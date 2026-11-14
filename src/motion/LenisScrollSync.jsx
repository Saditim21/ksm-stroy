import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { getLenis } from '../utils/lenis'
import { clearTransitionCut } from '../utils/viewTransition'
import { getMotion } from './runtime'

// The longest a route change's view transition runs (the doors' 1120 ms in
// src/styles/motion.css, with room to spare). ScrollTrigger re-measures, and
// the doors' cut comes off, by then at the latest, even where a transition
// never settles.
const TRANSITION_MAX_MS = 1400

const isViewTransition = (animation) => animation.effect?.pseudoElement?.startsWith('::view-transition') === true

// Settles once the view transition's own animations have, or after
// TRANSITION_MAX_MS, whichever comes first. Where the browser cannot list its
// animations, after TRANSITION_MAX_MS.
function viewTransitionDone() {
  const timeout = new Promise((resolve) => { setTimeout(resolve, TRANSITION_MAX_MS) })
  if (typeof document.getAnimations !== 'function') return timeout
  const running = document.getAnimations().filter(isViewTransition)
  return Promise.race([Promise.allSettled(running.map((animation) => animation.finished)), timeout])
}

// Scroll on a route change has one owner (spec §5.3): React Router's
// <ScrollRestoration/> picks the position (the top for a new page, the saved
// position on Back and Forward, a #hash target) and applies it with
// window.scrollTo in a layout effect. A Lenis fling still in flight would
// overwrite that on its next frame. Rendered after ScrollRestoration, in
// root.jsx's Layout, this runs its layout effect after that one: Lenis measures
// the new page, adopts the position at once, and its glide stops. That happens
// before the view transition takes the new page's snapshot. `force`, because a
// stopped Lenis ignores scrollTo, and a scroll lock (useScrollLock) held by the
// page being left is released only in a passive effect, after this one.
//
// Then, once the view transition is over, ScrollTrigger re-measures: every
// trigger caches its start and end in pixels, and the new page has moved
// those that outlive the route change, such as one in the footer. And the
// doors' cut (`vt-cut`, src/utils/viewTransition.js), set for this change by
// the hero move or a popstate, comes off, so the next change has its doors.
// Only then: taken off mid-transition, it would start the doors there. A
// newer change waits for its own transition, and its own cut stays on until
// that is over.
//
// Without Lenis (no motion, or the engine not loaded yet) the router's scroll
// stands alone, and there is no ScrollTrigger to re-measure.
export default function LenisScrollSync() {
  const { key } = useLocation()
  const shownKey = useRef(key)

  useLayoutEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    // Lenis clamps every jump to how far the page could scroll when it last
    // measured. Its observers catch up a frame or more after the page changes,
    // so in this commit that is still the page being left. Back to a point
    // deep in a longer page, or a #hash far down it, would stop at the old
    // page's end and overwrite the router's position. So Lenis measures the
    // new page first: measurement only, the call SmoothScroll's observer makes.
    if (lenis.dimensions?.resize) lenis.dimensions.resize()
    else lenis.resize()
    const y = window.scrollY
    // Lenis skips a jump to the target it already has, and lets the glide
    // toward it run on: a fling gliding up to the top, with the new page sent
    // to the top too, would carry on over the new page. Stopping and starting
    // Lenis ends the glide. A Lenis a scroll lock has stopped has no glide,
    // and must stay stopped.
    if (lenis.isScrolling === 'smooth' && lenis.targetScroll === y && !lenis.isStopped) {
      lenis.stop()
      lenis.start()
    }
    lenis.scrollTo(y, { immediate: true, force: true })
  }, [key])

  useEffect(() => {
    // The first page's triggers are measured as they are created, and once
    // more when the idle queue drains (runtime.js).
    if (shownKey.current === key) return undefined
    shownKey.current = key
    let live = true
    viewTransitionDone().then(() => {
      if (!live) return
      clearTransitionCut()
      getMotion()?.ScrollTrigger.refresh()
    })
    return () => {
      live = false
    }
  }, [key])

  return null
}
