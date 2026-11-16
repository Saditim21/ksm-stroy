import { describe, expect, it } from 'vitest'
import {
  getBlockAFallbackData,
  getBlockBFallbackData,
  getGaragesFallbackData,
  getParkingFallbackData,
} from '../constants/apartmentFallbackData'
import { getMnogoAFallbackData, getMnogoBFallbackData } from '../constants/mnogofamilnaFallbackData'
import { apartmentUnits } from '../data/availability/select'
import { MN_SNAPSHOT_DATA, MN_SNAPSHOT_DATE } from '../data/mnogofamilna/snapshot'
import { summarizeStatuses } from '../utils/propertyStatus'
import { GR_FACTS, MNOGO_DATED } from './facts'

// The site's fixed facts (spec §9): only the free counts are live. Each is
// held to the data built into the site, so a fact and the data never part.

// Floor key "0" is Многофамилна's garages, not apartments.
const apartmentsOf = (data) => Object.entries(data).filter(([k]) => k !== '0').flatMap(([, units]) => units)

describe('MNOGO_DATED', () => {
  it('Многофамилна dated counts match the built-in data', () => {
    const statuses = [getMnogoAFallbackData(), getMnogoBFallbackData()]
      .flatMap((d) => Object.entries(d).filter(([k]) => k !== '0').flatMap(([, units]) => units.map((u) => u.status)))
    const s = summarizeStatuses(statuses)
    expect(MNOGO_DATED).toEqual({ free: s.available, total: s.total, date: '01.12.2025' })
    expect(MNOGO_DATED).toMatchObject({ free: 16, total: 144 })
  })

  // Home's dated count and the Многофамилна pages' snapshot state one fact.
  it('MNOGO_DATED agrees with the snapshot', () => {
    const units = apartmentUnits(MN_SNAPSHOT_DATA, 'mnogofamilna-sgrada')

    expect(MNOGO_DATED).toEqual({
      free: units.filter((unit) => unit.status === 'available').length,
      total: units.length,
      date: MN_SNAPSHOT_DATE,
    })
    expect(MNOGO_DATED).toEqual({ free: 16, total: 144, date: '01.12.2025' })
  })

  it('cannot be changed by a page', () => {
    expect(Object.isFrozen(MNOGO_DATED)).toBe(true)
  })
})

describe('GR_FACTS', () => {
  it('holds Golden Residence’s fixed facts, кота only where the drawings give it', () => {
    expect(GR_FACTS).toEqual({
      apartments: 192,
      blocks: 2,
      floors: 8,
      perFloor: 12,
      minArea: 43.98,
      maxArea: 114.58,
      garages: 113,
      parking: 68,
      elevations: { 'А-1': 3.06 },
    })
    expect(Object.isFrozen(GR_FACTS)).toBe(true)
    expect(Object.isFrozen(GR_FACTS.elevations)).toBe(true)
  })

  it('matches the built-in data: blocks, floors, apartments, areas, garages and parking places', () => {
    const blocks = [getBlockAFallbackData(), getBlockBFallbackData()]
    const units = blocks.flatMap(apartmentsOf)
    const areas = units.map((unit) => Number.parseFloat(unit.total))

    expect(blocks).toHaveLength(GR_FACTS.blocks)
    for (const block of blocks) {
      expect(Object.keys(block)).toHaveLength(GR_FACTS.floors)
      for (const floor of Object.values(block)) expect(floor).toHaveLength(GR_FACTS.perFloor)
    }
    expect(units).toHaveLength(GR_FACTS.apartments)
    expect(Math.min(...areas)).toBe(GR_FACTS.minArea)
    expect(Math.max(...areas)).toBe(GR_FACTS.maxArea)
    expect(getGaragesFallbackData()).toHaveLength(GR_FACTS.garages)
    expect(getParkingFallbackData()).toHaveLength(GR_FACTS.parking)
  })
})
