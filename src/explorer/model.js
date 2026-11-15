// The explorer's numbers (spec §7.1, §9; the concept's core.js:104-124), from
// useAvailability()'s `data`: the units (src/data/availability/select.js),
// each floor's counts by status, its colour and the range of its free areas,
// each block's counts, types and exposures, and the totals. Statuses follow
// src/utils/propertyStatus.js: text the rules do not know counts in the
// total only.
import { PROJECT_BLOCKS } from '../config/blocks'
import { apartmentUnits } from '../data/availability/select'
import { summarizeFloor } from '../utils/availability'
import { summarize } from '../utils/units'

/** A floor's key: its block's letter and its number, 'А-5'. */
export const floorKey = (block, floor) => `${block}-${floor}`

const countsOf = (units) => {
  const { available, reserved, sold, blocked, total } = summarize(units)
  return { available, reserved, sold, blocked, total }
}

// How many units have each value of `key` ('type', 'exposure'); a blank cell
// is no value.
function tally(units, key) {
  const out = {}
  for (const unit of units) {
    if (unit[key]) out[unit[key]] = (out[unit[key]] ?? 0) + 1
  }
  return out
}

function floorStats(block, floor, units) {
  const sorted = [...units].sort((a, b) => a.suffix.localeCompare(b.suffix))
  const { color } = summarizeFloor(sorted)
  const areas = sorted.filter((unit) => unit.status === 'available' && unit.totalArea != null).map((unit) => unit.totalArea)
  return {
    block,
    floor,
    units: sorted,
    counts: countsOf(sorted),
    colour: color,
    minFree: areas.length ? Math.min(...areas) : null,
    maxFree: areas.length ? Math.max(...areas) : null,
  }
}

/**
 * Model = {
 *   units: Unit[],
 *   floors: Map<'А-5', { block, floor, units: Unit[] (by suffix), counts: { available, reserved, sold, blocked, total },
 *                        colour: 'available' | 'reserved' | 'sold' | 'unknown', minFree: number | null, maxFree: number | null }>,
 *   blocks: { 'А': { counts, types: { '2-стаен': 56, … }, exposure: { 'Юг': 24, … } }, 'Б': { … } },
 *   totals: { available, reserved, sold, blocked, total },
 * }
 * The colour is summarizeFloor()'s (v2 spec §9), minFree and maxFree the
 * smallest and largest total area of the floor's free units.
 *
 * Null while there is no data, and while a block has no rows: never half the
 * building's counts (as grFree, select.js).
 */
export function buildModel(data) {
  const slots = data?.['golden-residence']
  const blocks = PROJECT_BLOCKS['golden-residence']
  if (!slots || blocks.some(({ id }) => !slots[id])) return null

  const units = apartmentUnits(data)
  const byFloor = new Map()
  for (const unit of units) {
    const key = floorKey(unit.block, unit.floor)
    if (!byFloor.has(key)) byFloor.set(key, [])
    byFloor.get(key).push(unit)
  }
  const floors = new Map([...byFloor].map(([key, list]) => [key, floorStats(list[0].block, list[0].floor, list)]))
  const perBlock = Object.fromEntries(blocks.map(({ letter }) => {
    const own = units.filter((unit) => unit.block === letter)
    return [letter, { counts: countsOf(own), types: tally(own, 'type'), exposure: tally(own, 'exposure') }]
  }))
  return { units, floors, blocks: perBlock, totals: countsOf(units) }
}

/**
 * What the range line of a floor's panel says (spec §7.3):
 * - { kind: 'range', min, max }: free units of different areas;
 * - { kind: 'single', area, one }: every free unit has one area (`one` when
 *   only one is free);
 * - { kind: 'reserved' }: none free, some reserved;
 * - { kind: 'soldout' }: otherwise.
 * Null for free units without a known area: nothing to say.
 */
export function rangeLine({ counts, minFree, maxFree }) {
  if (counts.available > 0) {
    if (minFree == null) return null
    if (minFree === maxFree) return { kind: 'single', area: minFree, one: counts.available === 1 }
    return { kind: 'range', min: minFree, max: maxFree }
  }
  return counts.reserved > 0 ? { kind: 'reserved' } : { kind: 'soldout' }
}
