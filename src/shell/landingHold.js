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
//   `release` on the first scroll, wheel, touch move or key from `after` ms
//   on (400 by default), so the jump's own scroll lets nothing go. Returns
//   its cleanup, which removes every listener, as the first move does.

const MOVES = ['scroll', 'wheel', 'touchmove', 'keydown']

export const holdEuRow = (on) => document.documentElement.toggleAttribute('data-eu-hold', on)

export function releaseOnFirstMove(release, { after = 400 } = {}) {
  let timer = 0
  const stop = () => {
    clearTimeout(timer)
    for (const type of MOVES) window.removeEventListener(type, move)
  }
  const move = () => {
    stop()
    release()
  }
  timer = setTimeout(() => {
    for (const type of MOVES) window.addEventListener(type, move, { passive: true })
  }, after)
  return stop
}
