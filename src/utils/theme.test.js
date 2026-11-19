import { afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_KEY, THEME_SCRIPT, applyTheme, readTheme } from './theme'

// Polish spec §5: the light theme, chosen by the visitor and remembered
// (localStorage `ksm-theme`), set on <html> before the first paint by an
// inline script in <head>; dark is the default.

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove())
  vi.restoreAllMocks()
})

const runScript = () => new Function(THEME_SCRIPT)()

describe('THEME_SCRIPT', () => {
  it('sets data-theme="light" on <html> when the visitor chose light', () => {
    localStorage.setItem(THEME_KEY, 'light')
    runScript()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('leaves <html> alone for dark, for nothing stored and for anything else', () => {
    for (const stored of ['dark', null, 'sepia']) {
      if (stored === null) localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, stored)
      runScript()
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    }
  })

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(runScript).not.toThrow()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('is one plain statement with no import, for <head>', () => {
    expect(THEME_SCRIPT).not.toMatch(/\bimport\b|=>|\blet\b|\bconst\b/)
  })
})

describe('applyTheme and readTheme', () => {
  it('applies light: the attribute, the stored choice and the browser bar colour', () => {
    const meta = Object.assign(document.createElement('meta'), { name: 'theme-color', content: '#0E0D0B' })
    document.head.appendChild(meta)
    applyTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(meta.getAttribute('content')).toBe('#ECE6DA')
    expect(readTheme()).toBe('light')
  })

  it('applies dark: no attribute, „dark“ stored, onyx in the bar', () => {
    const meta = Object.assign(document.createElement('meta'), { name: 'theme-color', content: '#ECE6DA' })
    document.head.appendChild(meta)
    applyTheme('light')
    applyTheme('dark')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(meta.getAttribute('content')).toBe('#0E0D0B')
    expect(readTheme()).toBe('dark')
  })

  it('tells listeners of the change', () => {
    const heard = vi.fn()
    window.addEventListener('ksm-theme', heard)
    applyTheme('light')
    window.removeEventListener('ksm-theme', heard)
    expect(heard).toHaveBeenCalledTimes(1)
  })

  it('still applies when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    applyTheme('light')
    expect(readTheme()).toBe('light')
  })
})
