import { useEffect, useRef } from 'react'
import useMotionAllowed from '../hooks/useMotionAllowed'
import { setLenis, clearLenis } from '../utils/lenis'
import { LENIS_OPTIONS, createGestureFilter } from '../utils/smoothScroll'
import { loadMotion } from './runtime'

// GSAP's default lag smoothing, restored when Lenis stops.
const LAG_THRESHOLD = 500
const LAG_ADJUSTED = 33

// The page's smooth scroll: Lenis, from the Golden Residence landing
// (golden-residence src/components/ui/SmoothScroll.jsx @944bb03), on the wheel
// only (src/utils/smoothScroll.js).
//
// Lenis and GSAP come from the motion engine, which loads after the page has
// (runtime.js), so Lenis starts only then, and only where useMotionAllowed()
// says so: never on the server or while hydrating, under reduced motion or
// data saver, or in tests that leave matchMedia out. Until then, and in all
// those cases, the page scrolls natively.
//
// The instance is published to src/utils/lenis.js while it runs, so code
// outside this component (a scroll lock, a jump to a section, LenisScrollSync
// on a route change) can reach it instead of being overwritten by it.
//
// GSAP's ticker drives Lenis (`autoRaf: false`), so the scroll position and
// every ScrollTrigger move in the same frame, and Lenis' scroll events update
// ScrollTrigger. While Lenis runs, it puts the class `lenis` on <html>, and
// `<html data-motion="on">` tells the CSS that motion is on.
export default function SmoothScroll({ children }) {
  const motionOk = useMotionAllowed()
  const contentRef = useRef(null)

  useEffect(() => {
    if (!motionOk) return undefined
    let live = true
    let stop
    loadMotion().then(
      (motion) => {
        if (live) stop = start(motion, contentRef.current)
      },
      () => {
        // The engine could not load: the page keeps its native scroll.
      },
    )
    return () => {
      live = false
      stop?.()
    }
  }, [motionOk])

  // The wrapper is a bare, unstyled block: it exists only so there is a box in
  // the DOM that grows with the page for the observer in start() to watch. It
  // is rendered on every path (no motion, tests, prerender), so the DOM shape
  // never differs between them, and it carries no styles of its own, so layout
  // is whatever the children were already doing.
  return <div ref={contentRef}>{children}</div>
}

// Starts Lenis on GSAP's ticker; returns what stops it again.
function start({ gsap, ScrollTrigger, Lenis }, content) {
  let lenis
  try {
    lenis = new Lenis({ ...LENIS_OPTIONS, virtualScroll: createGestureFilter() })
  } catch {
    // An unsupported browser: degrade to native scroll.
    return undefined
  }
  setLenis(lenis)
  lenis.on('scroll', ScrollTrigger.update)
  // gsap.ticker passes seconds; Lenis wants milliseconds.
  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  // Without this, a long frame (a tab coming back from the background) makes
  // GSAP pretend less time passed, and the scroll would lag behind the wheel.
  gsap.ticker.lagSmoothing(0)
  const root = document.documentElement
  root.dataset.motion = 'on'

  // How far the page can travel is a value Lenis caches, and ScrollTrigger
  // caches every trigger's start and end in pixels. Both must re-measure when
  // the page grows: the availability data arriving, an image landing above a
  // trigger, a route's page replacing the last one. ScrollTrigger does not
  // watch for that. Lenis watches `document.documentElement`, 250 ms
  // debounced, which grows with the page because src/index.css never fixes
  // the height of html or body. (Redesign v1, 5cecebb, kept them at
  // `height: 100%`: Lenis measured once, while the route was still a loader,
  // and every wheel gesture on the real page stopped dead at 388px.)
  //
  // The wrapper SmoothScroll renders is the first box in the tree whose height
  // IS the content height. Observing it re-measures both, within a frame of
  // any change.
  let contentObserver
  let pendingFrame
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
}
