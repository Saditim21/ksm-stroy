import { VT_CUT, clearTransitionCut, cutNextTransition, cutOnPop, keepRootSnapshot } from './viewTransition'

// The doors' off switch (spec §5.6): `vt-cut` on <html> turns the next route
// change's doors off (src/styles/motion.css), for the hero move and for Back
// and Forward. LenisScrollSync takes it off once that change is over.

const html = document.documentElement
afterEach(() => {
  html.removeAttribute('class')
  html.removeAttribute('style')
})

it('cuts the next transition and clears the cut', () => {
  expect(VT_CUT).toBe('vt-cut')
  cutNextTransition()
  expect(html.classList.contains('vt-cut')).toBe(true)
  clearTransitionCut()
  expect(html.classList.contains('vt-cut')).toBe(false)
})

it('leaves the other classes on <html> alone', () => {
  html.className = 'js intro'
  cutNextTransition()
  clearTransitionCut()
  expect(html.className).toBe('js intro')
})

it('a popstate cuts the doors', () => {
  const remove = cutOnPop()
  window.dispatchEvent(new PopStateEvent('popstate'))
  expect(html.classList.contains('vt-cut')).toBe(true)

  clearTransitionCut()
  remove()
  window.dispatchEvent(new PopStateEvent('popstate'))
  expect(html.classList.contains('vt-cut')).toBe(false)
})

// React leaves the root out of a view transition whose changes are all inside
// the boundaries it animates, by setting <html>'s inline view-transition-name
// to none, unless a name is set there already. The doors close the root too,
// and uncover onyx (src/styles/motion.css).
it('keeps the root in every view transition until removed', () => {
  const remove = keepRootSnapshot()
  expect(html.style.viewTransitionName).toBe('root')
  remove()
  expect(html.style.viewTransitionName).toBe('')
  expect(html.getAttribute('style')).toBe('')
})

// A fragment the browser follows (the skip link, a legacy page's #section)
// fires a popstate too, and keeps the page: it has no doors to cut, and a cut
// it left would wait for a route change to clear it. So the caller says, as
// each popstate arrives, whether it brings another page (src/root.jsx asks the
// address bar). Whether this runs before React Router's own listener or after
// it is the browser's affair (src/utils/viewTransition.js); root.test.jsx
// runs both orders.
it('cuts on a popstate only when it brings another page', () => {
  let anotherPage = false
  const remove = cutOnPop(() => anotherPage)
  try {
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(html.classList.contains('vt-cut')).toBe(false)

    anotherPage = true
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(html.classList.contains('vt-cut')).toBe(true)
  } finally {
    remove()
  }
})
