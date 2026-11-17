import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'

// #uslugi, what | why (spec M3/M4 §7.4; the concept's za-nas.html:207-229):
// production's four services (About.jsx:657-719), on onyx, face its five
// reasons (:726-756), on umber, each after a brass dash. The section keeps
// production's „Нашите услуги“ as its name for screen readers; the system
// shows no eyebrow.
//
// The headings rise line by line, the items fade up and the seam draws as
// they come into view (useReveals); the markup is the final state.

const SERVICES = [
  ['Жилищно строителство', 'Домове, в\u00a0които комфортът и\u00a0качеството вървят ръка за ръка.'],
  ['Обществени и\u00a0административни сгради', 'Модерни, функционални и\u00a0устойчиви решения.'],
  ['Ремонти и\u00a0реконструкции', 'Обновяване и\u00a0модернизация на съществуващи сгради.'],
  ['Проектиране и\u00a0консултации', 'Съдействие от първата идея до последния детайл.'],
]

const REASONS = [
  'Опитен и\u00a0квалифициран екип',
  'Съвременни материали и\u00a0технологии',
  'Стриктно спазване на срокове и\u00a0бюджет',
  'Индивидуален подход към всеки проект',
  'Дългосрочно доверие и\u00a0надеждно партньорство',
]

export default function Offer() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="offer" id="uslugi" aria-label="Нашите услуги">
      <Seam draw />
      <div className="offer__l">
        <h2 className="h2" id="offer-h" data-split="">
          Какво <em>предлагаме</em>?
        </h2>
        <ul className="offer__list" aria-labelledby="offer-h">
          {SERVICES.map(([service, line]) => (
            <li key={service} data-fade="">
              <h3 className="offer__t">{service}</h3>
              <p>{line}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="offer__r">
        <h3 className="h3" id="why-h" data-split="">
          Защо да <em>изберете</em> КСМ&nbsp;Строй&nbsp;ООД?
        </h3>
        <ul className="why" aria-labelledby="why-h">
          {REASONS.map((reason) => (
            <li key={reason} data-fade="">
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
