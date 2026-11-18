import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GR_PROJECT } from './projects/gr'
import { MN_PROJECT } from './projects/mn'

// A project's plans (plans.js; M3 §6.4, §10): each block's plan, with the
// number an apartment shows on it and the project's word on a floor. A
// project hands them over as data, there at once, as a chunk of its own,
// there once loaded, or both. Многофамилна's are both: its floors, numbers
// and attic are data (its block pages prerender mini plans), its drawing and
// its apartments' own plans a chunk. Golden Residence's are a chunk alone,
// and none of it is on its project object, which is in its routes'
// first-load JS.
//
// Each case starts from plans.js afresh, its project's chunk not yet loaded
// (M3 engine minor: a case that leaned on running before another's load).

let plans
beforeEach(async () => {
  vi.resetModules()
  plans = await import('./plans')
})

describe('Многофамилна’s plans, data and a chunk', () => {
  it('are there at once, before the chunk, with their numbers and attic and no drawing', () => {
    const early = plans.plansOf(MN_PROJECT)
    expect(early['А'].unitNumber({ floor: 2, suffix: '01' })).toBe('101')
    expect(early['Б'].floorMeta({ block: 'Б', floor: 10 })).toBe('тавански етаж')
    expect(early['Б'].floorMeta({ block: 'Б', floor: 9 })).toBeNull()
    expect(early['А'].drawing).toBeNull()
    expect(early['А'].own).toBeUndefined()
    expect(plans.hasPlans(MN_PROJECT)).toBe(false)
  })

  it('are whole once the chunk is in: the data with the drawing and the own plans', async () => {
    const loaded = await plans.loadPlans(MN_PROJECT)
    expect(plans.hasPlans(MN_PROJECT)).toBe(true)
    expect(plans.plansOf(MN_PROJECT)).toBe(loaded)
    // The data's, kept.
    expect(loaded['А'].unitNumber({ floor: 2, suffix: '01' })).toBe('101')
    expect(loaded['Б'].floorMeta({ block: 'Б', floor: 10 })).toBe('тавански етаж')
    // The chunk's, merged in.
    expect(loaded['А'].drawing).toBe('/img/mn-plan-line-2400.webp')
    expect(loaded['А'].className).toBe('plan--mn')
    expect(Object.keys(loaded['А'].own)).toContain('А-808')
    expect(await plans.loadPlans(MN_PROJECT)).toBe(loaded)
  })
})

describe('Golden Residence’s plans, a chunk of their own', () => {
  it('are not on the project, and not there before they load', () => {
    for (const key of ['plans', 'unitNumber', 'floorMeta']) expect(GR_PROJECT).not.toHaveProperty(key)
    expect(plans.plansOf(GR_PROJECT)).toBeUndefined()
    expect(plans.hasPlans(GR_PROJECT)).toBe(false)
  })

  it('bring their drawings, their numbers and the кота the drawings give', async () => {
    const loaded = await plans.loadPlans(GR_PROJECT)
    expect(plans.hasPlans(GR_PROJECT)).toBe(true)
    expect(plans.plansOf(GR_PROJECT)).toBe(loaded)
    expect(loaded['А'].drawing).toBe('/img/plan-a-1200.webp')
    expect(loaded['Б'].drawing).toBe('/img/plan-b-1200.webp')
    expect(loaded['А'].unitNumber({ floor: 5, suffix: '01' })).toBe('501')
    expect(loaded['А'].floorMeta({ block: 'А', floor: 1 })).toBe('кота +3,06')
    expect(loaded['Б'].floorMeta({ block: 'Б', floor: 1 })).toBeNull()
    expect(loaded['А'].floorMeta({ block: 'А', floor: 2 })).toBeNull()
  })
})
