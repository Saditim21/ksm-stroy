import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from './media'

// The test harness itself (src/test/setup.js, src/test/media.js).

describe('test environment', () => {
  it('has no window.matchMedia, so motion code renders its static final state', () => {
    expect(window.matchMedia).toBeUndefined()
  })

  it('never reads the Google Sheets URLs from the developer .env', () => {
    expect(import.meta.env.VITE_GOOGLE_SHEET_BLOCK_A).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_BLOCK_B).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_GARAGES).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_PARKING).toBe('')
  })

  it('fills the jsdom gaps real browsers never have', () => {
    expect(() => new IntersectionObserver(() => {}).observe(document.body)).not.toThrow()
    expect(() => new ResizeObserver(() => {}).observe(document.body)).not.toThrow()
    expect(() => window.scrollTo(0, 0)).not.toThrow()
    expect(document.createElement('canvas').getContext('2d')).toBeNull()
    expect(document.createElement('video').play()).toBeInstanceOf(Promise)
  })
})

describe('mockMatchMedia', () => {
  it('answers the motion and pointer queries it was given, then goes away', () => {
    const restore = mockMatchMedia({ reduce: true, fine: true })
    try {
      expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
      expect(window.matchMedia('(prefers-reduced-motion: no-preference)').matches).toBe(false)
      expect(window.matchMedia('(pointer: fine)').matches).toBe(true)
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false)
      expect(window.matchMedia('(min-width: 1024px)').matches).toBe(false)
    } finally {
      restore()
    }
    expect(window.matchMedia).toBeUndefined()
  })

  it('lets a test change a setting the way a visitor does', () => {
    const restore = mockMatchMedia()
    try {
      const list = window.matchMedia('(prefers-reduced-motion: reduce)')
      expect(window.matchMedia('(prefers-reduced-motion: reduce)')).toBe(list)

      const seen = []
      const listener = (event) => seen.push(event.matches)
      list.addEventListener('change', listener)
      list.matches = true
      list.dispatchEvent({ matches: true })
      list.removeEventListener('change', listener)
      list.dispatchEvent({ matches: false })

      expect(seen).toEqual([true])
    } finally {
      restore()
    }
  })
})
