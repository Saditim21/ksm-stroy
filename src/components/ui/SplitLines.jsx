import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// Splits string children into words, each masked in an overflow-hidden span
// and risen into view on scroll. Non-string children (e.g. a pre-composed
// <em> accent) are rendered as-is — this component only knows how to split
// plain strings; composing mixed content is the caller's job (documented
// limitation, see Home's headline usage in a later task).
export default function SplitLines({ as = 'span', className = '', delay = 0, stagger = 0.045, children }) {
  const reduce = useReducedMotion()
  const Tag = as

  if (typeof children !== 'string' || reduce) {
    return <Tag className={className}>{children}</Tag>
  }

  const words = children.split(' ').filter(Boolean)

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.65, ease: EASE, delay: delay + i * stagger }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
