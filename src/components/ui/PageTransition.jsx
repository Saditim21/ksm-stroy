import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// How long the curtain panel's exit takes to fully cover the viewport, in ms.
// App.jsx's route-change scroll-to-top effect delays its `window.scrollTo`
// by this same value so the snap never happens before the curtain has masked
// it — exported (rather than each side hardcoding "0.45s"/"450") so the two
// can't silently drift apart.
export const CURTAIN_COVER_MS = 450

// The page content itself keeps a fast cross-fade — no slide, no scale — so
// the persistent Navbar/Footer never appear to shift while a page swaps. It
// runs *underneath* the ink curtain panel below, which is what the visitor
// actually sees; the fade just has to finish inside the curtain's cover.
// AnimatePresence (mode="wait") in App.jsx plays the exit before the next page
// mounts, which is why the out leg is shorter than the in leg.
const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
}

// The curtain: a full-bleed ink panel with a 1px gold top hairline.
//  - enter: starts already covering the incoming page (y: 0%) — picking up
//    exactly where the outgoing page's own panel left off — then lifts off
//    the top (y: -100%) to reveal it.
//  - exit: an explicit two-value keyframe list. Framer Motion snaps a value
//    to an array's first keyframe before tweening to the rest, so this
//    always plays as "rise from below the viewport" regardless of wherever
//    the panel is actually resting when the exit begins (idle position is
//    off-screen at the top, per the `enter` state above).
const panelVariants = {
  initial: { y: '0%' },
  animate: { y: '-100%', transition: { duration: 0.5, delay: 0.05, ease: EASE } },
  exit: { y: ['100%', '0%'], transition: { duration: CURTAIN_COVER_MS / 1000, ease: EASE } },
}

// A transition belongs *between* pages: the landing page has nothing to fade
// from (or sweep in from), and animating it only pushes the hero out of LCP
// contention (measured: +0.6s on Home). So the first routed page to mount
// skips its own enter leg entirely — IntroReveal owns that first reveal.
// Every route change after it gets the full fade + curtain sweep.
let appHasPainted = false

// `as` lets a page hand over its own root tag (<main>, <div>) instead of gaining
// an extra wrapper element. motion's proxy caches motion.main / motion.div, so
// the component identity stays stable across renders.
export default function PageTransition({ as = 'div', className, children, ...rest }) {
  const reduce = useReducedMotion()
  const [isFirstPage] = useState(() => {
    const first = !appHasPainted
    appHasPainted = true
    return first
  })

  if (reduce) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }

  const Motion = motion[as]
  return (
    // The curtain panel is a SIBLING of the content wrapper, not a child of
    // it: the content wrapper animates its own opacity (0 -> 1), and CSS
    // opacity compounds onto every descendant's paint. Nesting the "solid
    // ink" panel inside that fading wrapper would fade the panel right along
    // with it, defeating the whole point of a curtain that's supposed to
    // hide the fade. Framer's exit-animation propagation via PresenceContext
    // reaches every descendant of the removed subtree regardless of sibling
    // vs. nested placement, so the panel still plays its own exit correctly.
    <>
      <Motion
        variants={contentVariants}
        initial={isFirstPage ? false : 'initial'}
        animate="animate"
        exit="exit"
        className={className}
        {...rest}
      >
        {children}
      </Motion>
      <motion.div
        data-curtain
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[150] bg-ink"
        variants={panelVariants}
        // `initial` is gated on `isFirstPage` exactly like `animate` just
        // below — not left on the "initial" variant (y: 0%, covering)
        // unconditionally. Framer Motion always animates from `initial` to
        // `animate` on mount, so if `initial` stayed at y:0% while `animate`
        // jumped straight to y:-100% for the first page, the panel would
        // still visibly sweep from covering to off-screen on mount. That's
        // invisible on a *fresh* session (IntroReveal's opaque overlay is on
        // top of it), but on a reload *after* the session has already seen
        // the intro, IntroReveal doesn't mount and the sweep plays bare: an
        // unmasked black curtain wipe on page load.
        initial={isFirstPage ? { y: '-100%' } : 'initial'}
        animate={isFirstPage ? { y: '-100%' } : 'animate'}
        exit="exit"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gold-accent" />
      </motion.div>
    </>
  )
}
