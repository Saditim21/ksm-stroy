import { useRef } from 'react'
import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'

// useMotion: a component's motion setup runs once the motion engine has
// loaded, from the idle queue, inside a gsap.context, and is undone when the
// component goes.
//
// The engine is a stand-in. Its gsap.context runs the function it is given
// and, like GSAP's, keeps a function that function returns, to call it when
// the context is reverted.
const fakeMotion = vi.hoisted(() => {
  const motion = {
    contextReverted: false,
    contexts: [],
    ScrollTrigger: { refresh: vi.fn() },
    SplitText: function SplitText() {},
    Lenis: function Lenis() {},
  }
  motion.gsap = {
    context: vi.fn((fn, scope) => {
      const ctx = {
        scope,
        revert: vi.fn(() => {
          motion.contextReverted = true
          if (typeof returned === 'function') returned()
        }),
      }
      const returned = fn()
      motion.contexts.push(ctx)
      return ctx
    }),
  }
  return motion
})

vi.mock('./engine.js', () => ({ default: fakeMotion }))

// A fresh runtime for every test: its memoised load and its idle queue are
// module state. useMotion and the Lenis handle come fresh with it.
let useMotion
let runtime
let lenisHandle
let idle
let restoreMedia
beforeEach(async () => {
  vi.resetModules()
  runtime = await import('./runtime')
  useMotion = (await import('./useMotion')).default
  lenisHandle = await import('../utils/lenis')
  fakeMotion.contextReverted = false
  fakeMotion.contexts = []
  fakeMotion.gsap.context.mockClear()
  fakeMotion.ScrollTrigger.refresh.mockClear()
  // The browser's idle callbacks, run by hand (jsdom has none).
  idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
})

afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
})

// A browser that answers these queries as given (src/test/media.js).
function installMatchMedia(answers) {
  restoreMedia = mockMatchMedia()
  for (const [query, matches] of Object.entries(answers)) window.matchMedia(query).matches = matches
}

const allowMotion = () => installMatchMedia({ '(prefers-reduced-motion: reduce)': false })
const engineLoaded = () => runtime.getMotion() !== null

// Lets the engine's import() resolve, then runs every idle callback queued,
// one at a time, including those the callbacks queue themselves.
async function flushIdle() {
  for (let turn = 0; turn < 5; turn += 1) {
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    while (idle.length > 0) await act(async () => idle.shift()())
  }
}

// Runs the idle callbacks queued so far, and only those.
const runQueuedIdle = () => act(async () => idle.splice(0).forEach((callback) => callback()))

function Box({ onSetup = () => {}, deps }) {
  const ref = useRef(null)
  useMotion(ref, (motion) => onSetup(motion, ref.current), deps)
  return <div ref={ref}>Box</div>
}

it('does not load the engine when motion is not allowed', async () => {
  render(<Box />) // jsdom: no matchMedia → motion off
  await flushIdle()
  expect(engineLoaded()).toBe(false)
  expect(idle).toEqual([])
})

it('runs setup once the engine loads and reverts on unmount', async () => {
  allowMotion()
  const setup = vi.fn()
  const { unmount } = render(<Box onSetup={setup} />)
  expect(setup).not.toHaveBeenCalled()
  await flushIdle()
  expect(setup).toHaveBeenCalledTimes(1)
  expect(fakeMotion.contextReverted).toBe(false)
  unmount()
  expect(fakeMotion.contextReverted).toBe(true)
})

it('refreshes ScrollTrigger once after a queue of three setups', async () => {
  allowMotion()
  const order = []
  fakeMotion.ScrollTrigger.refresh.mockImplementation(() => order.push('refresh'))
  render(
    <>
      <Box onSetup={() => order.push('one')} />
      <Box onSetup={() => order.push('two')} />
      <Box onSetup={() => order.push('three')} />
    </>,
  )
  await flushIdle()
  expect(order).toEqual(['one', 'two', 'three', 'refresh'])
})

it('runs one setup per idle callback', async () => {
  allowMotion()
  const setups = []
  render(
    <>
      <Box onSetup={() => setups.push('one')} />
      <Box onSetup={() => setups.push('two')} />
    </>,
  )
  await act(() => runtime.loadMotion())
  await runQueuedIdle()
  expect(setups).toEqual(['one'])
  await runQueuedIdle()
  expect(setups).toEqual(['one', 'two'])
})

it('hands setup the engine and the running Lenis, in a gsap.context scoped to its element', async () => {
  allowMotion()
  const lenis = { running: true }
  lenisHandle.setLenis(lenis)
  const setup = vi.fn()
  render(<Box onSetup={setup} />)
  await flushIdle()
  const [motion, element] = setup.mock.calls[0]
  expect(motion).toMatchObject({
    gsap: fakeMotion.gsap,
    ScrollTrigger: fakeMotion.ScrollTrigger,
    SplitText: fakeMotion.SplitText,
    Lenis: fakeMotion.Lenis,
    lenis,
  })
  expect(fakeMotion.contexts).toHaveLength(1)
  expect(fakeMotion.contexts[0].scope).toBe(element)
  expect(element).toHaveTextContent('Box')
})

it('hands setup no Lenis where none runs', async () => {
  allowMotion()
  const setup = vi.fn()
  render(<Box onSetup={setup} />)
  await flushIdle()
  expect(setup.mock.calls[0][0].lenis).toBeNull()
})

// The stand-in context, like GSAP's, would also call a function its own
// function returned: a cleanup handed to it that way would run twice.
it('calls the cleanup setup returned once, then reverts the context', async () => {
  allowMotion()
  const calls = []
  const cleanup = () => calls.push(fakeMotion.contextReverted ? 'cleanup after revert' : 'cleanup')
  const { unmount } = render(<Box onSetup={() => cleanup} />)
  await flushIdle()
  unmount()
  expect(calls).toEqual(['cleanup'])
  expect(fakeMotion.contextReverted).toBe(true)
})

it('never runs setup for a component that leaves before the engine loads or before its turn', async () => {
  allowMotion()
  const early = vi.fn()
  const queued = vi.fn()
  const { unmount: leaveEarly } = render(<Box onSetup={early} />)
  leaveEarly()
  const { unmount: leaveQueued } = render(<Box onSetup={queued} />)
  await act(() => runtime.loadMotion())
  expect(idle).toHaveLength(1)
  leaveQueued()
  await flushIdle()
  expect(early).not.toHaveBeenCalled()
  expect(queued).not.toHaveBeenCalled()
  expect(fakeMotion.gsap.context).not.toHaveBeenCalled()
})

it('runs setup again when a dependency changes, reverting the last run first', async () => {
  allowMotion()
  const calls = []
  const setup = (motion, element) => {
    calls.push(`setup ${element.dataset.step}`)
    return () => calls.push('cleanup')
  }
  function Stepper({ step }) {
    const ref = useRef(null)
    useMotion(ref, (motion) => setup(motion, ref.current), [step])
    return <div ref={ref} data-step={step} />
  }
  const { rerender } = render(<Stepper step={1} />)
  await flushIdle()
  rerender(<Stepper step={1} />)
  await flushIdle()
  expect(calls).toEqual(['setup 1'])
  rerender(<Stepper step={2} />)
  await flushIdle()
  expect(calls).toEqual(['setup 1', 'cleanup', 'setup 2'])
})

// The error surfaces from its idle callback, after the context has closed: the
// next setups still run, and the broken one is still undone on unmount.
it('a setup that throws keeps its context, and the queue goes on', async () => {
  allowMotion()
  const next = vi.fn()
  const { unmount } = render(
    <>
      <Box onSetup={() => { throw new Error('broken section') }} />
      <Box onSetup={next} />
    </>,
  )
  await expect(flushIdle()).rejects.toThrow('broken section')
  await flushIdle()
  expect(next).toHaveBeenCalledTimes(1)
  expect(fakeMotion.contexts).toHaveLength(2)
  unmount()
  expect(fakeMotion.contexts[0].revert).toHaveBeenCalledTimes(1)
})

it('reverts when the visitor switches reduced motion on', async () => {
  allowMotion()
  const setup = vi.fn()
  render(<Box onSetup={setup} />)
  await flushIdle()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  act(() => {
    reduce.matches = true
    reduce.dispatchEvent(new Event('change'))
  })
  expect(fakeMotion.contextReverted).toBe(true)
  await flushIdle()
  expect(setup).toHaveBeenCalledTimes(1)
})
