// A module-scope handle on the live Lenis instance.
//
// Why this lives in its own file rather than next to the component that
// creates it (src/components/ui/SmoothScroll.jsx): adding a named non-component
// export to a component module is exactly what
// `react-refresh/only-export-components` flags ("Use a new file to share
// constants or functions between components"). SmoothScroll registers the
// instance here; consumers outside the React tree read it back.
//
// Why anyone needs the handle at all: Lenis owns an uninterrupted rAF loop and
// writes `scrollTop` on every frame while a fling is still gliding, so a plain
// `window.scrollTo(0, 0)` issued from elsewhere is overwritten on the very next
// frame — the page settles wherever the inertia was headed (measured: a nav
// click mid-fling landed the new route at scrollY 2582). Going through
// `getLenis()?.scrollTo(0, { immediate: true })` cancels the in-flight
// animation instead of racing it.
//
// Null whenever Lenis is not running: reduced motion, the test environment,
// SSR/prerender, or between unmount and the next mount. Every caller must
// therefore keep `window.scrollTo` as its fallback.
let instance = null

export function setLenis(next) {
  instance = next
}

export function clearLenis(previous) {
  // Only retract the handle if it is still the caller's — a stale cleanup must
  // never null out an instance a newer mount has already published.
  if (instance === previous) instance = null
}

export function getLenis() {
  return instance
}
