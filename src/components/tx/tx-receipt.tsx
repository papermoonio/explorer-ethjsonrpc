import type { TransactionReceipt } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BlockLink } from '@/components/shared/block-link'
import { AddressLink } from '@/components/shared/address-link'
import { formatNumber, formatGwei } from '@/lib/formatters'

interface TxReceiptProps {
  receipt: TransactionReceipt | undefined
  loading?: boolean
  pending?: boolean
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span className="text-sm break-all">{children}</span>
    </div>
  )
}

function SkeletonReceipt() {
  return (
    <Card className="py-4">
      <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
      <CardContent>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function TxReceipt({ receipt, loading, pending }: TxReceiptProps) {
  if (loading) return <SkeletonReceipt />
  if (!receipt) {
    return (
      <Card className="py-4">
        <CardHeader><CardTitle>Transaction Receipt</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground px-4 py-3 text-sm">
            {pending ? 'Receipt not yet available \u2014 transaction is pending.' : 'No receipt found.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Transaction Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Status">
          {receipt.status === 'success'
            ? <Badge>Success</Badge>
            : <Badge variant="destructive">Failed</Badge>}
        </DetailRow>

        <DetailRow label="Gas Used">
          {formatNumber(receipt.gasUsed)}
        </DetailRow>

        <DetailRow label="Cumulative Gas Used">
          {formatNumber(receipt.cumulativeGasUsed)}
        </DetailRow>

        <DetailRow label="Effective Gas Price">
          {formatGwei(receipt.effectiveGasPrice)} Gwei
        </DetailRow>

        <DetailRow label="Contract Address">
          {receipt.contractAddress
            ? <AddressLink address={receipt.contractAddress} />
            : '\u2014'}
        </DetailRow>

        <DetailRow label="Logs">
          {receipt.logs.length}
        </DetailRow>

        <DetailRow label="Block">
          <BlockLink blockNumber={receipt.blockNumber} />
        </DetailRow>
      </CardContent>
    </Card>
  )
}
