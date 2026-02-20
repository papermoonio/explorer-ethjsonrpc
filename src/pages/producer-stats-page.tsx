import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useProducerStats } from '@/hooks/use-producer-stats'
import { ProducerPieChart } from '@/components/stats/producer-pie-chart'
import { ProducerTable } from '@/components/stats/producer-table'
import { Card, CardContent } from '@/components/ui/card'

export default function ProducerStatsPage() {
  usePageTitle('Block Producer Stats')
  const { stats, isLoading, isError, totalBlocks } = useProducerStats()

  if (isError) {
    return (
      <div className="space-y-4 p-6">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Failed to load producer stats. The RPC endpoint may be unreachable.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Link to="/" className="text-primary text-sm hover:underline">
        &larr; Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Block Producer Stats</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Distribution of the last {totalBlocks} blocks by producer address
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProducerPieChart stats={stats} loading={isLoading} />
        <ProducerTable stats={stats} loading={isLoading} />
      </div>
    </div>
  )
}
