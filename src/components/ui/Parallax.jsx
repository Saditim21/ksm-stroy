import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// Scroll-linked drift: the inner layer moves +-strength px as its host section
// crosses the viewport. Oversized 10% so the drift never exposes the outer
// overflow-hidden edges. Reduced motion: static passthrough, no scroll
// tracking, no scale.
//
// The oversize has to be part of the motion style, not a `scale-110` utility:
// framer writes an inline `transform` for `y`, and an inline transform replaces
// the class's transform outright — measured 30px of page background showing at
// the drift extremes while the class was still on the element.
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
      <motion.div style={{ y, scale: 1.1 }} data-parallax-layer>
        {children}
      </motion.div>
    </div>
  )
}
