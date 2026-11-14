import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../../test/media'

// DimensionLine (plan Task 7, spec §3.3): a hairline with 7 px end ticks and a
// value centred on it. Static unless `draw`; with `draw` it draws once, through
// useMotion, when it comes into view.
//
// The motion engine is a stand-in, as in src/motion/useMotion.test.jsx: its
// gsap.context runs the setup it is given.
const fakeMotion = vi.hoisted(() => {
  const motion = {
    ScrollTrigger: { refresh: () => {} },
    SplitText: function SplitText() {},
    Lenis: function Lenis() {},
  }
  motion.gsap = {
    from: vi.fn(),
    context: vi.fn((fn, scope) => {
      fn()
      return { scope, revert: vi.fn() }
    }),
  }
  return motion
})

vi.mock('../../motion/engine.js', () => ({ default: fakeMotion }))

// A fresh motion runtime (memoised load, idle queue) and component per test.
let DimensionLine
let idle
let restoreMedia
beforeEach(async () => {
  vi.resetModules()
  DimensionLine = (await import('./DimensionLine')).default
  fakeMotion.gsap.from.mockClear()
  fakeMotion.gsap.context.mockClear()
  idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
})
afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const allowMotion = () => { restoreMedia = mockMatchMedia() }

// Lets the engine's import() resolve, then runs every idle callback queued.
async function flushMotion() {
  for (let turn = 0; turn < 3; turn += 1) {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    while (idle.length > 0) await act(async () => idle.shift()())
  }
}

// jsdom lays nothing out, so every element sits at the top of the viewport.
const placeAt = (top) => vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
  .mockReturnValue({ top, bottom: top + 20, left: 0, right: 300, width: 300, height: 20, x: 0, y: top })

test('a hairline with two 7 px end ticks and the value centred on it, in label size with tabular figures', () => {
  const { container } = render(<DimensionLine value="57,46 м²" label="Застроена" />)
  const value = screen.getByText('57,46 м²')
  expect(value).toHaveClass('text-label', 'nums')
  expect(screen.getByText('Застроена')).toBeInTheDocument()

  const ticks = [...container.querySelectorAll('[data-tick]')]
  expect(ticks).toHaveLength(2)
  ticks.forEach((tick) => expect(tick).toHaveClass('h-[7px]', 'w-px'))
  const rules = [...container.querySelectorAll('[data-rule]')]
  expect(rules).toHaveLength(2)
  rules.forEach((rule) => expect(rule).toHaveClass('h-px', 'flex-1'))

  // tick, rule, value, rule, tick: the value breaks the line at its middle.
  expect([...value.parentElement.children]).toEqual([ticks[0], rules[0], value, rules[1], ticks[1]])
  ;[...ticks, ...rules].forEach((part) => expect(part).toHaveAttribute('aria-hidden', 'true'))
})

test('without a label it is the line and its value alone; className reaches the whole', () => {
  const { container } = render(<DimensionLine value="500 м до метростанция" className="max-w-sm" />)
  expect(container).toHaveTextContent(/^500 м до метростанция$/)
  expect(container.firstChild).toHaveClass('max-w-sm')
})

test('static by default: no motion setup even where motion is allowed', async () => {
  allowMotion()
  placeAt(2000)
  render(<DimensionLine value="2008 – 2026" />)
  await flushMotion()
  expect(fakeMotion.gsap.context).not.toHaveBeenCalled()
  expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
})

test('draw without motion rests drawn: nothing is scaled', async () => {
  placeAt(2000)
  const { container } = render(<DimensionLine value="2008 – 2026" draw />)
  await flushMotion()
  expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
  container.querySelectorAll('[data-rule]').forEach((rule) => expect(rule.style.transform).toBe(''))
})

test('draw with motion: a line below the fold scales from 0 outward when it enters the view', async () => {
  allowMotion()
  placeAt(2000)
  const { container } = render(<DimensionLine value="2008 – 2026" draw />)
  await flushMotion()
  expect(fakeMotion.gsap.from).toHaveBeenCalledTimes(1)
  const [targets, vars] = fakeMotion.gsap.from.mock.calls[0]
  expect(targets).toEqual([...container.querySelectorAll('[data-rule]')])
  expect(vars).toMatchObject({
    scaleX: 0,
    ease: 'expo.inOut',
    scrollTrigger: { trigger: container.firstChild, start: 'top 85%', once: true },
  })
  // The two halves grow out of the value toward the ticks.
  const [left, right] = targets
  expect(left).toHaveClass('origin-right')
  expect(right).toHaveClass('origin-left')
})

// Spec §5.2.2: the first viewport never animates from JS. A line already on
// screen when the engine arrives has been seen whole; it stays as it is.
test('draw with motion: a line already on screen stays as it is', async () => {
  allowMotion()
  placeAt(300)
  render(<DimensionLine value="2008 – 2026" draw />)
  await flushMotion()
  expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
})
