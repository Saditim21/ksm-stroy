// Pure CSV parsing and row normalisation for the published Google Sheets
// tabs. Two readers share it: the browser's direct fetchers (googleSheets.js)
// and the Vercel Function api/availability.js. So it reads no import.meta.env,
// touches no browser API, and its imports carry their .js: Vercel runs the
// function as plain Node ESM.
//
// Sheet columns are never renamed (spec §6.4): goldenresidence.dianahomes.bg
// reads the same tabs. These are today's names:
//   apartment tabs (Блок А, Блок Б, Многофамилна Вход А and Б): Етаж,
//     Апартамент, Вид, Застроена, Идеални, Обща, Изложение, Статус, and the
//     optional Цена;
//   Гаражи and Паркоместа: Номер, Застроена, Идеални, Обща, Тип, Статус.

import { normalizeStatus } from '../utils/propertyStatus.js'

/**
 * A CSV text as rows of fields (RFC 4180). A quoted field may hold commas,
 * line breaks and doubled quotes; a row ends at CRLF, LF or CR. Fields are
 * kept as written, untrimmed. A leading BOM is dropped.
 */
export function parseCsv(text) {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  // Whether anything has been read since the last line end, so that the last
  // line end makes no empty row.
  let open = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quoted) {
      if (char !== '"') field += char
      else if (input[i + 1] === '"') {
        field += '"'
        i += 1
      } else quoted = false
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      open = false
      continue
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '"' && field === '') {
      quoted = true
    } else {
      field += char
    }
    open = true
  }
  if (open) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/**
 * Header-keyed rows of a parsed table: the first row names the columns.
 * Names and values are trimmed. A row whose field count differs from the
 * header's is left out, as it always was (a truncated line is no unit).
 */
export function toRows(table) {
  if (table.length === 0) return []
  const header = table[0].map((name) => name.trim())
  const rows = []
  for (const cells of table.slice(1)) {
    if (cells.length !== header.length) continue
    const row = {}
    header.forEach((name, index) => {
      row[name] = cells[index].trim()
    })
    rows.push(row)
  }
  return rows
}

const cell = (row, column) => String(row[column] ?? '').trim()

const areaOf = (row) => ({
  built: cell(row, 'Застроена'),
  ideal: cell(row, 'Идеални'),
  total: cell(row, 'Обща'),
})

/**
 * One row of an apartment tab. The status goes through normalizeStatus(): an
 * empty cell is free, and text the rules do not know is kept as written.
 */
export function normalizeApartmentRow(row) {
  return {
    unit: cell(row, 'Апартамент'),
    floor: cell(row, 'Етаж'),
    type: cell(row, 'Вид'),
    area: areaOf(row),
    exposure: cell(row, 'Изложение'),
    status: normalizeStatus(row['Статус']),
    price: cell(row, 'Цена'),
  }
}

/** One row of the Гаражи or Паркоместа tab. */
export function normalizeSpotRow(row) {
  return {
    number: cell(row, 'Номер'),
    type: cell(row, 'Тип'),
    area: areaOf(row),
    status: normalizeStatus(row['Статус']),
  }
}

// The columns without which a body is not the tab. Google's HTML error or
// sign-in page has none of them. Without Статус every unit would read as
// free; without the others no row names a unit.
export const APARTMENT_COLUMNS = Object.freeze(['Етаж', 'Апартамент', 'Статус'])
export const SPOT_COLUMNS = Object.freeze(['Номер', 'Статус'])

/**
 * A tab's header-keyed rows. Throws when its header lacks any of `columns`.
 */
export function readTab(text, columns) {
  const table = parseCsv(text)
  const header = (table[0] ?? []).map((name) => name.trim())
  const missing = columns.filter((column) => !header.includes(column))
  if (missing.length > 0) {
    throw new Error(`Sheet response has no ${missing.join(' or ')} column`)
  }
  return toRows(table)
}

// A row a page lists: it names a unit, on a floor other than 0. Floor 0 holds
// the Многофамилна garages, which no page lists; an empty Етаж reads as 0, as
// it does in googleSheets.js.
const isListed = (row) => row.unit !== '' && Number.parseInt(row.floor || '0', 10) !== 0

/**
 * An apartment tab's units, normalised. Throws when the body is not the tab,
 * or names no unit: a 200 that parses to nothing is a failure, never an empty
 * building.
 */
export function apartmentRows(text) {
  const rows = readTab(text, APARTMENT_COLUMNS).map(normalizeApartmentRow).filter(isListed)
  if (rows.length === 0) throw new Error('Sheet response contained no apartment rows')
  return rows
}

/**
 * A Гаражи or Паркоместа tab's places, normalised. A row with no Номер names
 * no place (a blank line), so it is left out. Throws as apartmentRows() does.
 */
export function spotRows(text) {
  const spots = readTab(text, SPOT_COLUMNS).map(normalizeSpotRow).filter((spot) => spot.number !== '')
  if (spots.length === 0) throw new Error('Sheet response contained no rows')
  return spots
}
