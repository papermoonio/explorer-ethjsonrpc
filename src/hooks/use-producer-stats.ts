import { useMemo } from 'react'
import { useBlockNumber } from './use-block-number'
import { useBlocks, MAX_BLOCKS } from './use-blocks'

/**
 * Number of recent blocks to sample for producer statistics.
 * Must be less than MAX_BLOCKS (currently 250) to avoid silent query disabling.
 */
const PRODUCER_BLOCKS = 200

if (PRODUCER_BLOCKS >= MAX_BLOCKS) {
  throw new Error(
    `PRODUCER_BLOCKS (${PRODUCER_BLOCKS}) must be less than MAX_BLOCKS (${MAX_BLOCKS})`,
  )
}

export interface ProducerStat {
  /** Producer address, normalized to lowercase. */
  address: string
  count: number
  percentage: number
}

export function useProducerStats() {
  const { data: head } = useBlockNumber()

  const from =
    head != null
      ? head - BigInt(PRODUCER_BLOCKS - 1) < 0n
        ? 0n
        : head - BigInt(PRODUCER_BLOCKS - 1)
      : undefined
  const to = head

  const { data: blocks, isLoading, isError, error } = useBlocks(from, to)

  const stats = useMemo(() => {
    if (!blocks || blocks.length === 0) return []
    const counts = new Map<string, number>()
    for (const block of blocks) {
      const producer = block.miner?.toLowerCase() ?? '0x0000000000000000000000000000000000000000'
      counts.set(producer, (counts.get(producer) ?? 0) + 1)
    }
    const total = blocks.length
    return Array.from(counts.entries())
      .map(([address, count]) => ({
        address,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
  }, [blocks])

  // totalBlocks may be < PRODUCER_BLOCKS on young chains (genesis proximity)
  return { stats, blocks, isLoading, isError, error, totalBlocks: blocks?.length ?? 0 }
}
