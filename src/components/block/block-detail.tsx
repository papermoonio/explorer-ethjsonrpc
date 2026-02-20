import type { Block } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { HashDisplay } from '@/components/shared/hash-display'
import { BlockLink } from '@/components/shared/block-link'
import { AddressLink } from '@/components/shared/address-link'
import {
  formatNumber,
  formatGwei,
  formatTimestamp,
  formatFullTimestamp,
  gasPercentage,
} from '@/lib/formatters'

interface BlockDetailProps {
  block: Block | undefined
  loading?: boolean
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span className="text-sm break-all">{children}</span>
    </div>
  )
}

function SkeletonDetail() {
  return (
    <Card className="py-4">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function BlockDetail({ block, loading }: BlockDetailProps) {
  if (loading || !block) return <SkeletonDetail />

  const gasPct = gasPercentage(block.gasUsed, block.gasLimit)
  const baseFee =
    block.baseFeePerGas != null ? `${formatGwei(block.baseFeePerGas)} Gwei` : 'N/A'

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>
          Block {block.number != null ? `#${formatNumber(block.number)}` : 'Pending'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Block Number">
          {block.number != null ? formatNumber(block.number) : 'Pending'}
        </DetailRow>

        <DetailRow label="Block Hash">
          {block.hash ? <HashDisplay hash={block.hash} truncate={false} /> : 'Pending'}
        </DetailRow>

        <DetailRow label="Parent Hash">
          <BlockLink blockHash={block.parentHash} />
        </DetailRow>

        <DetailRow label="Timestamp">
          {formatTimestamp(block.timestamp)} ({formatFullTimestamp(block.timestamp)})
        </DetailRow>

        <DetailRow label="Block Producer">
          <AddressLink address={block.miner} />
        </DetailRow>

        <DetailRow label="Gas Used / Gas Limit">
          <div className="flex items-center gap-3">
            <span>
              {formatNumber(block.gasUsed)} / {formatNumber(block.gasLimit)}
            </span>
            <Progress value={gasPct} className="w-24" />
            <span className="text-muted-foreground text-xs">{gasPct.toFixed(1)}%</span>
          </div>
        </DetailRow>

        <DetailRow label="Base Fee">{baseFee}</DetailRow>

        <DetailRow label="Size">
          {formatNumber(block.size)} bytes
        </DetailRow>

        <DetailRow label="Transactions">
          {block.transactions.length}
        </DetailRow>

        <DetailRow label="Nonce">
          {block.nonce ?? 'N/A'}
        </DetailRow>

        <DetailRow label="Extra Data">
          <HashDisplay hash={block.extraData} truncate={block.extraData.length > 66} />
        </DetailRow>
      </CardContent>
    </Card>
  )
}
