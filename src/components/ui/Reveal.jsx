import { motion, useReducedMotion } from 'framer-motion'
import { EASE, viewportOnce } from '../../utils/motion'

export default function Reveal({ as = 'div', delay = 0, className = '', children }) {
  const reduce = useReducedMotion()
  const M = motion[as] ?? motion.div
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}
