import { useQuery } from '@tanstack/react-query'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { HEAD_REFRESH_MS } from '@/config/chains'

/** Polls `eth_blockNumber` every {@link HEAD_REFRESH_MS} and shares the result across all consumers.
 *  When a WebSocket URL is configured, polling is disabled — the WS subscription
 *  pushes updates directly into the query cache instead. */
export function useBlockNumber() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const wsUrl = useAppStore((s) => s.selectedChain.wsUrl)

  return useQuery({
    queryKey: ['blockNumber', rpcUrl],
    queryFn: () => client.getBlockNumber(),
    refetchInterval: wsUrl ? false : HEAD_REFRESH_MS,
    staleTime: wsUrl ? Infinity : HEAD_REFRESH_MS / 2,
  })
}
