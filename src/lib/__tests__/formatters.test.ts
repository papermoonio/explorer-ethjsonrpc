import { describe, it, expect } from 'vitest'
import {
  truncateHash,
  truncateAddress,
  formatTimestamp,
  formatFullTimestamp,
  formatNumber,
  gasPercentage,
  addressToColor,
} from '../formatters'

describe('truncateHash', () => {
  it('truncates a normal 42-char address', () => {
    const hash = '0x1234567890abcdef1234567890abcdef12345678'
    // startLen=6, endLen=4 => slice(0,8) + ellipsis + slice(-4)
    expect(truncateHash(hash)).toBe('0x123456\u20265678')
  })

  it('returns short hash unchanged when within threshold', () => {
    expect(truncateHash('0xabcd')).toBe('0xabcd')
  })

  it('returns empty string for empty input', () => {
    expect(truncateHash('')).toBe('')
  })

  it('returns empty string for null', () => {
    expect(truncateHash(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(truncateHash(undefined)).toBe('')
  })

  it('respects custom startLen and endLen', () => {
    const hash = '0xaabbccddee1122334455'
    const result = truncateHash(hash, 4, 2)
    expect(result).toBe('0xaabb\u202655')
  })
})

describe('truncateAddress', () => {
  it('delegates to truncateHash with default params', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678'
    expect(truncateAddress(addr)).toBe(truncateHash(addr, 6, 4))
  })

  it('handles null', () => {
    expect(truncateAddress(null)).toBe('')
  })
})

describe('formatTimestamp', () => {
  it('returns a relative string without throwing', () => {
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600
    const result = formatTimestamp(oneHourAgo)
    expect(typeof result).toBe('string')
    expect(result).toContain('ago')
  })

  it('accepts bigint input', () => {
    const ts = BigInt(Math.floor(Date.now() / 1000) - 60)
    expect(() => formatTimestamp(ts)).not.toThrow()
  })
})

describe('formatFullTimestamp', () => {
  it('returns a formatted date string', () => {
    // 2024-01-15 12:00:00 UTC = 1705320000
    const result = formatFullTimestamp(1705320000)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatNumber', () => {
  it('formats a number with locale separators', () => {
    const result = formatNumber(1234567)
    expect(result).toBeTruthy()
  })

  it('formats a bigint', () => {
    const result = formatNumber(9876543210n)
    expect(result).toBeTruthy()
  })
})

describe('gasPercentage', () => {
  it('calculates percentage correctly', () => {
    expect(gasPercentage(50n, 100n)).toBe(50)
  })

  it('returns 0 when limit is zero', () => {
    expect(gasPercentage(100n, 0n)).toBe(0)
  })

  it('returns 100 for full usage', () => {
    expect(gasPercentage(100n, 100n)).toBe(100)
  })

  it('handles precision for non-round percentages', () => {
    // 1/3 = 33.33%
    expect(gasPercentage(1n, 3n)).toBeCloseTo(33.33, 0)
  })
})

describe('addressToColor', () => {
  it('extracts color from valid address', () => {
    expect(addressToColor('0xaabbcc1234567890')).toBe('#aabbcc')
  })

  it('returns fallback for address with invalid hex after 0x', () => {
    expect(addressToColor('0xZZZZZZ')).toBe('#888888')
  })

  it('returns fallback for short address', () => {
    expect(addressToColor('0xab')).toBe('#888888')
  })
})
