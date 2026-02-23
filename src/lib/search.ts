export type SearchType = 'address' | 'txHash' | 'blockNumber' | 'blockHash'

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const HASH_RE = /^0x[0-9a-fA-F]{64}$/
const BLOCK_NUMBER_RE = /^\d+$/

/** Classify a raw search query into an entity type, or `null` if unrecognised. */
export function detectSearchType(input: string): SearchType | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (ADDRESS_RE.test(trimmed)) return 'address'
  if (HASH_RE.test(trimmed)) return 'txHash'
  if (trimmed.startsWith('0x') && /^0x[0-9a-fA-F]+$/.test(trimmed)) return 'blockHash'
  if (BLOCK_NUMBER_RE.test(trimmed)) return 'blockNumber'
  return null
}
