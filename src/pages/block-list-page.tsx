import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useBlockNumber } from '@/hooks/use-block-number'
import { useBlocks } from '@/hooks/use-blocks'
import { BlockListTable } from '@/components/block/block-list-table'
import { BlockPagination } from '@/components/block/block-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

const PAGE_SIZE = 15

export default function BlockListPage() {
  usePageTitle('Blocks')
  const { number } = useParams()
  const { data: head } = useBlockNumber()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const [pageOffset, setPageOffset] = useState(0n)

  // Reset pagination on chain or route param change
  useEffect(() => {
    setPageOffset(0n)
  }, [rpcUrl, number])

  // Determine the anchor point: URL param or head block
  const anchor: bigint | undefined = (() => {
    if (number != null) {
      try {
        return BigInt(number)
      } catch {
        return head
      }
    }
    return head
  })()

  const rawTo = anchor != null ? anchor - pageOffset : undefined
  const to = rawTo != null && rawTo < 0n ? 0n : rawTo
  const from =
    to != null
      ? to - BigInt(PAGE_SIZE - 1) < 0n
        ? 0n
        : to - BigInt(PAGE_SIZE - 1)
      : undefined

  const { data: blocks, isLoading } = useBlocks(from, to)

  const handleNavigate = useCallback(
    (_from: bigint, newTo: bigint) => {
      if (anchor == null) return
      setPageOffset(anchor - newTo)
    },
    [anchor],
  )

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Blocks</h1>

      <Card className="py-4">
        <CardHeader>
          <CardTitle>Block List</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockListTable blocks={blocks ?? []} loading={isLoading} />
          {anchor != null && from != null && to != null && (
            <div className="mt-4">
              <BlockPagination
                currentFrom={from}
                currentTo={to}
                headBlock={anchor}
                pageSize={PAGE_SIZE}
                onNavigate={handleNavigate}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
