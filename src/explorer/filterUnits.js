// The list's filters and its sorts (spec §7.8; extract §4.26; the concept's
// gr.js:158-171), on the explorer's units (buildModel()'s `units`). Only the
// list (UnitList.jsx) imports it, so it travels in the list's own lazy chunk
// (ruling C8.5).

/** Площ's ranges by their option's value, each [a0, a1): a unit's total area
 * a matches when a0 ≤ a < a1. */
export const AREA_RANGES = Object.freeze({ 'do-70': [0, 70], '70-100': [70, 100], 'nad-100': [100, 999] })

// A filter field left as any: null, undefined, or a select's empty value.
const any = (value) => value == null || value === ''

/**
 * The units that pass every filter given, in their order. Each field null or
 * undefined (or '') means any:
 * - block: 'А' | 'Б'; floor: one of the project's (Golden Residence 1–8,
 *   Многофамилна 2–10); type: the sheet's Вид („Ателие“);
 * - area: a key of AREA_RANGES; a unit whose area the sheet does not give
 *   never matches a range;
 * - exposure: matched by `includes` on the lower-cased Изложение, so „юг“
 *   keeps „Юг“, „Юг/Изток“ and „Запад/Юг“;
 * - status: a status key ('available', 'reserved', 'sold', 'blocked').
 */
export function filterUnits(units, { block, floor, type, area, exposure, status } = {}) {
  const range = any(area) ? null : AREA_RANGES[area] ?? null
  const facing = any(exposure) ? null : String(exposure).toLowerCase()
  return units.filter((unit) =>
    (any(block) || unit.block === block)
    && (any(floor) || unit.floor === Number(floor))
    && (any(type) || unit.type === type)
    && (!range || (unit.totalArea != null && unit.totalArea >= range[0] && unit.totalArea < range[1]))
    && (!facing || unit.exposure.toLowerCase().includes(facing))
    && (any(status) || unit.status === status))
}

// The units' own order: block, floor, then the number on the floor.
const byId = (a, b) => a.block.localeCompare(b.block) || a.floor - b.floor || a.suffix.localeCompare(b.suffix)

/**
 * A sorted copy of `units` (the list's sortable columns): by `key`, 'id'
 * (block, floor, number), 'floor' (then id) or 'total' (the total area, then
 * id), going `dir`, 'asc' or 'desc'. A unit whose area the sheet does not
 * give sorts last by area either way.
 */
export function sortUnitsBy(units, { key = 'id', dir = 'asc' } = {}) {
  const sign = dir === 'desc' ? -1 : 1
  let compare = (a, b) => sign * byId(a, b)
  if (key === 'floor') compare = (a, b) => sign * (a.floor - b.floor || byId(a, b))
  if (key === 'total') {
    compare = (a, b) => {
      if (a.totalArea == null || b.totalArea == null) return (a.totalArea == null) - (b.totalArea == null) || byId(a, b)
      return sign * (a.totalArea - b.totalArea) || byId(a, b)
    }
  }
  return [...units].sort(compare)
}
