import { useParams, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'
import { useTransaction, useTransactionReceipt } from '@/hooks/use-transaction'
import { RawJsonView } from '@/components/shared/raw-json-view'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function TxRawPage() {
  usePageTitle('Transaction Raw JSON')
  const { hash } = useParams()
  const { data: tx, isLoading: txLoading, error: txError } = useTransaction(hash)
  const { data: receipt, isLoading: receiptLoading } = useTransactionReceipt(hash)

  return (
    <div className="space-y-4 p-6">
      <Link
        to={hash ? `/tx/${encodeURIComponent(hash)}` : '/'}
        className="text-primary text-sm hover:underline"
      >
        &larr; Back to transaction
      </Link>

      <h1 className="text-2xl font-bold">
        Transaction Raw JSON{tx?.hash ? `: ${tx.hash}` : ''}
      </h1>

      {txError ? (
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Failed to load transaction: {txError.message}
            </p>
          </CardContent>
        </Card>
      ) : txLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : tx ? (
        <>
          <h2 className="text-lg font-semibold">Transaction</h2>
          <RawJsonView data={tx} />

          <h2 className="text-lg font-semibold">Receipt</h2>
          {receiptLoading ? (
            <Skeleton className="h-[600px] w-full rounded-xl" />
          ) : receipt ? (
            <RawJsonView data={receipt} />
          ) : (
            <p className="text-muted-foreground text-sm">
              Receipt not available (transaction may be pending).
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}
