import { useQuery } from '@tanstack/react-query'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { HEAD_REFRESH_MS } from '@/config/chains'

/** Polls `eth_blockNumber` every {@link HEAD_REFRESH_MS} and shares the result across all consumers. */
export function useBlockNumber() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['blockNumber', rpcUrl],
    queryFn: () => client.getBlockNumber(),
    refetchInterval: HEAD_REFRESH_MS,
    staleTime: HEAD_REFRESH_MS / 2,
  })
}
