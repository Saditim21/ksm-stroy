import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import logo from '../../assets/images/logo.webp'
import { EASE } from '../../utils/motion'

const FLAG = 'ksm-intro-seen'

// Timeline (ms from mount) — a small state machine of timeouts, total 1900ms:
//   0     logo fades in + scales up (0.5s)
//   400   the gold rule begins its own 0.6s draw, its start overlapping the
//         tail of the logo's entrance so the two beats read as one gesture
//   1000  rule finishes drawing; a 0.2s hold lets the mark breathe
//   1200  the whole overlay lifts away over 0.7s, revealing the site
//   1900  session flag is set and the overlay unmounts
const RULE_DELAY = 0.4
const LIFT_DELAY_MS = 1200
const DONE_DELAY_MS = 1900

export default function IntroReveal() {
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)
  const [lifting, setLifting] = useState(false)

  // sessionStorage is synchronous and only ever written by this component's
  // own completion timer below, so reading it fresh each render (rather than
  // caching it in state) is both simpler and always correct.
  const hasFlag = typeof window !== 'undefined' && Boolean(sessionStorage.getItem(FLAG))
  const shouldPlay = !done && !hasFlag && !reduce

  useEffect(() => {
    if (!shouldPlay) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const liftTimer = setTimeout(() => setLifting(true), LIFT_DELAY_MS)
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem(FLAG, 'true')
      setDone(true)
    }, DONE_DELAY_MS)

    return () => {
      clearTimeout(liftTimer)
      clearTimeout(doneTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [shouldPlay])

  if (!shouldPlay) return null

  return (
    <motion.div
      data-intro-reveal
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-ink"
      initial={{ y: 0 }}
      animate={{ y: lifting ? '-100%' : 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <motion.img
        data-intro-logo
        src={logo}
        alt=""
        className="h-16 w-16 object-cover"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      <div className="flex h-[7px] w-48 items-center">
        <span data-tick className="h-[7px] w-px bg-gold-accent" />
        <motion.span
          data-rule
          className="h-px flex-1 origin-left bg-gold-accent"
          initial={{ scaleX: 0.5 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: RULE_DELAY }}
        />
        <span data-tick className="h-[7px] w-px bg-gold-accent" />
      </div>
    </motion.div>
  )
}
