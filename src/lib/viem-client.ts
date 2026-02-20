import { createPublicClient, http, type PublicClient } from 'viem'

const clientCache = new Map<string, PublicClient>()

/**
 * Return a memoised viem `PublicClient` for the given RPC URL.
 * Subsequent calls with the same URL return the cached instance.
 */
export function getViemClient(rpcUrl: string): PublicClient {
  const existing = clientCache.get(rpcUrl)
  if (existing) return existing

  const client = createPublicClient({
    transport: http(rpcUrl, {
      batch: { wait: 16 },
      retryCount: 3,
      timeout: 15_000,
    }),
  })

  clientCache.set(rpcUrl, client)
  return client
}

/** Remove a cached client (call when removing a custom chain). */
export function removeViemClient(rpcUrl: string): void {
  clientCache.delete(rpcUrl)
}
