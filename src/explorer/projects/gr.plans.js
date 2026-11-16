// Golden Residence's floor plans (golden-residence.floors.json: one typical
// floor serves all eight, spec §9) and the dark drawing under each block's
// (plan-a, plan-b: 1200 px, the plans' own grid), as the surfaces read a
// project's plans (plans.js). A chunk of its own, which GR_PROJECT.loadPlans()
// loads with an opened floor's surfaces (gr.js).
import grImages from '../../data/images/golden-residence.json'
import floors from '../../data/maps/golden-residence.floors.json'

export default { floors, drawings: { 'А': grImages['plan-a'], 'Б': grImages['plan-b'] } }
