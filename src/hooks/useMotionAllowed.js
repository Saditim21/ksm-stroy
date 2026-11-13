import { useEffect, useState } from 'react'
import useMediaQuery from './useMediaQuery'

const connection = () => (typeof navigator !== 'undefined' ? navigator.connection : undefined)
const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

// The gate every animation and Lenis wait behind, from golden-residence
// src/hooks/useMotionAllowed.js @944bb03.
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
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [saveData, setSaveData] = useState(() => connection()?.saveData === true)
  useEffect(() => {
    const conn = connection()
    if (!conn?.addEventListener) return undefined
    const update = () => setSaveData(conn.saveData === true)
    // A setting that changed between the first render and this effect.
    update()
    conn.addEventListener('change', update)
    return () => conn.removeEventListener('change', update)
  }, [])
  return hasMatchMedia() && !reduce && !saveData
}
