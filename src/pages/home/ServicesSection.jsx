import { useRef } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import homeImages from '../../data/images/home.json'
import useMotion from '../../motion/useMotion'
import useReveals from '../../motion/useReveals'

// „Нашите услуги“ as Diptych shows it (spec §6.9; extract §4.11): the
// user-approved heading „Строим, ремонтираме, завършваме.“ against the seam,
// production's lead after it (Home.jsx:72), then three columns on umber,
// each an article: a photo, an outlined numeral, the title and production's
// sentence (Home.jsx:16–27, sentence case).
//
// Where a fine pointer hovers, from 901 px, the column pointed at, or the one
// the keyboard focuses, widens, its photo opens from the bottom, its numeral
// brightens, its sentence shows and a brass-l underline draws; a touch screen
// shows every photo and sentence, and a phone stacks the columns. All CSS
// (home.css). The numerals and titles rise in once, when the row comes into
// view (home.js:211-217); the headings and seams reveal as everywhere
// (useReveals). The markup is the final state.

const SERVICES = [
  {
    id: 'svc-t1',
    numeral: '01',
    title: 'Жилищно строителство',
    text: <>Строителство на къщи, апартаменти и&nbsp;жилищни комплекси с&nbsp;висок стандарт.</>,
    image: homeImages['svc-residential'],
  },
  {
    id: 'svc-t2',
    numeral: '02',
    title: <>Ремонти и&nbsp;реновация</>,
    text: <>Цялостни ремонти и&nbsp;модернизация на съществуващи сгради.</>,
    image: homeImages['svc-renovation'],
    photo: 'svc__photo--renovation',
  },
  {
    id: 'svc-t3',
    numeral: '03',
    title: 'Комерсиално строителство',
    text: <>Офисни сгради, складове и&nbsp;индустриални обекти.</>,
    image: homeImages['svc-commercial'],
    photo: 'svc__photo--commercial',
  },
]

// Each photo spans its column, which widens to about half the screen.
const PHOTO_SIZES = '(max-width: 900px) 100vw, 56vw'

export default function ServicesSection() {
  const ref = useRef(null)
  useReveals(ref)

  // The numerals rise 36 % and the titles 22 px into place, column after
  // column, once the row reaches 84 % of the screen; a row already on screen
  // stays as it is. The numeral's own fade (its hover) is off while it
  // rises, so it follows the rise exactly.
  useMotion(ref, ({ gsap }) => {
    const row = ref.current?.querySelector('.svc__cols')
    if (!row || row.getBoundingClientRect().top < window.innerHeight) return
    const numerals = row.querySelectorAll('.svc__n')
    gsap.set(numerals, { transition: 'none' })
    gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 84%', once: true } })
      .from(numerals, { yPercent: 36, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity,transition' }, 0)
      .from(row.querySelectorAll('.svc__t'), { y: 22, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity' }, 0.18)
  })

  return (
    <section ref={ref} className="sec svc" id="uslugi" aria-labelledby="svc-h">
      <div className="hinge">
        <h2 className="h2" id="svc-h" data-split="">
          Строим, ремонтираме, <em>завършваме</em>.
        </h2>
        <p className="lead" data-fade="">
          Предлагаме пълен спектър от строителни услуги за жилищни и&nbsp;комерсиални проекти.
        </p>
        <Seam draw />
      </div>
      {/* Each column is focusable, so the keyboard opens it as the pointer does. */}
      <div className="svc__cols dark">
        {SERVICES.map(({ id, numeral, title, text, image, photo }, i) => (
          <article key={id} className="svc__col" tabIndex={0} aria-labelledby={id}>
            {i > 0 ? <Seam draw /> : null}
            <div className="svc__img" aria-hidden="true">
              <ResponsivePicture image={image} alt="" sizes={PHOTO_SIZES} imgClassName={photo} />
            </div>
            <span className="svc__n" aria-hidden="true">
              {numeral}
            </span>
            <div className="svc__body">
              <h3 className="svc__t" id={id}>
                {title}
              </h3>
              <p className="svc__d">{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
