import { describe, expect, it } from 'vitest'
import config from '../../tailwind.config.js'

const c = config.theme.extend.colors

function channel(v) {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('design tokens', () => {
  it('carries the exact palette', () => {
    expect(c.paper).toBe('#F1F2EF')
    expect(c.ink).toBe('#14202F')
    expect(c.dusk).toBe('#1F3A63')
    expect(c.light).toBe('#F5D88F')
    expect(c.graphite).toBe('#465060')
    expect(c.rule).toBe('#CBD0D4')
    expect(c['bronze-ink']).toBe('#7A6549')
    expect(c['status-free']).toBe('#3F8F55')
    expect(c['status-free-deep']).toBe('#2F6E41')
    expect(c['status-reserved']).toBe('#C9962E')
    expect(c['status-sold']).toBe('#B23A30')
    expect(c['status-blocked']).toBe('#7A828C')
  })

  it('keeps text pairings readable', () => {
    expect(contrast(c['gold-ink'], c.paper)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(c.graphite, c.paper)).toBeGreaterThanOrEqual(7)
    expect(contrast(c.paper, c.dusk)).toBeGreaterThanOrEqual(7)
    expect(contrast(c.light, c.dusk)).toBeGreaterThanOrEqual(7)
    expect(contrast(c.ink, c.paper)).toBeGreaterThanOrEqual(12)
    for (const s of ['status-free-deep', 'status-sold', 'status-blocked'])
      expect(contrast(c[s], c.paper)).toBeGreaterThanOrEqual(3)
  })

  it('defines type, radius and easing', () => {
    const t = config.theme.extend
    expect(t.fontFamily.display[0]).toBe('"KSM Display"')
    expect(t.fontFamily.text[0]).toBe('"KSM Text"')
    expect(t.fontSize.body).toEqual(['17px', { lineHeight: '1.6' }])
    expect(t.fontSize.count[0]).toBe('clamp(56px, 9vw, 140px)')
    expect(t.borderRadius.ui).toBe('2px')
    expect(t.transitionTimingFunction['expo-out']).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
    expect(t.transitionTimingFunction['power3-out']).toBe('cubic-bezier(0.215, 0.61, 0.355, 1)')
  })
})
