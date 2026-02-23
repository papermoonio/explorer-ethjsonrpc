import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { Blocks, Link2, Fuel, Users, RefreshCw } from 'lucide-react'
import { useBlockNumber } from '@/hooks/use-block-number'
import { useBlocks } from '@/hooks/use-blocks'
import { useBlockPagination } from '@/hooks/use-block-pagination'
import {
  useChainId,
  useGasPrice,
  usePeerCount,
  useSyncing,
} from '@/hooks/use-network-stats'
import { StatCard } from '@/components/stats/stat-card'
import { StatCharts } from '@/components/stats/stat-charts'
import { BlockListTable } from '@/components/block/block-list-table'
import { BlockPagination } from '@/components/block/block-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatGwei } from '@/lib/formatters'

const PAGE_SIZE = 15
const CHART_BLOCKS = 30

function syncLabel(data: false | Record<string, string> | null | undefined): string {
  if (data === undefined) return '--'
  if (data === null) return 'Unavailable'
  if (data === false) return 'Synced'
  return 'Syncing...'
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { data: head, isLoading: headLoading } = useBlockNumber()
  const { data: chainId, isLoading: chainIdLoading } = useChainId()
  const { data: gasPrice, isLoading: gasPriceLoading } = useGasPrice()
  const { data: peerCount, isLoading: peerCountLoading } = usePeerCount()
  const { data: syncData, isLoading: syncLoading } = useSyncing()

  const { from: tableFrom, to: tableTo, handleNavigate } = useBlockPagination(head, PAGE_SIZE)

  // Chart range: last CHART_BLOCKS blocks from head
  const chartFrom =
    head != null
      ? head - BigInt(CHART_BLOCKS - 1) < 0n
        ? 0n
        : head - BigInt(CHART_BLOCKS - 1)
      : undefined
  const chartTo = head

  const { data: chartBlocks, isLoading: chartLoading } = useBlocks(chartFrom, chartTo)
  const { data: tableBlocks, isLoading: tableLoading } = useBlocks(tableFrom, tableTo)

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Block Height"
          value={head != null ? formatNumber(head) : '--'}
          icon={<Blocks className="size-5" />}
          loading={headLoading}
        />
        <StatCard
          label="Chain ID"
          value={chainId != null ? String(chainId) : '--'}
          icon={<Link2 className="size-5" />}
          loading={chainIdLoading}
        />
        <StatCard
          label="Gas Price"
          value={gasPrice != null ? `${formatGwei(gasPrice)} Gwei` : '--'}
          icon={<Fuel className="size-5" />}
          loading={gasPriceLoading}
        />
        <StatCard
          label="Peer Count"
          value={peerCount != null ? String(peerCount) : peerCount === null ? 'Unavailable' : '--'}
          icon={<Users className="size-5" />}
          loading={peerCountLoading}
        />
        <StatCard
          label="Sync Status"
          value={syncLabel(syncData)}
          icon={<RefreshCw className="size-5" />}
          loading={syncLoading}
        />
      </div>

      {/* Charts Section */}
      <StatCharts blocks={chartBlocks ?? []} loading={chartLoading} />

      {/* Recent Blocks Section */}
      <Card className="py-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Blocks</CardTitle>
            <Link
              to="/blocks"
              className="text-primary text-sm hover:underline"
            >
              View all blocks
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <BlockListTable blocks={tableBlocks ?? []} loading={tableLoading} />
          {head != null && tableFrom != null && tableTo != null && (
            <div className="mt-4">
              <BlockPagination
                currentFrom={tableFrom}
                currentTo={tableTo}
                headBlock={head}
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
