import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// The redesign's signature: an architect's dimension line under a small
// uppercase eyebrow. Draws itself left-to-right when scrolled into view.
export default function DimensionLine({ label, dark = false, className = '' }) {
  const reduce = useReducedMotion()
  const tickColor = 'bg-gold-accent'
  return (
    <div className={`mb-4 ${className}`}>
      <div className={`text-xs font-semibold uppercase tracking-eyebrow ${dark ? 'text-plaster/70' : 'text-graphite'}`}>
        {label}
      </div>
      <div className="mt-2 flex h-[7px] w-24 items-center" aria-hidden="true">
        <span data-tick className={`h-[7px] w-px ${tickColor}`} />
        <motion.span
          data-rule
          className="h-px flex-1 origin-left bg-gold-accent"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        <span data-tick className={`h-[7px] w-px ${tickColor}`} />
      </div>
    </div>
  )
}
