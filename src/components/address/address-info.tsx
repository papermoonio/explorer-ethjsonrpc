import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { HashDisplay } from '@/components/shared/hash-display'
import { formatEther } from '@/lib/formatters'

interface AddressInfoProps {
  address: string
  balance: bigint | undefined
  nonce: number | undefined
  code: string | undefined
  loading?: boolean
  currencySymbol?: string
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span className="text-sm break-all">{children}</span>
    </div>
  )
}

function SkeletonInfo() {
  return (
    <Card className="py-4">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function AddressInfo({
  address,
  balance,
  nonce,
  code,
  loading,
  currencySymbol = 'ETH',
}: AddressInfoProps) {
  if (loading) return <SkeletonInfo />

  const isContract = !!code && code !== '0x'

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Address Details</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Address">
          <HashDisplay hash={address} truncate={false} />
        </DetailRow>

        <DetailRow label="Balance">
          {balance != null ? `${formatEther(balance)} ${currencySymbol}` : 'N/A'}
        </DetailRow>

        <DetailRow label="Nonce / Tx Count">
          {nonce != null ? nonce : 'N/A'}
        </DetailRow>

        <DetailRow label="Type">
          {isContract ? (
            <Badge variant="secondary">Contract</Badge>
          ) : (
            <Badge variant="outline">EOA</Badge>
          )}
        </DetailRow>

        {code && code !== '0x' && (
          <DetailRow label="Contract Code">
            <HashDisplay hash={code.slice(0, 66)} truncate={false} />
            {code.length > 66 && (
              <span className="text-muted-foreground ml-1 text-xs">
                ({Math.floor((code.length - 2) / 2).toLocaleString()} bytes)
              </span>
            )}
          </DetailRow>
        )}
      </CardContent>
    </Card>
  )
}
