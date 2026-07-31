import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({ value, duration = 1.2, className = '' }) {
  const ref = useRef(null)
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const inView = useInView(ref, { once: true, amount: 1 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce || !canObserve ? value : 0)

  useEffect(() => {
    if (reduce || !canObserve) { setDisplay(value); return }
    if (!inView) return
    let frame
    const start = performance.now()
    const tick = (now) => {
      const elapsed = Math.max(0, now - start)
      const t = Math.min(1, elapsed / (duration * 1000))
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduce, canObserve])

  return <span ref={ref} className={className}>{display}</span>
}
