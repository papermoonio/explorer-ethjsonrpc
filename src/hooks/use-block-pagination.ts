import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

/**
 * Shared pagination state for block list views.
 *
 * Manages the page offset from an anchor block, computes the
 * `from`/`to` BigInt range, and resets on chain changes.
 */
export function useBlockPagination(
  anchor: bigint | undefined,
  pageSize: number,
  extraResetDeps: readonly unknown[] = [],
) {
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)
  const [pageOffset, setPageOffset] = useState(0n)

  // Reset pagination when chain (or caller-specified deps) change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPageOffset(0n) }, [rpcUrl, ...extraResetDeps])

  const rawTo = anchor != null ? anchor - pageOffset : undefined
  const to = rawTo != null && rawTo < 0n ? 0n : rawTo
  const from =
    to != null
      ? to - BigInt(pageSize - 1) < 0n
        ? 0n
        : to - BigInt(pageSize - 1)
      : undefined

  const handleNavigate = useCallback(
    (_from: bigint, newTo: bigint) => {
      if (anchor == null) return
      setPageOffset(anchor - newTo)
    },
    [anchor],
  )

  return { from, to, handleNavigate } as const
}
