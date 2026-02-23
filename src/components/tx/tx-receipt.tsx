import type { TransactionReceipt } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BlockLink } from '@/components/shared/block-link'
import { AddressLink } from '@/components/shared/address-link'
import { DetailRow, SkeletonDetail } from '@/components/shared/detail-row'
import { formatNumber, formatGwei } from '@/lib/formatters'

interface TxReceiptProps {
  receipt: TransactionReceipt | undefined
  loading?: boolean
  pending?: boolean
}

export function TxReceipt({ receipt, loading, pending }: TxReceiptProps) {
  if (loading) return <SkeletonDetail rows={7} />
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
