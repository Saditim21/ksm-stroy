// Golden Residence, as the one explorer reads a project (spec M3 §6.4; the
// shape is useExplorer.js's): its facts (GR_FACTS), its unit labels, the
// sheets' live rows, its list's types and footnote, and its facade, the
// sky-cut picture on golden-residence.building.json's grid, whose CSS
// geometry is explorer.css's own defaults. What only an opened floor's
// surfaces read, its floor plans with their dark drawings, the numbers its
// plans draw and the кота its drawings give, is a chunk of its own
// (gr.plans.js), loaded with those surfaces and never with a route's
// first-load JS, nor on another project's pages (ruling PF3, M3 §10).
import { GR_FACTS } from '../../config/facts'
import grImages from '../../data/images/golden-residence.json'
import building from '../../data/maps/golden-residence.building.json'

export const GR_PROJECT = Object.freeze({
  id: 'golden-residence',
  option: 'golden-residence',
  floors: Object.freeze({ min: 1, max: GR_FACTS.floors }),
  perFloor: GR_FACTS.perFloor,
  total: GR_FACTS.apartments,
  // „А 501“: the block, then the floor and the unit's number on it.
  unitLabel: (unit) => `${unit.block} ${unit.floor}${unit.suffix}`,
  // The sheets' rows, live or built in (StaleNotice.jsx says which).
  modelData: (snapshot) => snapshot.data,
  dated: () => null,
  types: Object.freeze(['2-стаен', '3-стаен', 'Ателие']),
  // A no-break space after the one-letter words, and in „блок Б“.
  exposureNote: 'Изложение има само за блок\u00a0Б, така е\u00a0в\u00a0таблицата.',
  facade: Object.freeze({
    map: building,
    // The cut-out facade: its sky is see-through, so it waits on the page's
    // ground, not on a block of its colour.
    picture: Object.freeze({ ...grImages['facade-cut'], color: 'transparent' }),
    // The picture's width: the grid's (the stage's) on a desktop, 1200/628 of
    // the stage on a phone, which shows one block.
    sizes: '(max-width: 900px) 191vw, (max-width: 1150px) 860px, 76vw',
    alt: 'Фасада на Golden Residence',
    // The brass seam between the blocks, on the grid.
    seam: Object.freeze({ x: 605, top: 120, bottom: 520 }),
  }),
  loadPlans: () => import('./gr.plans'),
})
