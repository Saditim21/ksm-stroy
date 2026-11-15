// Loads the list, „По критерии“ (UnitList.jsx, with its filters,
// filterUnits.js, and the views' switch with motion, viewMotion.js: the
// chunk listChunk.js), once, for the explorer of the page and every later
// visit to it. A chunk of its own, so the list never travels with a route's
// first-load JS (ruling C8.5): the explorer asks for it on the first switch
// to „По критерии“ or on a ?view=list landing (ExplorerSection.jsx).
//
// The surfaces' chunk imports it (surfaces.js): the list's rows open their
// units in the unit panel there, and on the Golden Residence page that chunk
// is in by the time the tabs are (the facade loads it as it nears the
// screen), so the list is then one request.
import { loadSurfaces } from './loadSurfaces'

let loaded = null
let loading = null

/** The list's module once it has loaded, else null. */
export const loadedUnitList = () => loaded

/** Loads the list, once; a failed load may be tried again. */
export function loadUnitList() {
  loading ??= loadSurfaces()
    .then((surfaces) => surfaces.loadList())
    .then(
      (module) => {
        loaded = module
        return module
      },
      (error) => {
        loading = null
        throw error
      },
    )
  return loading
}
