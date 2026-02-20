import { AddressLink } from '@/components/shared/address-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { addressToColor } from '@/lib/formatters'
import type { ProducerStat } from '@/hooks/use-producer-stats'

interface ProducerTableProps {
  stats: ProducerStat[]
  loading?: boolean
}

export function ProducerTable({ stats, loading }: ProducerTableProps) {
  if (loading) {
    return (
      <Card className="py-4">
        <CardHeader><CardTitle>Producers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card className="py-4">
        <CardHeader><CardTitle>Producers</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No producers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardHeader><CardTitle>Producers</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Producer</TableHead>
                <TableHead className="text-right">Blocks</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat, idx) => (
                <TableRow key={stat.address}>
                  <TableCell className="font-mono">{idx + 1}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: addressToColor(stat.address) }}
                      />
                      <AddressLink address={stat.address} />
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{stat.count}</TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.percentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
