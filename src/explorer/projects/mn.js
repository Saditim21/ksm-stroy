// Многофамилна жилищна сграда, as the one explorer reads a project (spec M3
// §2, §5, §6.3, §6.4; the shape is useExplorer.js's): two blocks of
// apartments on floors 2–10, eight a floor, numbered by the data (А-101 is on
// floor 2), the top floor the attic. Its apartments, as a page counts and
// names them, are MN_UNITS (mn.units.js): its id, floors and labels, and its
// numbers, the dated snapshot of 01.12.2025 until the store holds live rows
// of both its blocks, which its sheets would give once they are published:
// the date goes with them. Продажби's board reads MN_UNITS alone.
//
// Its facade is the night render (spec M3 §6.3): the twin with every window
// dark (mn-night's mn-dusk-off), the page's first picture, and over it the
// lit render (mn-dusk, of the same crop of the 3308 px master) through the
// band of every floor with a free apartment (FacadeLights.jsx). Its geometry
// on the building map's grid of 1200 × 848, its crops and its fades are its
// stylesheet's (src/explorer/mn-facade.css), under the facade's class.
//
// Its plans' data are there at once (ruling PF3: the block pages prerender
// mini plans of its one typical floor); its drawing and its apartments' own
// plans are a chunk of their own (mn.plans.js), which the dialogs load.
import mnNight from '../../data/images/mn-night.json'
import building from '../../data/maps/mnogofamilna.building.json'
import floors from '../../data/maps/mnogofamilna.floors.json'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import FacadeLights from '../FacadeLights'
import { MN_UNITS } from './mn.units'

// Each block's band on the grid, as wide as its towers (the concept's
// mnogofamilna.js:262): the lit render shows a floor through its band.
const BANDS = Object.freeze({ 'А': Object.freeze([70, 516]), 'Б': Object.freeze([700, 1146]) })

// The facade's floors are its bands, 6 inside them, at each floor's height
// on the building map (the concept's :455-458): the lens covers the block's
// band, as the lit floor does, and so does the pointer's target.
const map = Object.freeze({
  ...building,
  shapes: building.shapes.map((shape) => {
    if (shape.type !== 'floor') return shape
    const ys = shape.polygons[0].map(([, y]) => y)
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)]
    const [left, right] = [BANDS[shape.block][0] + 6, BANDS[shape.block][1] - 6]
    return { ...shape, polygons: [[[left, top], [right, top], [right, bottom], [left, bottom]]] }
  }),
})

// The twin and the lit render, each on the page's ground: their skies are
// the render's own.
const twin = Object.freeze({ ...mnNight['mn-dusk-off'], color: 'transparent' })
const litRender = Object.freeze({ ...mnNight['mn-dusk'], color: 'transparent' })

// A phone shows one block's crop of a render, and its files up to 1400 px
// are enough there at any density (the concept's mnogofamilna.js:413-414,
// its phone up to 900 px): its own sources of each render, without the
// larger rungs, keep a phone's LCP image, the twin, within the 60 kB mobile
// budget at any density (spec M3/M4 §10: the 1400 px AVIF is 55 kB, the
// 1600 px 66 kB). `sizes` still says the slot's width, so the browser picks
// between the two. A desktop keeps the whole ladder.
const onPhones = (image) => Object.freeze({
  media: '(max-width: 900px)',
  image: Object.freeze({ ...image, widths: image.widths.filter((width) => width <= 1400) }),
})

export const MN_PROJECT = Object.freeze({
  ...MN_UNITS,
  types: Object.freeze(Object.keys(MN_FACTS.types).sort()),
  exposureNote: null,
  facade: Object.freeze({
    map,
    // The twin, the page's first picture (its LCP): fetched first and at
    // once.
    picture: twin,
    art: onPhones(twin),
    priority: true,
    // The lit render, which the lit floors show (FacadeLights.jsx).
    lit: litRender,
    litArt: onPhones(litRender),
    // The picture's width, the grid's: the stage's on a desktop (860 px up
    // to a 1365 px screen, then about .66 of it), 1200 / 652 of the stage on
    // a phone, which shows one block's crop (mn-facade.css).
    sizes: '(max-width: 900px) 170vw, (max-width: 1365px) 860px, 66vw',
    alt: 'Фасада на Многофамилна жилищна сграда',
    className: 'fx--mn',
    // The courtyard between the blocks (the concept's mnogofamilna.js:258).
    seam: Object.freeze({ x: 609.5, top: 150, bottom: 598 }),
    bands: BANDS,
    Lights: FacadeLights,
    // Its block names apart in the page's text, „Блок А Блок Б“, as they are
    // on the screen, not run together: the page names its blocks on its
    // facade (the routes contract reads „блок А“ before anything but a
    // letter, tests/contracts/site.jsx). Golden Residence's and Home's
    // markup stays as it was (M3 §6.4).
    namesApart: true,
  }),
  plans: Object.freeze({
    floors,
    // „101“ on floor 2, as its label has it.
    unitNumber: (unit) => `${unit.floor - 1}${unit.suffix}`,
    // The top floor is the one production calls „Тавански етаж“ (spec §2),
    // and an apartment's line says so after the floor's number, „етаж 10,
    // тавански“ (the unit panel; the concept's mnogofamilna.js:856).
    floorMeta: ({ floor }) => (floor === MN_FACTS.floors.max ? 'тавански етаж' : null),
    floorWord: ({ floor }) => (floor === MN_FACTS.floors.max ? 'тавански' : null),
  }),
  loadPlans: () => import('./mn.plans'),
})
