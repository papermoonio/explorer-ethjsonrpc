import { createPublicClient, webSocket, type PublicClient } from 'viem'

const wsClientCache = new Map<string, PublicClient>()

/**
 * Return a memoised viem `PublicClient` backed by a WebSocket transport.
 *
 * @param wsUrl - A `ws://` or `wss://` endpoint URL.
 *   If falsy (undefined, empty string), returns `undefined`.
 * @returns The cached `PublicClient`, or `undefined` when no URL is provided.
 */
export function getWsClient(wsUrl?: string): PublicClient | undefined {
  if (!wsUrl) return undefined

  const existing = wsClientCache.get(wsUrl)
  if (existing) return existing

  const client = createPublicClient({
    transport: webSocket(wsUrl, {
      reconnect: true,
      keepAlive: true,
      retryCount: 3,
    }),
  })

  wsClientCache.set(wsUrl, client)
  return client
}

/**
 * Close and remove a cached WebSocket client.
 *
 * Gracefully closes the underlying WebSocket connection before evicting
 * the client from the cache. No-op if no client exists for the given URL.
 */
export async function removeWsClient(wsUrl: string): Promise<void> {
  const client = wsClientCache.get(wsUrl)
  if (!client) return

  // viem WebSocket transports expose a `close` method on the transport
  // object, but the public type may not surface it — use optional chaining.
  const transport = client.transport as Record<string, unknown>
  if (typeof transport.close === 'function') {
    await (transport.close as () => Promise<void>)()
  }

  wsClientCache.delete(wsUrl)
}
