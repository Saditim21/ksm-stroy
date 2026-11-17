// Многофамилна's apartments as a page counts and names them (spec M3 §2, §5,
// §6.4; the shape is useExplorer.js's): its id, its floors 2–10 with eight
// apartments a floor, numbered by the data (А-101 is on floor 2), and its
// rows, the dated snapshot of 01.12.2025 (src/data/mnogofamilna/snapshot.js)
// until the store holds live rows of both its blocks, which its sheets would
// give once they are published: the date goes with them.
//
// MN_PROJECT (mn.js) is made of it, with the facade, its lights and its
// plans; Продажби's board reads it alone (M3/M4 §7.1), so Многофамилна's
// facade, maps and stylesheet stay on Многофамилна's own routes (spec §10).
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import { MN_SNAPSHOT_DATA, MN_SNAPSHOT_DATE } from '../../data/mnogofamilna/snapshot'

const ID = 'mnogofamilna-sgrada'

// Whether the store holds live rows of both blocks (src/data/availability/
// store.js gives Многофамилна rows only from its own sheets, or built in
// when every read failed).
const live = (snapshot) => ['block-a', 'block-b'].every((slot) => snapshot.origin?.[ID]?.[slot] === 'live')

export const MN_UNITS = Object.freeze({
  id: ID,
  option: 'mnogofamilna',
  floors: MN_FACTS.floors,
  perFloor: MN_FACTS.perFloor,
  total: MN_FACTS.apartments,
  // „А-101“ on floor 2: the data numbers the apartments by residential level.
  unitLabel: (unit) => `${unit.block}-${unit.floor - 1}${unit.suffix}`,
  modelData: (snapshot) => (live(snapshot) ? snapshot.data : MN_SNAPSHOT_DATA),
  dated: (snapshot) => (live(snapshot) ? null : MN_SNAPSHOT_DATE),
})
