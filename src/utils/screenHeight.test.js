import { trackScreenHeight } from './screenHeight'

// From golden-residence src/utils/screenHeight.test.js @944bb03.

// A window whose viewport and pointer the test sets.
function fakeWindow({ width = 390, height = 760, coarse = true } = {}) {
  const listeners = new Set()
  const root = document.createElement('html')
  const win = {
    document: { documentElement: root },
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
  return { win, root, resize, listeners }
}

const screenH = (root) => root.style.getPropertyValue('--screen-h')

test('the page height is the viewport height when the page loads', () => {
  const { win, root } = fakeWindow({ height: 760 })
  trackScreenHeight(win)
  expect(screenH(root)).toBe('760px')
})

// Messenger's and Instagram's browsers resize the page itself as their
// toolbars slide (84 px on an iPhone): the sections must not follow, or the
// page lurches under the reader's finger.
test('on a phone, a toolbar sliding in or out keeps the height', () => {
  const { win, root, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(390, 844)
  expect(screenH(root)).toBe('760px')
  resize(390, 700)
  expect(screenH(root)).toBe('760px')
})

test('on a phone, turning it sideways takes the new height', () => {
  const { win, root, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(844, 350)
  expect(screenH(root)).toBe('350px')
})

// The same line ScrollTrigger's ignoreMobileResize draws, so the sections and
// ScrollTrigger's measurements change together.
test('on a phone, a height change over a quarter takes the new height', () => {
  const { win, root, resize } = fakeWindow({ width: 390, height: 760 })
  trackScreenHeight(win)
  resize(390, 560)
  expect(screenH(root)).toBe('560px')
})

test('with a mouse, every resize takes the new height', () => {
  const { win, root, resize } = fakeWindow({ width: 1440, height: 900, coarse: false })
  trackScreenHeight(win)
  resize(1440, 860)
  expect(screenH(root)).toBe('860px')
})

test('the returned function stops tracking', () => {
  const { win, listeners } = fakeWindow()
  const stop = trackScreenHeight(win)
  expect(listeners.size).toBe(1)
  stop()
  expect(listeners.size).toBe(0)
})
