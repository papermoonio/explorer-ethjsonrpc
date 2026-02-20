import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/stores/app-store'
import { getWsClient } from '@/lib/ws-client'

/**
 * Subscribes to `newHeads` via WebSocket (when available) and pushes
 * the latest block number directly into the TanStack Query cache.
 * Falls back silently to HTTP polling when no wsUrl is configured.
 */
export function useBlockSubscription(): void {
  const queryClient = useQueryClient()
  const wsUrl = useAppStore((s) => s.selectedChain.wsUrl)
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  useEffect(() => {
    if (!wsUrl) return

    const client = getWsClient(wsUrl)
    if (!client) return

    let unwatch: (() => void) | undefined
    let errorLogged = false

    try {
      unwatch = client.watchBlockNumber({
        onBlockNumber(blockNumber) {
          queryClient.setQueryData(['blockNumber', rpcUrl], blockNumber)
        },
        onError(error) {
          if (errorLogged) return
          errorLogged = true
          const isSocketClosed = error?.name === 'SocketClosedError' ||
            String(error?.message ?? '').includes('socket has been closed')
          if (isSocketClosed) {
            console.warn('[ws-subscription] WebSocket closed, falling back to HTTP polling:', wsUrl)
          } else {
            console.warn('[ws-subscription] watch error, falling back to HTTP polling:', error)
          }
          unwatch?.()
          unwatch = undefined
        },
      })
    } catch (err) {
      console.warn('[ws-subscription] failed to start watch:', err)
    }

    return () => {
      unwatch?.()
    }
  }, [wsUrl, rpcUrl, queryClient])
}
