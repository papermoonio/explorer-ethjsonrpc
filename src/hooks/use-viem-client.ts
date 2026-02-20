import { useMemo } from 'react'
import { useAppStore } from '@/stores/app-store'
import { getViemClient } from '@/lib/viem-client'

/** Returns a memoised viem PublicClient for the currently selected chain. */
export function useViemClient() {
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  return useMemo(() => getViemClient(rpcUrl), [rpcUrl])
}
