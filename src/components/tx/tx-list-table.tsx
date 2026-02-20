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
  const hasFullTxs = transactions.length > 0 && isFullTransaction(transactions[0]!)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tx Hash</TableHead>
            {hasFullTxs && <TableHead>From</TableHead>}
            {hasFullTxs && <TableHead>To</TableHead>}
            {hasFullTxs && <TableHead>Value</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasFullTxs ? 4 : 1} className="text-muted-foreground text-center">
                No transactions
              </TableCell>
            </TableRow>
          ) : hasFullTxs ? (
            (transactions as Transaction[]).map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell><TxLink hash={tx.hash} /></TableCell>
                <TableCell><AddressLink address={tx.from} /></TableCell>
                <TableCell>
                  {tx.to ? (
                    <AddressLink address={tx.to} />
                  ) : (
                    <span className="text-muted-foreground italic">Contract Creation</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatEther(tx.value)} ETH
                </TableCell>
              </TableRow>
            ))
          ) : (
            (transactions as string[]).map((hash) => (
              <TableRow key={hash}>
                <TableCell><TxLink hash={hash} /></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
