import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { Block } from 'viem'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { useBlockNumber } from './use-block-number'
import { CONFIRMATIONS_FINALIZED } from '@/config/chains'

export const MAX_BLOCKS = 250

function isRangeFinalized(to: bigint | undefined, head: bigint | undefined): boolean {
  if (to == null || head == null) return false
  return head - to >= BigInt(CONFIRMATIONS_FINALIZED)
}

/**
 * Fetch a range of block headers (without full transactions).
 *
 * Blocks are returned most-recent-first. Viem's batched HTTP transport
 * coalesces the individual `eth_getBlockByNumber` calls into minimal
 * JSON-RPC batch requests automatically.
 *
 * Range is capped at MAX_BLOCKS to prevent unbounded requests.
 */
export function useBlocks(from: bigint | undefined, to: bigint | undefined) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const { data: head } = useBlockNumber()

  const rangeValid = from != null && to != null && from <= to && Number(to - from) < MAX_BLOCKS

  return useQuery({
    queryKey: ['blocks', rpcUrl, String(from), String(to)],
    queryFn: async () => {
      if (from == null || to == null || from > to) return []
      const promises: Promise<Block>[] = []
      for (let i = to; i >= from; i--) {
        promises.push(
          client.getBlock({ blockNumber: i, includeTransactions: false }),
        )
      }
      return Promise.all(promises)
    },
    enabled: rangeValid,
    placeholderData: keepPreviousData,
    staleTime: isRangeFinalized(to, head) ? Infinity : 10_000,
  })
}
