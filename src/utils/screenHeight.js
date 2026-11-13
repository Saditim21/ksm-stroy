// The viewport's height, fixed when the page loads, as --screen-h on <html>,
// from the Golden Residence landing (golden-residence src/utils/screenHeight.js
// @944bb03). A section whose height sets the page's length (a full-screen
// hero, a pinned scroll sequence, a stack of one-screen cards) uses it instead
// of vh or svh. Call trackScreenHeight() once, before the first render.
//
// Messenger's and Instagram's in-app browsers resize the page itself as their
// toolbars slide in and out (84 px on an iPhone), so vh and svh change mid
// scroll. On the landing, a climb three screens tall and five one-screen cards
// made the page grow and shrink by up to 8 x 84 px above the reader, and
// WebKit has no scroll anchoring to hold the content in place: it lurched
// under the finger, which slid the toolbars again.
//
// On a phone the height follows only what ScrollTrigger's ignoreMobileResize
// re-measures for (src/utils/gsap.js): a new width (the phone turned) or a
// height change over a quarter. So the sections and ScrollTrigger's
// measurements change together. With a mouse, every resize counts.
// clientWidth and clientHeight, not innerWidth and innerHeight: Safari's
// inner sizes shrink with a pinch zoom.
export function trackScreenHeight(win = window) {
  const root = win.document.documentElement
  const phone = win.matchMedia('(pointer: coarse)').matches
  let width = 0
  let height = 0

  const measure = () => {
    const w = root.clientWidth
    const h = root.clientHeight
    if (phone && w === width && Math.abs(h - height) <= h * 0.25) return
    width = w
    height = h
    root.style.setProperty('--screen-h', `${h}px`)
  }

  measure()
  win.addEventListener('resize', measure)
  return () => win.removeEventListener('resize', measure)
}
