import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import logo from '../../assets/images/logo.webp'
import { EASE } from '../../utils/motion'
import {
  INTRO_LIFT_DELAY_MS,
  INTRO_LIFT_DURATION_MS,
  INTRO_DONE_DELAY_MS,
  markIntroStart,
  markIntroEnd,
} from '../../utils/introGate'

const FLAG = 'ksm-intro-seen'

// Timeline (ms from mount) — a small state machine of timeouts, total 1900ms:
//   0     logo fades in + scales up (0.5s)
//   400   the gold rule begins its own 0.6s draw, its start overlapping the
//         tail of the logo's entrance so the two beats read as one gesture
//   1000  rule finishes drawing; a 0.2s hold lets the mark breathe
//   1200  the whole overlay lifts away over 0.7s, revealing the site
//   1900  session flag is set and the overlay unmounts
//
// The two lift numbers live in utils/introGate.js, which is also where the page
// underneath reads its entrance cue from — one source of truth, so the hero's
// handoff can't drift away from the lift it is timed against.
const RULE_DELAY = 0.4
const LIFT_DELAY_MS = INTRO_LIFT_DELAY_MS
const DONE_DELAY_MS = INTRO_DONE_DELAY_MS

export default function IntroReveal() {
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)
  const [lifting, setLifting] = useState(false)

  // sessionStorage is synchronous and only ever written by this component's
  // own completion timer below, so reading it fresh each render (rather than
  // caching it in state) is both simpler and always correct.
  const hasFlag = typeof window !== 'undefined' && Boolean(sessionStorage.getItem(FLAG))
  const shouldPlay = !done && !hasFlag && !reduce

  // Publish the countdown so the page mounting underneath (Home's hero) can
  // hold its entrance until this overlay is on its way out, instead of playing
  // the whole reveal behind an opaque panel. Deliberately in the render phase
  // rather than in the effect below: a page rendering in the same commit as
  // this one would otherwise read the gate before the effect had opened it.
  // markIntroStart is idempotent, so the repeat calls cost nothing.
  if (shouldPlay) markIntroStart()

  useEffect(() => {
    if (!shouldPlay) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const liftTimer = setTimeout(() => setLifting(true), LIFT_DELAY_MS)
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem(FLAG, 'true')
      markIntroEnd()
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
      transition={{ duration: INTRO_LIFT_DURATION_MS / 1000, ease: EASE }}
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
