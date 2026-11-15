// The ?floor of the explorer's address (spec §7.10): „А-5“ names the block
// and the floor; on a block route a bare „5“ is the route's own block. A
// Latin A or B reads as the Cyrillic letter it looks like, either case, and
// so does a lower-case letter; a floor outside 1–8, a bare floor on the
// Golden Residence page (no block of its own), or anything else opens
// nothing (Review Focus 2). The Golden Residence page always writes the
// letter, a block route its own floors bare.
import { GR_FACTS } from '../config/facts'

// The block letters as they may be written: the Cyrillic ones and the Latin
// look-alikes, after toUpperCase.
const LETTERS = Object.freeze({ 'А': 'А', 'Б': 'Б', A: 'А', B: 'Б' })
// An optional letter, an optional dash between it and the floor, and the
// floor's one or two digits.
const PATTERN = /^(?:([^\d\s-])\s*-?\s*)?(\d{1,2})$/u

/** { block: 'А' | 'Б', floor: 1..8 }, or null: `value` is ?floor's value,
 * `routeBlock` the block route's letter ('А' | 'Б'), or null on the Golden
 * Residence page. */
export function parseFloorParam(value, routeBlock) {
  if (typeof value !== 'string') return null
  const match = PATTERN.exec(value.trim().toUpperCase())
  if (!match) return null
  const [, letter, digits] = match
  const block = letter === undefined ? routeBlock ?? null : LETTERS[letter] ?? null
  const floor = Number(digits)
  if (!block || floor < 1 || floor > GR_FACTS.floors) return null
  return { block, floor }
}

/** What ?floor holds for a floor: its number alone on its own block's route
 * („5“), else the block's letter and the number („Б-5“). */
export function formatFloorParam({ block, floor }, routeBlock) {
  return block === routeBlock ? String(floor) : `${block}-${floor}`
}
