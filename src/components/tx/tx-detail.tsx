import type { Transaction } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HashDisplay } from '@/components/shared/hash-display'
import { BlockLink } from '@/components/shared/block-link'
import { AddressLink } from '@/components/shared/address-link'
import { DetailRow, SkeletonDetail } from '@/components/shared/detail-row'
import { formatNumber, formatEther, formatGwei } from '@/lib/formatters'

interface TxDetailProps {
  tx: Transaction | undefined
  loading?: boolean
}

export function TxDetail({ tx, loading }: TxDetailProps) {
  if (loading || !tx) return <SkeletonDetail rows={9} />

  const isPending = tx.blockNumber == null
  const inputDisplay =
    tx.input === '0x'
      ? '\u2014'
      : tx.input.length > 66
        ? <HashDisplay hash={tx.input} truncate />
        : <span className="font-mono">{tx.input}</span>

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Transaction Hash">
          {tx.hash ? <HashDisplay hash={tx.hash} truncate={false} /> : <span className="text-muted-foreground">Pending</span>}
        </DetailRow>

        <DetailRow label="Status">
          {isPending ? <Badge variant="secondary">Pending</Badge> : <Badge>Confirmed</Badge>}
        </DetailRow>

        <DetailRow label="Block">
          {tx.blockNumber != null ? <BlockLink blockNumber={tx.blockNumber} /> : '\u2014'}
        </DetailRow>

        <DetailRow label="From">
          <AddressLink address={tx.from} />
        </DetailRow>

        <DetailRow label="To">
          {tx.to ? <AddressLink address={tx.to} /> : <Badge variant="secondary">Contract Creation</Badge>}
        </DetailRow>

        <DetailRow label="Value">
          {formatEther(tx.value)} ETH
        </DetailRow>

        <DetailRow label="Gas Limit">
          {formatNumber(tx.gas)}
        </DetailRow>

        <DetailRow label="Gas Price">
          {tx.gasPrice != null ? `${formatGwei(tx.gasPrice)} Gwei` : '\u2014'}
        </DetailRow>

        <DetailRow label="Nonce">
          {tx.nonce}
        </DetailRow>

        <DetailRow label="Input Data">
          {inputDisplay}
        </DetailRow>
      </CardContent>
    </Card>
  )
}
