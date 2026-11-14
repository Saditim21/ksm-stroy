import { useLayoutEffect, useRef } from 'react'
import useMotionAllowed from '../../hooks/useMotionAllowed'
import { digitColumns } from '../../utils/rolling'

// A live count (plan Task 7, spec §5.4), from golden-residence
// src/components/ui/RollingNumber.jsx @944bb03.
//
// Until the count arrives (`null`) it is `—`, as wide as two tabular digits,
// which is what the prerendered HTML shows (spec §6.4). A number is one column
// per digit, each a 0–9 strip that index.css draws and places on its digit
// (--d), behind a one-digit window. That holds with or without motion, on the
// server and in the browser, so hydration never changes the markup. The page's
// text holds the real number only, in the sr-only span; the strips are drawn by
// CSS and hidden from assistive technology.
//
// The digits roll only when the value changes after mount, the first number
// after `—` included, and never under reduced motion or data saver. Each column
// whose digit changed rolls from the digit it showed (new columns from 0) over
// 1.2 s on the expo-out curve, 60 ms after the column to its left. The roll is
// a Web Animation started in the layout effect of the change, so it runs from
// the frame that shows the new value: nothing waits for the GSAP engine or
// an idle period, so the new digits never flash before rolling back. A finished
// or cancelled roll leaves the strip where index.css puts it, on the digit
// React rendered. A browser without Web Animations shows the new digits at once.
const ROLL_MS = 1200
const STAGGER_MS = 60
const EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)' // the expo-out token (tailwind.config.js)

const strips = (root) => [...root.querySelectorAll('.roll-strip')]
const cancelRolls = (strip) => strip.getAnimations?.().forEach((animation) => animation.cancel())

// Where a strip sits now, in percent of its height off its digit: part-way
// through a roll, where that roll has it; otherwise 0.
function offsetOf(strip) {
  const { transform } = getComputedStyle(strip)
  if (!transform || transform === 'none' || typeof DOMMatrixReadOnly === 'undefined') return 0
  const height = strip.offsetHeight
  return height ? (new DOMMatrixReadOnly(transform).m42 / height) * 100 : 0
}

export default function RollingNumber({ value, label, className = '' }) {
  const motionOk = useMotionAllowed()
  const ref = useRef(null)
  const shown = useRef(value)
  const digits = value == null ? null : digitColumns(value)

  useLayoutEffect(() => {
    const before = shown.current
    shown.current = value
    if (!motionOk || value == null || before === value) return
    const from = before == null ? [] : digitColumns(before)
    const to = digitColumns(value)
    // A new number of digits rebuilt the columns (their key holds the count).
    const rebuilt = from.length !== to.length
    strips(ref.current).forEach((strip, i) => {
      if (typeof strip.animate !== 'function') return
      const step = (to[i] - (rebuilt ? 0 : from[i])) * 10
      if (step === 0) return
      // A column caught mid-roll carries on from where it is.
      const start = (rebuilt ? 0 : offsetOf(strip)) + step
      cancelRolls(strip)
      strip.animate(
        [{ transform: `translateY(${start}%)` }, { transform: 'translateY(0)' }],
        { duration: ROLL_MS, delay: i * STAGGER_MS, easing: EXPO_OUT, fill: 'backwards' },
      )
    })
  }, [value, motionOk])

  // Reduced motion switched on, or the number leaving: no roll outlives it.
  useLayoutEffect(() => {
    if (!motionOk) return undefined
    const root = ref.current
    return () => strips(root).forEach(cancelRolls)
  }, [motionOk])

  return (
    <span ref={ref} className={`nums inline-flex items-baseline gap-x-[0.3em] ${className}`.trim()}>
      {digits === null ? (
        <span data-placeholder className="inline-block h-[1em] min-w-[2ch] text-center leading-none">—</span>
      ) : (
        <>
          <span className="sr-only">{value}</span>
          {/* items-start: a column stretched to this one-digit window would be
              one digit tall, and its tenths would move it by tenths of a digit. */}
          <span aria-hidden="true" className="inline-flex h-[1em] items-start overflow-hidden leading-none">
            {digits.map((digit, i) => (
              <span key={`${digits.length}-${i}`} data-digit={digit} className="roll-col" style={{ '--d': digit }}>
                <span className="roll-strip" />
              </span>
            ))}
          </span>
        </>
      )}
      {label ? (
        <>
          {' '}
          <span className="font-text text-small">{label}</span>
        </>
      ) : null}
    </span>
  )
}
