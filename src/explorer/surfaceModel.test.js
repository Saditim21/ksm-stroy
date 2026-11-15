import { describe, expect, it } from 'vitest'
import * as model from './model'
import { buildModel, findUnit } from './model'
import { rangeLine, stepUnit } from './surfaceModel'
import { snapshotData } from './testing'

// What only the surfaces read from the model (spec §7.3, §7.7): the range
// line of a floor's panel and sheet, and the unit panel's previous and next.

describe('rangeLine (spec §7.3)', () => {
  const m = buildModel(snapshotData())
  const stats = (available, reserved, minFree, maxFree) => ({ counts: { available, reserved, sold: 0, blocked: 0, total: 12 }, minFree, maxFree })

  it('describes the free range', () => {
    expect(rangeLine(m.floors.get('А-5'))).toEqual({ kind: 'range', min: 63.51, max: 108.56 })
    expect(rangeLine(m.floors.get('Б-6'))).toEqual({ kind: 'soldout' })
  })

  it('gives one area when every free unit has it, and says whether one unit is free', () => {
    expect(rangeLine(stats(1, 0, 62.18, 62.18))).toEqual({ kind: 'single', area: 62.18, one: true })
    expect(rangeLine(stats(3, 2, 62.18, 62.18))).toEqual({ kind: 'single', area: 62.18, one: false })
  })

  it('says a floor with none free but some reserved has reserved ones', () => {
    expect(rangeLine(stats(0, 2, null, null))).toEqual({ kind: 'reserved' })
  })

  // „Разпродаден етаж“ only where every unit is sold or blocked, the floor
  // the facade colours sold (summarizeFloor, spec §9). Ruling R1 adds a case
  // §7.3's „otherwise“ was not written for: units whose status the rules do
  // not know („Скоро“). Such a floor is not sold out, and its rail shows the
  // unknown dash, so its line says nothing, as for free units without an
  // area.
  it('calls a floor sold out only when every unit is sold or blocked', () => {
    const data = snapshotData()
    const rows = data['golden-residence']['block-b'].filter((row) => String(row.floor) === '6')
    rows.slice(6).forEach((row) => Object.assign(row, { status: 'Скоро' }))
    const floor = buildModel(data).floors.get('Б-6')

    expect(floor.counts).toEqual({ available: 0, reserved: 0, sold: 6, blocked: 0, total: 12 })
    expect(floor.colour).toBe('unknown')
    expect(rangeLine(floor)).toBeNull()
    expect(rangeLine({ counts: { available: 0, reserved: 0, sold: 6, blocked: 6, total: 12 }, minFree: null, maxFree: null })).toEqual({ kind: 'soldout' })
  })
})

// Spec §7.7: the unit panel's previous and next go round the floor.
describe('stepUnit', () => {
  const m = buildModel(snapshotData())
  const unit = (label) => findUnit(m, label)

  it('steps to the next and the previous unit on the floor, round from either end', () => {
    expect(stepUnit(m, unit('А 501'), 1).label).toBe('А 502')
    expect(stepUnit(m, unit('А 501'), -1).label).toBe('А 512')
    expect(stepUnit(m, unit('А 512'), 1).label).toBe('А 501')
    expect(stepUnit(m, unit('Б 307'), -1).label).toBe('Б 306')
  })
})

// Ruling FR5: model.js travels in the first-load JS of the Golden Residence
// pages, which have no bytes to spare, so what only an opened floor needs
// stays out of it, in the surfaces' lazy chunk (surfaces.js), and only
// modules of that chunk import it.
describe('the surfaces’ part of the model', () => {
  it('is not in model.js', () => {
    expect(Object.keys(model)).not.toContain('rangeLine')
    expect(Object.keys(model)).not.toContain('stepUnit')
  })

  it('is imported only by modules of the surfaces’ chunk', () => {
    const sources = import.meta.glob(['../**/*.{js,jsx}', '!../**/*.test.{js,jsx}', '!../test/**'], { query: '?raw', import: 'default', eager: true })
    expect(Object.keys(sources)).toEqual(expect.arrayContaining(['./model.js', './surfaces.js', '../root.jsx']))
    const importers = Object.keys(sources).filter((path) => /from '\.\/surfaceModel'/.test(sources[path]))
    expect(importers.sort()).toEqual(['./ExplorerDialogs.jsx', './FloorPanel.jsx', './UnitPanel.jsx'])
  })
})
