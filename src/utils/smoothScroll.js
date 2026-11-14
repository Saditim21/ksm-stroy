// Lenis' settings (src/motion/SmoothScroll.jsx). The wheel is the Golden
// Residence landing's (golden-residence src/utils/smoothScroll.js @944bb03),
// tuned there on 2026-10-08 to scroll slower and smoother.
//
// lerp: how much of the remaining distance the page covers per 60th of a
// second. Lenis' default 0.1 settles a wheel step in about 0.5 s; 0.07 takes
// about 0.7 s, a softer landing. wheelMultiplier 0.8: each wheel notch or
// trackpad swipe travels 80% as far.
//
// syncTouch off: Lenis smooths the wheel only, and a finger scrolls the page
// natively (spec §5.1). The landing had it on, for a desktop-like glide after
// a flick; native touch scrolling keeps iOS ProMotion and the in-app browsers
// (Facebook, Instagram, Viber) as smooth as the browser makes them.
//
// allowNestedScroll: a panel that scrolls on its own (a modal, a floor's
// apartment list) keeps the wheel while it can still scroll that way, and at
// its end the page scrolls on. Lenis takes the wheel on the window, so
// without it Lenis cancels the wheel and scrolls the page behind the panel:
// on the Golden Residence block A page (2026-11-14) the apartment list stayed
// put while the page moved 478 px. Lenis caches each element's overflow for
// 2 s, so the check costs little per wheel event.
export const LENIS_OPTIONS = {
  lerp: 0.07,
  wheelMultiplier: 0.8,
  syncTouch: false,
  allowNestedScroll: true,
  // GSAP's ticker drives Lenis (SmoothScroll.jsx).
  autoRaf: false,
}

// Lenis' virtualScroll filter: true lets Lenis take the gesture, false leaves
// it to the browser, uncancelled. With syncTouch off, Lenis leaves a finger to
// the browser, except while it is stopped by a scroll lock (useScrollLock):
// then it cancels every gesture, and a pinch would not zoom. So from its
// second finger until the last one lifts, a pinch is the browser's. And while
// the page is zoomed in, a finger or the wheel pans the zoomed view, as the
// browser does.
export function createGestureFilter(scale = () => window.visualViewport?.scale ?? 1) {
  let pinching = false
  return ({ event }) => {
    if (event.type.startsWith('touch')) {
      if (event.touches.length > 1) pinching = true
      if (pinching) {
        if (event.type === 'touchend' && event.touches.length === 0) pinching = false
        return false
      }
    }
    return scale() <= 1.01
  }
}
