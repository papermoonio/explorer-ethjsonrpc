import type { Transaction } from 'viem'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TxLink } from '@/components/shared/tx-link'
import { AddressLink } from '@/components/shared/address-link'
import { formatEther } from '@/lib/formatters'

interface TxListTableProps {
  transactions: (Transaction | string)[]
  loading?: boolean
}

function isFullTransaction(tx: Transaction | string): tx is Transaction {
  return typeof tx === 'object' && tx !== null && 'hash' in tx
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function TxListTable({ transactions, loading }: TxListTableProps) {
  const hasAnyFull = transactions.some(isFullTransaction)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tx Hash</TableHead>
            {hasAnyFull && <TableHead>From</TableHead>}
            {hasAnyFull && <TableHead>To</TableHead>}
            {hasAnyFull && <TableHead>Value</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasAnyFull ? 4 : 1} className="text-muted-foreground text-center">
                No transactions
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((entry) => {
              if (isFullTransaction(entry)) {
                return (
                  <TableRow key={entry.hash}>
                    <TableCell><TxLink hash={entry.hash} /></TableCell>
                    <TableCell><AddressLink address={entry.from} /></TableCell>
                    <TableCell>
                      {entry.to ? (
                        <AddressLink address={entry.to} />
                      ) : (
                        <span className="text-muted-foreground italic">Contract Creation</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatEther(entry.value)} ETH
                    </TableCell>
                  </TableRow>
                )
              }
              return (
                <TableRow key={entry}>
                  <TableCell><TxLink hash={entry} /></TableCell>
                  {hasAnyFull && <TableCell colSpan={3} />}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
