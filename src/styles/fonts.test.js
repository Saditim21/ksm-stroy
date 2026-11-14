import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { links } from '../root.jsx'

const fontsDir = join(process.cwd(), 'public/fonts')
const fontFile = (f) => join(fontsDir, f)
const css = () => readFileSync(join(process.cwd(), 'src/styles/fonts.css'), 'utf8')

describe('self-hosted fonts', () => {
  it('ships both woff2 files within the 90 kB budget', () => {
    expect(existsSync(fontFile('ksm-display.woff2'))).toBe(true)
    expect(existsSync(fontFile('ksm-text.woff2'))).toBe(true)
    const files = readdirSync(fontsDir).filter((f) => f.endsWith('.woff2'))
    const total = files.reduce((n, f) => n + statSync(fontFile(f)).size, 0)
    expect(total).toBeLessThanOrEqual(90 * 1024)
  })

  it('declares font-display: swap for both families', () => {
    const faces = css().match(/@font-face\s*{[^}]*}/g)
    for (const family of ['KSM Display', 'KSM Text']) {
      const face = faces.find((f) => f.includes(`font-family: "${family}"`))
      expect(face, family).toBeTruthy()
      expect(face).toContain('font-display: swap')
    }
  })

  it('gives every fallback face a size-adjust', () => {
    const faces = css().match(/@font-face\s*{[^}]*}/g).filter((f) => /font-family: "KSM \w+ Fallback/.test(f))
    expect(faces.length).toBe(8)
    for (const f of faces) expect(f).toContain('size-adjust:')
  })

  it('preloads the display font from root links()', () => {
    const preload = links().find((l) => l.rel === 'preload' && l.href === '/fonts/ksm-display.woff2')
    expect(preload).toMatchObject({ as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
    expect(links().some((l) => l.rel === 'preload' && l.href.includes('ksm-text'))).toBe(false)
  })
})
