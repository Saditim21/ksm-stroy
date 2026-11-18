import { plural } from './format'

// The room types' words (the concept's core.js:56-62), by the sheets' Вид,
// singular and plural: one table for every page that counts its rooms,
// Golden Residence's blocks (BlocksSection.jsx), Многофамилна's
// (MnBlocks.jsx) and Продажби's rows (BuildingRows.jsx), in Golden
// Residence's order.
export const TYPE_WORDS = {
  '2-стаен': ['двустаен', 'двустайни'],
  '3-стаен': ['тристаен', 'тристайни'],
  'Ателие': ['ателие', 'ателиета'],
}

/** A count of room type `type` in words: „56 двустайни“, „1 ателие“; a type
 * the words do not know, as the sheet writes it. */
export const typeWord = (type, count) => (TYPE_WORDS[type] ? plural(count, ...TYPE_WORDS[type]) : type)
