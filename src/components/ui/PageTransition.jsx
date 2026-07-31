import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// One transition for every route: a plain cross-fade — no slide, no scale — so
// the persistent Navbar/Footer never appear to shift while a page swaps.
// AnimatePresence (mode="wait") in App.jsx plays the exit before the next page
// mounts, which is why the out leg is shorter than the in leg.
const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
}

// `as` lets a page hand over its own root tag (<main>, <div>) instead of gaining
// an extra wrapper element. motion's proxy caches motion.main / motion.div, so
// the component identity stays stable across renders.
export default function PageTransition({ as = 'div', className, children, ...rest }) {
  const reduce = useReducedMotion()

  if (reduce) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }

  const Motion = motion[as]
  return (
    <Motion variants={variants} initial="initial" animate="animate" exit="exit" className={className} {...rest}>
      {children}
    </Motion>
  )
}
