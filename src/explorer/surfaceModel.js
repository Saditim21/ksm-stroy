// What only the surfaces read from the explorer's model (model.js): the range
// line of a floor's edge panel and sheet (FloorFacts.jsx, spec §7.3), and the
// unit panel's previous and next (ExplorerDialogs.jsx, UnitPanel.jsx, spec
// §7.7). Only modules of the surfaces' lazy chunk (surfaces.js) import it,
// and a Многофамилна block page's rows (FloorRows.jsx, its range lines), so
// it travels in a chunk those two share and in no other route's first-load
// JS, as model.js does for buildModel and findUnit, which every explorer's
// first load needs (rulings C7.7, FR5).
import { floorKey } from './model'

/**
 * What the range line of a floor's panel says (spec §7.3), from the floor's
 * counts and its units (model.js), the smallest and the largest total area of
 * its free ones making the range:
 * - { kind: 'range', min, max }: free units of different areas;
 * - { kind: 'single', area, one }: every free unit has one area (`one` when
 *   only one is free);
 * - { kind: 'reserved' }: none free, some reserved;
 * - { kind: 'soldout' }: every unit sold or blocked, the floor the facade
 *   colours sold (summarizeFloor, spec §9).
 * Null for free units without a known area, and for a floor whose other units
 * carry a status the rules do not know („Скоро“, ruling R1), which is not sold
 * out: nothing to say.
 */
export function rangeLine({ counts, units }) {
  if (counts.available > 0) {
    const areas = units.filter((unit) => unit.status === 'available' && unit.totalArea != null).map((unit) => unit.totalArea)
    if (!areas.length) return null
    const [min, max] = [Math.min(...areas), Math.max(...areas)]
    if (min === max) return { kind: 'single', area: min, one: counts.available === 1 }
    return { kind: 'range', min, max }
  }
  if (counts.reserved > 0) return { kind: 'reserved' }
  return counts.sold + counts.blocked === counts.total ? { kind: 'soldout' } : null
}

/** The unit `delta` places from `unit` on its floor, going round from either
 * end (spec §7.7): the unit panel's previous and next. */
export function stepUnit(model, unit, delta) {
  const units = model.floors.get(floorKey(unit.block, unit.floor))?.units ?? [unit]
  const at = Math.max(0, units.indexOf(unit))
  return units[(((at + delta) % units.length) + units.length) % units.length]
}
