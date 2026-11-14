import { useSyncExternalStore } from 'react'
import useMediaQuery from './useMediaQuery'

const connection = () => (typeof navigator !== 'undefined' ? navigator.connection : undefined)
const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

// The answer of each store on the server and while hydrating: no motion, as
// in the prerendered HTML.
const serverSnapshot = () => false

// Whether matchMedia exists never changes while the page is open.
const subscribeNever = () => () => {}

// Data saver, where the browser exposes it (navigator.connection, Chromium).
function subscribeSaveData(onChange) {
  const conn = connection()
  if (!conn?.addEventListener) return () => {}
  conn.addEventListener('change', onChange)
  return () => conn.removeEventListener('change', onChange)
}
const saveDataOn = () => connection()?.saveData === true

// The gate every animation and Lenis wait behind, from golden-residence
// src/hooks/useMotionAllowed.js @944bb03, on useSyncExternalStore so that it
// hydrates (spec §6.2): false on the server and while hydrating, then the
// browser's answer.
//
// Motion runs only where the browser can be asked about reduced motion and the
// answer is no, and the connection is not in data-saver mode. Without
// matchMedia (jsdom, so every test by default) it stays off and the page renders
// static and complete.
//
// Reduced motion or a data-saver connection means no motion. It follows both
// settings while the page is open, so switching reduced motion on stops the
// motion without a reload.
export default function useMotionAllowed() {
  const canAsk = useSyncExternalStore(subscribeNever, hasMatchMedia, serverSnapshot)
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const saveData = useSyncExternalStore(subscribeSaveData, saveDataOn, serverSnapshot)
  return canAsk && !reduce && !saveData
}
