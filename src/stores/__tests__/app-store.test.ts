import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('@/lib/viem-client', () => ({
  getViemClient: vi.fn(),
  removeViemClient: vi.fn(),
}))

// jsdom does not provide window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

import { useAppStore, useAllChains, useResolvedTheme } from '../app-store'
import { defaultChains, type Chain } from '@/config/chains'

const testChain: Chain = {
  id: 999,
  name: 'test-chain',
  displayName: 'Test Chain',
  rpcUrl: 'https://rpc.test.example',
  network: 'testnet',
  nativeCurrency: { name: 'Test', symbol: 'TST', decimals: 18 },
}

function resetStore() {
  useAppStore.setState({
    selectedChain: defaultChains[0]!,
    customChains: [],
    theme: 'system',
  })
}

describe('useAppStore', () => {
  beforeEach(resetStore)

  it('has initial selectedChain set to first default chain', () => {
    expect(useAppStore.getState().selectedChain).toEqual(defaultChains[0])
  })

  it('setSelectedChain updates the selected chain', () => {
    useAppStore.getState().setSelectedChain(testChain)
    expect(useAppStore.getState().selectedChain).toEqual(testChain)
  })

  it('addCustomChain adds a chain to customChains', () => {
    useAppStore.getState().addCustomChain(testChain)
    expect(useAppStore.getState().customChains).toHaveLength(1)
    expect(useAppStore.getState().customChains[0]).toEqual(testChain)
  })

  it('addCustomChain deduplicates by chain ID', () => {
    useAppStore.getState().addCustomChain(testChain)
    useAppStore.getState().addCustomChain({ ...testChain, name: 'duplicate' })
    expect(useAppStore.getState().customChains).toHaveLength(1)
  })

  it('removeCustomChain removes the chain', () => {
    useAppStore.getState().addCustomChain(testChain)
    useAppStore.getState().removeCustomChain(testChain.id)
    expect(useAppStore.getState().customChains).toHaveLength(0)
  })

  it('setTheme updates theme', () => {
    useAppStore.getState().setTheme('dark')
    expect(useAppStore.getState().theme).toBe('dark')
  })
})

describe('useAllChains', () => {
  beforeEach(resetStore)

  it('returns defaults plus custom chains', () => {
    useAppStore.getState().addCustomChain(testChain)
    const { result } = renderHook(() => useAllChains())
    expect(result.current).toEqual([...defaultChains, testChain])
  })
})

describe('useResolvedTheme', () => {
  beforeEach(resetStore)

  it('returns light or dark for system theme', () => {
    const { result } = renderHook(() => useResolvedTheme())
    expect(['light', 'dark']).toContain(result.current)
  })

  it('returns explicit theme when set', () => {
    useAppStore.getState().setTheme('dark')
    const { result } = renderHook(() => useResolvedTheme())
    expect(result.current).toBe('dark')
  })
})
