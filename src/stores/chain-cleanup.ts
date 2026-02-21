import { removeViemClient } from '@/lib/viem-client'
import { removeWsClient } from '@/lib/ws-client'
import type { Chain } from '@/config/chains'

/** Clean up cached network clients for a removed chain. */
export function cleanupChainClients(chain: Chain): void {
  removeViemClient(chain.rpcUrl)
  if (chain.wsUrl) removeWsClient(chain.wsUrl).catch(() => {})
}
