import { createContext, useContext } from 'react'

// What ExplorerProvider (ExplorerContext.jsx) gives the sections inside it:
//   { model, snapshot, project, dated, stage, unitId, view,
//     openFloor(block, floor, unitId?, meta?), closeStage(), setFloor(floor),
//     setBlock(block), openUnit(unitId, opener?), closeUnit(), setView(view),
//     railFocus, railFocused() }
// `model` is buildModel()'s (model.js), null until the data arrives, and
// `snapshot` is useAvailability()'s. `project` is the page's project (below),
// and `dated` the date its numbers are from („01.12.2025“), or null while
// they are the sheets' own. The rest is useExplorerState's, the address's,
// the provider's own openFloor, openUnit, closeStage, setFloor and setBlock
// around it; openFloor also takes the opening's { fromRect, opener } (ruling
// F5), and openUnit the element the unit panel gives the focus back to (else
// the focused one), neither of which goes into the address.
// `railFocus` ({ block, floor } or null) is the floor whose rail the facade
// is to focus as a stage closes, once it shows that floor's block, and
// railFocused() says it has (Facade.jsx).
//
// A project (spec M3 §6.4; projects/gr.js, projects/mn.js), the one place the
// explorer reads a building from:
//   { id: 'golden-residence' | 'mnogofamilna-sgrada',
//     option: 'golden-residence' | 'mnogofamilna',  the inquiry option its units preset
//     floors: { min, max },                           1–8, 2–10
//     perFloor, total,                                12/192, 8/144
//     unitLabel({ block, floor, suffix }) → string,   a unit's label: 'А 501', 'А-101'
//     modelData(snapshot) → data | null,              what buildModel reads
//     dated(snapshot) → string | null,                the date of numbers that are not live
//     types: string[],                                the list's Вид options
//     exposureNote: string | null,                    the list's footnote on the exposures
//     facade: { map, picture, priority?, sizes, alt, className?, seam: { x, top, bottom }, Lights?, namesApart? },
//     plans: Plans, or loadPlans() → Promise<Plans> }
//   Plans = { floors, drawings?,
//     unitNumber(unit) → string,                      what a plan draws: '501', '101'
//     floorMeta({ block, floor }) → string | null,    'кота +3,06' on А-1, 'тавански етаж' on 10
//     floorWord?({ block, floor }) → string | null }  after a unit's floor: 'тавански' on 10
// `facade.map` is its building map; `picture` and `sizes` the facade's
// picture; `alt` its name; `className` the class under which the project's
// stylesheet sets its facade's geometry (explorer.css's own is Golden
// Residence's); `seam` the brass line between its blocks, on the map's grid.
// Its plans are what only an opened floor's surfaces, and mini plans, read:
// its floor plans (a floors map), the dark drawing under each block's (an
// image), the number an apartment shows on them and the project's word on a
// floor. They are data, there at once (Многофамилна's, whose block pages
// prerender mini plans), or a chunk of their own that loadPlans() loads, out
// of the route's first-load JS (Golden Residence's, gr.plans.js; M3 §10).
// The surfaces read them through plans.js.
//
// Its own module, so the provider's is a component's alone.
export const ExplorerContext = createContext(null)

/** The explorer's state and model, for a section inside ExplorerProvider. */
export default function useExplorer() {
  const explorer = useContext(ExplorerContext)
  // Worded short: it ships in every explorer page's first load, and its
  // bytes offset FR9's unit retry (ruling FW2).
  if (!explorer) throw new Error('useExplorer() needs an ExplorerProvider')
  return explorer
}
