import { describe, expect, it } from 'vitest'
import { loadPlans, plansOf } from './plans'
import { GR_PROJECT } from './projects/gr'
import { MN_PROJECT } from './projects/mn'

// A project's plans (plans.js; M3 §6.4, §10): each block's plan, with the
// number an apartment shows on it and the project's word on a floor. A
// project whose plans are data has them at once (Многофамилна's: its block
// pages prerender mini plans); Golden Residence's are a chunk of their own,
// there once loaded, and none of it is on its project object, which is in
// its routes' first-load JS.

describe('Многофамилна’s plans, data', () => {
  it('are there at once, with its numbers and its attic', () => {
    const plans = plansOf(MN_PROJECT)
    expect(plans).toBeDefined()
    expect(plans['А'].unitNumber({ floor: 2, suffix: '01' })).toBe('101')
    expect(plans['Б'].floorMeta({ block: 'Б', floor: 10 })).toBe('тавански етаж')
    expect(plans['Б'].floorMeta({ block: 'Б', floor: 9 })).toBeNull()
    expect(plans['А'].drawing).toBeNull()
  })

  it('load as the same plans', async () => {
    expect(await loadPlans(MN_PROJECT)).toBe(plansOf(MN_PROJECT))
  })
})

describe('Golden Residence’s plans, a chunk of their own', () => {
  it('are not on the project, and not there before they load', () => {
    for (const key of ['plans', 'unitNumber', 'floorMeta']) expect(GR_PROJECT).not.toHaveProperty(key)
    expect(plansOf(GR_PROJECT)).toBeUndefined()
  })

  it('bring their drawings, their numbers and the кота the drawings give', async () => {
    const plans = await loadPlans(GR_PROJECT)
    expect(plansOf(GR_PROJECT)).toBe(plans)
    expect(plans['А'].drawing).toBe('/img/plan-a-1200.webp')
    expect(plans['Б'].drawing).toBe('/img/plan-b-1200.webp')
    expect(plans['А'].unitNumber({ floor: 5, suffix: '01' })).toBe('501')
    expect(plans['А'].floorMeta({ block: 'А', floor: 1 })).toBe('кота +3,06')
    expect(plans['Б'].floorMeta({ block: 'Б', floor: 1 })).toBeNull()
    expect(plans['А'].floorMeta({ block: 'А', floor: 2 })).toBeNull()
  })
})
