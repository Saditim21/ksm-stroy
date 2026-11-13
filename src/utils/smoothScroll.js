// Lenis' settings (src/components/ui/SmoothScroll.jsx), from the Golden
// Residence landing (golden-residence src/utils/smoothScroll.js @944bb03),
// where they were tuned on 2026-10-08 to scroll slower and smoother, and to
// feel right on every device.
//
// lerp: how much of the remaining distance the page covers per 60th of a
// second. Lenis' default 0.1 settles a wheel step in about 0.5 s; 0.07 takes
// about 0.7 s, a softer landing. wheelMultiplier 0.8: each wheel notch or
// trackpad swipe travels 80% as far.
//
// syncTouch: the page follows the finger (Lenis eases it at lerp 1 while the
// finger is down, about 17 ms behind), and a flick's glide is Lenis' rather
// than the browser's, easing out at syncTouchLerp, so a phone feels like the
// desktop. The glide's length is Lenis' touchInertiaExponent default: in
// headless Chrome a flick at 480 px/s glided about 120 px, at 2100 px/s about
// 1200 px.
export const LENIS_OPTIONS = {
  lerp: 0.07,
  wheelMultiplier: 0.8,
  syncTouch: true,
  syncTouchLerp: 0.065,
  // GSAP's ticker drives Lenis (SmoothScroll.jsx).
  autoRaf: false,
}

// Lenis' virtualScroll filter: true lets Lenis take the gesture, false leaves
// it to the browser, uncancelled. Lenis follows only the first finger and
// cancels the event, so a pinch would scroll instead of zoom: from its second
// finger until the last one lifts, a pinch is the browser's. And while the page
// is zoomed in, a finger or the wheel pans the zoomed view, as the browser does.
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
