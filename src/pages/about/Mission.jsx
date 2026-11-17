import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'

// #misiya, mission | vision (spec M3/M4 §7.4; the concept's za-nas.html:231-241):
// production's „Мисия и *визия*“ (About.jsx:779-780) read across the seam,
// which runs on into its two texts (:107-115), set in the serif under their
// production names.
//
// The heading's parts rise, the texts fade up and the seam draws as they come
// into view (useReveals); the markup is the final state.

export default function Mission() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec mv" id="misiya" aria-labelledby="mv-h">
      <div className="mv__body">
        <Seam draw />
        <h2 className="mv__h h2" id="mv-h">
          <span className="mv__hl" data-split="">
            Мисия
          </span>{' '}
          <span className="mv__hr" data-split="">
            и&nbsp;<em>визия</em>
          </span>
        </h2>
        <div className="mv__pair">
          <div className="mv__half mv__half--l">
            <h3 className="mv__k">Нашата мисия</h3>
            <p className="mv__t" data-fade="">
              Да предоставяме цялостни строителни услуги, които обединяват професионализъм, отговорност и&nbsp;иновации, като същевременно гарантираме удовлетворението на нашите клиенти.
            </p>
          </div>
          <div className="mv__half mv__half--r">
            <h3 className="mv__k">Нашата визия</h3>
            <p className="mv__t" data-fade="">
              Вярваме, че строителството не е&nbsp;просто изграждане на сгради, а&nbsp;създаване на пространства за живот, работа и&nbsp;бъдеще. Ето защо в&nbsp;КСМ Строй ООД винаги поставяме клиента и&nbsp;качеството на първо място.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
