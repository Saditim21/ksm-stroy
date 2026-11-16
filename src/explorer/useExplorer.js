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
//     name: 'Golden Residence' | 'Многофамилна жилищна сграда',
//     option: 'golden-residence' | 'mnogofamilna',  the inquiry option its units preset
//     floors: { min, max },                           1–8, 2–10
//     perFloor, perBlock, total,                      12/96/192, 8/72/144
//     unitNumber(unit) → string,                      what a plan draws: '501', '101'
//     unitLabel({ block, floor, suffix }) → string,   a unit's label: 'А 501', 'А-101'
//     floorMeta({ block, floor }) → string | null,    'кота +3,06' on А-1, 'тавански етаж' on 10
//     modelData(snapshot) → data | null,              what buildModel reads
//     dated(snapshot) → string | null,                the date of numbers that are not live
//     types: string[],                                the list's Вид options
//     exposureNote: string | null,                    the list's footnote on the exposures
//     facade: { map, picture, sizes, alt, className?, seam: { x, top, bottom }, Lights? },
//     plans: { floors, drawings? } or loadPlans() → Promise<{ floors, drawings? }> }
// `facade.map` is its building map; `picture` and `sizes` the facade's
// picture; `alt` its name; `className` the class under which the project's
// stylesheet sets its facade's geometry (explorer.css's own is Golden
// Residence's); `seam` the brass line between its blocks, on the map's grid.
// `plans` is its floor plans (a floors map) and the dark drawing under each
// block's (an image), as data or as a chunk of its own that loadPlans()
// loads: the surfaces read them (plans.js).
//
// Its own module, so the provider's is a component's alone.
export const ExplorerContext = createContext(null)

/** The explorer's state and model, for a section inside ExplorerProvider. */
export default function useExplorer() {
  const explorer = useContext(ExplorerContext)
  if (!explorer) throw new Error('useExplorer() needs an <ExplorerProvider> around it')
  return explorer
}
