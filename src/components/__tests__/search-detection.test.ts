import { describe, it, expect } from 'vitest'
import { detectSearchType } from '@/lib/search'

describe('search type detection', () => {
  it('detects a 40-char hex as address', () => {
    const addr = '0x' + 'a'.repeat(40)
    expect(detectSearchType(addr)).toBe('address')
  })

  it('detects a 64-char hex as hash (ambiguous tx/block)', () => {
    const tx = '0x' + 'b'.repeat(64)
    expect(detectSearchType(tx)).toBe('hash')
  })

  it('detects all digits as blockNumber', () => {
    expect(detectSearchType('12345678')).toBe('blockNumber')
  })

  it('detects non-standard hex as hexBlock', () => {
    const hex = '0x' + 'c'.repeat(20)
    expect(detectSearchType(hex)).toBe('hexBlock')
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
