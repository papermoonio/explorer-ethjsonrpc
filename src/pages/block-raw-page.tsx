import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useBlockWithTransactions } from '@/hooks/use-block'
import { RawJsonView } from '@/components/shared/raw-json-view'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function BlockRawPage() {
  usePageTitle('Block Raw JSON')
  const { hashOrNumber } = useParams()
  const decoded = hashOrNumber ? decodeURIComponent(hashOrNumber) : undefined
  const { data: block, isLoading, error } = useBlockWithTransactions(decoded)

  return (
    <div className="space-y-4 p-6">
      <Link
        to={hashOrNumber ? `/block/${encodeURIComponent(hashOrNumber)}` : '/'}
        className="text-primary text-sm hover:underline"
      >
        &larr; Back to block
      </Link>

      <h1 className="text-2xl font-bold">
        Block Raw JSON{block?.number != null ? `: #${String(block.number)}` : ''}
      </h1>

      {error ? (
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Failed to load block: {error.message}
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : block ? (
        <RawJsonView data={block} />
      ) : null}
    </div>
  )
}
