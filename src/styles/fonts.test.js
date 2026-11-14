import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'
import { links } from '../root.jsx'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks.js'

// The self-hosted faces (spec §3.1; scripts/fonts/build-fonts.py, REPORT.md):
// Cormorant Garamond as KSM Display, normal (variable 500–600) and italic
// (static 500), and Manrope as KSM Text (variable 400–600). Three files within
// 90 KiB, each face with metric-matched fallbacks. The root preloads the text
// face, the shell's; a page that sets display type in its first viewport
// preloads both display files from its own links (DISPLAY_FONT_PRELOADS).

const fontsDir = join(cwd(), 'public/fonts')
const woff2Files = () => readdirSync(fontsDir).filter((f) => f.endsWith('.woff2'))
const sizeOf = (file) => statSync(join(fontsDir, file)).size
const totalBytes = () => woff2Files().reduce((n, file) => n + sizeOf(file), 0)
const css = readFileSync(join(cwd(), 'src/styles/fonts.css'), 'utf8')
const faces = () => css.match(/@font-face\s*\{[^}]*\}/g) ?? []
// The @font-face of exactly `family` in `style`.
const face = (family, style) =>
  faces().find((f) => f.includes(`font-family: "${family}";`) && f.includes(`font-style: ${style};`))
const fallbackFaces = () => faces().filter((f) => /font-family: "KSM \w+ Fallback /.test(f))

it('ships the three faces within 90 KiB', () => {
  expect(woff2Files().sort()).toEqual(['ksm-display-italic.woff2', 'ksm-display.woff2', 'ksm-text.woff2'])
  expect(totalBytes()).toBeLessThanOrEqual(90 * 1024)
  console.info(
    `fonts: ${woff2Files().sort().map((file) => `${file} ${sizeOf(file)} B`).join(', ')}; ${totalBytes()} B of ${90 * 1024} (90 KiB)`,
  )
})

it('declares each face with swap', () => {
  expect(face('KSM Display', 'normal')).toMatch(/font-weight: 500 600;[\s\S]*font-display: swap/)
  expect(face('KSM Display', 'italic')).toMatch(/ksm-display-italic\.woff2[\s\S]*font-weight: 500;[\s\S]*font-display: swap/)
  expect(face('KSM Text', 'normal')).toMatch(/font-weight: 400 600;[\s\S]*font-display: swap/)
})

it('metric-matches every fallback family', () => {
  for (const f of ['Georgia', 'Times', 'Noto']) {
    expect(face(`KSM Display Fallback ${f}`, 'normal')).toBeTruthy()
    expect(face(`KSM Display Fallback ${f}`, 'italic')).toBeTruthy()
  }
  for (const f of ['Segoe', 'Arial', 'Roboto']) expect(face(`KSM Text Fallback ${f}`, 'normal')).toBeTruthy()
  for (const f of fallbackFaces())
    for (const p of ['size-adjust:', 'ascent-override:', 'descent-override:', 'line-gap-override:']) expect(f).toContain(p)
})

it('preloads the text face from the root and the display faces from route links', () => {
  expect(links()).toContainEqual({ rel: 'preload', href: '/fonts/ksm-text.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  expect(links().some((l) => l.href?.includes('ksm-display'))).toBe(false)
  expect(DISPLAY_FONT_PRELOADS.map((l) => l.href)).toEqual(['/fonts/ksm-display.woff2', '/fonts/ksm-display-italic.woff2'])
  for (const preload of DISPLAY_FONT_PRELOADS)
    expect(preload).toEqual({ rel: 'preload', href: preload.href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  expect(Object.isFrozen(DISPLAY_FONT_PRELOADS)).toBe(true)
})
