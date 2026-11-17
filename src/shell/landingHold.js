// The landing hold (M3/M4 spec §8; Diptych spec §1.9, ruling T7a): a page
// that lands its visitor on a deep link, or on its form (#zapitvane), jumps
// there, which would slide the header's EU row away (§6.2). From just before
// the jump until the landing ends, <html> carries data-eu-hold: the header
// keeps its 36 px EU row where it is, and the dialogs start below it
// (src/styles/shell.css, src/explorer/explorer.css).
//
// - holdEuRow(on): puts the mark on, or takes it off.
// - releaseOnFirstMove(release, { after }): where a landing ends with the
//   visitor's first move of the page (a list's landing, Контакти's), calls
//   `release` on the visitor's first wheel, touch move, key or pointer press
//   from `after` ms on (400 by default). Returns its cleanup, which removes
//   every listener, as the first move does.
//
//   Never on a scroll: a `scroll` event cannot tell whose scroll it was, and
//   the page scrolls itself after its jump too. Each ScrollTrigger.refresh()
//   takes the page to the top and back, and the browser then fires `scroll`.
//   The motion's idle queue makes one refresh as it drains
//   (src/motion/runtime.js), 230–450 ms after a list's jump in Chrome (M4
//   Task 4), and SmoothScroll another whenever the page grows; the browser's
//   scroll anchoring moves the page too. The visitor's own scroll starts
//   with a move heard here: the wheel or a trackpad, a finger, a key, or a
//   press on the page's scrollbar (Chrome sends pointerdown there) or of the
//   middle button (autoscroll). Each is heard on its way down (capture),
//   before anything under it can stop it.

const MOVES = ['wheel', 'touchmove', 'keydown', 'pointerdown']
const LISTENING = { capture: true, passive: true }

export const holdEuRow = (on) => document.documentElement.toggleAttribute('data-eu-hold', on)

export function releaseOnFirstMove(release, { after = 400 } = {}) {
  let timer = 0
  const stop = () => {
    clearTimeout(timer)
    for (const type of MOVES) window.removeEventListener(type, move, LISTENING)
  }
  const move = () => {
    stop()
    release()
  }
  timer = setTimeout(() => {
    for (const type of MOVES) window.addEventListener(type, move, LISTENING)
  }, after)
  return stop
}
