import { useRef } from 'react'
import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'

// useReveals (spec §5.7): once the page has loaded, the markers inside a
// section reveal what they mark as it scrolls into view, once each:
// - data-split: the lines rise from their masks (SplitText), and the split is
//   reverted once they land, so no mask clips a glyph afterwards;
// - data-fade: body copy fades up 16 px;
// - data-draw: a seam draws down when its section reaches 82 %.
// What is already on screen when the setup runs stays as it is.
//
// The engine is a stand-in, as in useMotion.test.jsx: its gsap.context runs
// the function it is given; SplitText.create splits into two stand-in lines
// and calls onSplit, as SplitText does.
const fakeMotion = vi.hoisted(() => {
  const motion = {
    ScrollTrigger: { refresh: vi.fn() },
    Lenis: function Lenis() {},
    splits: [],
  }
  motion.gsap = {
    context: vi.fn((fn, scope) => {
      fn()
      return { scope, revert: vi.fn() }
    }),
    from: vi.fn((targets, vars) => ({ targets, vars })),
  }
  motion.SplitText = {
    create: vi.fn((el, vars) => {
      const self = { el, vars, lines: [`${el.id}: line 1`, `${el.id}: line 2`], revert: vi.fn() }
      self.tween = vars.onSplit(self)
      motion.splits.push(self)
      return self
    }),
  }
  return motion
})

vi.mock('./engine.js', () => ({ default: fakeMotion }))

let useReveals
let idle
let restoreMedia
beforeEach(async () => {
  vi.resetModules()
  useReveals = (await import('./useReveals')).default
  fakeMotion.gsap.context.mockClear()
  fakeMotion.gsap.from.mockClear()
  fakeMotion.SplitText.create.mockClear()
  fakeMotion.splits = []
  // The browser's idle callbacks, run by hand (jsdom has none).
  idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
})

afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
})

const allowMotion = () => { restoreMedia = mockMatchMedia() }

// Lets the engine's import() resolve, then runs every idle callback queued.
async function flushIdle() {
  for (let turn = 0; turn < 5; turn += 1) {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    while (idle.length > 0) await act(async () => idle.shift()())
  }
}

// Where each element sits when the setup runs: jsdom's window is 768 px tall,
// so 2000 is below the fold and 300 on screen.
const BELOW = 2000
const ON_SCREEN = 300
function placed(top) {
  return (el) => {
    if (el) el.getBoundingClientRect = () => ({ top, bottom: top + 80, left: 0, right: 0, width: 0, height: 80, x: 0, y: top })
  }
}

function Section({ top = BELOW }) {
  const ref = useRef(null)
  useReveals(ref)
  const at = placed(top)
  return (
    <section ref={ref} id="section">
      <span className="seam" id="seam" data-draw="" aria-hidden="true" ref={at} />
      <h2 id="title" data-split="" ref={at}>Нашите <em>обекти</em></h2>
      <p id="lead" data-fade="" ref={at}>Разгледайте нашите проекти.</p>
    </section>
  )
}

const byId = (id) => document.getElementById(id)
const fromCall = (target) => fakeMotion.gsap.from.mock.calls.find(([targets]) => targets === target)

it('[data-split] splits into masked lines that rise once, and reverts the split when they land', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  const title = byId('title')
  expect(fakeMotion.SplitText.create).toHaveBeenCalledTimes(1)
  expect(fakeMotion.SplitText.create).toHaveBeenCalledWith(title, {
    type: 'words,lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, reduceWhiteSpace: false, aria: 'none', onSplit: expect.any(Function),
  })
  const [split] = fakeMotion.splits
  const [, vars] = fromCall(split.lines)
  expect(vars).toEqual({
    yPercent: 112, duration: 0.9, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    onComplete: expect.any(Function),
  })
  // Returned to SplitText, which re-syncs it when autoSplit splits again.
  expect(split.tween).toEqual({ targets: split.lines, vars })

  expect(split.revert).not.toHaveBeenCalled()
  vars.onComplete()
  expect(split.revert).toHaveBeenCalledTimes(1)
})

// Spec §3.3, M3/M4 §4.5: a no-break space binds a one-letter word to the next
// („С&nbsp;магазини“, „и&nbsp;подземни“). SplitText's default reduceWhiteSpace
// reads it as a space (GSAP 3.15.1 collapses /\s+/, U+00A0 included), so the
// split lines could break after „и“ and reflow as the split is undone (M3
// ruling T5d). The options useReveals gives keep each no-break space inside its
// word, which the real SplitText, given them, shows.
it('a split heading keeps its no-break spaces', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  const [[, vars]] = fakeMotion.SplitText.create.mock.calls
  expect(vars.reduceWhiteSpace).toBe(false)

  const { SplitText } = await import('gsap/SplitText')
  const heading = document.createElement('h2')
  heading.innerHTML = 'С&nbsp;магазини и&nbsp;подземни <em>гаражи</em>'
  document.body.append(heading)
  const split = SplitText.create(heading, { ...vars, onSplit: undefined, autoSplit: false })
  try {
    expect(split.words.map((word) => word.textContent)).toEqual(['С\u00A0магазини', 'и\u00A0подземни', 'гаражи'])
  } finally {
    split.revert()
    heading.remove()
  }
})

// Spec M3/M4 §4.5 (Lighthouse a11y ≥ 98): a split into words and lines
// leaves the text where it was, readable as it is, so the split names
// nothing. SplitText's default would label the split element and hide its
// words, and a label is prohibited on a span with no role, which За нас's
// heading halves are (Mission.jsx, Tradition.jsx; Lighthouse's
// aria-prohibited-attr, M4 Task 8).
it('a split names nothing and hides no word', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  const [[, vars]] = fakeMotion.SplitText.create.mock.calls
  const { SplitText } = await import('gsap/SplitText')
  const half = document.createElement('span')
  half.textContent = 'Обещани дейности'
  document.body.append(half)
  const split = SplitText.create(half, { ...vars, onSplit: undefined, autoSplit: false })
  try {
    expect(half.hasAttribute('aria-label')).toBe(false)
    expect(half.querySelectorAll('[aria-hidden]')).toHaveLength(0)
    expect(split.words.map((word) => word.textContent)).toEqual(['Обещани', 'дейности'])
  } finally {
    split.revert()
    half.remove()
  }
})

it('[data-fade] fades body copy up 16 px once', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  const lead = byId('lead')
  expect(fromCall(lead)).toEqual([lead, {
    opacity: 0, y: 16, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: lead, start: 'top 92%', once: true },
  }])
})

it('[data-draw] draws the seam down once its section reaches 82 %', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  const seam = byId('seam')
  expect(fromCall(seam)).toEqual([seam, {
    scaleY: 0, duration: 1.3, ease: 'expo.out',
    scrollTrigger: { trigger: byId('section'), start: 'top 82%', once: true },
  }])
})

it('runs one setup for the section, scoped to it', async () => {
  allowMotion()
  render(<Section />)
  await flushIdle()

  expect(fakeMotion.gsap.context).toHaveBeenCalledTimes(1)
  expect(fakeMotion.gsap.context.mock.calls[0][1]).toBe(byId('section'))
  expect(fakeMotion.gsap.from).toHaveBeenCalledTimes(3)
})

it('leaves what is already on screen as it is', async () => {
  allowMotion()
  render(<Section top={ON_SCREEN} />)
  await flushIdle()

  expect(fakeMotion.gsap.context).toHaveBeenCalledTimes(1)
  expect(fakeMotion.SplitText.create).not.toHaveBeenCalled()
  expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
})

it('without motion, nothing runs', async () => {
  render(<Section />)
  await flushIdle()

  expect(fakeMotion.gsap.context).not.toHaveBeenCalled()
  expect(fakeMotion.SplitText.create).not.toHaveBeenCalled()
  expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
})
