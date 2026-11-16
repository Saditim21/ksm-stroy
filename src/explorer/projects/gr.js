// Golden Residence, as the one explorer reads a project (spec M3 §6.4; the
// shape is useExplorer.js's): its facts (GR_FACTS), its unit numbers, the кота
// its drawings give, the sheets' live rows, its list's types and footnote, and
// its facade, the sky-cut picture on golden-residence.building.json's grid,
// whose CSS geometry is explorer.css's own defaults. Its floor plans and their
// dark drawings are a chunk of their own (gr.plans.js), loaded with an opened
// floor's surfaces and never with a route's first-load JS, nor on another
// project's pages (ruling PF3).
import { GR_FACTS } from '../../config/facts'
import grImages from '../../data/images/golden-residence.json'
import building from '../../data/maps/golden-residence.building.json'
import { formatDecimal } from '../../utils/format'

export const GR_PROJECT = Object.freeze({
  id: 'golden-residence',
  name: 'Golden Residence',
  option: 'golden-residence',
  floors: Object.freeze({ min: 1, max: GR_FACTS.floors }),
  perFloor: GR_FACTS.perFloor,
  perBlock: GR_FACTS.apartments / GR_FACTS.blocks,
  total: GR_FACTS.apartments,
  // „501“: the floor, then the unit's number on it; „А 501“ with its block.
  unitNumber: (unit) => `${unit.floor}${unit.suffix}`,
  unitLabel: (unit) => `${unit.block} ${unit.floor}${unit.suffix}`,
  // The floor's кота, where the drawings give it (spec §9: only А1).
  floorMeta: ({ block, floor }) => {
    const level = GR_FACTS.elevations[`${block}-${floor}`]
    return level == null ? null : `кота +${formatDecimal(level)}`
  },
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
  loadPlans: () => import('./gr.plans').then((module) => module.default),
})
