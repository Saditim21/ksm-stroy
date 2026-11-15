import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAvailability } from '../data/availability/useAvailability'
import useHydrated from '../hooks/useHydrated'
import useMotionNow from '../motion/useMotionNow'
import { jumpToId } from '../utils/scroll'
import { loadedSurfaces, loadSurfaces } from './loadSurfaces'
import { buildModel } from './model'
import { ExplorerContext } from './useExplorer'
import useExplorerState from './useExplorerState'

// The explorer of a page (spec §7.6–7.10): the Golden Residence page wraps its
// sections in it, from the hero to the inquiry, and each block page its own
// (BlockPage.jsx, `routeBlock` its letter). It builds the model from the
// availability store, holds the address's state (useExplorerState), and
// renders the page's two dialogs, the plan stage and the unit panel, while the
// address opens them (ExplorerDialogs.jsx, which also gives the focus back as
// each goes). Sections read it through useExplorer() (useExplorer.js).
//
// - The opening's { fromRect, opener } (ruling F5) stays here, never in the
//   address: the stage grows from fromRect, and closing gives the focus back
//   to the opener. A floor opened from a mini plan's unit opens the unit panel
//   once the plan has grown (820 ms, at once without motion; extract §4.23).
//   openUnit keeps the element that opened the unit panel, for its close.
// - A deep link: when the address opens a dialog as the page arrives, the
//   page first jumps to #explorer, with no glide (jumpToId), so closing the
//   stage leaves the reader at the facade; the dialogs mount after the jump.
// - The dialogs are the surfaces' chunk (surfaces.js), loaded when the
//   address asks for one; the full facade has usually loaded it before, as it
//   neared the screen. Until it is in, nothing shows.

const UNIT_AFTER_MS = 820

export function ExplorerProvider({ routeBlock = null, children }) {
  const snapshot = useAvailability()
  const model = useMemo(() => buildModel(snapshot.data), [snapshot.data])
  const state = useExplorerState({ routeBlock })
  const { stage, unitId } = state
  const hydrated = useHydrated()
  const motionNow = useMotionNow()
  // The address's state at its latest, for what runs after a delay.
  const latest = useRef(state)
  useLayoutEffect(() => {
    latest.current = state
  })

  // The page's arrival: a deep link's jump comes first, then the dialogs.
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    if (!hydrated || arrived) return
    if (stage || unitId) jumpToId('explorer')
    setArrived(true)
  }, [hydrated, arrived, stage, unitId])

  // The dialogs' chunk, once the address asks for a dialog.
  const [surfaces, setSurfaces] = useState(loadedSurfaces)
  const wanted = arrived && Boolean(stage || unitId)
  useEffect(() => {
    if (!wanted || surfaces) return undefined
    let live = true
    loadSurfaces().then(
      (module) => {
        if (live) setSurfaces(module)
      },
      (error) => console.error('[explorer] the plan stage did not load:', error),
    )
    return () => {
      live = false
    }
  }, [wanted, surfaces])

  // The opening: where the stage grows from and what opened it; and what
  // opened the unit panel.
  const [opening, setOpening] = useState(null)
  const unitOpener = useRef(null)
  const unitTimer = useRef(0)
  useEffect(() => () => clearTimeout(unitTimer.current), [])

  const openFloor = useCallback((block, floor, unitLabel, meta) => {
    clearTimeout(unitTimer.current)
    setOpening(meta ?? null)
    unitOpener.current = null
    if (unitLabel && motionNow()) {
      latest.current.openFloor(block, floor)
      unitTimer.current = setTimeout(() => latest.current.openUnit(unitLabel), UNIT_AFTER_MS)
    } else {
      latest.current.openFloor(block, floor, unitLabel)
    }
  }, [motionNow])

  const openUnit = useCallback((label) => {
    clearTimeout(unitTimer.current)
    unitOpener.current = document.activeElement === document.body ? null : document.activeElement
    latest.current.openUnit(label)
  }, [])

  const closeStage = useCallback(() => {
    clearTimeout(unitTimer.current)
    latest.current.closeStage()
  }, [])

  const value = useMemo(
    () => ({ ...state, model, snapshot, openFloor, openUnit, closeStage }),
    [state, model, snapshot, openFloor, openUnit, closeStage],
  )

  return (
    <ExplorerContext.Provider value={value}>
      {children}
      {surfaces && arrived ? (
        <surfaces.ExplorerDialogs
          model={model}
          state={state}
          opening={opening}
          setOpening={setOpening}
          unitOpener={unitOpener}
          openUnit={openUnit}
          closeStage={closeStage}
        />
      ) : null}
    </ExplorerContext.Provider>
  )
}
