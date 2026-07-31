import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({ value, duration = 1.2, className = '' }) {
  const ref = useRef(null)
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const inView = useInView(ref, { once: true, amount: 1 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce || !canObserve ? value : 0)

  useEffect(() => {
    if (!inView || reduce || !canObserve) { setDisplay(value); return }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduce, canObserve])

  return <span ref={ref} className={className}>{display}</span>
}
