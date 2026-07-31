import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({ value, duration = 1.2, className = '' }) {
  const ref = useRef(null)
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const inView = useInView(ref, { once: true, amount: 1 })
  const reduce = useReducedMotion()
  const initial = reduce || !canObserve ? value : 0
  const [display, setDisplay] = useState(initial)
  // Tracks the currently displayed number across re-renders so that a later
  // `value` change (e.g. fallback total swapped for live data) eases from
  // wherever the count currently sits instead of restarting the animation
  // from 0 (see Task 5 review finding: hero counter visibly rewinding).
  const displayRef = useRef(initial)

  useEffect(() => {
    if (reduce || !canObserve) {
      displayRef.current = value
      setDisplay(value)
      return
    }
    if (!inView) return
    let frame
    const from = displayRef.current
    const start = performance.now()
    const tick = (now) => {
      const elapsed = Math.max(0, now - start)
      const t = Math.min(1, elapsed / (duration * 1000))
      const next = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)))
      displayRef.current = next
      setDisplay(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduce, canObserve])

  return <span ref={ref} className={className}>{display}</span>
}
