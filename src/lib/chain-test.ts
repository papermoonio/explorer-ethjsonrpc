import { getViemClient, removeViemClient } from '@/lib/viem-client'
import { getWsClient, removeWsClient } from '@/lib/ws-client'

export type EndpointProtocol = 'ws' | 'http'

/** Detect whether a URL is ws(s) or http(s). Returns null if neither. */
export function detectProtocol(url: string): EndpointProtocol | null {
  if (/^wss?:\/\//.test(url)) return 'ws'
  if (/^https?:\/\//.test(url)) return 'http'
  return null
}

/** Derive an HTTP URL from a WebSocket URL (wss->https, ws->http). */
export function deriveHttpUrl(wsUrl: string): string {
  return wsUrl.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://')
}

/** Result of testing an endpoint. */
export interface EndpointTestResult {
  chainId: number
  rpcUrl: string
  wsUrl: string
  httpDerived: boolean
}

/**
 * Test a primary endpoint URL.
 * - If WS: connect via WS client, get chain ID. Then try deriving HTTP URL.
 * - If HTTP: connect via HTTP client, get chain ID.
 * Throws on connection failure.
 */
export async function testEndpoint(url: string): Promise<EndpointTestResult> {
  const protocol = detectProtocol(url)

  if (protocol === 'ws') {
    let wsClient
    try {
      wsClient = getWsClient(url)
    } catch {
      throw new Error(`Failed to create WebSocket client for ${url}`)
    }
    if (!wsClient) {
      throw new Error(`Failed to create WebSocket client for ${url}`)
    }

    let chainId: number
    try {
      chainId = await wsClient.getChainId()
    } catch (err) {
      removeWsClient(url).catch(() => {})
      throw err
    }

    const derivedHttp = deriveHttpUrl(url)
    let rpcUrl = ''
    let httpDerived = false

    try {
      const httpClient = getViemClient(derivedHttp)
      await httpClient.getChainId()
      rpcUrl = derivedHttp
      httpDerived = true
    } catch {
      removeViemClient(derivedHttp)
    }

    return { chainId, rpcUrl, wsUrl: url, httpDerived }
  }

  // HTTP path
  try {
    const httpClient = getViemClient(url)
    const chainId = await httpClient.getChainId()
    return { chainId, rpcUrl: url, wsUrl: '', httpDerived: false }
  } catch (err) {
    removeViemClient(url)
    throw err
  }
}

/**
 * Test an HTTP RPC URL directly. Returns the chain ID.
 * Throws on connection failure, cleans up client on error.
 */
export async function testHttpRpc(url: string): Promise<number> {
  try {
    const httpClient = getViemClient(url)
    return await httpClient.getChainId()
  } catch (err) {
    removeViemClient(url)
    throw err
  }
}
