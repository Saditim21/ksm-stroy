// The explorer's numbers (spec §7.1, §9; the concept's core.js:104-124), from
// useAvailability()'s `data`: the units (src/data/availability/select.js),
// each floor's counts by status and its colour, each block's counts, types
// and exposures, and the totals. Statuses follow src/utils/propertyStatus.js:
// text the rules do not know counts in the total only. What only an opened
// floor's surfaces read from it, the range line (with the range of a floor's
// free areas) and the unit panel's previous and next, is surfaceModel.js's,
// so it stays out of the first load.
import { PROJECT_BLOCKS } from '../config/blocks'
import { apartmentUnits } from '../data/availability/select'
import { summarizeFloor } from '../utils/availability'
import { normalizeUnitId, summarize } from '../utils/units'

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
  return { block, floor, units: sorted, counts: countsOf(sorted), colour: summarizeFloor(sorted).color }
}

/**
 * Model = {
 *   units: Unit[],
 *   floors: Map<'А-5', { block, floor, units: Unit[] (by suffix), counts: { available, reserved, sold, blocked, total },
 *                        colour: 'available' | 'reserved' | 'sold' | 'unknown' }>,
 *   blocks: { 'А': { counts, types: { '2-стаен': 56, … }, exposure: { 'Юг': 24, … } }, 'Б': { … } },
 *   totals: { available, reserved, sold, blocked, total },
 * }
 * The colour is summarizeFloor()'s (v2 spec §9).
 *
 * `data` is what `project` (projects/gr.js, projects/mn.js) reads from the
 * store (its modelData): the model is of that project's blocks, from
 * data[project.id]. Null while there is no data, and while a block has no
 * rows: never half the building's counts (as grFree, select.js).
 */
export function buildModel(data, { id }) {
  const slots = data?.[id]
  const blocks = PROJECT_BLOCKS[id]
  if (!slots || blocks.some((block) => !slots[block.id])) return null

  const units = apartmentUnits(data, id)
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
 * The unit `id` names, or null: `id` is a unit's label („А 501“), as the
 * address, the callbacks and the inquiry carry it (spec §7.1), matched through
 * normalizeUnitId, so „a501“ and „А-501“ find it too. Null without data, for
 * an empty id, and for a unit the sheets do not have.
 */
export function findUnit(model, id) {
  if (!model || !id) return null
  const wanted = normalizeUnitId(id)
  return model.units.find((unit) => unit.id === wanted) ?? null
}
