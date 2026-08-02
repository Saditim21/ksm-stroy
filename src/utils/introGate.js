// The handoff between the branded intro overlay (IntroReveal) and the first
// page's own entrance animation.
//
// The problem this solves: on a first visit the overlay covers the whole
// viewport for its first beat, while Home mounts underneath it and immediately
// plays its hero reveal — the word-rise, the stagger, the dimension line. By
// the time the overlay lifts, all of it has already settled, so the visitor's
// very first impression is a static headline. The centerpiece is spent behind
// a curtain.
//
// The fix: whoever animates on first paint asks this module how much of the
// intro is still to come and adds that as a delay offset. IntroReveal registers
// the moment it starts (and retracts on unmount, i.e. once there is nothing
// left to wait for); everything else just reads `getIntroDelayMs()` once, at
// mount.
//
// This lives in utils/ rather than beside IntroReveal because a named
// non-component export in a component module is exactly what
// `react-refresh/only-export-components` flags. Owning the timeline constants
// here also keeps IntroReveal's timeouts and the handoff cue from drifting
// apart — IntroReveal imports them back.

// IntroReveal's timeline, in ms from its mount:
//   0                     logo fades in, gold rule draws
//   LIFT_DELAY            the overlay starts lifting upward
//   LIFT_DELAY+LIFT_DUR   the overlay is clear; session flag set, unmount
export const INTRO_LIFT_DELAY_MS = 1200
export const INTRO_LIFT_DURATION_MS = 700
export const INTRO_DONE_DELAY_MS = INTRO_LIFT_DELAY_MS + INTRO_LIFT_DURATION_MS

// When the page below should take over. The overlay lifts *upward*, so the
// bottom of the viewport — where Home parks its headline block — is the first
// thing uncovered, roughly a third of the way into the lift. Cueing the hero
// at 250ms into the lift starts the word-rise just as that band comes out from
// under the overlay: the lift reads as pulling the words up with it, and they
// are still mid-rise when the overlay clears at INTRO_DONE_DELAY_MS.
export const INTRO_HANDOFF_MS = INTRO_LIFT_DELAY_MS + 250

// null means "no intro is running": the session flag was already set, reduced
// motion is on, this is a test/prerender pass, or the intro has finished. In
// every one of those cases there is nothing to wait for and the delay is 0.
let startedAt = null

// Idempotent on purpose. IntroReveal calls this from its RENDER phase, not an
// effect, so the countdown is already published by the time anything mounting
// in the same commit reads it — an effect would run after the page below had
// already picked its delay. (Today Home arrives in a later commit because it
// is lazy-loaded, but the gate must not quietly depend on that.) Being
// idempotent makes the repeat calls from re-renders and StrictMode's
// double-invoke free of side effects.
export function markIntroStart(now = Date.now()) {
  if (startedAt === null) startedAt = now
}

// Called when the sequence genuinely completes. Not called from effect cleanup:
// StrictMode's mount/unmount/mount would clear a start that the (render-phase)
// re-publish no longer restores. An abandoned intro needs no cleanup anyway —
// the countdown below reaches 0 by INTRO_HANDOFF_MS on its own. Tests use it as
// the reset seam between renders.
export function markIntroEnd() {
  startedAt = null
}

// Remaining ms until the page below should begin its entrance. Read this ONCE
// per mount (a useState initializer) — it is a countdown, not a constant, so a
// value re-read on a later render would keep sliding toward 0.
export function getIntroDelayMs(now = Date.now()) {
  if (startedAt === null) return 0
  return Math.max(0, INTRO_HANDOFF_MS - (now - startedAt))
}
