import { LENIS_OPTIONS, createGestureFilter } from './smoothScroll'

// From golden-residence src/utils/smoothScroll.test.js @944bb03.

// The landing's wheel, tuned there on 2026-10-08: Lenis eases it more gently
// than its default and travels less per notch. Touch scrolling stays the
// browser's own (spec §5.1), and GSAP's ticker drives Lenis.
test('Lenis smooths the wheel only, slower than its default, on GSAP\'s ticker', () => {
  expect(LENIS_OPTIONS).toEqual({ lerp: 0.07, wheelMultiplier: 0.8, syncTouch: false, autoRaf: false })
})

const touch = (type, fingers) => ({ event: { type, touches: Array.from({ length: fingers }, () => ({})) } })
const wheel = () => ({ event: { type: 'wheel' } })

test('one finger and the wheel are Lenis\', at normal zoom', () => {
  const lenisTakes = createGestureFilter(() => 1)
  expect(lenisTakes(touch('touchstart', 1))).toBe(true)
  expect(lenisTakes(touch('touchmove', 1))).toBe(true)
  expect(lenisTakes(touch('touchend', 0))).toBe(true)
  expect(lenisTakes(wheel())).toBe(true)
})

// Lenis follows only the first finger and cancels the event, which would turn
// a pinch into a scroll and stop the zoom.
test('a pinch is the browser\'s, from its second finger until the last one lifts', () => {
  const lenisTakes = createGestureFilter(() => 1)
  expect(lenisTakes(touch('touchstart', 1))).toBe(true)
  expect(lenisTakes(touch('touchstart', 2))).toBe(false)
  expect(lenisTakes(touch('touchmove', 2))).toBe(false)
  expect(lenisTakes(touch('touchend', 1))).toBe(false)
  expect(lenisTakes(touch('touchmove', 1))).toBe(false)
  expect(lenisTakes(touch('touchend', 0))).toBe(false)
  expect(lenisTakes(touch('touchstart', 1))).toBe(true)
})

// Zoomed in on a floor plan, a finger pans the zoomed view, and so does the wheel.
test('while the page is zoomed in, every gesture is the browser\'s', () => {
  const lenisTakes = createGestureFilter(() => 1.6)
  expect(lenisTakes(touch('touchmove', 1))).toBe(false)
  expect(lenisTakes(wheel())).toBe(false)
})

test('by default the zoom is the visual viewport\'s scale', () => {
  const lenisTakes = createGestureFilter()
  const had = Object.prototype.hasOwnProperty.call(window, 'visualViewport')
  const previous = window.visualViewport
  try {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: { scale: 2 } })
    expect(lenisTakes(wheel())).toBe(false)
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: { scale: 1 } })
    expect(lenisTakes(wheel())).toBe(true)
    // jsdom has no visual viewport: that is normal zoom.
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
    expect(lenisTakes(wheel())).toBe(true)
  } finally {
    if (had) Object.defineProperty(window, 'visualViewport', { configurable: true, value: previous })
    else delete window.visualViewport
  }
})
