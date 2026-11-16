// Each block's plan (floors.json: one typical floor serves all eight, spec
// §9), by its letter: what the edge panels, the sheet, the plan stage and the
// unit panel draw. Only the surfaces' chunk imports it (surfaces.js), so the
// plans never travel with a route's first-load JS.
import floorsMap from '../data/maps/golden-residence.floors.json'
import { planFor } from './planGeometry'

export const PLANS = Object.freeze({ 'А': planFor(floorsMap, 'А'), 'Б': planFor(floorsMap, 'Б') })
