import { useLayoutEffect, useRef } from 'react'
import { presetInquiry } from '../components/inquiry/inquiryStore'
import { findUnit, floorKey, stepUnit } from './model'
import PlanStage from './PlanStage'
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
//   Facade.jsx). An inquiry's close gives the focus to nothing: the inquiry
//   focuses the form's first field once its glide ends (spec §7.7).
// - An inquiry closes both dialogs in one replace (closeStage drops ?floor
//   and ?unit), then presets the form (presetInquiry), whose glide waits for
//   the first frame with no scroll lock held: after this close's commit.
//
// `state` is useExplorerState()'s; `opening` the stage's { fromRect, opener }
// (ruling F5), which setOpening(null) spends; `unitOpener` the element that
// opened the unit panel; openUnit, closeStage, setFloor, setBlock and
// focusRail the provider's (its setFloor and setBlock call off a unit still
// to open, ruling C8.2).

// Gives `element` the focus if it can take it: in the page, not inert, and
// focusable. Whether it did.
function focusInto(element) {
  if (!element?.isConnected || element.closest('[inert]')) return false
  element.focus({ preventScroll: true })
  return document.activeElement === element
}

const railOf = ({ block, floor }) => document.querySelector(`#explorer .fx__cnt[data-k="${floorKey(block, floor)}"]`)

// Gives the focus to a floor's rail, or has the facade show it first.
function focusRailOf(at, focusRail) {
  if (!focusInto(railOf(at))) focusRail(at)
}

export default function ExplorerDialogs({ model, state, opening, setOpening, unitOpener, openUnit, closeStage, setFloor, setBlock, focusRail }) {
  const { stage, unitId } = state
  const unit = findUnit(model, unitId)
  const showStage = Boolean(stage)
  const showUnit = Boolean(unit)
  const quiet = useRef(false)

  // What was on show: the dialogs, the stage's floor and the unit's.
  const shown = useRef({ stage: false, unit: false, at: null, unitAt: null })
  useLayoutEffect(() => {
    const was = shown.current
    shown.current = {
      stage: showStage,
      unit: showUnit,
      at: stage ?? was.at,
      unitAt: unit ? { block: unit.block, floor: unit.floor } : was.unitAt,
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
    presetInquiry({ option: 'golden-residence', pick: target.label })
  }

  return (
    <>
      {showStage ? (
        <PlanStage
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
