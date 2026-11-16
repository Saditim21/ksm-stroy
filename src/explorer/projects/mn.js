// Многофамилна жилищна сграда, as the one explorer reads a project (spec M3
// §2, §5, §6.4; the shape is useExplorer.js's): two blocks of apartments on
// floors 2–10, eight a floor, numbered by the data (А-101 is on floor 2), the
// top floor the attic. Its numbers are the dated snapshot of 01.12.2025
// (src/data/mnogofamilna/snapshot.js) until the store holds live rows of
// both its blocks, which its sheets would give once they are published: the
// date goes with them. Its plans are data, there at once (ruling PF3: the
// block pages prerender mini plans of its one typical floor).
//
// Its facade is a placeholder until Task 4 brings the night render and its
// lights: the building map, the alt text, the class its stylesheet's
// geometry hangs on and the seam are its own; the picture is the daylight
// crop already in the pipeline.
import mnImages from '../../data/images/mnogofamilna.json'
import building from '../../data/maps/mnogofamilna.building.json'
import floors from '../../data/maps/mnogofamilna.floors.json'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import { MN_SNAPSHOT_DATA, MN_SNAPSHOT_DATE } from '../../data/mnogofamilna/snapshot'

const ID = 'mnogofamilna-sgrada'

// Whether the store holds live rows of both blocks (src/data/availability/
// store.js gives Многофамилна rows only from its own sheets, or built in
// when every read failed).
const live = (snapshot) => ['block-a', 'block-b'].every((slot) => snapshot.origin?.[ID]?.[slot] === 'live')

export const MN_PROJECT = Object.freeze({
  id: ID,
  option: 'mnogofamilna',
  floors: MN_FACTS.floors,
  perFloor: MN_FACTS.perFloor,
  total: MN_FACTS.apartments,
  // „А-101“ on floor 2: the data numbers the apartments by residential level.
  unitLabel: (unit) => `${unit.block}-${unit.floor - 1}${unit.suffix}`,
  modelData: (snapshot) => (live(snapshot) ? snapshot.data : MN_SNAPSHOT_DATA),
  dated: (snapshot) => (live(snapshot) ? null : MN_SNAPSHOT_DATE),
  types: Object.freeze(Object.keys(MN_FACTS.types).sort()),
  exposureNote: null,
  facade: Object.freeze({
    map: building,
    picture: Object.freeze({ ...mnImages['mnogofamilna-sgrada1'], color: 'transparent' }),
    sizes: '100vw',
    alt: 'Фасада на Многофамилна жилищна сграда',
    className: 'fx--mn',
    // The courtyard between the blocks (the concept's mnogofamilna.js:258).
    seam: Object.freeze({ x: 609.5, top: 150, bottom: 598 }),
  }),
  plans: Object.freeze({
    floors,
    // „101“ on floor 2, as its label has it.
    unitNumber: (unit) => `${unit.floor - 1}${unit.suffix}`,
    // The top floor is the one production calls „Тавански етаж“ (spec §2).
    floorMeta: ({ floor }) => (floor === MN_FACTS.floors.max ? 'тавански етаж' : null),
  }),
})
