import type { Block } from 'viem'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { BlockLink } from '@/components/shared/block-link'
import { AddressLink } from '@/components/shared/address-link'
import { formatTimestamp, gasPercentage } from '@/lib/formatters'

interface BlockListTableProps {
  blocks: Block[]
  loading?: boolean
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function BlockListTable({ blocks, loading }: BlockListTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Block</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Txs</TableHead>
            <TableHead>Gas Used</TableHead>
            <TableHead>Block Producer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : blocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No blocks found
              </TableCell>
            </TableRow>
          ) : (
            blocks.map((block) => {
              const pct = gasPercentage(block.gasUsed, block.gasLimit)
              return (
                <TableRow key={String(block.number ?? block.hash)}>
                  <TableCell>
                    <BlockLink blockNumber={block.number ?? undefined} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatTimestamp(block.timestamp)}
                  </TableCell>
                  <TableCell>{block.transactions.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="w-16" />
                      <span className="text-muted-foreground text-xs">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AddressLink address={block.miner} />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
