// A module-scope handle on the live Lenis instance, from redesign v1 (c141d57,
// archive/redesign-v1 @5cecebb) by way of the Golden Residence landing
// (golden-residence src/utils/lenis.js @944bb03).
//
// Why this lives in its own file rather than next to the component that
// creates it (src/motion/SmoothScroll.jsx): adding a named non-component
// export to a component module is exactly what
// `react-refresh/only-export-components` flags ("Use a new file to share
// constants or functions between components"). SmoothScroll registers the
// instance here; consumers outside it read it back.
//
// Why anyone needs the handle at all: Lenis owns an uninterrupted rAF loop and
// writes `scrollTop` on every frame while a fling is still gliding, so a plain
// `window.scrollTo(0, 0)` issued from elsewhere is overwritten on the very next
// frame — the page settles wherever the inertia was headed (measured: a nav
// click mid-fling landed the new route at scrollY 2582). Going through
// `getLenis()?.scrollTo(0, { immediate: true })` cancels the in-flight
// animation instead of racing it.
//
// Null whenever Lenis is not running: until the motion engine has loaded,
// after the page (src/motion/runtime.js), under reduced motion, in tests,
// on the server, or between unmount and the next mount. Every caller must
// therefore keep `window.scrollTo` as its fallback.
let instance = null

// Scroll locks (useScrollLock): an overlay that must not scroll the page stops
// Lenis while it is open. Overlays can overlap, a unit's panel over the mobile
// menu, so the locks are counted: Lenis stops on the first and starts again
// only on the last release. A Lenis published while a lock holds starts out
// stopped.
let locks = 0

export function setLenis(next) {
  instance = next
  if (locks > 0) instance?.stop()
}

export function clearLenis(previous) {
  // Only retract the handle if it is still the caller's — a stale cleanup must
  // never null out an instance a newer mount has already published.
  if (instance === previous) instance = null
}

export function getLenis() {
  return instance
}

export function acquireScrollLock() {
  locks += 1
  if (locks === 1) instance?.stop()
}

export function releaseScrollLock() {
  // A release with no lock held is a caller's bug; ignoring it keeps the count
  // from going negative, after which no lock would stop Lenis again.
  if (locks === 0) return
  locks -= 1
  if (locks === 0) instance?.start()
}
