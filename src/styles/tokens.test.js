import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'
import config from '../../tailwind.config.js'
import { LIGHT_PALETTE, PALETTE } from './palette.js'

// The Diptych tokens (spec §2.1, §3.2): src/styles/palette.js is the single
// source, Tailwind's colours and src/index.css's :root variables both carry it.

const c = config.theme.extend.colors
const indexCss = readFileSync(join(cwd(), 'src/index.css'), 'utf8')

function channel(v) {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const rgbOf = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function luminance(hex) {
  const [r, g, b] = rgbOf(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
// An rgba() colour composited over a hex ground, as a hex.
function blend(rgba, under) {
  const [r, g, b, a] = rgba.match(/[\d.]+/g).map(Number)
  const ground = rgbOf(under)
  return `#${[r, g, b].map((v, i) => Math.round(v * a + ground[i] * (1 - a)).toString(16).padStart(2, '0')).join('')}`
}

it('carries the Diptych palette', () => {
  expect(PALETTE).toEqual({
    onyx: '#0E0D0B', umber: '#1A1714', 'umber-2': '#211D19', ivory: '#EFE9DD',
    'ivory-2': 'rgba(239, 233, 221, 0.82)', 'ivory-3': 'rgba(239, 233, 221, 0.62)', stone: '#9B9488',
    hair: 'rgba(155, 148, 136, 0.3)', 'hair-2': 'rgba(155, 148, 136, 0.16)', 'hair-ctl': 'rgba(155, 148, 136, 0.62)',
    brass: '#B8954A', 'brass-l': '#D8BD7A', 'status-free': '#4FBF85', 'status-reserved': '#E9953F',
    'status-sold': '#D4574E', 'status-blocked': '#8A867D',
  })
  expect(Object.isFrozen(PALETTE)).toBe(true)
  // Tailwind's colours are the palette's custom properties alone (spec M3/M4
  // §9: the legacy palettes left with the legacy pages, ivory's shades with
  // them), so a utility follows the theme (polish spec §5).
  expect(c).toEqual(Object.fromEntries(Object.keys(PALETTE).map((key) => [key, `var(--${key})`])))
  for (const gone of ['paper', 'ink', 'dusk', 'light', 'gold-ink', 'graphite', 'rule', 'bronze-ink', 'status-free-deep'])
    expect(c[gone]).toBeUndefined()
})

// Polish spec §5: the light theme („травертин“), the same keys.
it('carries the light palette, key for key', () => {
  expect(LIGHT_PALETTE).toEqual({
    onyx: '#ECE6DA', umber: '#E2DACC', 'umber-2': '#D8CEBE', ivory: '#17140F',
    'ivory-2': 'rgba(23, 20, 15, 0.8)', 'ivory-3': 'rgba(23, 20, 15, 0.66)', stone: '#5E574B',
    hair: 'rgba(23, 20, 15, 0.2)', 'hair-2': 'rgba(23, 20, 15, 0.1)', 'hair-ctl': 'rgba(23, 20, 15, 0.5)',
    brass: '#8E6D2C', 'brass-l': '#735619', 'status-free': '#237F4E', 'status-reserved': '#B0621A',
    'status-sold': '#BA4136', 'status-blocked': '#7A756B',
  })
  expect(Object.isFrozen(LIGHT_PALETTE)).toBe(true)
  expect(Object.keys(LIGHT_PALETTE)).toEqual(Object.keys(PALETTE))
})

// The light values override the dark ones under :root[data-theme="light"],
// and a .dark island (what sits on photographs) takes the dark ones back.
it('writes the light values under :root[data-theme="light"] and the dark ones on .dark', () => {
  const block = (selector) => {
    const at = indexCss.indexOf(`${selector} {`)
    expect(at, selector).toBeGreaterThan(-1)
    return indexCss.slice(at, indexCss.indexOf('}', at))
  }
  const light = block(':root[data-theme="light"]')
  for (const [key, value] of Object.entries(LIGHT_PALETTE)) expect(light).toContain(`--${key}: ${value};`)
  expect(light).toContain('color-scheme: light;')
  const dark = block(':root[data-theme="light"] .dark')
  for (const [key, value] of Object.entries(PALETTE)) expect(dark).toContain(`--${key}: ${value};`)
  expect(dark).toContain('color-scheme: dark;')
  // The header over a page's dark opening (its overlay look) is one too,
  // until the page scrolls and it turns solid.
  expect(indexCss).toContain(':root[data-theme="light"] .hdr[data-look="overlay"],\n  :root[data-theme="light"] .dark {')
})

it('meets the contrast floors in the light theme', () => {
  const L = LIGHT_PALETTE
  expect(contrast(L.ivory, L.onyx)).toBeGreaterThanOrEqual(12)
  for (const ground of [L.onyx, L.umber]) {
    expect(contrast(blend(L['ivory-3'], ground), ground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(L.stone, ground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(L['brass-l'], ground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(L.brass, ground)).toBeGreaterThanOrEqual(3)
    expect(contrast(blend(L['hair-ctl'], ground), ground)).toBeGreaterThanOrEqual(3)
    for (const s of ['status-free', 'status-reserved', 'status-sold', 'status-blocked'])
      expect(contrast(L[s], ground)).toBeGreaterThanOrEqual(3)
  }
})

// Spec M3/M4 §9: the legacy theme went with the legacy pages: the Inter and
// Playfair stacks, the hero and display-1/2/3 sizes, the luxury and gold-glow
// shadows, the 18/88/128 spacing, the luxury radii, the entrance animations
// and the .container widths, with the content glob of an index.html the site
// has no more. What stays is Diptych's.
it('keeps no legacy theme', () => {
  const t = config.theme.extend
  expect(config.content).toEqual(['./src/**/*.{js,jsx,ts,tsx}'])
  expect(config.theme.container).toBeUndefined()
  expect(Object.keys(t.fontFamily)).toEqual(['display', 'text'])
  expect(Object.keys(t.fontSize)).toEqual(['body', 'small', 'label', 'h3', 'h2', 'display', 'count'])
  expect(t.boxShadow).toBeUndefined()
  expect(t.spacing).toBeUndefined()
  expect(t.borderRadius).toEqual({ ui: '2px' })
  expect(Object.keys(t.animation)).toEqual(['hero-rise'])
  expect(Object.keys(t.keyframes)).toEqual(['hero-rise'])
})

it('writes every palette value as a :root custom property', () => {
  for (const [key, value] of Object.entries(PALETTE)) expect(indexCss).toContain(`--${key}: ${value};`)
})

it('meets the contrast floors', () => {
  const { onyx, umber, ivory, stone, brass } = PALETTE
  expect(contrast(ivory, onyx)).toBeGreaterThanOrEqual(12)
  expect(contrast(blend(PALETTE['ivory-3'], onyx), onyx)).toBeGreaterThanOrEqual(4.5)
  for (const ground of [onyx, umber]) {
    expect(contrast(stone, ground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(blend(PALETTE['hair-ctl'], ground), ground)).toBeGreaterThanOrEqual(3)
    for (const s of ['status-free', 'status-reserved', 'status-sold', 'status-blocked'])
      expect(contrast(PALETTE[s], ground)).toBeGreaterThanOrEqual(3)
  }
  expect(contrast(brass, onyx)).toBeGreaterThanOrEqual(4.5)
})

// Spec §7.2: a floor's zero free count on the facade dims to stone at .65
// (src/explorer/explorer.css), 3.36:1 on onyx. The count is never under
// 24 px, so the large-text floor of 3:1 is the one that applies; the
// concept's .55 gave 2.71:1.
it('keeps a zero count on the facade at 3:1 on onyx', () => {
  const zero = contrast(blend('rgba(155, 148, 136, 0.65)', PALETTE.onyx), PALETTE.onyx)
  expect(zero).toBeGreaterThanOrEqual(3)
  expect(contrast(blend('rgba(155, 148, 136, 0.55)', PALETTE.onyx), PALETTE.onyx)).toBeLessThan(3)
})

it('sets the split breakpoint, hover gating and the type stacks', () => {
  expect(Object.entries(config.theme.screens)).toEqual([['sm', '640px'], ['md', '768px'], ['split', '901px'], ['lg', '1024px'], ['xl', '1280px'], ['2xl', '1536px']])
  expect(config.future.hoverOnlyWhenSupported).toBe(true)
  const t = config.theme.extend
  expect(t.fontFamily.display).toEqual(['"KSM Display"', '"KSM Display Fallback Georgia"', '"KSM Display Fallback Times"', '"KSM Display Fallback Noto"', 'serif'])
  expect(t.fontFamily.text).toEqual(['"KSM Text"', '"KSM Text Fallback Segoe"', '"KSM Text Fallback Arial"', '"KSM Text Fallback Roboto"', 'sans-serif'])
  expect(t.fontSize.body).toEqual(['16px', { lineHeight: '1.6' }])
  expect(t.fontSize.h2[0]).toBe('clamp(40px, 4.6vw, 76px)')
  expect(t.fontSize.count[0]).toBe('clamp(40px, 3.6vw, 60px)')
})

// src/index.css names the same two stacks for hand-written CSS, so the two
// copies cannot drift apart.
it('gives hand-written CSS the same type stacks as Tailwind', () => {
  const t = config.theme.extend
  expect(indexCss).toContain(`--serif: ${t.fontFamily.display.join(', ')};`)
  expect(indexCss).toContain(`--sans: ${t.fontFamily.text.join(', ')};`)
})

// The brightest the ground allows (src/styles/diptych.css's hovers): white on
// the dark grounds, black on the light one, white again on a dark island.
it('sets --hi for each ground', () => {
  const after = (selector) => indexCss.slice(indexCss.indexOf(`${selector} {`))
  const valueIn = (block) => /--hi: (#[0-9A-F]{6});/.exec(block.slice(0, block.indexOf('}')))?.[1]
  expect(valueIn(after('  :root'))).toBe('#FFFFFF')
  expect(valueIn(after(':root[data-theme="light"]'))).toBe('#000000')
  expect(valueIn(after(':root[data-theme="light"] .dark'))).toBe('#FFFFFF')
})
