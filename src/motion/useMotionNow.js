import { useCallback } from 'react'
import useMotionAllowed from '../hooks/useMotionAllowed'
import { getMotion } from './runtime'

// For motion that follows an action rather than the page's load (spec §5.7):
// a panel that opens, a view that switches, a sheet. The function this
// returns gives the motion engine at the moment of the action, if motion is
// allowed and the engine has loaded (SmoothScroll starts loading it once the
// page has); otherwise null, and the component makes its change at once.
// React renders the final state either way; GSAP only animates towards it.
/** @returns {() => import('./runtime').Motion | null} */
export default function useMotionNow() {
  const allowed = useMotionAllowed()
  return useCallback(() => (allowed ? getMotion() : null), [allowed])
}
