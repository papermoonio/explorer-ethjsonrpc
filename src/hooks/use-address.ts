import { useQuery } from '@tanstack/react-query'
import { isAddress } from 'viem'
import { useViemClient } from './use-viem-client'
import { useAppStore } from '@/stores/app-store'

/**
 * Fetch balance, nonce, and bytecode for an address in parallel.
 *
 * All three calls share the same query key so they are fetched/cached as a unit.
 * A non-empty `code` field indicates the address is a contract.
 */
export function useAddress(address: string | undefined) {
  const client = useViemClient()
  const rpcUrl = useAppStore((s) => s.selectedChain.rpcUrl)

  return useQuery({
    queryKey: ['address', rpcUrl, address],
    queryFn: async () => {
      const addr = address as `0x${string}`
      const [balance, nonce, code] = await Promise.all([
        client.getBalance({ address: addr }),
        client.getTransactionCount({ address: addr }),
        client.getCode({ address: addr }),
      ])
      return { balance, nonce, code }
    },
    enabled: !!address && isAddress(address),
    staleTime: 10_000,
  })
}
