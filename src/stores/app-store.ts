import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import { type Chain, defaultChains } from '@/config/chains'
import { removeViemClient } from '@/lib/viem-client'
import { removeWsClient } from '@/lib/ws-client'

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
    (set) => ({
      selectedChain: defaultChains[0]!,
      customChains: [],
      setSelectedChain: (chain) => set({ selectedChain: chain }),
      addCustomChain: (chain) =>
        set((s) => {
          if (defaultChains.some((c) => c.id === chain.id) || s.customChains.some((c) => c.id === chain.id)) return s
          return { customChains: [...s.customChains, chain] }
        }),
      removeCustomChain: (chainId) =>
        set((s) => {
          const removed = s.customChains.find((c) => c.id === chainId)
          if (removed) {
            removeViemClient(removed.rpcUrl)
            if (removed.wsUrl) removeWsClient(removed.wsUrl).catch(() => {})
          }
          return {
            customChains: s.customChains.filter((c) => c.id !== chainId),
            ...(s.selectedChain.id === chainId ? { selectedChain: defaultChains[0]! } : {}),
          }
        }),

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

/** Resolve the effective theme ('light' | 'dark'), honouring 'system'. */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useAppStore((s) => s.theme)
  if (theme !== 'system') return theme
  // At call-time, read the OS preference (SSR-safe fallback to 'light')
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

// ---------------------------------------------------------------------------
// Theme side-effect: keep <html> class in sync
// ---------------------------------------------------------------------------

function applyThemeClass(theme: Theme): void {
  if (typeof document === 'undefined') return
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

let themeSyncInitialized = false

/**
 * Call once at app startup (e.g. in main.tsx) to keep the `dark` class on
 * `<html>` synchronised with the store and the OS preference.
 * Idempotent — safe to call multiple times (e.g. React strict-mode).
 */
export function initThemeSync(): void {
  if (themeSyncInitialized) return
  themeSyncInitialized = true

  // Apply immediately from current store value
  applyThemeClass(useAppStore.getState().theme)

  // Re-apply whenever the theme value changes in the store
  useAppStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme) applyThemeClass(state.theme)
  })

  // Listen for OS preference changes when theme is 'system'
  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', () => {
      if (useAppStore.getState().theme === 'system') {
        applyThemeClass('system')
      }
    })
  }
}
