import { useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { mapsUrl } from '../../config/site'
import grImages from '../../data/images/golden-residence.json'
import useMotion from '../../motion/useMotion'
import useReveals from '../../motion/useReveals'
import { formatArea, formatDecimal } from '../../utils/format'

// The building, #sgradata (spec §6.15, §8.2; extract §4.18): four blocks of
// text, each with its picture. The paragraphs are the client's own text, the
// Golden Residence landing's (golden-residence src/content.js:44-76), the
// agency's clause dropped (decision A1); the headings are drawn from those
// sentences, the figures are the project's fixed facts (src/config/facts.js),
// and the captions and alts are extract §7.3's.
//
// With motion, from 901 px, the picture half stays beside the text as it
// scrolls (gr.css: sticky, one screen tall), and as each block reaches the
// middle of the screen its picture wipes in from the seam over the one
// before (gr.js:41-64), the index and the caption following. Without motion,
// and on a phone, each block shows its picture inline above it (spec §5.8).
// The picture half is decoration, hidden from assistive technology: the
// inline figures, which carry the alts, are what reads where the half does
// not show. The headings rise line by line and the copy fades in as each
// block comes into view (useReveals); the markup is the final state.

const ADDRESS = 'ул. Ген. Климент Бояджиев, жк Левски Г, София'
const PIN_SIZES = '50vw'
const INLINE_SIZES = '(max-width: 900px) 100vw, 820px'
const pad = (n) => String(n).padStart(2, '0')

// Each block's text after its paragraph.
function Metro() {
  return (
    <>
      <div className="metro" data-fade="">
        <span className="num">500&nbsp;м</span>{' '}
        <p>
          до метростанция <br />
          <span className="small">ул. Ген. Климент Бояджиев, жк&nbsp;Левски&nbsp;Г</span>
        </p>
      </div>
      <p data-fade="">
        <Button href={mapsUrl(ADDRESS)} variant="link" target="_blank" rel="noopener noreferrer">
          Отвори в&nbsp;Google Maps
        </Button>
      </p>
    </>
  )
}

function Figures() {
  const { blocks, floors, apartments, perFloor, minArea, maxArea } = GR_FACTS
  return (
    <dl className="kv" data-fade="">
      <div>
        <dt>{blocks}</dt>
        <dd>блока, А&nbsp;и&nbsp;Б</dd>
      </div>
      <div>
        <dt>{floors}</dt>
        <dd>жилищни етажа във всеки блок</dd>
      </div>
      <div>
        <dt>{apartments}</dt>
        <dd>
          апартамента, по {apartments / blocks} в&nbsp;блок
        </dd>
      </div>
      <div>
        <dt>{perFloor}</dt>
        <dd>
          апартамента на етаж, от {formatDecimal(minArea)} до {formatArea(maxArea)}
        </dd>
      </div>
    </dl>
  )
}

// The garages and the parking places, a glide away (Button, glideToHash).
function Parking() {
  return (
    <p data-fade="">
      <Button href="#garazhi" variant="link" arrow>
        {GR_FACTS.garages}&nbsp;гаража и&nbsp;{GR_FACTS.parking}&nbsp;паркоместа
      </Button>
    </p>
  )
}

const BLOCKS = [
  {
    image: grImages['gr-entrance'],
    photo: 'story__photo--entrance',
    alt: 'Входът на Golden Residence, визуализация',
    caption: 'Визуализация: входът и градината пред него',
    title: (
      <>
        Модерен дом в&nbsp;жк&nbsp;<em>Левски&nbsp;Г</em>
      </>
    ),
    text: (
      <>
        Golden Residence е&nbsp;новострояща се жилищна сграда, която съчетава съвременна архитектурна визия, прецизно
        функционално разпределение и&nbsp;безупречна локация&nbsp;– в&nbsp;един от най-бързо развиващите се
        и&nbsp;зелени столични райони&nbsp;– жк&nbsp;Левски&nbsp;Г и&nbsp;само на 500&nbsp;метра от метростанция.
      </>
    ),
    more: <Metro />,
  },
  {
    image: grImages['gr-balconies'],
    alt: 'Бронзовите рамки на терасите, визуализация',
    caption: 'Визуализация: терасите отдолу',
    title: (
      <>
        Бронзови <em>рамки</em>
      </>
    ),
    text: <>Изчистени линии и&nbsp;фасада с&nbsp;бронзови рамки около просторните остъклени тераси.</>,
    more: <Figures />,
  },
  {
    image: grImages['gr-terrace'],
    photo: 'story__photo--terrace',
    alt: 'Тераса с маса и растения, визуализация',
    caption: 'Визуализация: тераса',
    title: (
      <>
        Продължение на <em>дневната</em>
      </>
    ),
    text: <>Терасите са продължение на дневната: място за маса, растения и&nbsp;вечери навън.</>,
  },
  {
    image: grImages['gr-garden'],
    photo: 'story__photo--garden',
    alt: 'Озелененият двор отгоре, визуализация',
    caption: 'Визуализация: дворът',
    title: (
      <>
        Озеленен <em>двор</em>
      </>
    ),
    text: <>Озеленен двор с&nbsp;алеи и&nbsp;дървета около сградата.</>,
    more: <Parking />,
  },
]

export default function StorySection() {
  const ref = useRef(null)
  useReveals(ref)
  // The block whose picture the half shows: its index and its caption.
  const [shown, setShown] = useState(0)

  // The wipes (gr.js:41-64): each block, from when its top reaches 55 % of
  // the screen until its bottom does, brings its picture over the rest, from
  // the seam, 1 s expo.inOut, settling from 1.08 over 1.4 s; the caption
  // fades in after 0.3 s. No ScrollTrigger pin: the half is sticky (gr.css).
  // The setup's animations, and the ScrollTriggers' with them, are its
  // context's, reverted with it; the half then shows the first picture again.
  useMotion(ref, ({ gsap, ScrollTrigger }) => {
    const root = ref.current
    const layers = [...(root?.querySelectorAll('.story__img') ?? [])]
    const caption = root?.querySelector('.story__cap')
    if (layers.length === 0 || !caption) return undefined
    let current = 0
    let top = layers.length
    const show = (i) => {
      if (i === current) return
      current = i
      const layer = layers[i]
      const picture = layer.querySelector('img')
      gsap.killTweensOf([layer, picture, caption])
      top += 1
      gsap.set(layer, { zIndex: top })
      gsap.fromTo(layer, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
      gsap.fromTo(picture, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'expo.out' })
      gsap.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.3 })
      setShown(i)
    }
    root.querySelectorAll('.story__block').forEach((block, i) => {
      ScrollTrigger.create({
        trigger: block,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) show(i)
        },
      })
    })
    return () => setShown(0)
  })

  return (
    <section ref={ref} className="story split" id="sgradata" aria-label="Сградата">
      <Seam />
      <div className="story__pin" aria-hidden="true">
        <div className="story__frame">
          {BLOCKS.map(({ image, photo }) => (
            <div key={image.path} className="story__img">
              <ResponsivePicture image={image} alt="" sizes={PIN_SIZES} imgClassName={photo} />
            </div>
          ))}
        </div>
        <p className="story__idx">
          <b>{pad(shown + 1)}</b> <span>/ {pad(BLOCKS.length)}</span>
        </p>
        <p className="story__cap">{BLOCKS[shown].caption}</p>
      </div>
      <div className="story__text">
        {BLOCKS.map(({ image, photo, alt, caption, title, text, more }) => (
          <article key={caption} className="story__block">
            <figure className="story__inline">
              <ResponsivePicture image={image} alt={alt} sizes={INLINE_SIZES} imgClassName={photo} />
            </figure>
            <h2 className="h2" data-split="">
              {title}
            </h2>
            <p data-fade="">{text}</p>
            {more ?? null}
          </article>
        ))}
      </div>
    </section>
  )
}
