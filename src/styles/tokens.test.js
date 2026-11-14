import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'
import config from '../../tailwind.config.js'
import { PALETTE } from './palette.js'

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
  expect(c.onyx).toBe('#0E0D0B')
  expect(c.ivory).toMatchObject({ DEFAULT: '#EFE9DD', 50: '#f8f8f6' })
  for (const gone of ['paper', 'ink', 'dusk', 'light', 'gold-ink', 'graphite', 'rule', 'bronze-ink', 'status-free-deep'])
    expect(c[gone]).toBeUndefined()
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
