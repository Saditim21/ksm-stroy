import { useRef } from 'react'
import { EMBLEM_VIEWBOX, EmblemPaths } from '../../components/brand/Emblem'
import { STROKE_PROPS } from '../../components/brand/strokeProps'
import Button from '../../components/ui/Button'
import Seam from '../../components/ui/Seam'
import { SITE, mapsUrl } from '../../config/site'
import useMotion from '../../motion/useMotion'
import useReveals from '../../motion/useReveals'
import { bindAddress } from '../../utils/format'

// Контакти's offices, #ofisi (spec M3/M4 §7.3; the concept's
// kontakti.html:211-235): KSM's own two doors, as the page transition's
// doors meet on the seam. A hinge, „Нашите *офиси*“ and production's line;
// then a band of two door panels, „София“ | „Гоце Делчев“ across the seam,
// the KSM mark on it, each office's full address (bindAddress) and its search
// on Google Maps (mapsUrl), in a new tab, its office named for a screen
// reader. No embedded map (spec §2).
//
// The headings rise, the copy fades in and the seams draw as the section
// comes up from below (useReveals); the mark draws itself, stroke by stroke,
// as the band reaches 72 % of the screen (the concept's kontakti.js:334-339).
// The markup is the final state.

// The KSM mark, drawn in strokes (src/components/brand/Emblem.jsx's paths),
// which the subject „Друго“ shows too (ContactInquiry.jsx).
export function Mark() {
  return (
    <svg viewBox={EMBLEM_VIEWBOX} aria-hidden="true" focusable="false" {...STROKE_PROPS}>
      <EmblemPaths />
    </svg>
  )
}

const OFFICES = [
  { side: 'l', city: 'София', id: 'off-sofia', address: SITE.offices[0] },
  { side: 'r', city: 'Гоце Делчев', id: 'off-gd', address: SITE.offices[1] },
]

export default function Offices() {
  const ref = useRef(null)
  useReveals(ref)
  useMotion(ref, ({ gsap }) => {
    const band = ref.current?.querySelector('.doorway')
    if (!band || band.getBoundingClientRect().top < window.innerHeight) return
    gsap.fromTo(
      band.querySelectorAll('.doorway__node path'),
      { strokeDasharray: '1 1', strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        stagger: (i) => (i % 13) * 0.035,
        clearProps: 'strokeDasharray,strokeDashoffset',
        scrollTrigger: { trigger: band, start: 'top 72%', once: true },
      },
    )
  })

  return (
    <section ref={ref} className="sec offices" id="ofisi" aria-labelledby="off-h">
      <div className="hinge">
        <h2 className="h2" id="off-h" data-split="">
          Нашите <em>офиси</em>
        </h2>
        <p className="lead" data-fade="">
          Посетете ни в&nbsp;един от нашите офиси за лична консултация и&nbsp;обсъждане на вашия&nbsp;проект.
        </p>
        <Seam draw />
      </div>
      <div className="doorway">
        <Seam draw />
        <div className="doorway__node" aria-hidden="true">
          <Mark />
        </div>
        {OFFICES.map(({ side, city, id, address }) => (
          <article key={id} className={`office office--${side}`} aria-labelledby={id}>
            <h3 className="office__city" id={id} data-split="">
              {city}
            </h3>
            <div className="office__more">
              <p className="office__addr" data-fade="">
                {bindAddress(address)}
              </p>
              <Button href={mapsUrl(address)} variant="link" arrow className="office__map" target="_blank" rel="noopener noreferrer" data-fade="">
                Отвори в&nbsp;Google Maps<span className="sr-only">: офисът в&nbsp;{city}</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
