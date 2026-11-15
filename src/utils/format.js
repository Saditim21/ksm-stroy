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
// line: „Кирил и Методий“. No regex lookbehind: Safari before 16.4 cannot
// parse one, and the build (es2020) ships a pattern as written.
const NBSP = String.fromCharCode(0xa0)

export function bindOneLetterWords(text) {
  const parts = text.split(/(\s+)/)
  return parts.map((part, j) => (j % 2 === 1 && /^\p{L}$/u.test(parts[j - 1]) ? NBSP : part)).join('')
}

// An address as the concept sets it (ruling C4.7): besides the one-letter
// words, a number never starts a line, nor the one letter of an entrance
// that ends a part of the address, each bound to the word before it:
// „Връбница 1“, „блок 537А“, „етаж 9“, „Методий 17“, „вх. Б,“. A one-letter
// word inside the phrase („Кирил и Методий“) leaves the line free to break
// before it.
const ENDING_LETTER = /^\p{L}\p{P}$/u

export function bindAddress(text) {
  const parts = text.split(/(\s+)/)
  const last = parts.length - 1
  return parts.map((part, j) => {
    if (j % 2 === 0) return part
    const before = parts[j - 1]
    const after = parts[j + 1]
    const bound = /^\p{L}$/u.test(before)
      || /^\d/.test(after)
      || ENDING_LETTER.test(after)
      || (j + 1 === last && /^\p{L}$/u.test(after))
    return bound ? NBSP : part
  }).join('')
}
