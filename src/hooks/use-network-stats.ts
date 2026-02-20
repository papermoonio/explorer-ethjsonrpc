import { useQuery } from '@tanstack/react-query'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { HEAD_REFRESH_MS } from '@/config/chains'

/** Fetch the chain ID. Cached indefinitely since it never changes for a given RPC. */
export function useChainId() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['chainId', rpcUrl],
    queryFn: () => client.getChainId(),
    staleTime: Infinity,
  })
}

/** Poll the current gas price. Refreshes alongside the head block. */
export function useGasPrice() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['gasPrice', rpcUrl],
    queryFn: () => client.getGasPrice(),
    refetchInterval: HEAD_REFRESH_MS,
    staleTime: HEAD_REFRESH_MS / 2,
  })
}

/**
 * Fetch the peer count via `net_peerCount`.
 *
 * Many hosted RPCs do not support this method, so errors are swallowed and
 * `null` is returned to let the UI show an "unavailable" indicator.
 */
export function usePeerCount() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['peerCount', rpcUrl],
    queryFn: async () => {
      try {
        const raw = await client.request({ method: 'net_peerCount' })
        return typeof raw === 'number' ? raw : parseInt(raw as string, 16)
      } catch {
        return null
      }
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 0,
  })
}

/**
 * Query `eth_syncing`.
 *
 * Returns `false` when the node is fully synced, an object with progress info
 * when syncing, or `null` when the method is unsupported.
 */
export function useSyncing() {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['syncing', rpcUrl],
    queryFn: async () => {
      try {
        // eth_syncing is a standard JSON-RPC method not exposed via viem's PublicClient actions
        type SyncingResult = false | Record<string, string>
        const result = await client.request<{ Method: 'eth_syncing'; Parameters?: undefined; ReturnType: SyncingResult }>({ method: 'eth_syncing' })
        return result
      } catch {
        return null
      }
    },
    refetchInterval: HEAD_REFRESH_MS,
    staleTime: HEAD_REFRESH_MS / 2,
    retry: 0,
  })
}
