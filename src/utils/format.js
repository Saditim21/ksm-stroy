// Bulgarian display text for counts and areas, from the Golden Residence
// landing (golden-residence src/utils/format.js @944bb03). No imports:
// scripts/validate-maps.mjs loads it in Node through units.js.

export function freeApartmentsLine(n) {
  if (n == null) return 'Апартаменти в продажба'
  if (n === 0) return 'Няма свободни апартаменти'
  if (n === 1) return '1 свободен апартамент'
  return `${n} свободни апартамента`
}

export function formatArea(n) {
  if (n == null) return '—'
  return `${n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} м²`
}

// Bulgarian counts take the singular for exactly one and the plural otherwise.
export function plural(n, one, many) {
  return n === 1 ? one : many
}
