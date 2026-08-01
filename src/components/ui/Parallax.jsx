import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Scroll-linked drift: the inner layer moves +-strength px as its host section
// crosses the viewport. Oversized (scale-110) so the drift never exposes the
// outer overflow-hidden edges. Reduced motion: static passthrough, no scroll
// tracking, no scale.
export default function Parallax({ strength = 40, className = '', children }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength])

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`.trim()}>
      <motion.div style={{ y }} className="scale-110">
        {children}
      </motion.div>
    </div>
  )
}
