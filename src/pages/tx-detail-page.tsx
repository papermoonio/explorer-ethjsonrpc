import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useTransaction, useTransactionReceipt } from '@/hooks/use-transaction'
import { truncateHash } from '@/lib/formatters'
import { TxDetail } from '@/components/tx/tx-detail'
import { TxReceipt } from '@/components/tx/tx-receipt'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TxDetailPage() {
  const { hash } = useParams()
  const { data: tx, isLoading: txLoading, error: txError } = useTransaction(hash)
  const { data: receipt, isLoading: receiptLoading } = useTransactionReceipt(hash)
  usePageTitle(tx?.hash ? `Tx ${truncateHash(tx.hash)}` : 'Transaction')

  const isHash = hash?.startsWith('0x') && hash.length === 66

  if (txError) {
    return (
      <div className="space-y-4 p-6">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        <Card className="py-4">
          <CardContent className="space-y-2">
            <p className="text-destructive">
              Failed to load transaction: {txError.message}
            </p>
            {isHash && (
              <p className="text-sm">
                This 64-character hash may be a block hash.{' '}
                <Link to={`/block/${hash}`} className="text-primary hover:underline">
                  Try as block hash &rarr;
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        {hash && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/tx/${encodeURIComponent(hash)}/raw`}>View Raw JSON</Link>
          </Button>
        )}
      </div>

      <TxDetail tx={tx} loading={txLoading} />
      <TxReceipt receipt={receipt} loading={receiptLoading} pending={tx ? tx.blockNumber == null : false} />
    </div>
  )
}
