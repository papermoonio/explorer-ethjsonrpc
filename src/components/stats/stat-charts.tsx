import { useMemo } from 'react'
import type { Block } from 'viem'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatChartsProps {
  blocks: Block[]
  loading?: boolean
}

interface ChartDatum {
  blockNumber: string
  txCount: number
  gasUsed: number
}

function toChartData(blocks: Block[]): ChartDatum[] {
  // Blocks arrive most-recent-first; reverse for chronological display
  return [...blocks].reverse().map((b) => ({
    blockNumber: b.number != null ? `#${String(b.number)}` : '#pending',
    txCount: b.transactions.length,
    gasUsed: Number(b.gasUsed / 1_000_000n),
  }))
}

export function StatCharts({ blocks, loading }: StatChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader><CardTitle>Transactions per Block</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader><CardTitle>Gas Used per Block</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
        </Card>
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader><CardTitle>Transactions per Block</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">No data</p></CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader><CardTitle>Gas Used per Block</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">No data</p></CardContent>
        </Card>
      </div>
    )
  }

  const data = useMemo(() => toChartData(blocks), [blocks])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="py-4">
        <CardHeader><CardTitle>Transactions per Block</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="blockNumber" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', border: '1px solid var(--color-border)', color: 'var(--color-popover-foreground)', borderRadius: 6 }} />
              <Bar dataKey="txCount" name="Transactions" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader><CardTitle>Gas Used per Block</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="blockNumber" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} unit=" M" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', border: '1px solid var(--color-border)', color: 'var(--color-popover-foreground)', borderRadius: 6 }} formatter={(value) => [`${String(value)} M gas`, 'Gas Used']} />
              <Bar dataKey="gasUsed" name="Gas Used (M)" fill="var(--color-chart-3)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
