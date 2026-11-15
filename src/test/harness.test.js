import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { NO_PREFERENCE, firstViewportMotionProblems } from './css'
import { mockMatchMedia } from './media'
import { mouseClick, tap } from './pointer'

// The test harness itself (src/test/setup.js, src/test/media.js,
// src/test/css.js, src/test/pointer.js).

describe('test environment', () => {
  it('has no window.matchMedia, so motion code renders its static final state', () => {
    expect(window.matchMedia).toBeUndefined()
  })

  it('never reads the Google Sheets URLs from the developer .env', () => {
    expect(import.meta.env.VITE_GOOGLE_SHEET_BLOCK_A).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_BLOCK_B).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_GARAGES).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_PARKING).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_MNOGO_A).toBe('')
    expect(import.meta.env.VITE_GOOGLE_SHEET_MNOGO_B).toBe('')
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

// src/test/pointer.js: presses in Chrome's order, where a finger's focus comes
// after it lets go and leaves, and a mouse's with its press.
describe('pointer presses', () => {
  let listening
  afterEach(() => {
    listening?.abort()
    document.body.innerHTML = ''
  })

  const TYPES = ['pointerover', 'pointerenter', 'pointerdown', 'pointerup', 'pointerout', 'pointerleave', 'focusin', 'focusout', 'click']
  function logged() {
    document.body.innerHTML = '<button type="button" id="b">b</button><p id="p">p</p>'
    listening = new AbortController()
    const log = []
    for (const type of TYPES) {
      document.addEventListener(type, (event) => log.push(`${type}${event.pointerType ? `:${event.pointerType}` : ''} ${event.target.id}`), { capture: true, signal: listening.signal })
    }
    return log
  }
  const touch = (id) => [`pointerover:touch ${id}`, `pointerenter:touch ${id}`, `pointerdown:touch ${id}`, `pointerup:touch ${id}`, `pointerout:touch ${id}`, `pointerleave:touch ${id}`]

  it('tap focuses after the finger lets go and leaves, a mouse click with the press, and neither focuses twice', () => {
    const log = logged()
    const button = document.getElementById('b')

    tap(button)
    tap(button)
    expect(log).toEqual([...touch('b'), 'focusin b', 'click b', ...touch('b'), 'click b'])

    button.blur()
    log.length = 0
    mouseClick(button)
    expect(log).toEqual(['pointerdown:mouse b', 'focusin b', 'pointerup:mouse b', 'click b'])

    button.blur()
    log.length = 0
    tap(button, 'pen', { focusOnPress: true })
    expect(log).toEqual(['pointerover:pen b', 'pointerenter:pen b', 'pointerdown:pen b', 'focusin b', 'pointerup:pen b', 'pointerout:pen b', 'pointerleave:pen b', 'click b'])
  })

  it('takes the focus off what had it when the press lands on something that takes none', () => {
    const log = logged()
    const button = document.getElementById('b')
    button.focus()
    log.length = 0

    tap(document.getElementById('p'))
    expect(log).toEqual([...touch('p'), 'focusout b', 'click p'])
    expect(document.activeElement).toBe(document.body)
  })
})

// src/test/css.js's first-viewport check, against a planted stylesheet: it
// must find each way a first viewport could start hidden or move without the
// gate, and pass what is allowed.
describe('firstViewportMotionProblems', () => {
  let dir
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
    dir = undefined
  })

  const check = (css) => {
    dir = mkdtempSync(join(tmpdir(), 'ksm-css-'))
    const file = join(dir, 'planted.css')
    writeFileSync(file, css)
    return firstViewportMotionProblems(file, '.hero, .door')
  }

  it('passes motion gated by :root.js and no-preference, with its starting states in keyframes', () => {
    expect(check(`
      .hero { transform: translateX(calc(var(--s) * 100cqw)); }
      .hero__shade { opacity: .4; }
      .door__mark path { stroke-dasharray: 1 1; }
      .works { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        :root.js .hero__title { animation: rise .9s both; opacity: 0; }
        @media (hover: hover) { :root.js .hero { animation: none; } }
      }
      @keyframes rise { from { transform: translateY(112%) scale(1.12); opacity: 0; visibility: hidden; stroke-dashoffset: 1; } }
    `)).toEqual([])
  })

  it('finds an animation outside the gate or outside no-preference', () => {
    expect(check(`
      .works { animation: a 1s; }
      @media (prefers-reduced-motion: no-preference) { .hero, :root.js .door { animation-name: b; } }
      :root.js .hero { animation: c 1s; }
    `)).toEqual([
      '.works: animates outside :root.js',
      `.works: animates outside ${NO_PREFERENCE}`,
      '.hero, :root.js .door: animates outside :root.js',
      `:root.js .hero: animates outside ${NO_PREFERENCE}`,
    ])
  })

  it('finds a hidden or moved starting state of the first viewport outside no-preference', () => {
    expect(check(`
      .hero__title { opacity: 0; }
      .door--l { visibility: hidden; transform: scale(1.12); }
      .door__mark path { stroke-dashoffset: 1; }
      @media (max-width: 900px) { .hero .x { transform: translateY(22px); translate: 0 22px; scale: 1.1; } }
      .heroic { opacity: 0; }
    `)).toEqual([
      `.hero__title: opacity: 0 outside ${NO_PREFERENCE}`,
      `.door--l: visibility: hidden outside ${NO_PREFERENCE}`,
      `.door--l: transform: scale(1.12) outside ${NO_PREFERENCE}`,
      `.door__mark path: stroke-dashoffset: 1 outside ${NO_PREFERENCE}`,
      `.hero .x: transform: translateY(22px) outside ${NO_PREFERENCE}`,
      `.hero .x: translate: 0 22px outside ${NO_PREFERENCE}`,
      `.hero .x: scale: 1.1 outside ${NO_PREFERENCE}`,
    ])
  })
})
