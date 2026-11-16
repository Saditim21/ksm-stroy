// Golden Residence's plans, as the surfaces read a project's (plans.js; the
// shape is useExplorer.js's), each a named export, so the module is the
// plans GR_PROJECT.loadPlans() hands over: its floor plans
// (golden-residence.floors.json: one typical floor serves all eight, spec
// §9), the dark drawing under each block's (plan-a, plan-b: 1200 px, the
// plans' own grid), the number each apartment shows on them and the word they
// give a floor. A chunk of its own, loaded with an opened floor's surfaces
// (gr.js), so none of it is in a route's first-load JS (M3 §10).
import { GR_FACTS } from '../../config/facts'
import grImages from '../../data/images/golden-residence.json'
import floorsMap from '../../data/maps/golden-residence.floors.json'
import { formatDecimal } from '../../utils/format'

export const floors = floorsMap
export const drawings = { 'А': grImages['plan-a'], 'Б': grImages['plan-b'] }

// „501“: the floor, then the unit's number on it.
export const unitNumber = (unit) => `${unit.floor}${unit.suffix}`

// The floor's кота, where the drawings give it (spec §9: only А1).
export function floorMeta({ block, floor }) {
  const level = GR_FACTS.elevations[`${block}-${floor}`]
  return level == null ? null : `кота +${formatDecimal(level)}`
}
