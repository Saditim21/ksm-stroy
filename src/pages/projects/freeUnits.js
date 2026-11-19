// Продажби's free apartments (polish spec §3, #svobodni): both buildings'
// free units as one list, filtered by building, rooms and a band of floors.
//
// `buildings` is [{ key: 'gr' | 'mn', project, model }], each model
// buildModel()'s (src/explorer/model.js) or null until its data is in; a unit
// is named by its project's label („А 501“, „А-101“ on Многофамилна's floor 2).
// A filter is { building, type, band }, each null for „all“.

/** The rooms a visitor can choose, in the page's words. */
export const TYPES = Object.freeze([
  { key: null, label: 'Всички' },
  { key: 'Ателие', label: 'Ателие' },
  { key: '2-стаен', label: 'Двустаен' },
  { key: '3-стаен', label: 'Тристаен' },
])

/** The floors, by the number each building's page gives them. */
export const BANDS = Object.freeze([
  { key: null, label: 'Всеки' },
  { key: 'low', label: '1–3', from: 1, to: 3 },
  { key: 'mid', label: '4–6', from: 4, to: 6 },
  { key: 'high', label: '7 и нагоре', from: 7, to: Infinity },
])

const bandOf = (key) => BANDS.find((band) => band.key === key)

function matches(unit, { type, band }) {
  if (type && unit.type !== type) return false
  const range = band ? bandOf(band) : null
  return !range || (unit.floor >= range.from && unit.floor <= range.to)
}

/** The free apartments that match `filter`, as [{ unit, label, building }]:
 * Golden Residence's first, each building's by floor, then by number. */
export function freeUnits(buildings, filter = {}) {
  return buildings.flatMap(({ key, project, model }) => {
    if (!model || (filter.building && filter.building !== key)) return []
    return model.units
      .filter((unit) => unit.status === 'available' && matches(unit, filter))
      .sort((a, b) => a.floor - b.floor || a.block.localeCompare(b.block, 'bg') || a.suffix.localeCompare(b.suffix))
      .map((unit) => ({ unit, label: project.unitLabel(unit), building: key }))
  })
}

/** How many free apartments the choice `value` for `field` ('building',
 * 'type' or 'band') would show, the rest of `filter` kept; null while a
 * building the choice counts has no data yet, never a false 0. */
export function countFree(buildings, filter, field, value) {
  const next = { ...filter, [field]: value }
  const counted = buildings.filter(({ key }) => !next.building || next.building === key)
  if (counted.some(({ model }) => !model)) return null
  return freeUnits(buildings, next).length
}
