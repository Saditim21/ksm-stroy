import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'

// The company, „За нас“ (spec §6.8; extract §4.10), a split on the seam: the
// motto, production's „ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА“ re-cased, set
// against the seam; beside it the founding story, the triad and three facts.
// Copy: About.jsx:415–444 and src/assets/for-us/content.txt:1–3, as spec §8.1
// re-sets it, with non-breaking spaces after one-letter words and before
// „г.“ (spec §3.3).
//
// The headings rise line by line, the copy fades in and the seam draws as the
// section comes into view (useReveals); the markup is the final state.
export default function CompanySection() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec bros split" id="za-nas" aria-labelledby="bros-h">
      <Seam draw />
      <div className="bros__motto">
        <blockquote data-split>
          <span className="q">„</span>Добрата работа – <em>реклама</em> за майстора<span className="q">“</span>
        </blockquote>
      </div>
      <div className="bros__story">
        <h2 className="h3" id="bros-h" data-split>
          Традиция и&nbsp;иновации от <em>2008</em>
        </h2>
        <p data-fade>
          КСМ СТРОЙ ООД е&nbsp;основана през септември 2008&nbsp;г. от двама братя – Кадри и&nbsp;Сухат, синове на известен
          в&nbsp;родното им село Буково строител зидар (дюлгерин).
        </p>
        <p data-fade>
          Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност,
          бързина и&nbsp;точност.
        </p>
        {/* Spaces between the words, for the text; the layout ignores them. */}
        <p className="triad" data-fade>
          <span>коректност</span>{' '}
          <span>бързина</span>{' '}
          <span>точност</span>
        </p>
        <dl className="facts-row" data-fade>
          <div>
            <dt>2008</dt>
            <dd>годината, в&nbsp;която братята основават КСМ Строй</dd>
          </div>
          <div>
            <dt>2</dt>
            <dd>сгради в&nbsp;продажба в&nbsp;София в&nbsp;момента</dd>
          </div>
          <div>
            <dt>2</dt>
            <dd>офиса: София и&nbsp;Гоце Делчев</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
