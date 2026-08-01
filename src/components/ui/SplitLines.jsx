import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// Splits string children into words, each masked in an overflow-hidden span
// and risen into view on scroll. Non-string children (e.g. a pre-composed
// <em> accent) are rendered as-is — this component only knows how to split
// plain strings; composing mixed content is the caller's job (documented
// limitation, see Home's headline usage in a later task).
//
// The in-view trigger sits on the unclipped wrapper, NOT on the masked words:
// a word parked at y:110% is entirely outside its own overflow-hidden mask, so
// an IntersectionObserver attached to it reports ratio 0 forever. `whileInView`
// on the word therefore never fires in a real browser (jsdom's no-op observer
// hides this) and the headline stays invisible — measured on Home's hero.
export default function SplitLines({ as = 'span', className = '', delay = 0, stagger = 0.045, children }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const Tag = as

  if (typeof children !== 'string' || reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  const words = children.split(' ').filter(Boolean)

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : { y: '110%' }}
            transition={{ duration: 0.65, ease: EASE, delay: delay + i * stagger }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
