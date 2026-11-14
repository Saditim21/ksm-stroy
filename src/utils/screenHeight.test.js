import { SCREEN_HEIGHT_SCRIPT, trackScreenHeight } from './screenHeight'

// From golden-residence src/utils/screenHeight.test.js @944bb03. The height
// lives in the <style id="screen-h"> the head script writes before first
// paint (spec §6.3), never on <html>.

// A window whose viewport and pointer the test sets, with a document of its
// own.
function fakeWindow({ width = 390, height = 760, coarse = true } = {}) {
  const listeners = new Set()
  const doc = document.implementation.createHTMLDocument('')
  const root = doc.documentElement
  const win = {
    document: doc,
    matchMedia: (query) => ({ matches: query === '(pointer: coarse)' && coarse }),
    addEventListener: (type, fn) => type === 'resize' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'resize' && listeners.delete(fn),
  }
  const size = (w, h) => {
    Object.defineProperty(root, 'clientWidth', { value: w, configurable: true })
    Object.defineProperty(root, 'clientHeight', { value: h, configurable: true })
  }
  size(width, height)
  const resize = (w, h) => {
    size(w, h)
    listeners.forEach((fn) => fn())
  }
  return { win, doc, root, resize, listeners }
}

// The head script, run in that window's document as the page loads.
const loadPage = (doc, innerHeight) => new Function('document', 'innerHeight', SCREEN_HEIGHT_SCRIPT)(doc, innerHeight)

const screenH = (doc) => /--screen-h:(\d+px)/.exec(doc.getElementById('screen-h')?.textContent)?.[1]

test('the page height is the viewport height when the page loads', () => {
  const { win, doc } = fakeWindow({ height: 760 })
  trackScreenHeight(win)
  expect(doc.getElementById('screen-h').textContent).toBe(':root{--screen-h:760px}')
})

test('it updates the head script\'s <style> and puts nothing on <html>', () => {
  const { win, doc, root, resize } = fakeWindow({ width: 1440, height: 900, coarse: false })
  loadPage(doc, 900)
  const style = doc.getElementById('screen-h')
  trackScreenHeight(win)
  resize(1440, 860)
  expect([...doc.querySelectorAll('style')]).toEqual([style])
  expect(style.textContent).toBe(':root{--screen-h:860px}')
  expect(root.getAttribute('style')).toBe(null)
})

// The head script measured the page before first paint, and tracking starts
// later, once the JS has loaded. A toolbar that slid away in between is still
// only a toolbar: the reader keeps the height they have seen since the start.
test('on a phone, it keeps the height the page loaded with', () => {
  const { win, doc, resize } = fakeWindow({ width: 390, height: 760 })
  loadPage(doc, 760)
  resize(390, 844)
  trackScreenHeight(win)
  expect(screenH(doc)).toBe('760px')
  resize(844, 350)
  expect(screenH(doc)).toBe('350px')
})

// Messenger's and Instagram's browsers resize the page itself as their
// toolbars slide (84 px on an iPhone): the sections must not follow, or the
// page lurches under the reader's finger.
test('on a phone, a toolbar sliding in or out keeps the height', () => {
  const { win, doc, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(390, 844)
  expect(screenH(doc)).toBe('760px')
  resize(390, 700)
  expect(screenH(doc)).toBe('760px')
})

test('on a phone, turning it sideways takes the new height', () => {
  const { win, doc, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(844, 350)
  expect(screenH(doc)).toBe('350px')
})

// The same line ScrollTrigger's ignoreMobileResize draws, so the sections and
// ScrollTrigger's measurements change together.
test('on a phone, a height change over a quarter takes the new height', () => {
  const { win, doc, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(390, 560)
  expect(screenH(doc)).toBe('560px')
})

test('with a mouse, every resize takes the new height', () => {
  const { win, doc, resize } = fakeWindow({ width: 1440, height: 900, coarse: false })
  trackScreenHeight(win)
  resize(1440, 860)
  expect(screenH(doc)).toBe('860px')
})

test('the returned function stops tracking', () => {
  const { win, listeners } = fakeWindow()
  const stop = trackScreenHeight(win)
  expect(listeners.size).toBe(1)
  stop()
  expect(listeners.size).toBe(0)
})
