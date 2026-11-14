import { useRef } from 'react'
import useMotion from '../../motion/useMotion'
import { EASE_IN_OUT } from '../../utils/motion'

// The dimension line, размерна линия (spec §3.3): a hairline with 7 px end
// ticks and the measured value centred on it, in KSM Text at label size with
// tabular figures. It appears only where the measurement is the subject: a
// unit's areas, „500 м до метростанция", the company's 2008 – 2026. `label`,
// when given, names the measurement ahead of the line (the unit panel's
// „Застроена"). The line takes the width its container gives it. Rows of lines
// align their labels in a grid: the container `grid grid-cols-[max-content_1fr]`,
// each line `col-span-2 grid grid-cols-subgrid`.
//
// The ticks and the hairline are brass, Diptych's line (spec §2.1). The value
// takes the text colour of its ground, the label is stone.
//
// Static unless `draw`. With `draw`, where motion is allowed, the two halves
// grow out of the value toward the ticks, once, when the line comes into view
// (useMotion, spec §5.1). A line already on screen when the motion engine
// arrives has been seen whole, so it stays as it is: the first viewport never
// animates from JS (§5.2.2).
const STROKE = 'bg-brass'

function Line({ ref, value, label, className = '' }) {
  return (
    <div ref={ref} className={`flex items-center gap-4 font-text ${className}`.trim()}>
      {label ? <span className="shrink-0 text-label text-stone">{label}</span> : null}
      <span className="flex min-w-0 flex-1 items-center">
        <span data-tick aria-hidden="true" className={`h-[7px] w-px shrink-0 ${STROKE}`} />
        <span data-rule aria-hidden="true" className={`h-px min-w-3 flex-1 origin-right ${STROKE}`} />
        <span className="nums shrink-0 whitespace-nowrap px-2.5 text-label">{value}</span>
        <span data-rule aria-hidden="true" className={`h-px min-w-3 flex-1 origin-left ${STROKE}`} />
        <span data-tick aria-hidden="true" className={`h-[7px] w-px shrink-0 ${STROKE}`} />
      </span>
    </div>
  )
}

function DrawnLine(props) {
  const ref = useRef(null)
  useMotion(ref, ({ gsap }) => {
    const line = ref.current
    if (line.getBoundingClientRect().top < window.innerHeight) return
    gsap.from([...line.querySelectorAll('[data-rule]')], {
      scaleX: 0,
      duration: 1.1,
      ease: EASE_IN_OUT,
      scrollTrigger: { trigger: line, start: 'top 85%', once: true },
    })
  })
  return <Line ref={ref} {...props} />
}

export default function DimensionLine({ draw = false, ...props }) {
  return draw ? <DrawnLine {...props} /> : <Line {...props} />
}
