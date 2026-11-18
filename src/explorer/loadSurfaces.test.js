import { beforeEach, expect, it, vi } from 'vitest'

// loadSurfaces.js (M3 engine minor, loadSurfaces.js:27): a project's plans,
// a chunk of their own (project.loadPlans()), start loading with the
// surfaces' chunk, in the same call, not once that chunk is in, so the first
// panel, or a deep link's dialog, waits one round trip, not two. The
// surfaces' chunk is a stand-in that notes the plans it is asked for.

const chunk = vi.hoisted(() => ({ plansAsked: [] }))
vi.mock('./surfaces', () => ({
  loadPlans: (project) => {
    chunk.plansAsked.push(project)
    return Promise.resolve()
  },
  hasPlans: () => true,
}))

let loadSurfaces
beforeEach(async () => {
  vi.resetModules()
  chunk.plansAsked = []
  ;({ loadSurfaces } = await import('./loadSurfaces'))
})

it('starts a project’s plans in the same call as the surfaces’ chunk', async () => {
  const project = { loadPlans: vi.fn(() => Promise.resolve({})) }

  const loading = loadSurfaces(project)
  // Before anything has had a turn to arrive.
  expect(project.loadPlans).toHaveBeenCalledTimes(1)
  expect(chunk.plansAsked).toEqual([])

  const module = await loading
  // The chunk's own loadPlans then finds them on their way (plans.js).
  expect(chunk.plansAsked).toEqual([project])
  expect(module.hasPlans(project)).toBe(true)
})

it('asks for no plans without a project, and starts none for one that keeps them in its data', async () => {
  await loadSurfaces()
  expect(chunk.plansAsked).toEqual([])

  const inData = { plans: {} }
  await loadSurfaces(inData)
  expect(chunk.plansAsked).toEqual([inData])
})

// The early start only gets the chunk on its way: if it fails, nothing is
// left unhandled, and the chunk's own load (plans.js, which retries a failed
// one) decides.
it('lets an early start that failed go, to the chunk’s own load', async () => {
  const project = { loadPlans: vi.fn(() => Promise.reject(new Error('Failed to fetch dynamically imported module'))) }
  await loadSurfaces(project)
  expect(chunk.plansAsked).toEqual([project])
})
