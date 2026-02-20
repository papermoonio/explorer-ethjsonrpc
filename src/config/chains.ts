import { env } from '@/config/env'

export interface Chain {
  readonly id: number
  readonly name: string
  readonly displayName: string
  readonly rpcUrl: string
  readonly wsUrl?: string
  readonly network: 'mainnet' | 'testnet' | 'devnet'
  readonly nativeCurrency: {
    readonly name: string
    readonly symbol: string
    readonly decimals: number
  }
  readonly blockTime?: number
  readonly confirmationsFinalized?: number
}

/** Default number of confirmations before a block is considered finalized. */
export const CONFIRMATIONS_FINALIZED = 20

/** Interval (ms) between head-block refresh polls. */
export const HEAD_REFRESH_MS = Math.max(500, parseInt(env.pollIntervalMs, 10) || 1_000)

interface ChainConfigEntry {
  name: string
  chainId: number
  rpcUrl: string
  wsUrl?: string
  symbol?: string
  network?: 'mainnet' | 'testnet' | 'devnet'
  decimals?: number
}

function parseChainConfigEntries(json: string): Chain[] {
  const entries: ChainConfigEntry[] = JSON.parse(json)
  return entries.map((entry) => {
    if (!Number.isFinite(entry.chainId) || entry.chainId <= 0) {
      throw new Error(`Invalid chainId "${String(entry.chainId)}" for chain "${entry.name}"`)
    }
    return {
      id: entry.chainId,
      name: entry.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: entry.name,
      rpcUrl: entry.rpcUrl,
      wsUrl: entry.wsUrl || undefined,
      network: entry.network || 'mainnet',
      nativeCurrency: {
        name: entry.symbol || 'ETH',
        symbol: entry.symbol || 'ETH',
        decimals: entry.decimals || 18,
      },
    }
  })
}

function buildDefaultChains(): Chain[] {
  if (env.chainsConfig) {
    try {
      return parseChainConfigEntries(env.chainsConfig)
    } catch (err) {
      console.error('Failed to parse VITE_CHAINS_CONFIG, falling back to individual env vars:', err)
    }
  }

  const parsedChainId = parseInt(env.defaultChainId, 10)
  if (!Number.isFinite(parsedChainId) || parsedChainId <= 0) {
    console.error(
      `Invalid VITE_DEFAULT_CHAIN_ID: "${env.defaultChainId}". Must be a positive integer. Defaulting to chain ID 1.`,
    )
  }

  const chainId = Number.isFinite(parsedChainId) && parsedChainId > 0 ? parsedChainId : 1

  return [
    {
      id: chainId,
      name: env.defaultChainName.toLowerCase().replace(/\s+/g, '-'),
      displayName: env.defaultChainName,
      rpcUrl: env.defaultRpcUrl,
      wsUrl: env.defaultWsUrl || undefined,
      network: 'mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    },
  ]
}

export const defaultChains: Chain[] = buildDefaultChains()
