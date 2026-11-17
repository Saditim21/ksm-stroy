import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'

// #cennosti, the values (spec M3/M4 §7.4; the concept's za-nas.html:190-205):
// a hinge, production's „Какво ни прави *различни*“ with its lead
// (About.jsx:577-582), then its three values (:74-105) as ruled rows read
// across the seam, each word ending at the seam and its sentence starting
// after it. The legacy icons and gradient boxes are dropped. The words are
// smaller than the section's h2 (spec §4.1, about.css).
//
// The headings rise line by line, the copy fades up and the seams draw as
// they come into view (useReveals); the markup is the final state.

const VALUES = [
  ['Качество', 'Използваме най-добрите материали и\u00a0най-новите технологии за постигане на изключително качество във всеки проект.'],
  ['Точност', 'Спазваме стриктно договорените срокове и\u00a0бюджети, осигурявайки пълна прозрачност в\u00a0работния процес.'],
  ['Иновации', 'Прилагаме най-съвременните строителни технологии и\u00a0методи за постигане на отлични резултати.'],
]

export default function Values() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec values" id="cennosti" aria-labelledby="values-h">
      <div className="hinge">
        <h2 className="h2" id="values-h" data-split="">
          Какво ни прави <em>различни</em>
        </h2>
        <p className="lead" data-fade="">
          Три принципа, които ръководят всеки наш проект и&nbsp;гарантират изключителните&nbsp;резултати.
        </p>
        <Seam draw />
      </div>
      <div className="ledger">
        <Seam draw />
        <ul className="ledger__rows">
          {VALUES.map(([value, line]) => (
            <li key={value} className="ledger__row">
              <h3 className="ledger__k" data-split="">
                {value}
              </h3>
              <p className="ledger__d" data-fade="">
                {line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
