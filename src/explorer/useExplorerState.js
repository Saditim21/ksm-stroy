import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import useHydrated from '../hooks/useHydrated'
import { formatFloorParam, parseFloorParam } from './floorParam'

// The explorer's state in the address (spec §7.10): ?floor opens the plan
// stage, ?unit the unit panel, ?view=list the list. The address is the one
// source: `stage` and `unitId` are read from it alone, never kept beside it,
// so a dialog closes in the same commit as its parameter goes.
//
// - All three are read once the page has hydrated (useHydrated): the
//   prerendered HTML was built without a query, and the first client render
//   must reproduce it.
// - Every change is one navigation that replaces the entry and keeps the
//   scroll where it is ({ replace: true, preventScrollReset: true }): the
//   explorer never adds to the history, and the router never scrolls for it.
// - `routeBlock` is the block route's letter, or null on the Golden
//   Residence page: a block route writes its own floors bare („5“), and the
//   Golden Residence page always writes the letter („А-5“) (floorParam.js).
// - Changing the floor or the block drops ?unit, as closing the stage drops
//   both.
//
// stage: { block, floor } | null; unitId: the ?unit label as written, or
// null (the provider looks it up, ExplorerContext.jsx); view: 'visual' |
// 'list'.
export default function useExplorerState({ routeBlock = null }) {
  const hydrated = useHydrated()
  const [params, setParams] = useSearchParams()
  const floorValue = hydrated ? params.get('floor') : null
  const unitValue = hydrated ? params.get('unit') : null
  const viewValue = hydrated ? params.get('view') : null

  const stage = useMemo(() => parseFloorParam(floorValue, routeBlock), [floorValue, routeBlock])
  const unitId = unitValue?.trim() || null
  const view = viewValue === 'list' ? 'list' : 'visual'

  // One replace for every change: each parameter given is set, or deleted
  // for null.
  const write = useCallback((changes) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      for (const [name, value] of Object.entries(changes)) {
        if (value == null) next.delete(name)
        else next.set(name, value)
      }
      return next
    }, { replace: true, preventScrollReset: true })
  }, [setParams])

  const floorParam = useCallback((block, floor) => formatFloorParam({ block, floor }, routeBlock), [routeBlock])

  const openFloor = useCallback((block, floor, unit) => write({ floor: floorParam(block, floor), unit: unit ?? null }), [write, floorParam])
  const closeStage = useCallback(() => write({ floor: null, unit: null }), [write])
  const setFloor = useCallback((floor) => {
    if (stage) write({ floor: floorParam(stage.block, floor), unit: null })
  }, [write, floorParam, stage])
  const setBlock = useCallback((block) => {
    if (stage) write({ floor: floorParam(block, stage.floor), unit: null })
  }, [write, floorParam, stage])
  const openUnit = useCallback((unit) => write({ unit }), [write])
  const closeUnit = useCallback(() => write({ unit: null }), [write])
  const setView = useCallback((next) => write({ view: next === 'list' ? 'list' : null }), [write])

  return useMemo(
    () => ({ stage, unitId, view, openFloor, closeStage, setFloor, setBlock, openUnit, closeUnit, setView }),
    [stage, unitId, view, openFloor, closeStage, setFloor, setBlock, openUnit, closeUnit, setView],
  )
}
