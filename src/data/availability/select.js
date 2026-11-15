// What the pages read from the availability store (useAvailability.js): its
// API rows as units, and the counts the shell shows (spec §9).
import { PROJECT_BLOCKS } from '../../config/blocks'
import { normalizeStatus, statusKey } from '../../utils/propertyStatus'
import { normalizeUnitId, parseArea, toApartment } from '../../utils/units'

const text = (value) => String(value ?? '').trim()

// The last two digits of the label's trailing number: „А 501“ → '01',
// „А-1012“ → '12'. A plan's shapes name their unit by it
// (src/data/maps/*.floors.json).
function suffixOf(label) {
  const digits = /(\d+)\D*$/.exec(label)?.[1] ?? ''
  return digits.slice(-2).padStart(2, '0')
}

// One API row (src/services/sheetsCore.js: { unit, floor, type, area: { built,
// ideal, total }, exposure, status, price }) of block `letter`, or null for a
// row that names no unit or no floor. The row goes back under the sheet's
// own column names, so M1's toApartment() (src/utils/units.js) makes the one
// unit model of every page (ruling C6); only the suffix and the price are
// added here.
function toUnit(row, letter) {
  const unit = toApartment({
    'Апартамент': row.unit,
    'Етаж': row.floor,
    'Застроена': row.area?.built,
    'Идеални': row.area?.ideal,
    'Обща': row.area?.total,
    'Вид': row.type,
    'Изложение': row.exposure,
    'Статус': row.status,
  }, letter)
  return unit && { ...unit, suffix: suffixOf(unit.label), price: text(row.price) }
}

/** M1's unit model (src/utils/units.js) plus suffix and price:
 * { id: 'А501', label: 'А 501', kind: 'apartment', block: 'А' | 'Б', floor: number, suffix: '01',
 *   builtArea, idealParts, totalArea: number | null, type: string, exposure: string, price: string,
 *   status: 'available' | 'reserved' | 'sold' | 'blocked' | 'unknown', statusText: string }
 *
 * The apartments of `project`'s blocks, block А's first, from useAvailability()'s
 * `data`; [] for null data. A block without rows (null) gives none. */
export function apartmentUnits(data, project = 'golden-residence') {
  const slots = data?.[project]
  if (!slots) return []
  return PROJECT_BLOCKS[project].flatMap(({ id, letter }) =>
    (slots[id] ?? []).map((row) => toUnit(row, letter)).filter(Boolean))
}

// The free apartments of Golden Residence's two blocks, or null: until the
// store has data ('idle', 'loading'), when it has none ('error'), and while a
// block has no rows, so a count is never a fake zero or half the building.
export function grFree(snapshot) {
  if (snapshot?.status !== 'ready' && snapshot?.status !== 'fallback') return null
  const slots = snapshot.data?.['golden-residence']
  if (!slots || PROJECT_BLOCKS['golden-residence'].some(({ id }) => !slots[id])) return null
  return apartmentUnits(snapshot.data).filter((unit) => unit.status === 'available').length
}

// One spot row (src/services/sheetsCore.js: { number, type, area: { built,
// ideal, total }, status }), or null for a row that names no place.
function toSpot(row) {
  const label = text(row.number)
  if (!label) return null
  return {
    id: normalizeUnitId(label),
    label,
    totalArea: parseArea(row.area?.total),
    type: text(row.type),
    status: statusKey(row.status),
    statusText: normalizeStatus(row.status),
  }
}

/** Golden Residence's garages (`slot` 'garages') or parking places
 * ('parking'), from useAvailability()'s `data`:
 * { id: 'Г001', label: 'Г-001', totalArea: number | null, type: string,
 *   status: 'available' | 'reserved' | 'sold' | 'blocked' | 'unknown', statusText: string }
 * in the sheet's order; [] for null data, and for a slot without rows. */
export function spotUnits(data, slot) {
  return (data?.['golden-residence']?.[slot] ?? []).map(toSpot).filter(Boolean)
}
