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
export const HEAD_REFRESH_MS = 3_000

const parsedChainId = parseInt(env.defaultChainId, 10)
if (!Number.isFinite(parsedChainId) || parsedChainId <= 0) {
  throw new Error(
    `Invalid VITE_DEFAULT_CHAIN_ID: "${env.defaultChainId}". Must be a positive integer.`,
  )
}

export const defaultChains: Chain[] = [
  {
    id: parsedChainId,
    name: env.defaultChainName.toLowerCase().replace(/\s+/g, '-'),
    displayName: env.defaultChainName,
    rpcUrl: env.defaultRpcUrl,
    wsUrl: env.defaultWsUrl || undefined,
    network: 'mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
]
