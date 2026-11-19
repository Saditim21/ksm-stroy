import { useRef } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'
import { STORY } from './photos'

// How it began, #istoriya (polish spec §4): „Семейство *строители*“ on the
// seam, and beside it the legacy page's founding sentence (About.jsx:422-423,
// the contract's „основана през месец септември 2008“, tests/contracts/site.jsx),
// its motto paragraph and its team sentence, in production's words; the
// legacy figures in one line. The brothers' names are part of the story, not
// its headline. Under it, three photographs, from a dig to a finished
// building, each named.

const FIGURES = [
  ['15+', 'години опит'],
  ['200+', 'завършени проекта'],
  ['50+', 'доволни клиенти'],
]

export default function Origin() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="og" id="istoriya" aria-labelledby="og-h">
      <div className="hinge og__hinge">
        <h2 className="h2" id="og-h" data-split="">
          Семейство <em>строители</em>
        </h2>
        <div className="og__t">
          <p className="og__lead" data-fade="">
            КСМ СТРОЙ ООД е&nbsp;основана през месец септември 2008&nbsp;г. от двама братя Кадри и&nbsp;Сухат, синове на известен в&nbsp;родното им село Буково строител зидар (дюлгерин).
          </p>
          <p data-fade="">
            Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност, бързина и&nbsp;точност под мотото „Добрата работа – реклама за майстора“.
          </p>
          <p data-fade="">
            Ние сме екип млади специалисти и&nbsp;майстори, дипломирани технически ръководители с&nbsp;богат опит в&nbsp;строителството и&nbsp;интериорните решения.
          </p>
          <ul className="og__figs" data-fade="">
            {FIGURES.map(([figure, words]) => (
              <li key={words}>
                <b>{figure}</b> {words}
              </li>
            ))}
          </ul>
        </div>
        <Seam draw />
      </div>
      <div className="og__row">
        {STORY.map(({ image, alt, caption }) => (
          <figure key={caption} className="og__ph" data-fade="">
            <ResponsivePicture image={image} alt={alt} sizes="(max-width: 900px) 50vw, 32vw" />
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
