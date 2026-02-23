import { useState, useRef, useEffect, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { Transaction } from 'viem'
import { useBlockNumber } from '@/hooks/use-block-number'
import { useViemClient } from '@/hooks/use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { CONFIRMATIONS_FINALIZED } from '@/config/chains'
import { TxListTable } from '@/components/tx/tx-list-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/formatters'

/** Blocks fetched per "Load More" click. */
const BATCH_SIZE = 10

interface AddressTxListProps {
  address: string
}

export function AddressTxList({ address }: AddressTxListProps) {
  const [depth, setDepth] = useState(1)
  const { data: head } = useBlockNumber()
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  // Snapshot head on first arrival so live updates don't shift the range
  const headRef = useRef<bigint | undefined>(undefined)
  if (headRef.current == null && head != null) headRef.current = head
  const stableHead = headRef.current

  // Reset on address or chain change
  useEffect(() => {
    setDepth(1)
    headRef.current = undefined
  }, [address, rpcUrl])

  const totalBlocks = BigInt(depth * BATCH_SIZE)
  const scanTo = stableHead
  const rawFrom = stableHead != null ? stableHead - totalBlocks + 1n : undefined
  const scanFrom = rawFrom != null && rawFrom < 0n ? 0n : rawFrom
  const rangeValid = scanFrom != null && scanTo != null && scanTo >= scanFrom

  // Block numbers to scan, most-recent-first
  const blockNumbers = useMemo(() => {
    if (!rangeValid || scanFrom == null || scanTo == null) return []
    const nums: bigint[] = []
    for (let i = scanTo; i >= scanFrom; i--) nums.push(i)
    return nums
  }, [rangeValid, scanFrom, scanTo])

  // Per-block cache keys — "Load More" only fetches the new batch
  const { txs, isLoading, someLoaded } = useQueries({
    queries: blockNumbers.map((num) => ({
      queryKey: ['block', rpcUrl, String(num), true] as const,
      queryFn: () => client.getBlock({ blockNumber: num, includeTransactions: true }),
      staleTime: head != null && head - num >= BigInt(CONFIRMATIONS_FINALIZED) ? Infinity : 30_000,
      refetchOnWindowFocus: false,
    })),
    combine: (results) => {
      const addr = address.toLowerCase()
      const matched: Transaction[] = []
      for (const r of results) {
        if (!r.data) continue
        for (const tx of r.data.transactions) {
          if (typeof tx === 'string') continue
          if (tx.from.toLowerCase() === addr || tx.to?.toLowerCase() === addr) {
            matched.push(tx)
          }
        }
      }
      return {
        txs: matched,
        isLoading: results.some((r) => r.isLoading),
        someLoaded: results.some((r) => r.data != null),
      }
    },
  })

  const canLoadMore = scanFrom != null && scanFrom > 0n

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>
          {scanFrom != null && scanTo != null
            ? `Recent Activity (blocks ${formatNumber(scanFrom)} \u2013 ${formatNumber(scanTo)})`
            : 'Recent Activity'}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Scanning {blockNumbers.length} blocks for transactions.
          Not seeing older transactions? Click &ldquo;Load More&rdquo; or note
          that this explorer scans recent blocks only &mdash; no indexer is used.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading && !someLoaded ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : txs.length > 0 ? (
          <TxListTable transactions={txs} />
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No transactions found in scanned range.
          </p>
        )}

        <div className="flex items-center justify-center border-t px-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!canLoadMore || isLoading}
            onClick={() => setDepth((d) => d + 1)}
          >
            {isLoading ? 'Scanning...' : `Load More (+${BATCH_SIZE} blocks)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
