// The viewport's height, fixed when the page loads, as --screen-h, from the
// Golden Residence landing (golden-residence src/utils/screenHeight.js
// @944bb03). A section whose height sets the page's length (a full-screen
// hero, a pinned scroll sequence, a stack of one-screen cards) uses it instead
// of vh or svh.
//
// Messenger's and Instagram's in-app browsers resize the page itself as their
// toolbars slide in and out (84 px on an iPhone), so vh and svh change mid
// scroll. On the landing, a climb three screens tall and five one-screen cards
// made the page grow and shrink by up to 8 x 84 px above the reader, and
// WebKit has no scroll anchoring to hold the content in place: it lurched
// under the finger, which slid the toolbars again.
//
// The value lives in <style id="screen-h"> in <head>, never on <html>: React
// hydrates <html>, and an attribute written there before hydration is not in
// the server's markup (spec §6.3). SCREEN_HEIGHT_SCRIPT, inline in <head>
// (root.jsx), writes it before first paint. trackScreenHeight() keeps that
// same element up to date from then on.
const STYLE_ID = 'screen-h'

// Runs while the browser parses <head>, after the viewport meta, so
// innerHeight is the device's. Its <style> goes in just before the script
// itself: React 19 hydrates a <style> it rendered in <head> into the next
// <style> it finds after the elements it has already claimed, and the script is
// one of those, so a <style> placed after the script could be taken for
// React's own.
export const SCREEN_HEIGHT_SCRIPT = `(function(){var d=document,c=d.currentScript,s=d.createElement('style');s.id='${STYLE_ID}';s.textContent=':root{--screen-h:'+innerHeight+'px}';d.head.insertBefore(s,c&&c.parentNode===d.head?c:null)})()`

// The <style> the head script wrote, or a new one where it did not run (the
// tests).
function screenHeightStyle(doc) {
  const existing = doc.getElementById(STYLE_ID)
  if (existing) return existing
  const style = doc.createElement('style')
  style.id = STYLE_ID
  return doc.head.appendChild(style)
}

// Call once, in the browser. On a phone the height follows only what
// ScrollTrigger's ignoreMobileResize re-measures for (src/utils/gsap.js): a new
// width (the phone turned) or a height change over a quarter. So the sections
// and ScrollTrigger's measurements change together. With a mouse, every resize
// counts. clientWidth and clientHeight, not innerWidth and innerHeight:
// Safari's inner sizes shrink with a pinch zoom.
//
// Tracking starts from the height the head script wrote, the one the reader
// has seen since first paint, so on a phone a toolbar that slid in or out
// before the JS loaded changes nothing.
export function trackScreenHeight(win = window) {
  const root = win.document.documentElement
  const phone = win.matchMedia('(pointer: coarse)').matches
  const style = screenHeightStyle(win.document)
  let height = Number(/--screen-h:(\d+)px/.exec(style.textContent)?.[1] ?? 0)
  let width = height ? root.clientWidth : 0

  const measure = () => {
    const w = root.clientWidth
    const h = root.clientHeight
    if (phone && w === width && Math.abs(h - height) <= h * 0.25) return
    width = w
    height = h
    style.textContent = `:root{--screen-h:${h}px}`
  }

  measure()
  win.addEventListener('resize', measure)
  return () => win.removeEventListener('resize', measure)
}
