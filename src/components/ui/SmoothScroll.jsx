import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import useMotionAllowed from '../../hooks/useMotionAllowed'
import { gsap, ScrollTrigger } from '../../utils/gsap'
import { getLenis, setLenis, clearLenis } from '../../utils/lenis'
import { LENIS_OPTIONS, createGestureFilter } from '../../utils/smoothScroll'

// GSAP's default lag smoothing, restored when Lenis stops.
const LAG_THRESHOLD = 500
const LAG_ADJUSTED = 33

// The page's smooth scroll: Lenis, from the Golden Residence landing
// (golden-residence src/components/ui/SmoothScroll.jsx @944bb03), adapted for
// this site's routes. It reads the route, so it must sit inside the router,
// around the routes.
//
// Lenis drives real scroll + rAF browser APIs that jsdom doesn't implement (no
// native scroll physics, and an uninterrupted ticker would never settle in a
// test run). Vitest sets `import.meta.env.MODE` to 'test', so that is the
// primary, deterministic gate: the test environment never even attempts to
// touch Lenis, rather than relying on it happening to throw. The try/catch
// around init is a second line of defense for any other non-browser/headless
// context (e.g. a future SSR pass) this component hasn't been audited for.
//
// The instance is published to src/utils/lenis.js on init and retracted on
// destroy, so code outside this component (a scroll lock, a jump to a section)
// can reach it instead of being overwritten by it.
//
// GSAP's ticker drives Lenis (`autoRaf: false`), so the scroll position and
// every ScrollTrigger move in the same frame, and Lenis' scroll events update
// ScrollTrigger. While Lenis runs, `<html data-motion="on">` tells the CSS that
// motion is on.
export default function SmoothScroll({ children }) {
  const motionOk = useMotionAllowed()
  const contentRef = useRef(null)
  const { pathname } = useLocation()
  const measuredPath = useRef(pathname)

  useEffect(() => {
    if (!motionOk || import.meta.env.MODE === 'test') return undefined

    let lenis
    // gsap.ticker passes seconds; Lenis wants milliseconds.
    const tick = (time) => lenis.raf(time * 1000)
    try {
      lenis = new Lenis({ ...LENIS_OPTIONS, virtualScroll: createGestureFilter() })
      setLenis(lenis)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      // Without this, a long frame (a tab coming back from the background) makes
      // GSAP pretend less time passed, and the scroll would lag behind the wheel.
      gsap.ticker.lagSmoothing(0)
    } catch {
      // Non-browser/unsupported environment — degrade to native scroll.
      return undefined
    }
    const root = document.documentElement
    root.dataset.motion = 'on'

    // How far the page can travel is a value Lenis caches. It refreshes that
    // cache from a ResizeObserver on `document.documentElement` — and
    // src/index.css (plus the critical inline CSS in index.html) pins
    // `html, body, #root { height: 100% }`, so all three boxes are exactly the
    // viewport forever no matter how tall the page below them gets. That
    // observer therefore fires once, on the initial observe, and never again.
    //
    // On most first loads that one measurement lands while the route is still
    // the min-h-screen PageLoader waiting on its lazy chunk (measured on
    // redesign v1, 5cecebb): 1288px of document against a 900px viewport, and
    // every wheel gesture on the real page afterwards stops dead at 388px.
    // (Native scrolling and `lenis.scrollTo` are unaffected — the cached limit
    // only bounds the wheel/touch path — which is why it survived every
    // previous check.) It is a race: nudging the window size re-measures and
    // clears it, and slower chunk delivery loses it every time.
    //
    // The element below is a plain block inside the pinned #root, so it is the
    // first box in the tree whose height IS the content height. Observing it
    // gives Lenis the measurement signal the pinned boxes structurally cannot,
    // regardless of when the chunk lands.
    //
    // ScrollTrigger caches every trigger's start and end in pixels, so the same
    // growth (the availability sheets arriving, an image landing above a
    // trigger, a route's lazy page replacing the PageLoader) re-measures it too.
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
        ScrollTrigger.refresh()
      }
      // A layout pass can fire the observer several times in one frame; one
      // re-measure per frame is all that can matter, and a ScrollTrigger
      // refresh is too costly to run more often.
      contentObserver = new ResizeObserver(() => {
        if (pendingFrame !== undefined) return
        pendingFrame = requestAnimationFrame(remeasure)
      })
      contentObserver.observe(content)
    }

    return () => {
      if (pendingFrame !== undefined) cancelAnimationFrame(pendingFrame)
      contentObserver?.disconnect()
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(LAG_THRESHOLD, LAG_ADJUSTED)
      delete root.dataset.motion
      clearLenis(lenis)
      lenis.destroy()
    }
  }, [motionOk])

  // Once a new route has mounted (this parent's layout effect runs after the
  // new page's own), ScrollTrigger re-measures: every trigger caches its start
  // and end in pixels, and the new page has moved every trigger that outlives
  // the route change, such as one in the footer. Only with motion: without it
  // no trigger exists. A page that suspends on its lazy chunk mounts in a later
  // commit; the content observer above re-measures when it lands.
  useLayoutEffect(() => {
    if (measuredPath.current === pathname) return
    measuredPath.current = pathname
    if (motionOk) ScrollTrigger.refresh()
  }, [pathname, motionOk])

  // The wrapper is a bare, unstyled block: it exists only so there is a box in
  // the DOM that grows with the page for the observer above to watch (see the
  // comment in the effect). It is rendered on every path — reduced motion,
  // tests, prerender — so the DOM shape never differs between them, and it
  // carries no styles of its own, so layout is whatever the children were
  // already doing. RouteTop renders nothing.
  return (
    <div ref={contentRef}>
      <RouteTop pathname={pathname} />
      {children}
    </div>
  )
}

// Each route after the first starts at the top of its page; the first keeps
// the position the browser gave it (a reload, say).
//
// Rendered before the page, so its layout effect runs before the page's own:
// the triggers the new page creates in useGSAP's layout effects are measured
// with the page already at its top. Created further down, where the old page
// was left, a reveal below the fold would play at once, unseen, and be spent.
//
// The jump goes to Lenis while it runs (redesign v1 c141d57; src/App.jsx:41-69
// at archive/redesign-v1): its loop rewrites `scrollTop` every frame while a
// fling is still gliding, so a bare `window.scrollTo(0, 0)` was overwritten on
// the very next frame, and a nav click mid-fling landed /about at scrollY 2582.
// `immediate` cancels the glide instead of racing it. `force`, because Lenis
// ignores scrollTo while it is stopped, and a scroll lock (useScrollLock) held
// by the page being left is released only in a passive effect, after this one.
// Lenis also skips a jump to the target it already has, which leaves the page
// where it is when that target is the top: a fling still gliding up to it, or
// a stale target after the browser restored a position on Back.
// `lenis.resize()` first re-measures for the new page and takes the real
// position as the target.
//
// Where Lenis is not running (reduced motion, data saver, the tests) the
// window jumps, and instantly: src/index.css gives <html>
// `scroll-behavior: smooth`, and the new page must not glide up from where the
// old one was left. There is no page transition to wait for; redesign v1
// delayed the jump until its curtain covered the page (fa8c90d).
function RouteTop({ pathname }) {
  const shownPath = useRef(pathname)
  useLayoutEffect(() => {
    if (shownPath.current === pathname) return
    shownPath.current = pathname
    const lenis = getLenis()
    if (lenis) {
      lenis.resize()
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname])
  return null
}
