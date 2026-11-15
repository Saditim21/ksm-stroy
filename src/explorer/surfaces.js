// The full facade's surfaces (spec §7.3, §7.5): the edge panels, the phone's
// sheet, and the block plans they draw. A chunk of their own, which only
// loadSurfaces.js imports: they show only once a floor turns hot, so the
// facade loads them as it nears the screen or is first touched, never with a
// route's first-load JS, and Home's compact facade, which has neither, never
// loads them at all (spec §12).
import floorsMap from '../data/maps/golden-residence.floors.json'
import { planFor } from './geometry'

export { default as FloorPanel } from './FloorPanel'
export { default as FloorSheet } from './FloorSheet'

/** Each block's plan (floors.json), by its letter. */
export const PLANS = Object.freeze({ 'А': planFor(floorsMap, 'А'), 'Б': planFor(floorsMap, 'Б') })
