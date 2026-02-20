import { env } from '@/config/env'

/**
 * Convert a hex color string (#rrggbb) to OKLch components [L, C, h].
 * Returns [0.5, 0, 0] (neutral gray) on invalid input.
 */
function hexToOklch(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m?.[1]) return [0.5, 0, 0]

  const digits = m[1]
  // hex → sRGB [0..1]
  const r = parseInt(digits.slice(0, 2), 16) / 255
  const g = parseInt(digits.slice(2, 4), 16) / 255
  const b = parseInt(digits.slice(4, 6), 16) / 255

  // sRGB → linear RGB
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)

  // linear RGB → LMS (using OKLab M1 matrix)
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  // LMS → OKLab (cube root + M2 matrix)
  const l1 = Math.cbrt(l_), m1 = Math.cbrt(m_), s1 = Math.cbrt(s_)
  const L = 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1
  const a = 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1
  const bLab = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1

  // OKLab → OKLch
  const C = Math.sqrt(a * a + bLab * bLab)
  const h = C < 0.002 ? 0 : ((Math.atan2(bLab, a) * 180) / Math.PI + 360) % 360

  return [L, C, h]
}

function oklchStr(L: number, C: number, h: number): string {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`
}

/**
 * Apply brand colors from env to CSS custom properties.
 * Injects a <style> tag with :root and .dark overrides.
 * Call once at app startup.
 */
export function applyBrandColors(): void {
  const { primaryColor } = env
  if (!primaryColor) return

  const [pL, pC, pH] = hexToOklch(primaryColor || '#6366f1')

  // Skip if the color has no saturation (grayscale) — use default theme
  if (pC < 0.01) return

  // Chart colors: use env overrides or derive from primary
  const { chartColor1, chartColor2 } = env
  const [c1L, c1C, c1H] = chartColor1 ? hexToOklch(chartColor1) : [pL, pC, pH]
  const [c2L, c2C, c2H] = chartColor2 ? hexToOklch(chartColor2) : [pL, pC, (pH + 60 + 360) % 360]

  const rules: string[] = []

  // Light mode overrides
  rules.push(':root {')
  rules.push(`  --primary: ${oklchStr(Math.min(pL, 0.55), pC, pH)};`)
  rules.push(`  --primary-fg: oklch(0.985 0 0);`)
  rules.push(`  --accent: ${oklchStr(0.95, pC * 0.08, pH)};`)
  rules.push(`  --accent-fg: ${oklchStr(0.35, pC * 0.5, pH)};`)
  rules.push(`  --secondary: ${oklchStr(0.97, pC * 0.03, pH)};`)
  rules.push(`  --secondary-fg: ${oklchStr(0.35, pC * 0.5, pH)};`)
  rules.push(`  --ring: ${oklchStr(0.55, pC, pH)};`)
  rules.push(`  --chart-1: ${oklchStr(Math.min(c1L, 0.6), c1C, c1H)};`)
  rules.push(`  --chart-2: ${oklchStr(Math.min(c1L, 0.65), c1C * 0.7, c1H)};`)
  rules.push(`  --chart-3: ${oklchStr(Math.min(c2L, 0.6), c2C, c2H)};`)
  rules.push(`  --chart-4: ${oklchStr(Math.min(c2L, 0.65), c2C * 0.7, c2H)};`)
  rules.push(`  --chart-5: ${oklchStr(Math.min(pL, 0.6), pC * 0.8, pH)};`)
  rules.push('}')

  // Dark mode overrides
  rules.push('.dark {')
  rules.push(`  --primary: ${oklchStr(Math.max(pL, 0.65), pC * 0.85, pH)};`)
  rules.push(`  --primary-fg: oklch(0.985 0 0);`)
  rules.push(`  --accent: ${oklchStr(0.27, pC * 0.12, pH)};`)
  rules.push(`  --accent-fg: oklch(0.985 0 0);`)
  rules.push(`  --secondary: ${oklchStr(0.27, pC * 0.05, pH)};`)
  rules.push(`  --secondary-fg: oklch(0.985 0 0);`)
  rules.push(`  --ring: ${oklchStr(0.55, pC, pH)};`)
  rules.push(`  --border: ${oklchStr(0.35, pC * 0.04, pH)};`)
  rules.push(`  --input: ${oklchStr(0.35, pC * 0.04, pH)};`)
  rules.push(`  --chart-1: ${oklchStr(Math.max(c1L, 0.65), c1C * 0.85, c1H)};`)
  rules.push(`  --chart-2: ${oklchStr(Math.max(c1L, 0.7), c1C * 0.6, c1H)};`)
  rules.push(`  --chart-3: ${oklchStr(Math.max(c2L, 0.65), c2C * 0.85, c2H)};`)
  rules.push(`  --chart-4: ${oklchStr(Math.max(c2L, 0.7), c2C * 0.6, c2H)};`)
  rules.push(`  --chart-5: ${oklchStr(Math.max(pL, 0.65), pC * 0.7, pH)};`)
  rules.push('}')

  const style = document.createElement('style')
  style.setAttribute('data-brand-colors', '')
  style.textContent = rules.join('\n')
  document.head.appendChild(style)
}

/**
 * Set the favicon from env config. Call once at app startup.
 */
export function applyFavicon(): void {
  const { appFaviconUrl } = env
  if (!appFaviconUrl) return

  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (link) {
    link.href = appFaviconUrl
    // Remove type restriction so any image format works
    link.removeAttribute('type')
  } else {
    const newLink = document.createElement('link')
    newLink.rel = 'icon'
    newLink.href = appFaviconUrl
    document.head.appendChild(newLink)
  }
}
