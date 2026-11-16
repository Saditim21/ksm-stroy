import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import { buildModel } from './model'
import { GR_PROJECT } from './projects/gr'
import { snapshotData } from './testing'

// The squares' entrance (spec §5.7; extract §4.27; the concept's
// gr.js:204-209), through useMotion (ruling C8.9): as a block comes up from
// below, its 96 squares come in from opacity 0 over 0.5 s power2.out, 4 ms
// apart, from the seam out (block А from its last square, block Б from its
// first), once, when the block's top reaches 75 % of the screen. A block
// already on screen when the motion runs stays as it is, and without motion
// nothing runs.
//
// The motion engine is a recording stand-in, as in
// src/components/ui/DimensionLine.test.jsx: its gsap.context runs the setup
// it is given, and gsap.from records its targets and values.
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
vi.mock('../motion/engine.js', () => ({ default: fakeMotion }))

const MODEL = buildModel(snapshotData(), GR_PROJECT)

// A fresh motion runtime (its memoised load and idle queue) and grid for
// every test; the grid's explorer, which sizes it, a fresh module with it.
let BlockGrid
let ExplorerContext
let idle
let restoreMedia
beforeEach(async () => {
  vi.resetModules()
  BlockGrid = (await import('./BlockGrid')).default
  ;({ ExplorerContext } = await import('./useExplorer'))
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

const allowMotion = () => {
  restoreMedia = mockMatchMedia()
}

// Lets the engine's import() resolve, then runs every idle callback queued.
async function flushMotion() {
  for (let turn = 0; turn < 3; turn += 1) {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    while (idle.length > 0) await act(async () => idle.shift()())
  }
}

// The block's half (.blk) at `top` px from the top of an 768 px screen
// (jsdom's): jsdom lays nothing out.
function renderBlock(block, top) {
  const view = render(
    <ExplorerContext.Provider value={{ project: GR_PROJECT }}>
      <div className="blk">
        <BlockGrid model={MODEL} block={block} onUnit={() => {}} />
      </div>
    </ExplorerContext.Provider>,
  )
  const half = view.container.querySelector('.blk')
  vi.spyOn(half, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 600, left: 0, right: 600, width: 600, height: 600, x: 0, y: top })
  return { ...view, half }
}

describe('the squares’ entrance', () => {
  it('brings block А’s squares in from its last, once its top reaches 75 % of the screen', async () => {
    allowMotion()
    const { half } = renderBlock('А', 2000)
    await flushMotion()

    expect(fakeMotion.gsap.from).toHaveBeenCalledTimes(1)
    const [targets, vars] = fakeMotion.gsap.from.mock.calls[0]
    expect([...targets]).toEqual([...half.querySelectorAll('.blk__grid button')])
    expect(targets).toHaveLength(96)
    expect(vars).toEqual({
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: { each: 0.004, from: 'end' },
      clearProps: 'opacity',
      scrollTrigger: { trigger: half, start: 'top 75%', once: true },
    })
    // Inside the grid's own context, so it goes with the grid.
    expect(fakeMotion.gsap.context).toHaveBeenCalledTimes(1)
  })

  it('brings block Б’s squares in from its first, the seam’s side', async () => {
    allowMotion()
    renderBlock('Б', 2000)
    await flushMotion()

    expect(fakeMotion.gsap.from).toHaveBeenCalledTimes(1)
    expect(fakeMotion.gsap.from.mock.calls[0][1].stagger).toEqual({ each: 0.004, from: 'start' })
  })

  // Spec §5.7, no replays: a block on screen when its setup runs has been
  // seen whole.
  it('leaves a block already on screen as it is', async () => {
    allowMotion()
    renderBlock('А', 500)
    await flushMotion()
    expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
  })

  it('runs nothing without motion: the squares are there at once', async () => {
    const { half } = renderBlock('А', 2000)
    await flushMotion()
    expect(fakeMotion.gsap.context).not.toHaveBeenCalled()
    expect(fakeMotion.gsap.from).not.toHaveBeenCalled()
    for (const square of half.querySelectorAll('.blk__grid button')) expect(square.style.opacity).toBe('')
  })
})
