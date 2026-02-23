import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useBlockWithTransactions } from '@/hooks/use-block'
import { BlockDetail } from '@/components/block/block-detail'
import { TxListTable } from '@/components/tx/tx-list-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TX_PAGE_SIZE = 50

export default function BlockDetailPage() {
  const { hashOrNumber } = useParams()
  const decoded = hashOrNumber ? decodeURIComponent(hashOrNumber) : undefined
  const { data: block, isLoading, error } = useBlockWithTransactions(decoded)
  usePageTitle(block ? `Block #${block.number}` : 'Block')
  const [visibleCount, setVisibleCount] = useState(TX_PAGE_SIZE)

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Failed to load block: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        {hashOrNumber && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/block/${encodeURIComponent(hashOrNumber)}/raw`}>View Raw JSON</Link>
          </Button>
        )}
      </div>

      <BlockDetail block={block} loading={isLoading} />

      {block && (
        <Card className="py-4">
          <CardHeader>
            <CardTitle>Transactions ({block.transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <TxListTable transactions={block.transactions.slice(0, visibleCount)} />
            {block.transactions.length > visibleCount && (
              <div className="flex items-center justify-center border-t px-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((c) => c + TX_PAGE_SIZE)}
                >
                  Show More ({block.transactions.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
