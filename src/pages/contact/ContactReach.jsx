import Button from '../../components/ui/Button'
import Seam from '../../components/ui/Seam'
import { SITE, hoursLong } from '../../config/site'
import { toForm } from './prefill'

// Контакти's opening, #top (spec M3/M4 §7.3; the concept's kontakti.html:84-111):
// the question | the answer, on the seam.
// - Left, on onyx, the question: production's heading made the visible H1,
//   „Как можете да се *свържете* с нас“, in three lines that end at the seam,
//   each in a mask of its own, authored by hand (spec §4.2: never split by
//   script above the fold), with production's intro under it.
// - Right, on umber (the menu's ground for the same details), the answer:
//   both phones, the hours in their long form from the one hours source
//   (src/config/site.js), the email, and „Изпратете запитване“, which glides
//   to the form and gives „Име“ the focus (toForm). There is no live open or
//   closed line (spec §2).
//
// The entrance is contact.css's, all CSS from the first paint: the seam
// draws down, the lines rise from their masks, the answer follows down the
// seam.

// One line of the H1: its mask, and the line that rises inside it.
function Line({ n, children }) {
  return (
    <span className={`line-mask reach__ln reach__ln--${n}`}>
      <span className="split-line">{children}</span>
    </span>
  )
}

export default function ContactReach() {
  return (
    <section className="reach" id="top" aria-labelledby="reach-h">
      <Seam />
      <div className="reach__q">
        <h1 className="reach__h1" id="reach-h">
          <Line n={0}>Как можете</Line>{' '}
          <Line n={1}>
            да се <em>свържете</em>
          </Line>{' '}
          <Line n={2}>с&nbsp;нас</Line>
        </h1>
        <p className="lead reach__lead">
          Нашият екип е&nbsp;на ваше разположение за консултации, оферти и&nbsp;отговори на всички ваши въпроси.
        </p>
      </div>
      <div className="reach__a">
        <div className="reach__g">
          <h2 className="reach__k">Телефон</h2>
          {SITE.phones.map(({ label, tel }) => (
            <a key={tel} className="reach__tel tab" href={`tel:${tel}`}>
              {label}
            </a>
          ))}
        </div>
        <div className="reach__g">
          <h2 className="reach__k">Работно време</h2>
          <dl className="reach__hours">
            {hoursLong().map(({ day, time }) => (
              <div key={day}>
                <dt>{day}</dt>
                <dd className="tab">{time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="reach__g">
          <h2 className="reach__k">Имейл</h2>
          <a className="reach__mail" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
        <div className="reach__go">
          <Button href="#zapitvane" variant="link" arrow onClick={toForm}>
            Изпратете запитване
          </Button>
        </div>
      </div>
    </section>
  )
}
