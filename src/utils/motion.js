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

export const stagger = (staggerChildren = 0.08) => ({
  initial: {},
  animate: { transition: { staggerChildren } },
})

export const viewportOnce = { once: true, amount: 0.3 }

export const hoverZoom = { scale: 1.04, transition: { duration: 0.8, ease: EASE } }
