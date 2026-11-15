// Bulgarian display text for counts and areas, from the Golden Residence
// landing (golden-residence src/utils/format.js @944bb03). No imports:
// scripts/validate-maps.mjs loads it in Node through units.js.

export function freeApartmentsLine(n) {
  if (n == null) return 'Апартаменти в продажба'
  if (n === 0) return 'Няма свободни апартаменти'
  if (n === 1) return '1 свободен апартамент'
  return `${n} свободни апартамента`
}

// A non-breaking space before „м²“ (spec §3.2), so the unit never starts a line.
export function formatArea(n) {
  if (n == null) return '—'
  return `${n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0м²`
}

// Bulgarian counts take the singular for exactly one and the plural otherwise.
export function plural(n, one, many) {
  return n === 1 ? one : many
}

// A non-breaking space after each one-letter word (spec §3.3), so none ends a
// line: „Кирил и Методий“.
export function bindOneLetterWords(text) {
  return text.replace(/(?<=^|\s)(\p{L})\s+/gu, '$1 ')
}
