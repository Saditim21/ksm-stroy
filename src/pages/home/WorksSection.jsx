import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import homeImages from '../../data/images/home.json'
import useMotionNow from '../../motion/useMotionNow'
import useReveals from '../../motion/useReveals'

// „Нашите обекти“ (spec §6.10; extract §4.12), a split on the seam: on the
// left, a panel one screen tall, sticky beside the list where there is
// motion (home.css), with the chosen work's cover and its caption; on the
// right, the heading, Blog's description (Blog.jsx:787) and production's six
// completed works (Blog.jsx:128–197), each a button.
//
// Pointing at a work with a mouse, focusing it or clicking it chooses it.
// With motion its cover wipes in from the seam (from the top on a phone) over
// the one before, 1 s expo.inOut, settling from 1.08 as it does; a quicker
// change wipes over a wipe still under way, as in the concept. Without
// motion the cover changes at once. The covers are production's photos
// (src/assets/projects), all six in the panel from the start, hidden but
// for the chosen one, so a change never waits for a download. The panel is
// decoration, hidden from assistive technology: the list carries the names,
// and aria-current the choice.

const WORKS = [
  {
    name: 'Green Life – Paradise Gardens and Town House',
    place: 'гр. Созопол',
    line: 'гр. Созопол · жилищен комплекс · 2018',
    image: homeImages['work-green-life'],
  },
  { name: 'Айвазовски Парк', place: 'гр. Поморие', line: 'гр. Поморие · жилищен комплекс', image: homeImages['work-aivazovski'] },
  {
    name: 'Панорама Резидънс',
    place: 'гр. Созопол',
    tag: 'груб строеж',
    line: 'гр. Созопол · жилищен комплекс',
    image: homeImages['work-panorama'],
  },
  {
    name: 'Сънни Хил блок 9',
    place: 'кв. Меден Рудник, гр. Бургас',
    line: 'кв. Меден Рудник, гр. Бургас · жилищна сграда',
    image: homeImages['work-sunny-hill'],
  },
  { name: 'Хотел Парадайс', place: 'с. Огняново', line: 'с. Огняново · хотелски комплекс', image: homeImages['work-hotel-paradise'] },
  {
    name: 'Читалище „Асен Златаров-1924“',
    place: 'с. Огняново, община Гърмен',
    line: 'с. Огняново, община Гърмен · обществена сграда',
    image: homeImages['work-chitalishte'],
  },
]

// A landscape cover fills the panel's height, so it is wider than the panel:
// at 1440 × 900 the 16:9 one is 92 % of the screen wide. Every cover's
// largest file is what the panel needs.
const COVER_SIZES = '(max-width: 900px) 100vw, 92vw'
const PHONE = '(max-width: 900px)'

const layerIn = (root, work) => root?.querySelector(`.works__img[data-work="${work}"]`)

// Stops the wipes under way and takes off what they left on the covers, for
// a change made at once.
function clearWipes(root, wipes) {
  wipes.forEach((wipe) => wipe.kill())
  wipes.clear()
  root?.querySelectorAll('.works__img').forEach((layer) => {
    layer.style.clipPath = ''
    if (layer.firstElementChild) layer.firstElementChild.style.transform = ''
  })
}

export default function WorksSection() {
  const ref = useRef(null)
  useReveals(ref)
  const motionNow = useMotionNow()
  // The covers on show, bottom to top: the chosen work's last, over any it
  // is still wiping in over.
  const [shown, setShown] = useState([0])
  const chosen = shown[shown.length - 1]
  // The wipes under way, by work, and the work whose cover wipes in once the
  // render that shows it has committed.
  const wipes = useRef(new Map())
  const wipeNext = useRef(null)

  function choose(work) {
    if (work === chosen) return
    if (!motionNow()) {
      clearWipes(ref.current, wipes.current)
      setShown([work])
      return
    }
    wipeNext.current = work
    setShown((current) => [...current.filter((w) => w !== work), work])
  }

  useLayoutEffect(() => {
    const work = wipeNext.current
    if (work === null) return
    wipeNext.current = null
    const motion = motionNow()
    const layer = layerIn(ref.current, work)
    if (!motion || !layer) {
      clearWipes(ref.current, wipes.current)
      setShown([work])
      return
    }
    const { gsap } = motion
    wipes.current.get(work)?.kill()
    const fromSeam = window.matchMedia(PHONE).matches ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 100%)'
    const wipe = gsap.timeline({
      onComplete: () => {
        wipes.current.delete(work)
        gsap.set(layer, { clearProps: 'clipPath' })
        gsap.set(layer.firstElementChild, { clearProps: 'transform' })
        // The covers it has wiped over go; any chosen after it stay.
        setShown((current) => {
          const at = current.indexOf(work)
          return at < 0 ? current : current.slice(at)
        })
      },
    })
    wipe
      .fromTo(layer, { clipPath: fromSeam }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
      .fromTo(layer.firstElementChild, { scale: 1.08 }, { scale: 1, duration: 1.3, ease: 'expo.out' }, 0.15)
    wipes.current.set(work, wipe)
  }, [shown, motionNow])

  useEffect(() => {
    const running = wipes.current
    return () => {
      running.forEach((wipe) => wipe.kill())
      running.clear()
    }
  }, [])

  const { name, place } = WORKS[chosen]

  return (
    <section ref={ref} className="works split" id="obekti" aria-labelledby="works-h">
      <Seam />
      <div className="works__media" aria-hidden="true">
        <div className="works__frame">
          {WORKS.map(({ image }, work) => {
            const depth = shown.indexOf(work)
            const on = depth >= 0
            return (
              <div
                key={image.path}
                className="works__img"
                data-work={work}
                data-shown={on ? (depth === shown.length - 1 ? 'top' : 'under') : undefined}
                style={on ? { zIndex: depth + 1 } : undefined}
              >
                <ResponsivePicture image={image} alt="" sizes={COVER_SIZES} />
              </div>
            )
          })}
        </div>
        <p className="works__cap">
          {name}, {place}
        </p>
      </div>
      <div className="works__list">
        <h2 className="h2" id="works-h" data-split="">
          Нашите <em>обекти</em>
        </h2>
        <p className="lead" data-fade="">
          Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси
          и&nbsp;санирания.
        </p>
        <ol className="works__items" role="list">
          {WORKS.map((work, i) => (
            <li key={work.name}>
              <button
                type="button"
                aria-current={i === chosen ? 'true' : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') choose(i)
                }}
                onFocus={() => choose(i)}
                onClick={() => choose(i)}
              >
                <span className="serif">{work.name}</span>
                {work.tag ? (
                  <>
                    {' '}
                    <span className="tag">{work.tag}</span>
                  </>
                ) : null}{' '}
                <span className="small">{work.line}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
