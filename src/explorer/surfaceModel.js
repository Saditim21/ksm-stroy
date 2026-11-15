// What only the surfaces read from the explorer's model (model.js): the range
// line of a floor's edge panel and sheet (FloorPanel.jsx, spec §7.3), and the
// unit panel's previous and next (ExplorerDialogs.jsx, UnitPanel.jsx, spec
// §7.7). Only modules of the surfaces' lazy chunk (surfaces.js) import it, so
// it travels there and not in a route's first-load JS, as model.js does for
// buildModel and findUnit, which the first load needs (rulings C7.7, FR5).
import { floorKey } from './model'

/**
 * What the range line of a floor's panel says (spec §7.3):
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
export function rangeLine({ counts, minFree, maxFree }) {
  if (counts.available > 0) {
    if (minFree == null) return null
    if (minFree === maxFree) return { kind: 'single', area: minFree, one: counts.available === 1 }
    return { kind: 'range', min: minFree, max: maxFree }
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
