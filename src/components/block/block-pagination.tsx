import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/formatters'

interface BlockPaginationProps {
  currentFrom: bigint
  currentTo: bigint
  headBlock: bigint
  pageSize: number
  onNavigate: (from: bigint, to: bigint) => void
}

export function BlockPagination({
  currentFrom,
  currentTo,
  headBlock,
  pageSize,
  onNavigate,
}: BlockPaginationProps) {
  const size = BigInt(pageSize)
  const canGoPrev = currentFrom > 0n
  const canGoNext = currentTo < headBlock

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={() => {
          const from = currentFrom - size < 0n ? 0n : currentFrom - size
          onNavigate(from, from + size - 1n)
        }}
      >
        Previous
      </Button>

      <span className="text-muted-foreground text-sm">
        Blocks {formatNumber(currentFrom)} &ndash; {formatNumber(currentTo)}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={() => {
          const to = currentTo + size > headBlock ? headBlock : currentTo + size
          onNavigate(to - size + 1n, to)
        }}
      >
        Next
      </Button>
    </div>
  )
}
