// The redesign's single motion grammar (see plan "Design Direction").
export const EASE = [0.22, 1, 0.36, 1]

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const fadeUpChild = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

// `delayChildren` holds the whole run back before the first child moves —
// used by Home's hero to wait out the intro overlay (see utils/introGate.js)
// so the entrance is not spent behind an opaque panel.
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  initial: {},
  animate: { transition: { staggerChildren, delayChildren } },
})

export const viewportOnce = { once: true, amount: 0.3 }

export const hoverZoom = { scale: 1.04, transition: { duration: 0.8, ease: EASE } }
