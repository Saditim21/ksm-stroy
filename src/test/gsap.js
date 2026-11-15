import { act } from '@testing-library/react'
import { vi } from 'vitest'

// A recording stand-in for the motion engine (ruling C9.4), for the tests that
// pin a motion's values: what useMotionNow() hands a component, or what the
// engine module (src/motion/engine.js, mocked) gives useMotion(). Nothing
// moves; every call is kept, in order, for the test to read.
//
// - gsap.to, from, fromTo and set: each call is a tween in `tweens`, as
//   { method, targets, from, vars } (`from` only for fromTo). The tween it
//   returns has kill(), revert() and isActive() (false: nothing plays).
// - gsap.timeline(vars): a timeline in `timelines`, with its `vars` (call
//   vars.onComplete() to end it) and its `steps`, as the tweens are plus the
//   `position` each step was placed at. Its methods chain, as GSAP's do.
// - gsap.context(fn, scope): runs fn at once and gives back a context to
//   revert. gsap.killTweensOf is a vi.fn().
// - ScrollTrigger.create(vars): each one's vars in `triggers`.
//
// reset() empties the records and the stand-in's own mocks between tests.
//
// The targets are the page's elements: compare them with toBe or toEqual,
// never inside toMatchObject, which would walk an element's own keys, React's
// fiber among them, through the whole tree.
const record = (method, [targets, first, second, third]) => (method === 'fromTo'
  ? { method, targets, from: first, vars: second, position: third }
  : { method, targets, vars: first, position: second })

export function recordingMotion() {
  const tweens = []
  const timelines = []
  const triggers = []
  const tween = (method) => vi.fn((...args) => {
    const call = record(method, args)
    delete call.position
    const made = { ...call, kill: vi.fn(), revert: vi.fn(), isActive: () => false }
    tweens.push(made)
    return made
  })
  const gsap = {
    to: tween('to'),
    from: tween('from'),
    fromTo: tween('fromTo'),
    set: tween('set'),
    killTweensOf: vi.fn(),
    timeline: vi.fn((vars = {}) => {
      const timeline = { vars, steps: [], kill: vi.fn(), revert: vi.fn(), isActive: () => false }
      for (const method of ['to', 'from', 'fromTo', 'set']) {
        timeline[method] = (...args) => {
          timeline.steps.push(record(method, args))
          return timeline
        }
      }
      timelines.push(timeline)
      return timeline
    }),
    context: vi.fn((fn, scope) => {
      fn?.()
      return { scope, revert: vi.fn(), kill: vi.fn() }
    }),
  }
  const ScrollTrigger = {
    create: vi.fn((vars) => {
      triggers.push(vars)
      return { kill: vi.fn() }
    }),
    refresh: vi.fn(),
  }
  const SplitText = { create: vi.fn() }
  const motion = { gsap, ScrollTrigger, SplitText, Lenis: function Lenis() {} }
  const reset = () => {
    tweens.length = 0
    timelines.length = 0
    triggers.length = 0
    for (const fn of [...Object.values(gsap), ScrollTrigger.create, ScrollTrigger.refresh, SplitText.create]) fn.mockClear()
  }
  return { motion, tweens, timelines, triggers, reset }
}

// useMotion() runs its setups from the runtime's idle queue (runtime.js):
// stubIdle() keeps them (requestIdleCallback stubbed; vi.unstubAllGlobals
// takes it off) and returns flushMotion(), which lets the engine's import()
// resolve, then runs every setup queued, as BlockGrid.motion.test does. The
// queue outlives a test: a suite whose tests may leave a setup in it drains
// it after each, or the next test's setups would wait behind it for good.
export function stubIdle() {
  const idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
  return async function flushMotion() {
    for (let turn = 0; turn < 3; turn += 1) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
      while (idle.length > 0) await act(async () => idle.shift()())
    }
  }
}
