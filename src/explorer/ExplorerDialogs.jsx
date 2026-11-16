import { useLayoutEffect, useRef } from 'react'
import { presetInquiry } from '../components/inquiry/inquiryStore'
import { getLenis } from '../utils/lenis'
import { findUnit, floorKey } from './model'
import { plansOf } from './plans'
import PlanStage from './PlanStage'
import { stepUnit } from './surfaceModel'
import UnitPanel from './UnitPanel'

// The explorer's two dialogs, the plan stage and the unit panel, as the
// address opens them (spec §7.6, §7.7, §7.10), for ExplorerProvider
// (ExplorerContext.jsx): in the surfaces' chunk, since only an opened floor
// needs them (ruling C7.7). Mounted once the page has arrived, it stays, so
// it sees each dialog go.
//
// - The stage shows while ?floor names a floor; the unit panel while ?unit
//   names a unit the model has (an unknown unit opens its floor only). The
//   stage under the panel is covered: inert and hidden.
// - The focus once a dialog has gone: the unit panel's to the element that
//   opened it, else into the stage under it, else (a panel the address or a
//   block's square opened alone, ruling C8.1) to its unit's floor's rail; the
//   stage's to its opener, else (a deep link, or an opener gone inert, such
//   as the sheet's button) to its floor's rail. A rail off screen, of the
//   block a phone's facade does not show, takes no focus: the facade shows
//   that block first, then focuses it (focusRail, the provider's;
//   Facade.jsx). While the list is on show, the facade's panel is hidden,
//   its rails and block switch with it (ExplorerSection.jsx): the unit's row
//   in the list takes the focus then, its table scrolled to it and the page
//   to it where it is still off the screen (showRow), else (a stage's floor,
//   or a row the filters leave out) the selected tab. An
//   inquiry's close gives the focus to nothing: the inquiry focuses the
//   form's first field once its glide ends (spec §7.7).
// - An inquiry closes both dialogs in one replace (closeStage drops ?floor
//   and ?unit), then presets the form (presetInquiry) with the project's
//   option and the unit as a pick of the project's (M3 §8), whose glide
//   waits for the first frame with no scroll lock held: after this close's
//   commit.
//
// `state` is useExplorerState()'s; `opening` the stage's { fromRect, opener }
// (ruling F5), which setOpening(null) spends; `unitOpener` the element that
// opened the unit panel; openUnit, closeStage, setFloor, setBlock and
// focusRail the provider's (its setFloor and setBlock call off a unit still
// to open, ruling C8.2); `project` and `dated` the provider's too, the
// project's plans having loaded with this chunk (loadSurfaces.js).

// Gives `element` the focus if it can take it: in the page, neither inert nor
// hidden, and focusable. Whether it did. (No browser focuses an element under
// [hidden]; jsdom would, so the check is spelled out.)
function focusInto(element) {
  if (!element?.isConnected || element.closest('[inert], [hidden]')) return false
  element.focus({ preventScroll: true })
  return document.activeElement === element
}

const railOf = ({ block, floor }) => document.querySelector(`#explorer .fx__cnt[data-k="${floorKey(block, floor)}"]`)
// A unit's row in the list (UnitList.jsx): the row whose first cell reads its
// label.
const rowOf = (label) => [...document.querySelectorAll('#explorer .lv tr.row')].find((row) => row.querySelector('.uid')?.textContent === label)
const selectedTab = () => document.querySelector('#explorer [role="tab"][aria-selected="true"]')

// Brings a row into view: first in the list's table, which scrolls in a box
// of its own under a sticky head (explorer.css), the row just under the
// head; then, if the row is still off the screen (on a phone, or one of the
// table's last rows), the page, by the least that shows the row and its
// ring, which lies inside it (ruling T8b). At once, with no glide, and
// through Lenis where it runs: Lenis, stopped by the dialog's lock until the
// passive effects, takes the scroll forced and keeps it (as jumpToId does,
// src/utils/scroll.js). The page moves for no other focus given back: each
// keeps it still (focusInto's preventScroll).
function showRow(row) {
  const box = row.closest('.lv__table')
  if (box) {
    const head = box.querySelector('thead')?.getBoundingClientRect().height ?? 0
    const view = box.getBoundingClientRect()
    const at = row.getBoundingClientRect()
    if (at.top < view.top + head || at.bottom > view.bottom) box.scrollTop += at.top - view.top - head
  }
  // The fixed bar covers the top of the screen (scroll-padding-top,
  // src/index.css).
  const bar = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const { top, bottom } = row.getBoundingClientRect()
  const by = bottom > window.innerHeight ? Math.ceil(bottom - window.innerHeight) : top < bar ? Math.floor(top - bar) : 0
  if (!by) return
  const y = window.scrollY + by
  window.scrollTo(0, y)
  const lenis = getLenis()
  if (!lenis) return
  lenis.dimensions?.resize()
  lenis.scrollTo(y, { immediate: true, force: true })
}

// Gives the focus to a floor's rail, or has the facade show it first. A rail
// under [hidden] is in the facade's panel while the list is on show: the
// focus goes to the unit's row then (`at.label`, a unit panel's), brought
// into the table's view, else to the selected tab, and the facade is not
// asked.
function focusRailOf(at, focusRail) {
  const rail = railOf(at)
  if (focusInto(rail)) return
  if (!rail?.closest('[hidden]')) {
    focusRail(at)
    return
  }
  const row = at.label ? rowOf(at.label) : null
  if (focusInto(row)) showRow(row)
  else focusInto(selectedTab())
}

export default function ExplorerDialogs({ project, dated, model, state, opening, setOpening, unitOpener, openUnit, closeStage, setFloor, setBlock, focusRail }) {
  const plans = plansOf(project)
  const { stage, unitId } = state
  const unit = findUnit(model, unitId)
  const showStage = Boolean(stage)
  const showUnit = Boolean(unit)
  const quiet = useRef(false)

  // What was on show: the dialogs, the stage's floor, and the unit's floor
  // with its label.
  const shown = useRef({ stage: false, unit: false, at: null, unitAt: null })
  useLayoutEffect(() => {
    const was = shown.current
    shown.current = {
      stage: showStage,
      unit: showUnit,
      at: stage ?? was.at,
      unitAt: unit ? { block: unit.block, floor: unit.floor, label: unit.label } : was.unitAt,
    }
    // An inquiry's close: the focus goes nowhere, and the opening goes with
    // the dialogs, so a stage the address opens later has none (ruling C8.3).
    if (quiet.current) {
      if (!showStage && !showUnit) {
        quiet.current = false
        setOpening(null)
        unitOpener.current = null
      }
      return
    }
    if (was.unit && !showUnit && !focusInto(unitOpener.current)) {
      if (showStage) focusInto(document.querySelector('.ps__close'))
      else if (was.unitAt) focusRailOf(was.unitAt, focusRail)
    }
    if (was.unit && !showUnit) unitOpener.current = null
    if (was.stage && !showStage) {
      if (!focusInto(opening?.opener) && was.at) focusRailOf(was.at, focusRail)
      setOpening(null)
    }
  }, [showStage, showUnit, stage, unit, opening, setOpening, unitOpener, focusRail])

  const inquire = (target) => {
    quiet.current = true
    closeStage()
    presetInquiry({ option: project.option, pick: { project: project.id, label: target.label } })
  }

  return (
    <>
      {showStage ? (
        <PlanStage
          project={project}
          plans={plans}
          dated={dated}
          model={model}
          block={stage.block}
          floor={stage.floor}
          fromRect={opening?.fromRect ?? null}
          covered={showUnit}
          onClose={closeStage}
          onFloor={setFloor}
          onBlock={setBlock}
          onUnit={openUnit}
        />
      ) : null}
      {showUnit ? (
        <UnitPanel
          plans={plans}
          dated={dated}
          model={model}
          unitId={unitId}
          onClose={state.closeUnit}
          onStep={(delta) => state.openUnit(stepUnit(model, unit, delta).label)}
          onInquire={inquire}
        />
      ) : null}
    </>
  )
}
