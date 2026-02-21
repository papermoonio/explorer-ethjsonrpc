import { useAppStore } from './app-store'

type Theme = 'light' | 'dark' | 'system'

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

let initialized = false

/**
 * Call once at app startup (e.g. in main.tsx) to keep the `dark` class on
 * `<html>` synchronised with the store and the OS preference.
 * Idempotent — safe to call multiple times (e.g. React strict-mode).
 */
export function initThemeSync(): void {
  if (initialized) return
  initialized = true

  applyThemeClass(useAppStore.getState().theme)

  useAppStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme) applyThemeClass(state.theme)
  })

  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', () => {
      if (useAppStore.getState().theme === 'system') {
        applyThemeClass('system')
      }
    })
  }
}
