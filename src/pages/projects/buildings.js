import { useMemo } from 'react'
import { useAvailability } from '../../data/availability/useAvailability'
import { loadSurfaces } from '../../explorer/loadSurfaces'
import { buildModel } from '../../explorer/model'
import { GR_PROJECT } from '../../explorer/projects/gr'
import { MN_UNITS } from '../../explorer/projects/mn.units'
import { bindAddress } from '../../utils/format'

// The two buildings Продажби sets side by side (spec M3/M4 §7.1), Golden
// Residence left of the seam and Многофамилна right, as both its sections
// read them, the sales board (SalesBoard.jsx) and the rows (BuildingRows.jsx):
// - `project`, the building as its explorer reads it (projects/gr.js, and
//   projects/mn.units.js, Многофамилна's apartments without its facade,
//   which stays on its own routes): its id, floors and labels, and the rows
//   it reads from the store;
// - its name, its address (a no-break space where the address keeps words
//   together, spec §4.5), and its page: `explorer`, the hash that takes a
//   visitor to its apartments there (Golden Residence's page opens on its
//   hero, Многофамилна's on its explorer);
// - unitHref(label), the address that opens an apartment's panel on its
//   page (spec §7.1, §7.10), and warm(), which starts loading that panel
//   with the click, as Home's teaser does (the dialogs' chunk, and Golden
//   Residence's plans), so it need not wait behind the doors.
const building = ({ page, explorer, project, ...rest }) => Object.freeze({
  ...rest,
  project,
  page,
  explorer,
  unitHref: (label) => `${page}?unit=${encodeURIComponent(label)}${explorer}`,
})

export const BUILDINGS = Object.freeze([
  building({
    key: 'gr',
    project: GR_PROJECT,
    name: 'Golden Residence',
    address: 'ул. Ген. Климент Бояджиев, жк Левски Г, София',
    page: '/projects/golden-residence',
    explorer: '#explorer',
    warm: () => loadSurfaces(GR_PROJECT),
  }),
  building({
    key: 'mn',
    project: MN_UNITS,
    name: 'Многофамилна сграда',
    address: bindAddress('УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София'),
    page: '/projects/mnogofamilna-sgrada',
    explorer: '',
    warm: () => loadSurfaces(),
  }),
])

/** Each building's numbers now: { model, dated } by its key ('gr', 'mn'),
 * and the store's `data`. `model` is buildModel()'s, null until the store
 * has Golden Residence's rows (Многофамилна's are the snapshot, there at
 * once), and `dated` the date of numbers that are not live, else null. */
export function useBuildings() {
  const snapshot = useAvailability()
  const grData = GR_PROJECT.modelData(snapshot)
  const mnData = MN_UNITS.modelData(snapshot)
  const gr = useMemo(() => buildModel(grData, GR_PROJECT), [grData])
  const mn = useMemo(() => buildModel(mnData, MN_UNITS), [mnData])
  return {
    gr: { model: gr, dated: GR_PROJECT.dated(snapshot) },
    mn: { model: mn, dated: MN_UNITS.dated(snapshot) },
    data: snapshot.data,
  }
}
