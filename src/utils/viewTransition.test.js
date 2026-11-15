import { VT_CUT, clearTransitionCut, cutNextTransition, cutOnPop, keepRootSnapshot, liftCutWhenDone } from './viewTransition'

// The doors' off switch (spec §5.6): `vt-cut` on <html> turns the next route
// change's doors off (src/styles/motion.css), for the hero move and for Back
// and Forward. It comes off once that change is over.

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

// The cut holds until the change it cuts is done. The browser keeps a view
// transition up until the frame after its animations have finished, and styles
// its pseudo-elements from the stylesheet until then: lifted as the animations
// end, the cut would start the doors on them, from the page left. React calls
// liftCutWhenDone as a route change's view transition starts to animate, and
// what it returns once that transition has finished (src/root.jsx). A later
// change's cut is its own: the end of an earlier change, such as the doors
// Back cuts short, leaves it on.
it('lifts the cut when its change is done, never a later change’s', () => {
  cutNextTransition()
  const backDone = liftCutWhenDone()
  backDone()
  expect(html.classList.contains('vt-cut')).toBe(false)

  const doorsDone = liftCutWhenDone()
  cutNextTransition()
  const forwardDone = liftCutWhenDone()
  doorsDone()
  expect(html.classList.contains('vt-cut')).toBe(true)
  forwardDone()
  expect(html.classList.contains('vt-cut')).toBe(false)
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
