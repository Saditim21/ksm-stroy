// What Многофамилна's plans add once its dialogs open (plans.js; the shape is
// useExplorer.js's), each a named export, so the module is what
// MN_PROJECT.loadPlans() hands over, beside its plans' data (mn.js): the dark
// line art under its typical floor (mn-plan-line, at twice the plan's grid;
// ruling PF4), quieter than Golden Residence's under the class its stylesheet
// gives it (plan--mn, src/explorer/mn-facade.css; ruling PF5), and the plans
// production has of single apartments, shown whole in the unit panel (M3
// §2, §6.4). A chunk of its own, loaded with the surfaces, so none of it is
// in a route's first-load JS, nor on Golden Residence's pages (ruling PF3).
import mnPlans from '../../data/images/mn-plans.json'

const LINE = mnPlans['mn-plan-line']
export const drawings = { 'А': LINE, 'Б': LINE }

export const className = 'plan--mn'

// Every real apartment src/constants/apartmentImages.js maps to a plan of its
// own, by the file it uses (ruling PF14): А-858 and А-864 do not exist, and
// Б-202 and Б-206 have Б-102's and Б-106's plans.
const OWN = {
  'А-102': 'a102',
  'А-106': 'a106',
  'А-802': 'a802',
  'А-808': 'a808',
  'Б-102': 'b102',
  'Б-202': 'b102',
  'Б-106': 'b106',
  'Б-206': 'b106',
  'Б-107': 'b107',
  'Б-207': 'b207',
  'Б-307': 'b307',
  'Б-407': 'b407',
  'Б-607': 'b607',
  'Б-702': 'b702',
  'Б-707': 'b707',
  'Б-801': 'b801',
  'Б-803': 'b803',
  'Б-807': 'b807',
}

export const own = Object.fromEntries(Object.entries(OWN).map(([label, file]) => [label, mnPlans[`mn-apt-${file}`]]))
