import { describe, it, expect } from 'vitest'

// Extracted search type detection logic matching search-bar.tsx patterns
function detectSearchType(
  input: string,
): 'address' | 'txHash' | 'blockNumber' | 'blockHash' | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return 'address'
  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return 'txHash'
  if (trimmed.startsWith('0x') && /^0x[0-9a-fA-F]+$/.test(trimmed))
    return 'blockHash'
  if (/^\d+$/.test(trimmed)) return 'blockNumber'
  return null
}

describe('search type detection', () => {
  it('detects a 40-char hex as address', () => {
    const addr = '0x' + 'a'.repeat(40)
    expect(detectSearchType(addr)).toBe('address')
  })

  it('detects a 64-char hex as txHash', () => {
    const tx = '0x' + 'b'.repeat(64)
    expect(detectSearchType(tx)).toBe('txHash')
  })

  it('detects all digits as blockNumber', () => {
    expect(detectSearchType('12345678')).toBe('blockNumber')
  })

  it('detects hex with other length as blockHash', () => {
    const hash = '0x' + 'c'.repeat(20)
    expect(detectSearchType(hash)).toBe('blockHash')
  })

  it('returns null for empty string', () => {
    expect(detectSearchType('')).toBeNull()
  })

  it('returns null for whitespace-only input', () => {
    expect(detectSearchType('   ')).toBeNull()
  })

  it('returns null for invalid non-hex input', () => {
    expect(detectSearchType('hello world')).toBeNull()
  })

  it('trims whitespace before detection', () => {
    const addr = '  0x' + 'a'.repeat(40) + '  '
    expect(detectSearchType(addr)).toBe('address')
  })
})
