import { useParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useBlockNumber } from '@/hooks/use-block-number'
import { useBlocks } from '@/hooks/use-blocks'
import { useBlockPagination } from '@/hooks/use-block-pagination'
import { BlockListTable } from '@/components/block/block-list-table'
import { BlockPagination } from '@/components/block/block-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PAGE_SIZE = 15

export default function BlockListPage() {
  usePageTitle('Blocks')
  const { number } = useParams()
  const { data: head } = useBlockNumber()

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

  const { from, to, handleNavigate } = useBlockPagination(anchor, PAGE_SIZE, [number])
  const { data: blocks, isLoading } = useBlocks(from, to)

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
