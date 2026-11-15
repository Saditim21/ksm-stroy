import { createContext, useContext } from 'react'

// What ExplorerProvider (ExplorerContext.jsx) gives the sections inside it:
//   { model, snapshot, stage, unitId, view,
//     openFloor(block, floor, unitId?, meta?), closeStage(), setFloor(floor),
//     setBlock(block), openUnit(unitId), closeUnit(), setView(view),
//     railFocus, railFocused() }
// `model` is buildModel()'s (model.js), null until the data arrives, and
// `snapshot` is useAvailability()'s. The rest is useExplorerState's, the
// address's; openFloor also takes the opening's { fromRect, opener } (ruling
// F5), which never goes into the address. `railFocus` ({ block, floor } or
// null) is the floor whose rail the facade is to focus as a stage closes,
// once it shows that floor's block, and railFocused() says it has (Facade.jsx).
// Its own module, so the provider's is a component's alone.
export const ExplorerContext = createContext(null)

/** The explorer's state and model, for a section inside ExplorerProvider. */
export default function useExplorer() {
  const explorer = useContext(ExplorerContext)
  if (!explorer) throw new Error('useExplorer() needs an <ExplorerProvider> around it')
  return explorer
}
