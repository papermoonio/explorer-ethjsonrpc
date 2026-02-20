import { formatEther, formatGwei } from 'viem'
import { formatDistanceToNow, format } from 'date-fns'

export { formatEther, formatGwei }

/** Truncate a hex string: `0x1234...abcd`. */
export function truncateHash(
  hash: string | null | undefined,
  startLen = 6,
  endLen = 4,
): string {
  if (!hash) return ''
  if (hash.length <= startLen + endLen + 2) return hash
  return `${hash.slice(0, startLen + 2)}\u2026${hash.slice(-endLen)}`
}

/** Truncate an address (alias with sensible defaults). */
export function truncateAddress(address: string | null | undefined): string {
  return truncateHash(address, 6, 4)
}

/** Format a block timestamp (unix seconds) to a relative string like "3 minutes ago". */
export function formatTimestamp(timestamp: number | bigint): string {
  const ms = Number(timestamp) * 1000
  return formatDistanceToNow(new Date(ms), { addSuffix: true })
}

/** Format a block timestamp (unix seconds) to a full date-time string. */
export function formatFullTimestamp(timestamp: number | bigint): string {
  const ms = Number(timestamp) * 1000
  return format(new Date(ms), 'PPpp')
}

/** Format a number with locale-aware thousands separators. */
export function formatNumber(num: number | bigint): string {
  if (typeof num === 'bigint') return num.toLocaleString()
  return num.toLocaleString()
}

/** Calculate gas usage as a percentage of the gas limit. */
export function gasPercentage(used: bigint, limit: bigint): number {
  if (limit === 0n) return 0
  return Number((used * 10000n) / limit) / 100
}

/** Derive a deterministic hex colour from an address (for visual identification). */
export function addressToColor(address: string): string {
  const hex = address.slice(2, 8)
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#888888'
  return `#${hex}`
}
