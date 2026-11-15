import { vi } from 'vitest'
import { acquireScrollLock, clearLenis, getLenis, releaseScrollLock, scrollLocked, setLenis } from './lenis'

// The handle on the live Lenis instance (redesign v1 c141d57; golden-residence
// @944bb03 tested it only through its callers).

afterEach(() => setLenis(null))

test('is null until SmoothScroll publishes an instance, and that instance after', () => {
  expect(getLenis()).toBeNull()
  const lenis = {}
  setLenis(lenis)
  expect(getLenis()).toBe(lenis)
})

test('clearLenis retracts the caller\'s own instance', () => {
  const lenis = {}
  setLenis(lenis)
  clearLenis(lenis)
  expect(getLenis()).toBeNull()
})

// However mounts and cleanups interleave, a stale cleanup must never null out
// an instance a newer mount has already published.
test('a stale cleanup never retracts an instance a newer mount published', () => {
  const older = {}
  const newer = {}
  setLenis(older)
  setLenis(newer)
  clearLenis(older)
  expect(getLenis()).toBe(newer)
})

// Every test below releases each lock it takes: the count is module state.
describe('scroll locks', () => {
  const fakeLenis = () => ({ stop: vi.fn(), start: vi.fn() })

  test('Lenis stops on the first lock and starts again only on the last release', () => {
    const lenis = fakeLenis()
    setLenis(lenis)

    acquireScrollLock()
    acquireScrollLock()
    expect(lenis.stop).toHaveBeenCalledTimes(1)

    releaseScrollLock()
    expect(lenis.start).not.toHaveBeenCalled()

    releaseScrollLock()
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  test('a Lenis published while a lock holds starts out stopped', () => {
    acquireScrollLock()
    const lenis = fakeLenis()
    setLenis(lenis)
    expect(lenis.stop).toHaveBeenCalledTimes(1)

    releaseScrollLock()
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  test('a release with no lock held changes nothing, and the next lock still stops Lenis', () => {
    const lenis = fakeLenis()
    setLenis(lenis)

    releaseScrollLock()
    expect(lenis.start).not.toHaveBeenCalled()

    acquireScrollLock()
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    releaseScrollLock()
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  test('locks hold while Lenis is not running', () => {
    expect(() => {
      acquireScrollLock()
      releaseScrollLock()
    }).not.toThrow()
  })

  // What an action that glides after a dialog closes waits for (the inquiry's
  // presets, src/components/inquiry/inquiryStore.js): whether any lock holds.
  test('scrollLocked says whether any lock is held', () => {
    expect(scrollLocked()).toBe(false)
    acquireScrollLock()
    acquireScrollLock()
    expect(scrollLocked()).toBe(true)
    releaseScrollLock()
    expect(scrollLocked()).toBe(true)
    releaseScrollLock()
    expect(scrollLocked()).toBe(false)
  })
})
