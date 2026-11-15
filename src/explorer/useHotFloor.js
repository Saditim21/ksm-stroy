import { useCallback, useEffect, useRef, useState } from 'react'

// The facade's hot floor (spec §7.2), the state the facade, its rails, its
// edge panels and its sheet share (Facade.jsx): which floor is hot, what
// made it hot, and where it shows, and the floor the lens is on.
//
// - setHot(key, source) makes a floor hot, if `isFloor(key)`: `source` is
//   'mouse', 'kbd' or 'tap'; it shows in the caption in compact mode, else in
//   the sheet on a phone and in its block's edge panel from 901 px. The lens
//   moves to it.
// - clearHot() clears it at once; scheduleClose() after 320 ms, which
//   setHot, clearHot and cancelClose call off.
// - giveWay(): the sheet gives way as its floor opens, the floor staying hot.
// - Crossing 900 px moves between the panel and the sheet: the floor clears.
// The lens stays on the last hot floor, where it fades.

const CLOSE_MS = 320
const PHONE = '(max-width: 900px)'

/** Whether the screen is a phone's, where the facade shows one block and its sheet. */
export const isPhone = () => window.matchMedia?.(PHONE).matches === true

export default function useHotFloor({ compact, isFloor }) {
  // The hot floor: { key, source: 'mouse' | 'kbd' | 'tap', on: where it shows }.
  const [hot, setHotState] = useState(null)
  // The floor the lens is on: the last hot one, where it stays while it fades.
  const [lens, setLens] = useState(null)
  const closeTimer = useRef(0)

  const setHot = useCallback((key, source) => {
    clearTimeout(closeTimer.current)
    if (!isFloor(key)) return
    const on = compact ? 'caption' : isPhone() ? 'sheet' : 'panel'
    setHotState({ key, source, on })
    setLens(key)
  }, [compact, isFloor])

  const clearHot = useCallback(() => {
    clearTimeout(closeTimer.current)
    setHotState(null)
  }, [])

  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(clearHot, CLOSE_MS)
  }, [clearHot])

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current)
  }, [])

  const giveWay = useCallback(() => {
    setHotState((current) => (current?.on === 'sheet' ? { ...current, on: 'none' } : current))
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  useEffect(() => {
    const query = window.matchMedia?.(PHONE)
    if (!query?.addEventListener) return undefined
    query.addEventListener('change', clearHot)
    return () => query.removeEventListener('change', clearHot)
  }, [clearHot])

  return { hot, lens, setHot, clearHot, scheduleClose, cancelClose, giveWay }
}

// The page's latest press: a key's, or a pointer's and the element it landed
// on. A key without Ctrl, Alt or ⌘ makes the next focus the keyboard's, and a
// pointer's press, wherever it lands, a pointer's: the rule :focus-visible
// follows. It watches the whole page, because Tab reaches a rail from
// anywhere, and in the capture phase, so it is set before any handler moves
// the focus. (jsdom matches :focus-visible on every focus, so the tests could
// not tell the selector's two cases apart.)
export function useLastPress() {
  const last = useRef({ keyboard: true, target: null })
  useEffect(() => {
    const onKey = (event) => {
      if (!event.ctrlKey && !event.altKey && !event.metaKey) last.current = { keyboard: true, target: null }
    }
    const onPointer = (event) => {
      last.current = { keyboard: false, target: event.target }
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])
  return last
}
