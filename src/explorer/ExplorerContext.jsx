import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAvailability } from '../data/availability/useAvailability'
import useHydrated from '../hooks/useHydrated'
import useMotionNow from '../motion/useMotionNow'
import { jumpToId } from '../utils/scroll'
import { loadedSurfaces, loadSurfaces } from './loadSurfaces'
import { buildModel, findUnit } from './model'
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
// - Its landing keeps the EU line in view (spec §1.9, §14.1): the jump would
//   slide the header's EU row away (§6.2), and the dialogs cover the page.
//   From just before the jump until the landing's dialogs have gone, <html>
//   carries data-eu-hold: the header keeps its EU row where it is, and the
//   dialogs leave it its 36 px (src/styles/shell.css, explorer.css). The
//   landing ends once the address asks for no dialog the page can show: a
//   close, an inquiry, a unit the sheets do not have, or dialogs whose chunk
//   did not load. A floor opened in place is no landing.
// - The dialogs are the surfaces' chunk (surfaces.js), loaded when the
//   address asks for one; the full facade has usually loaded it before, as it
//   neared the screen. Until it is in, nothing shows.

const UNIT_AFTER_MS = 820
const holdEuRow = (on) => document.documentElement.toggleAttribute('data-eu-hold', on)

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

  // The page's arrival: a deep link's jump comes first, then the dialogs. The
  // EU row is held before the jump's scroll can reach the header.
  const [arrived, setArrived] = useState(false)
  const [landing, setLanding] = useState(false)
  useEffect(() => {
    if (!hydrated || arrived) return
    if (stage || unitId) {
      holdEuRow(true)
      setLanding(true)
      jumpToId('explorer')
    }
    setArrived(true)
  }, [hydrated, arrived, stage, unitId])

  // The landing lasts while the address asks for a dialog the page can show:
  // the stage, or a unit the model has (or may have, until the data is in).
  // The hold follows it at every commit (a link that turns out to open
  // nothing ends it before it ever commits), and goes with the page.
  const asksForDialog = Boolean(stage) || (Boolean(unitId) && (!model || Boolean(findUnit(model, unitId))))
  if (landing && !asksForDialog) setLanding(false)
  useLayoutEffect(() => {
    holdEuRow(landing)
  })
  useLayoutEffect(() => () => holdEuRow(false), [])

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
      (error) => {
        console.error('[explorer] the plan stage did not load:', error)
        if (live) setLanding(false)
      },
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

  // The floor whose rail is to take the focus back, when a stage has closed
  // with no opener to give it to and its rail is off screen (a phone's facade
  // shows one block; ExplorerDialogs.jsx): the facade shows that block, then
  // focuses the rail, and says so (railFocused).
  const [railFocus, setRailFocus] = useState(null)
  const focusRail = useCallback(({ block, floor }) => setRailFocus({ block, floor }), [])
  const railFocused = useCallback(() => setRailFocus(null), [])

  const value = useMemo(
    () => ({ ...state, model, snapshot, openFloor, openUnit, closeStage, railFocus, railFocused }),
    [state, model, snapshot, openFloor, openUnit, closeStage, railFocus, railFocused],
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
          focusRail={focusRail}
        />
      ) : null}
    </ExplorerContext.Provider>
  )
}
