import { clearLenis, getLenis, setLenis } from './lenis'

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
