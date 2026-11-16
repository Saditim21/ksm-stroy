// Многофамилна's fixed facts (spec §5.4): its blocks, floors and apartments,
// their types and the range of their areas. They are derived from the dated
// snapshot at import, through the unit model every page reads (select.js), so
// they never part from the numbers the pages show. Продажби and #sgradata
// state them, and the explorer sizes the building by them.
import { apartmentUnits } from '../availability/select'
import { MN_SNAPSHOT_DATA } from './snapshot'

const units = apartmentUnits(MN_SNAPSHOT_DATA, 'mnogofamilna-sgrada')

// How many units have each value of `key`, as a Map.
function countBy(key) {
  const counts = new Map()
  for (const unit of units) counts.set(key(unit), (counts.get(key(unit)) ?? 0) + 1)
  return counts
}

const floors = units.map((unit) => unit.floor)
const areas = units.map((unit) => unit.totalArea).filter((area) => area !== null)
const byBlock = countBy((unit) => unit.block)

/** { blocks, floors: { min, max }, residentialFloors, perFloor, perBlock,
 *    apartments, types: { [type]: count }, minArea, maxArea }
 * - floors: the lowest and the highest floor with apartments;
 *   residentialFloors, how many floors have them;
 * - perFloor: the most apartments on one floor of a block; perBlock, in one
 *   block;
 * - minArea, maxArea: the smallest and the largest Обща площ, in m². */
export const MN_FACTS = Object.freeze({
  blocks: byBlock.size,
  floors: Object.freeze({ min: Math.min(...floors), max: Math.max(...floors) }),
  residentialFloors: new Set(floors).size,
  perFloor: Math.max(...countBy((unit) => `${unit.block}-${unit.floor}`).values()),
  perBlock: Math.max(...byBlock.values()),
  apartments: units.length,
  types: Object.freeze(Object.fromEntries(countBy((unit) => unit.type))),
  minArea: Math.min(...areas),
  maxArea: Math.max(...areas),
})
