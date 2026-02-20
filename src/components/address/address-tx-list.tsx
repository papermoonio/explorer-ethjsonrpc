import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Transaction } from 'viem'
import { useBlockNumber } from '@/hooks/use-block-number'
import { useViemClient } from '@/hooks/use-viem-client'
import { useAppStore } from '@/stores/app-store'
import { TxListTable } from '@/components/tx/tx-list-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/formatters'

/** Number of blocks to scan per page. ~10 min on mainnet, ~100 sec on Polygon. */
const SCAN_BLOCKS = 50

interface AddressTxListProps {
  address: string
}

export function AddressTxList({ address }: AddressTxListProps) {
  const [scanOffset, setScanOffset] = useState(0n)
  const { data: head } = useBlockNumber()
  const client = useViemClient()
  // rpcUrl included in query key so cache invalidates on chain switch
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  // Snapshot head on first arrival so live head changes don't cause continuous rescans
  const headRef = useRef<bigint | undefined>(undefined)
  if (headRef.current == null && head != null) headRef.current = head
  const stableHead = headRef.current

  // Reset scan state when address or chain changes
  useEffect(() => {
    setScanOffset(0n)
    headRef.current = undefined
  }, [address, rpcUrl])

  // Allow refreshing to latest head
  useEffect(() => {
    if (scanOffset === 0n && head != null) headRef.current = head
  }, [head, scanOffset])

  const scanTo = stableHead != null
    ? (scanOffset > stableHead ? 0n : stableHead - scanOffset)
    : undefined
  const rawFrom = stableHead != null
    ? stableHead - BigInt(SCAN_BLOCKS) - scanOffset + 1n
    : undefined
  const scanFrom = rawFrom != null ? (rawFrom < 0n ? 0n : rawFrom) : undefined

  // Disable query when range is degenerate (past genesis)
  const rangeValid = scanFrom != null && scanTo != null && scanTo > 0n

  const { data: recentTxs, isLoading: scanning } = useQuery({
    queryKey: ['addressTxs', rpcUrl, address, String(scanFrom), String(scanTo)],
    queryFn: async () => {
      if (scanFrom == null || scanTo == null) return []
      const txs: Transaction[] = []
      // Fetch in chunks of 10 with error resilience per block
      for (let start = scanTo; start >= scanFrom; start -= 10n) {
        const chunkEnd = start
        const chunkStart = start - 9n < scanFrom ? scanFrom : start - 9n
        const promises = []
        for (let i = chunkEnd; i >= chunkStart; i--) {
          promises.push(client.getBlock({ blockNumber: i, includeTransactions: true }))
        }
        const results = await Promise.allSettled(promises)
        const addr = address.toLowerCase()
        for (const result of results) {
          if (result.status === 'rejected') continue
          for (const tx of result.value.transactions) {
            if (typeof tx === 'string') continue
            if (tx.from.toLowerCase() === addr || tx.to?.toLowerCase() === addr) {
              txs.push(tx)
            }
          }
        }
      }
      return txs
    },
    enabled: rangeValid,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const canScanNewer = scanOffset > 0n
  const canScanOlder = scanFrom != null && scanFrom > 0n

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>
          {scanFrom != null && scanTo != null
            ? `Recent Activity (blocks ${formatNumber(scanFrom)} \u2013 ${formatNumber(scanTo)})`
            : 'Recent Activity'}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Showing transactions found in the last {SCAN_BLOCKS} blocks.
          Not seeing older transactions? This explorer scans recent blocks only
          &mdash; no indexer is used.
        </p>
      </CardHeader>
      <CardContent>
        {scanning ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : recentTxs == null ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            Waiting for block data...
          </p>
        ) : recentTxs.length > 0 ? (
          <TxListTable transactions={recentTxs} />
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No transactions found in scanned range.
          </p>
        )}

        <div className="flex items-center justify-between border-t px-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!canScanOlder}
            onClick={() => setScanOffset((prev) => prev + BigInt(SCAN_BLOCKS))}
          >
            Scan Older
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canScanNewer}
            onClick={() => setScanOffset((prev) => {
              const next = prev - BigInt(SCAN_BLOCKS)
              return next < 0n ? 0n : next
            })}
          >
            Scan Newer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
