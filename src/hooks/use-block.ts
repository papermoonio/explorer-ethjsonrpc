import { useQuery } from '@tanstack/react-query'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { useBlockNumber } from './use-block-number'
import { CONFIRMATIONS_FINALIZED } from '@/config/chains'

function isFinalized(
  blockNum: bigint | undefined,
  head: bigint | undefined,
): boolean {
  if (blockNum == null || head == null) return false
  return head - blockNum >= BigInt(CONFIRMATIONS_FINALIZED)
}

/**
 * Fetch a single block by hash or number.
 *
 * @param hashOrNumber - A `bigint` block number, a `0x`-prefixed 32-byte hash,
 *                       or a decimal string representing a block number.
 * @param includeTransactions - When `true`, the response includes full transaction objects.
 */
export function useBlock(
  hashOrNumber: string | bigint | undefined,
  includeTransactions = false,
) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const { data: head } = useBlockNumber()

  const isHash =
    typeof hashOrNumber === 'string' &&
    hashOrNumber.startsWith('0x') &&
    hashOrNumber.length === 66

  const blockNumber: bigint | undefined = (() => {
    if (typeof hashOrNumber === 'bigint') return hashOrNumber
    if (typeof hashOrNumber === 'string' && !isHash) {
      try { return BigInt(hashOrNumber) } catch { return undefined }
    }
    return undefined
  })()

  return useQuery({
    queryKey: ['block', rpcUrl, isHash ? hashOrNumber : String(blockNumber ?? hashOrNumber), includeTransactions],
    queryFn: () => {
      if (isHash) {
        return client.getBlock({
          blockHash: hashOrNumber as `0x${string}`,
          includeTransactions,
        })
      }
      return client.getBlock({
        blockNumber: blockNumber!,
        includeTransactions,
      })
    },
    enabled: hashOrNumber != null && (isHash || blockNumber !== undefined),
    staleTime: isHash || isFinalized(blockNumber, head) ? Infinity : 10_000,
  })
}

/** Convenience wrapper that fetches a block with full transaction objects. */
export function useBlockWithTransactions(
  hashOrNumber: string | bigint | undefined,
) {
  return useBlock(hashOrNumber, true)
}
