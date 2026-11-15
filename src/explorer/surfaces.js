// What only a floor that is hot or open needs (spec §7.3, §7.5–7.7, §12): the
// edge panels, the phone's sheet, the explorer's dialogs (ExplorerDialogs.jsx:
// the plan stage and the unit panel), and the block plans they draw. A chunk
// of their own, which only loadSurfaces.js imports, so none of it travels
// with a route's first-load JS (ruling C7.7): the full facade loads it as it
// nears the screen or is first touched, the explorer's provider when the
// address opens a dialog, and Home's compact facade, which has neither panels
// nor dialogs, never loads it at all.
export { default as FloorPanel } from './FloorPanel'
export { default as FloorSheet } from './FloorSheet'
export { default as ExplorerDialogs } from './ExplorerDialogs'
export { PLANS } from './plans'
