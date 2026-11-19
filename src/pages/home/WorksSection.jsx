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
// the covers before it, 1 s expo.inOut, settling from 1.08 as it does, and
// those go once it has landed. As in the concept, which appends a layer for
// every change (home.js:238-253), each choice wipes in over everything on
// show: a quick change wipes over a wipe still under way, and a work chosen
// again before its cover has left the stack wipes in as a fresh layer, so the
// covers under it stay and the frame never shows through. Without motion the
// cover changes at once. The covers are the works' own photographs, each a
// master enlarged and graded alike (polish spec §2, scripts/images/covers.mjs:
// Green Life its night pool, Хотел Парадайс from the air, Панорама its frame,
// Сънни Хил its finished corner), all six in the panel from the start, hidden
// but for the chosen one, so a change never waits for a download. The panel is
// decoration, hidden from assistive technology: the list carries the names,
// and aria-current the choice.

const WORKS = [
  {
    name: 'Green Life – Paradise Gardens and Town House',
    place: 'гр. Созопол',
    line: 'гр. Созопол · жилищен комплекс · 2018',
    image: homeImages['cover-green-life'],
  },
  { name: 'Айвазовски Парк', place: 'гр. Поморие', line: 'гр. Поморие · жилищен комплекс', image: homeImages['cover-aivazovski'] },
  {
    name: 'Панорама Резидънс',
    place: 'гр. Созопол',
    tag: 'груб строеж',
    line: 'гр. Созопол · жилищен комплекс',
    image: homeImages['cover-panorama'],
  },
  {
    name: 'Сънни Хил блок 9',
    place: 'кв. Меден Рудник, гр. Бургас',
    line: 'кв. Меден Рудник, гр. Бургас · жилищна сграда',
    image: homeImages['cover-sunny-hill'],
  },
  { name: 'Хотел Парадайс', place: 'с. Огняново', line: 'с. Огняново · хотелски комплекс', image: homeImages['cover-hotel-paradise'] },
  {
    name: 'Читалище „Асен Златаров-1924“',
    place: 'с. Огняново, община Гърмен',
    line: 'с. Огняново, община Гърмен · обществена сграда',
    image: homeImages['cover-chitalishte'],
  },
]

// A landscape cover fills the panel's height, so it is wider than the panel:
// at 1440 × 900 the 16:9 one is 92 % of the screen wide. Every cover's
// largest file is what the panel needs.
const COVER_SIZES = '(max-width: 900px) 100vw, 92vw'
const PHONE = '(max-width: 900px)'

// The covers on show, bottom to top, one show per choice:
// { work, key, own, wipe }.
// - key: the show's own number, never reused.
// - own: the show uses its work's layer, one of the six in the panel. A work
//   chosen again while an earlier show of it still holds that layer (its
//   cover under a wipe) gets a layer of its own over the stack, made for the
//   show and gone with it.
// - wipe: the show wipes in; the first, and a change made at once, do not.
const FIRST_SHOW = [{ work: 0, key: 0, own: true, wipe: false }]

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

// Wipes `layer` in from the seam, or from the top on a phone, over the layers
// under it (home.js:248-252).
function wipeIn(gsap, layer, onComplete) {
  const fromSeam = window.matchMedia(PHONE).matches ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 100%)'
  return gsap
    .timeline({ onComplete })
    .fromTo(layer, { clipPath: fromSeam }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
    .fromTo(layer.firstElementChild, { scale: 1.08 }, { scale: 1, duration: 1.3, ease: 'expo.out' }, 0.15)
}

export default function WorksSection() {
  const ref = useRef(null)
  useReveals(ref)
  const motionNow = useMotionNow()
  const [shown, setShown] = useState(FIRST_SHOW)
  const chosen = shown[shown.length - 1].work
  // The last show's key; the wipes under way, by show; the shows whose wipe
  // has started.
  const lastKey = useRef(0)
  const wipes = useRef(new Map())
  const started = useRef(new Set())

  function choose(work) {
    if (work === chosen) return
    const key = ++lastKey.current
    if (!motionNow()) {
      clearWipes(ref.current, wipes.current)
      setShown([{ work, key, own: true, wipe: false }])
      return
    }
    setShown((current) => {
      // Two choices of one work before a render are one show.
      if (current[current.length - 1].work === work) return current
      const own = !current.some((show) => show.own && show.work === work)
      return [...current, { work, key, own, wipe: true }]
    })
  }

  // Once a render has put a new show's layer on the stack, its wipe starts,
  // before the browser paints it in full.
  useLayoutEffect(() => {
    const onStack = new Set(shown.map((show) => show.key))
    // A show that has left the stack has no wipe left to run.
    for (const [key, wipe] of wipes.current) {
      if (onStack.has(key)) continue
      wipe.kill()
      wipes.current.delete(key)
    }
    for (const key of started.current) if (!onStack.has(key)) started.current.delete(key)

    const pending = shown.filter((show) => show.wipe && !started.current.has(show.key))
    if (pending.length === 0) return
    const motion = motionNow()
    for (const { key } of pending) {
      started.current.add(key)
      const layer = ref.current?.querySelector(`.works__img[data-show="${key}"]`)
      if (!motion || !layer) {
        // Motion went between the choice and its render: the cover changes
        // at once.
        clearWipes(ref.current, wipes.current)
        const settled = ++lastKey.current
        setShown((current) => [{ work: current[current.length - 1].work, key: settled, own: true, wipe: false }])
        return
      }
      const { gsap } = motion
      const wipe = wipeIn(gsap, layer, () => {
        wipes.current.delete(key)
        gsap.set(layer, { clearProps: 'clipPath' })
        gsap.set(layer.firstElementChild, { clearProps: 'transform' })
        // The shows it has wiped over go; any chosen after it stay.
        setShown((current) => {
          const at = current.findIndex((show) => show.key === key)
          return at > 0 ? current.slice(at) : current
        })
      })
      wipes.current.set(key, wipe)
    }
  }, [shown, motionNow])

  useEffect(() => {
    const running = wipes.current
    return () => {
      running.forEach((wipe) => wipe.kill())
      running.clear()
    }
  }, [])

  // One cover's layer: one of the six, or a show's own. A show's own layer
  // loads its picture at once rather than lazily: the file is the one its
  // work's layer has loaded already.
  const cover = (work, show, depth, key) => (
    <div
      key={key}
      className="works__img"
      data-work={work}
      data-show={show ? show.key : undefined}
      data-shown={show ? (depth === shown.length - 1 ? 'top' : 'under') : undefined}
      style={show ? { zIndex: depth + 1 } : undefined}
    >
      <ResponsivePicture image={WORKS[work].image} alt="" sizes={COVER_SIZES} eager={Boolean(show && !show.own)} />
    </div>
  )

  const { name, place } = WORKS[chosen]

  return (
    <section ref={ref} className="works split" id="obekti" aria-labelledby="works-h">
      <Seam />
      <div className="works__media dark" aria-hidden="true">
        <div className="works__frame">
          {WORKS.map(({ image }, work) => {
            const depth = shown.findIndex((show) => show.own && show.work === work)
            return cover(work, shown[depth], depth, image.path)
          })}
          {shown.map((show, depth) => (show.own ? null : cover(show.work, show, depth, `show-${show.key}`)))}
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
