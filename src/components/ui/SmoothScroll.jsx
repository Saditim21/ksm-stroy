import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import { setLenis, clearLenis } from '../../utils/lenis'

// Lenis drives real scroll + rAF browser APIs that jsdom doesn't implement (no
// native scroll physics, and an uninterrupted rAF loop would never settle in a
// test run). Vitest sets `import.meta.env.MODE` to 'test', so that is the
// primary, deterministic gate: the test environment never even attempts to
// touch Lenis, rather than relying on it happening to throw. The try/catch
// around init is a second line of defense for any other non-browser/headless
// context (e.g. a future SSR pass) this component hasn't been audited for.
//
// The instance is published to src/utils/lenis.js on init and retracted on
// destroy, so code outside the React tree (App's route-change scroll) can
// cancel an in-flight fling instead of being overwritten by it.
export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion()
  const contentRef = useRef(null)

  useEffect(() => {
    if (reduce || import.meta.env.MODE === 'test') return undefined

    let lenis
    let rafId
    try {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
      setLenis(lenis)
      const raf = (time) => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    } catch {
      // Non-browser/unsupported environment — degrade to native scroll.
      return undefined
    }

    // How far the page can travel is a value Lenis caches. It refreshes that
    // cache from a ResizeObserver on `document.documentElement` — and
    // index.css (plus the critical inline CSS in index.html) pins
    // `html, body, #root { height: 100% }`, so all three boxes are exactly the
    // viewport forever no matter how tall the page below them gets. That
    // observer therefore fires once, on the initial observe, and never again.
    //
    // On most first loads that one measurement lands while the route is still
    // the min-h-screen PageLoader waiting on its lazy chunk: 1288px of
    // document against a 900px viewport, and every wheel gesture on the real
    // page afterwards stops dead at 388px. (Native scrolling and
    // `lenis.scrollTo` are unaffected — the cached limit only bounds the
    // wheel/touch path — which is why it survived every previous check.) It is
    // a race: nudging the window size re-measures and clears it, and slower
    // chunk delivery loses it every time.
    //
    // The element below is a plain block inside the pinned #root, so it is the
    // first box in the tree whose height IS the content height. Observing it
    // gives Lenis the measurement signal the pinned boxes structurally cannot,
    // regardless of when the chunk lands.
    let contentObserver
    let pendingFrame
    const content = contentRef.current
    if (content && typeof ResizeObserver !== 'undefined') {
      const remeasure = () => {
        pendingFrame = undefined
        // `lenis.dimensions.resize()` is what Lenis' own content observer
        // calls: re-measure, nothing else. The instance-level `lenis.resize()`
        // additionally snaps animatedScroll/targetScroll to the current
        // scrollTop, which would kill an in-flight fling every time the page
        // grew mid-scroll (an image landing below the fold, say). Prefer the
        // measurement-only path, keep the public one as the fallback.
        if (lenis.dimensions?.resize) lenis.dimensions.resize()
        else lenis.resize()
      }
      // A layout pass can fire the observer several times in one frame; one
      // re-measure per frame is all that can matter.
      contentObserver = new ResizeObserver(() => {
        if (pendingFrame !== undefined) return
        pendingFrame = requestAnimationFrame(remeasure)
      })
      contentObserver.observe(content)
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      if (pendingFrame !== undefined) cancelAnimationFrame(pendingFrame)
      contentObserver?.disconnect()
      clearLenis(lenis)
      lenis.destroy()
    }
  }, [reduce])

  // The wrapper is a bare, unstyled block: it exists only so there is a box in
  // the DOM that grows with the page for the observer above to watch (see the
  // comment in the effect). It is rendered on every path — reduced motion,
  // tests, prerender — so the DOM shape never differs between them, and it
  // carries no styles of its own, so layout is whatever the children were
  // already doing.
  return <div ref={contentRef}>{children}</div>
}
