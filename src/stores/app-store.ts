import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo, useSyncExternalStore } from 'react'
import { type Chain, defaultChains } from '@/config/chains'
import { cleanupChainClients } from './chain-cleanup'

type Theme = 'light' | 'dark' | 'system'

interface AppState {
  // Chain
  selectedChain: Chain
  customChains: Chain[]
  setSelectedChain: (chain: Chain) => void
  addCustomChain: (chain: Chain) => void
  removeCustomChain: (chainId: number) => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedChain: defaultChains[0]!,
      customChains: [],
      setSelectedChain: (chain) => set({ selectedChain: chain }),
      addCustomChain: (chain) =>
        set((s) => {
          if (defaultChains.some((c) => c.id === chain.id) || s.customChains.some((c) => c.id === chain.id)) return s
          return { customChains: [...s.customChains, chain] }
        }),
      removeCustomChain: (chainId) => {
        const removed = get().customChains.find((c) => c.id === chainId)
        set((s) => ({
          customChains: s.customChains.filter((c) => c.id !== chainId),
          ...(s.selectedChain.id === chainId ? { selectedChain: defaultChains[0]! } : {}),
        }))
        if (removed) cleanupChainClients(removed)
      },

      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'explorer-jsonrpc-settings',
      partialize: (state) => ({
        customChains: state.customChains,
        theme: state.theme,
      }),
    },
  ),
)

// ---------------------------------------------------------------------------
// Derived selectors
// ---------------------------------------------------------------------------

/** All available chains: defaults + user-added custom chains. */
export function useAllChains(): Chain[] {
  const customChains = useAppStore((s) => s.customChains)
  return useMemo(() => [...defaultChains, ...customChains], [customChains])
}

const darkMql = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

function subscribeToDarkMode(cb: () => void) {
  darkMql?.addEventListener('change', cb)
  return () => darkMql?.removeEventListener('change', cb)
}

function getOsDark() {
  return darkMql?.matches ?? false
}

/** Resolve the effective theme ('light' | 'dark'), honouring 'system'. */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useAppStore((s) => s.theme)
  const osDark = useSyncExternalStore(subscribeToDarkMode, getOsDark, () => false)
  if (theme !== 'system') return theme
  return osDark ? 'dark' : 'light'
}
