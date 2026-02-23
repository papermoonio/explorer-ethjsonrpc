import { useMemo, useRef } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { useBlockNumber } from './use-block-number'
import { CONFIRMATIONS_FINALIZED } from '@/config/chains'

export const MAX_BLOCKS = 250

function isBlockFinalized(blockNum: bigint, head: bigint | undefined): boolean {
  if (head == null) return false
  return head - blockNum >= BigInt(CONFIRMATIONS_FINALIZED)
}

/**
 * Fetch a range of block headers (without full transactions).
 *
 * Each block is cached individually under `['block', rpcUrl, number, false]`,
 * so when the range slides by 1 on a new head block, only the single new
 * block is fetched from the network — the rest are served from cache.
 *
 * To avoid a visual flash when the range slides (e.g. the chart briefly
 * dropping a bar while the newest block loads), the hook buffers the
 * previous complete dataset and only swaps to the new one once every
 * block in the range has resolved.
 *
 * Blocks are returned most-recent-first. Range is capped at MAX_BLOCKS.
 */
export function useBlocks(from: bigint | undefined, to: bigint | undefined) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const { data: head } = useBlockNumber()

  const rangeValid = from != null && to != null && from <= to && Number(to - from) < MAX_BLOCKS

  const blockNumbers = useMemo(() => {
    if (!rangeValid || from == null || to == null) return []
    const nums: bigint[] = []
    for (let i = to; i >= from; i--) nums.push(i)
    return nums
  }, [rangeValid, from, to])

  const raw = useQueries({
    queries: blockNumbers.map((num) => ({
      queryKey: ['block', rpcUrl, String(num), false] as const,
      queryFn: () => client.getBlock({ blockNumber: num, includeTransactions: false }),
      staleTime: isBlockFinalized(num, head) ? Infinity : 10_000,
    })),
    combine: (results) => {
      const blocks = results
        .map((r) => r.data)
        .filter(<T,>(b: T | undefined): b is T => b != null)
      // Use count-based completeness instead of isLoading — during query
      // observer reconciliation isLoading can briefly report false for a
      // new query before its observer is initialised, causing the buffer
      // to be overwritten with partial data.
      const isComplete = results.length > 0 && blocks.length === results.length
      return {
        data: blocks.length > 0 ? blocks : undefined,
        isLoading: blocks.length === 0 && results.some((r) => r.isLoading),
        isComplete,
        isError: results.some((r) => r.isError),
        error: results.find((r) => r.error)?.error ?? null,
      }
    },
  })

  // Keep the previous complete dataset visible until every block in the
  // new range has loaded, preventing a brief flash of partial data when
  // the range slides by one block on a new head.
  const prevData = useRef(raw.data)
  if (raw.isComplete && raw.data != null) {
    prevData.current = raw.data
  }

  return {
    data: raw.isComplete ? raw.data : (prevData.current ?? raw.data),
    isLoading: prevData.current == null && raw.isLoading,
    isError: raw.isError,
    error: raw.error,
  }
}
