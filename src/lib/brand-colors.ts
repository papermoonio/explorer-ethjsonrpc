import { env } from '@/config/env'

/**
 * Convert a hex color string (#rrggbb) to OKLch components [L, C, h].
 * Returns [0.5, 0, 0] (neutral gray) on invalid input.
 */
export function hexToOklch(hex: string): [number, number, number] {
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

export interface BrandColorInput {
  primaryColor: string
  chartColor1?: string
  chartColor2?: string
}

/**
 * Pure function: derive theme CSS from brand colors.
 * Returns the CSS string, or `null` if the input is invalid / grayscale.
 * No DOM access — safe for SSR and unit testing.
 */
export function generateBrandCss(input: BrandColorInput): string | null {
  const { primaryColor, chartColor1, chartColor2 } = input
  if (!primaryColor) return null

  const [pL, pC, pH] = hexToOklch(primaryColor)
  if (pC < 0.01) return null // grayscale — use default theme

  const hue = (offset: number) => (pH + offset + 360) % 360
  const chartHues: [number, number, number, number, number] = (() => {
    if (chartColor1 && chartColor2) {
      const [, , h1] = hexToOklch(chartColor1)
      const [, , h2] = hexToOklch(chartColor2)
      const mid = (h1 + h2) / 2
      return [h1, h2, hue(120), hue(-60), mid]
    }
    return [hue(0), hue(30), hue(-30), hue(60), hue(-60)]
  })()
  const cL = pL, cC = pC

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
  rules.push(`  --chart-1: ${oklchStr(Math.min(cL, 0.6), cC, chartHues[0])};`)
  rules.push(`  --chart-2: ${oklchStr(Math.min(cL, 0.6), cC, chartHues[1])};`)
  rules.push(`  --chart-3: ${oklchStr(Math.min(cL, 0.6), cC, chartHues[2])};`)
  rules.push(`  --chart-4: ${oklchStr(Math.min(cL, 0.6), cC * 0.85, chartHues[3])};`)
  rules.push(`  --chart-5: ${oklchStr(Math.min(cL, 0.6), cC * 0.85, chartHues[4])};`)
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
  rules.push(`  --chart-1: ${oklchStr(Math.max(cL, 0.65), cC * 0.85, chartHues[0])};`)
  rules.push(`  --chart-2: ${oklchStr(Math.max(cL, 0.65), cC * 0.85, chartHues[1])};`)
  rules.push(`  --chart-3: ${oklchStr(Math.max(cL, 0.65), cC * 0.85, chartHues[2])};`)
  rules.push(`  --chart-4: ${oklchStr(Math.max(cL, 0.65), cC * 0.7, chartHues[3])};`)
  rules.push(`  --chart-5: ${oklchStr(Math.max(cL, 0.65), cC * 0.7, chartHues[4])};`)
  rules.push('}')

  return rules.join('\n')
}

/**
 * Apply brand colors from env to CSS custom properties.
 * Injects a <style> tag with :root and .dark overrides.
 * Call once at app startup.
 */
export function applyBrandColors(): void {
  const css = generateBrandCss({
    primaryColor: env.primaryColor,
    chartColor1: env.chartColor1 || undefined,
    chartColor2: env.chartColor2 || undefined,
  })
  if (!css) return

  const style = document.createElement('style')
  style.setAttribute('data-brand-colors', '')
  style.textContent = css
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
