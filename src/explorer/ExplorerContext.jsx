import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAvailability } from '../data/availability/useAvailability'
import useHydrated from '../hooks/useHydrated'
import useMotionNow from '../motion/useMotionNow'
import { holdEuRow, releaseOnFirstMove } from '../shell/landingHold'
import { jumpToId } from '../utils/scroll'
import { loadedSurfaces, loadSurfaces } from './loadSurfaces'
import { buildModel, findUnit } from './model'
import { ExplorerContext } from './useExplorer'
import useExplorerState from './useExplorerState'

// The explorer of a page (spec §7.6–7.10; M3 §6.4): a project's page wraps
// its sections in it, from the hero to the inquiry, and each block page its
// own (BlockPage.jsx, `routeBlock` its letter). `project` is the page's
// building (projects/gr.js, projects/mn.js; its shape is useExplorer.js's):
// the model is built from the data it reads from the availability store
// (project.modelData), dated where it says so (project.dated), the address's
// floors are its own (useExplorerState), and its plans load with the
// dialogs. The provider renders the page's two dialogs, the plan stage and
// the unit panel, while the address opens them (ExplorerDialogs.jsx, which
// also gives the focus back as each goes). Sections read it through
// useExplorer() (useExplorer.js).
//
// - The opening's { fromRect, opener } (ruling F5) stays here, never in the
//   address: the stage grows from fromRect, and closing gives the focus back
//   to the opener. A floor opened from a mini plan's unit opens the unit panel
//   once the plan has grown (820 ms, at once without motion; extract §4.23).
//   Any other change of the floor, the block, the unit or the stage calls
//   that unit off (ruling C8.2), so the stage's ▲▼, PageUp and PageDown and
//   its block switch get the provider's setFloor and setBlock.
// - openUnit keeps the element that opened the unit panel, for its close:
//   the one it is given (a block's square, BlockGrid.jsx: Safari and Firefox
//   on a Mac do not focus a button they click), else the focused element.
// - A deep link: when the address opens a dialog as the page arrives, the
//   page first jumps to #explorer, with no glide (jumpToId), so closing the
//   stage leaves the reader at the facade; the dialogs mount after the jump.
//   On a page whose list is a section of its own (#spisak, Многофамилна's,
//   M3 §6.2 #3), an address that shows the list (?view=list) lands on the
//   list instead, its dialogs, if any, over it.
// - Its landing keeps the EU line in view (spec §1.9, §14.1): the jump would
//   slide the header's EU row away (§6.2), and the dialogs cover the page.
//   From just before the jump until the landing's dialogs have gone, the
//   site's landing hold (src/shell/landingHold.js) holds the header's EU row
//   where it is, and the dialogs leave it its 36 px. The landing ends once
//   the address asks for no dialog the page can show: a close, an inquiry, a
//   unit the sheets do not have, or dialogs whose chunk did not load. A floor
//   opened in place is no landing.
// - A landing on the list with no dialog over it holds the row the same way,
//   from just before its jump until the visitor first moves the page, by the
//   wheel, a touch, a key or a pointer's press, 400 ms on (M3 §8, as
//   Контакти's landing lets go; no scroll does, neither the jump's own nor
//   the ScrollTrigger refresh that follows it: src/shell/landingHold.js), or
//   opens a dialog over the list, in place.
// - The dialogs are the surfaces' chunk (surfaces.js), loaded with the
//   project's plans when the address asks for one; the full facade has
//   usually loaded both before, as it neared the screen. Until they are in,
//   nothing shows.

const UNIT_AFTER_MS = 820

export function ExplorerProvider({ project, routeBlock = null, children }) {
  const snapshot = useAvailability()
  const data = project.modelData(snapshot)
  const model = useMemo(() => buildModel(data, project), [data, project])
  const dated = project.dated(snapshot)
  const state = useExplorerState({ routeBlock, floors: project.floors })
  const { stage, unitId, view } = state
  const hydrated = useHydrated()
  const motionNow = useMotionNow()
  // The address's state at its latest, for what runs after a delay.
  const latest = useRef(state)
  useLayoutEffect(() => {
    latest.current = state
  })

  // The page's arrival: a deep link's jump comes first, then the dialogs. The
  // EU row is held before the jump's scroll can reach the header. The
  // landing is 'dialog', a deep link's dialogs over the page, or 'list', a
  // list of its own section with none over it; false once it has ended.
  const [arrived, setArrived] = useState(false)
  const [landing, setLanding] = useState(false)
  useEffect(() => {
    if (!hydrated || arrived) return
    const list = view === 'list' && Boolean(document.getElementById('spisak'))
    if (stage || unitId || list) {
      holdEuRow(true)
      setLanding(stage || unitId ? 'dialog' : 'list')
      jumpToId(list ? 'spisak' : 'explorer')
    }
    setArrived(true)
  }, [hydrated, arrived, stage, unitId, view])

  // A dialog's landing lasts while the address asks for a dialog the page can
  // show: the stage, or a unit the model has (or may have, until the data is
  // in); a list's, until a dialog opens over it, in place, or the visitor
  // first moves the page (below). The hold follows the landing at every
  // commit (a link that turns out to open nothing ends it before it ever
  // commits), and goes with the page.
  const asksForDialog = Boolean(stage) || (Boolean(unitId) && (!model || Boolean(findUnit(model, unitId))))
  if (landing && asksForDialog !== (landing === 'dialog')) setLanding(false)
  useLayoutEffect(() => {
    holdEuRow(Boolean(landing))
  })
  useLayoutEffect(() => () => holdEuRow(false), [])
  useEffect(() => {
    if (landing !== 'list') return undefined
    return releaseOnFirstMove(() => setLanding(false))
  }, [landing])

  // The opening: where the stage grows from and what opened it, a new object
  // at every floor opened, with or without either, and at every unit opened,
  // as it was; and what opened the unit panel.
  const [opening, setOpening] = useState(null)
  const unitOpener = useRef(null)
  const unitTimer = useRef(0)
  useEffect(() => () => clearTimeout(unitTimer.current), [])

  // The dialogs' chunk, once the address asks for a dialog, and again at each
  // floor or unit opened while it is not in: a failed load may be tried again
  // (loadSurfaces.js), so the next one opened after one failed still opens.
  // Each floor or unit opened is a new opening, the same one again included,
  // whose address stays as it was (FR9), so one open asks once. While the
  // chunk is not in, only openFloor can change the floor, and only openUnit
  // the unit: the stage's and the panel's own controls are in the chunk, and
  // the explorer never adds to the history (useExplorerState.js). One load in
  // flight is shared.
  const [surfaces, setSurfaces] = useState(() => loadedSurfaces(project))
  const wanted = arrived && Boolean(stage || unitId)
  useEffect(() => {
    if (!wanted || surfaces) return undefined
    let live = true
    loadSurfaces(project).then(
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
  }, [wanted, surfaces, project, opening])

  const openFloor = useCallback((block, floor, unitLabel, meta) => {
    clearTimeout(unitTimer.current)
    setOpening({ ...meta })
    unitOpener.current = null
    if (unitLabel && motionNow()) {
      latest.current.openFloor(block, floor)
      unitTimer.current = setTimeout(() => latest.current.openUnit(unitLabel), UNIT_AFTER_MS)
    } else {
      latest.current.openFloor(block, floor, unitLabel)
    }
  }, [motionNow])

  const openUnit = useCallback((label, opener) => {
    clearTimeout(unitTimer.current)
    // A new opening, the stage's own kept, for the chunk's load to follow.
    setOpening((current) => ({ ...current }))
    const focused = document.activeElement === document.body ? null : document.activeElement
    unitOpener.current = opener ?? focused
    latest.current.openUnit(label)
  }, [])

  // The address's closeStage, setFloor and setBlock, each calling off a unit
  // still to open first.
  const [closeStage, setFloor, setBlock] = useMemo(() => ['closeStage', 'setFloor', 'setBlock'].map((name) => (value) => {
    clearTimeout(unitTimer.current)
    latest.current[name](value)
  }), [])

  // The floor whose rail is to take the focus back, when a stage has closed
  // with no opener to give it to and its rail is off screen (a phone's facade
  // shows one block; ExplorerDialogs.jsx): the facade shows that block, then
  // focuses the rail, and says so (railFocused).
  const [railFocus, setRailFocus] = useState(null)
  const focusRail = useCallback(({ block, floor }) => setRailFocus({ block, floor }), [])
  const railFocused = useCallback(() => setRailFocus(null), [])

  const value = useMemo(
    () => ({ ...state, model, snapshot, project, dated, openFloor, openUnit, closeStage, setFloor, setBlock, railFocus, railFocused }),
    [state, model, snapshot, project, dated, openFloor, openUnit, closeStage, setFloor, setBlock, railFocus, railFocused],
  )

  return (
    <ExplorerContext.Provider value={value}>
      {children}
      {surfaces && arrived ? (
        <surfaces.ExplorerDialogs
          project={project}
          dated={dated}
          model={model}
          state={state}
          opening={opening}
          setOpening={setOpening}
          unitOpener={unitOpener}
          openUnit={openUnit}
          closeStage={closeStage}
          setFloor={setFloor}
          setBlock={setBlock}
          focusRail={focusRail}
        />
      ) : null}
    </ExplorerContext.Provider>
  )
}
