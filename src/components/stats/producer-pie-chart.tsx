import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TooltipProps } from 'recharts'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { addressToColor, truncateAddress } from '@/lib/formatters'
import type { ProducerStat } from '@/hooks/use-producer-stats'

const TOP_N = 10
const OTHER_COLOR = '#7c7c8a'

interface ProducerPieChartProps {
  stats: ProducerStat[]
  loading?: boolean
}

interface SliceDatum {
  name: string
  address: string | null
  value: number
  percentage: number
  color: string
}

function toSlices(stats: ProducerStat[]): SliceDatum[] {
  const top = stats.slice(0, TOP_N)
  const rest = stats.slice(TOP_N)

  const slices: SliceDatum[] = top.map((s) => ({
    name: truncateAddress(s.address),
    address: s.address,
    value: s.count,
    percentage: s.percentage,
    color: addressToColor(s.address),
  }))

  if (rest.length > 0) {
    const otherCount = rest.reduce((sum, s) => sum + s.count, 0)
    const totalCount = stats.reduce((sum, s) => sum + s.count, 0)
    const otherPct = totalCount > 0 ? (otherCount / totalCount) * 100 : 0
    slices.push({
      name: 'Other',
      address: null,
      value: otherCount,
      percentage: otherPct,
      color: OTHER_COLOR,
    })
  }

  return slices
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.[0]) return null
  const datum = payload[0].payload as SliceDatum
  return (
    <div className="rounded border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{datum.name}</p>
      <p className="text-muted-foreground">
        {datum.value} blocks ({datum.percentage.toFixed(1)}%)
      </p>
    </div>
  )
}

export function ProducerPieChart({ stats, loading }: ProducerPieChartProps) {
  const navigate = useNavigate()
  const slices = useMemo(() => toSlices(stats), [stats])

  const handleClick = useCallback(
    (datum: SliceDatum) => {
      if (datum.address) {
        void navigate(`/address/${datum.address}`)
      }
    },
    [navigate],
  )

  if (loading) {
    return (
      <Card className="py-4">
        <CardHeader><CardTitle>Block Distribution</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
      </Card>
    )
  }

  if (slices.length === 0) {
    return (
      <Card className="py-4">
        <CardHeader><CardTitle>Block Distribution</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardHeader><CardTitle>Block Distribution</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              onClick={handleClick}
            >
              {slices.map((s) => (
                <Cell
                  key={s.address ?? s.name}
                  fill={s.color}
                  style={{ cursor: s.address ? 'pointer' : 'default' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
