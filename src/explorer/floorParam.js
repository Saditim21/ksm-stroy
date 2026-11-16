// The ?floor of the explorer's address (spec §7.10; M3 §6.4): „А-5“ names the
// block and the floor; on a block route a bare „5“ is the route's own block.
// A Latin A or B reads as the Cyrillic letter it looks like, either case, and
// so does a lower-case letter; a floor outside the project's (Golden
// Residence 1–8, Многофамилна 2–10), a bare floor on a project's own page
// (no block of its own), or anything else opens nothing (Review Focus 2). A
// project's page always writes the letter, a block route its own floors bare.

// The block letters as they may be written: the Cyrillic ones and the Latin
// look-alikes, after toUpperCase.
const LETTERS = Object.freeze({ 'А': 'А', 'Б': 'Б', A: 'А', B: 'Б' })
// An optional letter, an optional dash between it and the floor, and the
// floor's one or two digits.
const PATTERN = /^(?:([^\d\s-])\s*-?\s*)?(\d{1,2})$/u

/** { block: 'А' | 'Б', floor }, or null: `value` is ?floor's value,
 * `routeBlock` the block route's letter ('А' | 'Б'), or null on a project's
 * own page, and `floors` the project's { min, max }. */
export function parseFloorParam(value, routeBlock, floors) {
  if (typeof value !== 'string') return null
  const match = PATTERN.exec(value.trim().toUpperCase())
  if (!match) return null
  const [, letter, digits] = match
  const block = letter === undefined ? routeBlock ?? null : LETTERS[letter] ?? null
  const floor = Number(digits)
  if (!block || floor < floors.min || floor > floors.max) return null
  return { block, floor }
}

/** What ?floor holds for a floor: its number alone on its own block's route
 * („5“), else the block's letter and the number („Б-5“). */
export function formatFloorParam({ block, floor }, routeBlock) {
  return block === routeBlock ? String(floor) : `${block}-${floor}`
}
