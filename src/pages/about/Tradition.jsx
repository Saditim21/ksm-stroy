import { useRef } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'
import useWipes from '../../motion/useWipes'
import { PHOTOS } from './photos'

// #traditsiya, the tradition and what the founders promised (spec M3/M4 §7.4;
// the concept's za-nas.html:105-143). The section keeps production's
// „Нашата история“ as its name for screen readers; the system shows no
// eyebrow.
// - Production's story (About.jsx:415-444): the h2 „*Традиция* и иновации от
//   2008“ ends at the seam; after it the founders' principles sentence, in
//   sentence case, closed by the motto at h3 size, not a display quote.
// - Then the client's own text (src/assets/for-us/content.txt:5-12), which
//   Home never shows: „Обещани дейности | от учредителите“ across the seam,
//   the pair outside | inside, the Hotel Paradise facade (the legacy story's
//   photo, the hotel's byte for byte) and slider03, each opening from the
//   seam, then „ВиК и електродейности | Ремонт в дома и офиса“, and the
//   client's closing line under a short brass stem. The spelling fixes are
//   QUESTIONS.md's: „Поддръжка“, „клиентът“, „ВиК и електродейности“, en
//   dashes, and a comma after „и др.“.
//
// The headings rise line by line, the copy fades up and the seams draw as
// they come into view (useReveals); the photos open from the seam
// (useWipes). The markup is the final state.

// The pair's photos: a half each, the page on a phone.
const SIZES = '(max-width: 900px) 100vw, 50vw'

export default function Tradition() {
  const ref = useRef(null)
  useReveals(ref)
  useWipes(ref)

  return (
    <section ref={ref} className="sec tradition" id="traditsiya" aria-label="Нашата история">
      <div className="tradition__head">
        <Seam draw />
        <div className="tradition__l">
          <h2 className="h2" data-split="">
            <em>Традиция</em> и&nbsp;иновации от 2008
          </h2>
        </div>
        <div className="tradition__r">
          <p className="lead" data-fade="">
            Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност, бързина и&nbsp;точност под мотото:
          </p>
          <blockquote className="motto" data-split="">
            <span className="q">„</span>Добрата работа – реклама за майстора<span className="q">“</span>
          </blockquote>
        </div>
      </div>

      <section className="deeds" aria-labelledby="deeds-h">
        <div className="deeds__body">
          <Seam draw />
          <h3 className="deeds__h" id="deeds-h">
            <span className="deeds__hl" data-split="">Обещани дейности</span>{' '}
            <span className="deeds__hr" data-split="">от учредителите</span>
          </h3>
          <div className="deeds__pair">
            <article className="deed deed--l" aria-labelledby="deed-ext">
              <figure className="deed__ph" data-wipe="l">
                <ResponsivePicture image={PHOTOS.exterior} alt="Хотел Парадайс, с. Огняново" sizes={SIZES} className="grade" />
                <figcaption>Хотел Парадайс, с.&nbsp;Огняново</figcaption>
              </figure>
              <h4 className="deed__t" id="deed-ext" data-split="">Екстериор</h4>
              <p className="deed__d" data-fade="">
                груб строеж, изкопи, хидроизолация, топлоизолация, дренаж – проектиране и&nbsp;изпълнение, вертикална планировка, покриви – изграждане, окачени фасади и&nbsp;всички други елементи за облика на сградата и&nbsp;дома.
              </p>
            </article>
            <article className="deed deed--r" aria-labelledby="deed-int">
              <figure className="deed__ph" data-wipe="r">
                <ResponsivePicture image={PHOTOS.interior} alt="KSM Stroy строителни проекти" sizes={SIZES} className="grade" />
              </figure>
              <h4 className="deed__t" id="deed-int" data-split="">Интериор</h4>
              <p className="deed__d" data-fade="">
                зидария, мазилки, замазки, шпакловки, облицовки – фаянс, теракот, гранитогрес, камък, гипсокартон, ламинат, паркет и&nbsp;др., проектирани и&nbsp;изпълнени по начин за създаване на уют в&nbsp;сградата и&nbsp;дома.
              </p>
            </article>
          </div>
          <div className="deeds__more">
            <div className="deed deed--l deed--text">
              <h4 className="deed__t" data-split="">ВиК и&nbsp;електродейности</h4>
            </div>
            <div className="deed deed--r deed--text">
              <h4 className="deed__t" data-split="">Ремонт в&nbsp;дома и&nbsp;офиса</h4>
              <p className="deed__d" data-fade="">
                при които свеждаме до минимум неприятните усещания на възложителя. Поддръжка на обекта максимално чист и&nbsp;обезопасен.
              </p>
            </div>
          </div>
        </div>
        <p className="deeds__close" data-fade="">
          Всичко това го получава клиентът с&nbsp;висока степен на сигурност, качество, коректно отношение и&nbsp;внимание към детайла.
        </p>
      </section>
    </section>
  )
}
