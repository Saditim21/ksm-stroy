import { loadFlip } from '../motion/flip'

// What only a floor that is hot or open needs (spec §7.3, §7.5–7.7, §12): the
// edge panels, the phone's sheet, the explorer's dialogs (ExplorerDialogs.jsx:
// the plan stage and the unit panel), and the reading of a project's plans
// they draw (plans.js; the plans themselves are the project's, M3 §6.4). A
// chunk of their own, which only loadSurfaces.js imports, so none of it
// travels with a route's first-load JS (ruling C7.7): the full facade loads it
// as it nears the screen or is first touched, the explorer's provider when
// the address opens a dialog, and Home's compact facade, which has neither
// panels nor dialogs, never loads it at all.
//
// It also loads what the views' switch shows (ExplorerSection.jsx): the
// list, „По критерии“ (listChunk.js, a chunk of its own; loadUnitList.js),
// whose rows open their units in the unit panel here, and Flip (loadFlip,
// src/motion/flip.js, which only this chunk imports). Their loaders live in
// this chunk so that neither they nor the list of the chunks Vite preloads
// beside the list are in a route's first-load JS (rulings C8.5, C8.13); a
// switch waits for this chunk anyway, for the list.
//
// And it preloads them (spec §12, ruling C8.6): once this chunk is in, the
// browser's next idle moment starts the list's chunk, and Flip where motion
// may play (the motion gate's `js` on <html>, spec §5.2), so the first switch
// to „По критерии“ need not wait for either. Each loads once; a load that
// fails here is tried again by the switch, which says so.
export { default as FloorPanel } from './FloorPanel'
export { default as FloorSheet } from './FloorSheet'
export { default as ExplorerDialogs } from './ExplorerDialogs'
export { loadPlans, plansOf } from './plans'
export { loadFlip }

/** Loads the list's own chunk. */
export const loadList = () => import('./listChunk')

function preload() {
  loadList().catch(() => {})
  if (document.documentElement.classList.contains('js')) loadFlip().catch(() => {})
}

// Safari has no requestIdleCallback: the next macrotask then, as the motion
// runtime's queue does (src/motion/runtime.js).
if (typeof window !== 'undefined') {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(preload)
  else setTimeout(preload, 1)
}
