import { useQuery } from '@tanstack/react-query'
import { isHex } from 'viem'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { useBlockNumber } from './use-block-number'
import { CONFIRMATIONS_FINALIZED } from '@/config/chains'

function isValidTxHash(hash: string | undefined): hash is `0x${string}` {
  return !!hash && isHex(hash) && hash.length === 66
}

/** Fetch a transaction by hash. Transactions are immutable so `staleTime` is `Infinity`. */
export function useTransaction(hash: string | undefined) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['transaction', rpcUrl, hash],
    queryFn: () =>
      client.getTransaction({ hash: hash as `0x${string}` }),
    enabled: isValidTxHash(hash),
    staleTime: Infinity,
  })
}

/**
 * Fetch a transaction receipt by hash.
 *
 * - If the receipt is `null` (pending transaction), polls every 5 seconds.
 * - If the receipt's block is finalized, caches indefinitely.
 * - Otherwise uses a short stale time to account for possible reorgs.
 *
 * Note: The `staleTime` callback captures `head` from the render closure.
 * This means finalization detection may lag by one render cycle when the
 * head block advances. This is acceptable for a read-only explorer.
 */
export function useTransactionReceipt(hash: string | undefined) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const { data: head } = useBlockNumber()

  return useQuery({
    queryKey: ['transactionReceipt', rpcUrl, hash],
    queryFn: () =>
      client.getTransactionReceipt({ hash: hash as `0x${string}` }),
    enabled: isValidTxHash(hash),
    // Compute staleTime eagerly at render time (avoids stale closure in callback form)
    staleTime: 10_000,
    refetchInterval: (query) => {
      const receipt = query.state.data
      if (!receipt) return 5_000 // Pending — poll
      if (!head) return false
      // Once finalized, stop refetching
      return head - receipt.blockNumber >= BigInt(CONFIRMATIONS_FINALIZED)
        ? false
        : 30_000
    },
  })
}
