// Unit ids, areas and the unit model, from the Golden Residence landing
// (golden-residence src/utils/units.js and unitButtonLabel from status.js,
// @944bb03), on this site's status rules (propertyStatus.js): a unit's status
// is a STATUS_KEY, and an empty Статус cell is available. Beside it the unit
// keeps the canonical text (`statusText`), so a status the rules do not know
// („Скоро") is shown as the owner wrote it, as production does.
//
// Explicit .js extensions: scripts/validate-maps.mjs loads this file in Node.
import { STATUS_LABEL, normalizeStatus, statusKey, summarizeStatuses } from './propertyStatus.js'
import { formatArea } from './format.js'

const LATIN_TO_CYRILLIC = { A: 'А', B: 'Б' }

// Unit ids appear as "А 101" (Golden Residence) and "А-901" (Многофамилна),
// sometimes typed with Latin lookalike letters in the sheets. Canonical form:
// Cyrillic block letter + digits, no spaces, dashes or dots.
export function normalizeUnitId(raw) {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/[\s\-–—.]/g, '')
    .replace(/[A-Z]/g, (ch) => LATIN_TO_CYRILLIC[ch] || ch)
}

// A sheet area as a number: "57,46" (decimal comma) and " 65.68 " both read;
// a blank or a dash is null.
export function parseArea(raw) {
  const n = parseFloat(String(raw ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const text = (value) => String(value ?? '').trim()

// One row of an apartment tab, as parsed from the CSV, to the unit model.
export function toApartment(row, block) {
  const label = text(row['Апартамент'])
  const floor = parseInt(row['Етаж'], 10)
  if (!label || !Number.isFinite(floor)) return null
  return {
    id: normalizeUnitId(label),
    label,
    kind: 'apartment',
    block,
    floor,
    builtArea: parseArea(row['Застроена']),
    idealParts: parseArea(row['Идеални']),
    totalArea: parseArea(row['Обща']),
    type: text(row['Вид']),
    exposure: text(row['Изложение']),
    status: statusKey(row['Статус']),
    statusText: normalizeStatus(row['Статус']),
  }
}

// One row of the Гаражи or Паркоместа tab to the unit model.
export function toParkingUnit(row, kind) {
  const label = text(row['Номер'])
  if (!label) return null
  return {
    id: normalizeUnitId(label),
    label,
    kind,
    builtArea: parseArea(row['Застроена']),
    idealParts: parseArea(row['Идеални']),
    totalArea: parseArea(row['Обща']),
    type: text(row['Тип']) || (kind === 'garage' ? 'Гараж' : 'Паркомясто'),
    status: statusKey(row['Статус']),
    statusText: normalizeStatus(row['Статус']),
  }
}

// { total, available, reserved, sold, blocked }; unknown counts in the total only.
export function summarize(units) {
  return summarizeStatuses(units.map((unit) => unit.status))
}

export function distinct(units, key) {
  const seen = []
  for (const unit of units) {
    const value = unit[key]
    if (value && !seen.includes(value)) seen.push(value)
  }
  return seen
}

export function sortUnits(units) {
  return [...units].sort((a, b) =>
    (a.floor ?? 0) - (b.floor ?? 0) || a.label.localeCompare(b.label, 'bg', { numeric: true }))
}

// The accessible name of a unit's button, shared by every unit list:
// "А 306, 3-стаен, 98,40 м², Свободен". A button's content is presentational, so
// the type and area shown on it are named too (WCAG 1.3.1). Missing parts are
// skipped; a status that is not a STATUS_KEY reads as unknown, and an unknown
// status reads as the unit's own text („Скоро"), or „Няма информация" without one.
export function unitButtonLabel(unit) {
  const status = Object.prototype.hasOwnProperty.call(STATUS_LABEL, unit.status) ? unit.status : 'unknown'
  return [
    unit.label,
    unit.type,
    unit.totalArea != null ? formatArea(unit.totalArea) : null,
    (status === 'unknown' && unit.statusText) || STATUS_LABEL[status],
  ].filter(Boolean).join(', ')
}
