import { vi } from 'vitest'

// Flip (spec §5.1) is a lazy chunk of its own, apart from the motion engine:
// only the „Визуално / По критерии“ switch uses it. loadFlip() loads it with
// the engine, once, and registers it on the engine's GSAP.
const fake = vi.hoisted(() => ({
  motion: { gsap: { registerPlugin: vi.fn() }, ScrollTrigger: { refresh: () => {} } },
  Flip: { name: 'Flip' },
}))
vi.mock('./engine.js', () => ({ default: fake.motion }))
vi.mock('gsap/Flip', () => ({ Flip: fake.Flip, default: fake.Flip }))

let loadFlip
beforeEach(async () => {
  vi.resetModules()
  fake.motion.gsap.registerPlugin.mockClear()
  ;({ loadFlip } = await import('./flip'))
})

it('loads Flip once: every call shares one promise', async () => {
  const first = loadFlip()
  expect(loadFlip()).toBe(first)
  await expect(first).resolves.toBe(fake.Flip)
  expect(loadFlip()).toBe(first)
})

it('registers Flip on the loaded engine’s gsap, once', async () => {
  await Promise.all([loadFlip(), loadFlip()])
  await loadFlip()
  expect(fake.motion.gsap.registerPlugin).toHaveBeenCalledTimes(1)
  expect(fake.motion.gsap.registerPlugin).toHaveBeenCalledWith(fake.Flip)
})

it('loads the motion engine with it', async () => {
  const runtime = await import('./runtime')
  await loadFlip()
  expect(runtime.getMotion()).toBe(fake.motion)
})

// The explorer's surfaces' chunk preloads Flip at idle (ruling C8.6): a load
// that failed then (offline for a moment) must not cost the switch its Flip
// for the rest of the visit. The engine's load fails once here.
it('tries again after a load that failed', async () => {
  vi.resetModules()
  const loadMotion = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(fake.motion)
  vi.doMock('./runtime', () => ({ loadMotion }))
  try {
    const { loadFlip: fresh } = await import('./flip')
    await expect(fresh()).rejects.toThrow('offline')
    await expect(fresh()).resolves.toBe(fake.Flip)
    expect(loadMotion).toHaveBeenCalledTimes(2)
    expect(fake.motion.gsap.registerPlugin).toHaveBeenCalledTimes(1)
  } finally {
    vi.doUnmock('./runtime')
  }
})
