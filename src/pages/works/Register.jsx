import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useMotionNow from '../../motion/useMotionNow'
import useWipes from '../../motion/useWipes'
import { plural } from '../../utils/format'
import { lineOf, photoOf, WORKS } from './works'

// Обекти's opening, #top, the register (spec M3/M4 §7.2; the concept's
// obekti.html:80-215 and js/obekti.js): the H1 „Обекти“ hinged on the seam,
// in a mask authored by hand, production's description and its filter as a
// three-way segmented control (Всички проекти 7 / Завършени проекти 6 /
// Груб строеж 1; the short labels below 1240 px are works.css's, the long
// ones the buttons' names). Then the seven works (works.js), each a row
// across the seam: three of its photos as archive plates left of it, under
// the archive's grade (spec §4.3), the cover and two smaller ones; its
// record right of it: the name, the place and type (the year for Green Life
// alone), the brass „груб строеж“ tag on Панорама, production's description,
// its features joined by brass dashes, „Разгледайте проекта“ and its count
// of photos.
//
// - A plate, or „Разгледайте проекта“, opens the work's book (Book.jsx, the
//   page's moment) at its photo, or at the title page. The book is a chunk
//   of its own, with Flip, which flies the plate into it: both start loading
//   as soon as a pointer or the focus reaches the register or the filter,
//   and nothing of them is in the page's first load. The book shows as soon
//   as its chunk is in (no Suspense boundary, whose fallback would hold it
//   back 300 ms). When it closes, the focus goes back to what opened it.
// - The filter folds the register to the works it names. With motion
//   (useMotionNow), the rows it drops fade out (0.28 s), then the rows that
//   stay close the gaps with Flip (0.75 s expo.inOut) and the rows it brings
//   fade in (0.6 s, 0.3 s late), as the concept's js/obekti.js:30-56 does,
//   and a choice made while a fold plays is let go, as there. Without
//   motion the rows change at once; if Flip cannot load, they change at
//   once when the fade is done.
// - The first row opens with the opening (works.css, CSS from the first
//   paint): its cover, the page's largest paint and so its LCP image, is
//   whole from the first frame, its photo only settling in scale (Diptych
//   §5.5), and its two smaller plates open from the seam. Each row below
//   opens its three plates from the seam together as it comes up (useWipes,
//   on the row's media, as the concept's one timeline a row does), each row
//   the scope of its own, so that no motion's scope takes in the opening
//   (spec M3/M4 §4.2: useMotion is never used above the fold). A row's
//   plates' photos are the only ones of the work the page asks for (the
//   first row's at once, its cover first), the rest coming with the book.

const loadBook = () => import('./Book')
// Flip (src/motion/flip.js), through a chunk of its own, not in the page's
// first load.
const loadFlip = () => import('../../motion/flip').then((module) => module.loadFlip())

const FILTERS = [
  { id: 'all', long: 'Всички проекти', short: 'Всички' },
  { id: 'finished', long: 'Завършени проекти', short: 'Завършени' },
  { id: 'rough', long: 'Груб строеж', short: 'Груб строеж' },
]
const fits = (work, filter) => filter === 'all' || work.status === filter
const COUNTS = Object.fromEntries(FILTERS.map(({ id }) => [id, WORKS.filter((work) => fits(work, id)).length]))

// Each work's plates by the place of their photos among its photos: its
// cover, then the two smaller ones (the concept's choice: a finished photo
// as the cover where the work has one; Панорама's are all construction).
const PLATES = {
  'green-life': [2, 0, 3],
  aivazovski: [6, 5, 1],
  panorama: [17, 3, 21],
  sanirane: [0, 8, 9],
  'sunny-hill': [24, 9, 21],
  'hotel-paradise': [1, 0, 7],
  chitalishte: [2, 0, 10],
}
const PLATE_CLASSES = ['wk__ph wk__ph--cover', 'wk__ph wk__ph--m1', 'wk__ph wk__ph--m2']
// The plates' slots (works.css): beside the seam the cover is about 30 % of
// the screen and a small plate 14 %; on a phone the cover spans the column
// and the small ones half of it, inside the 20 px gutters.
const COVER_SIZES = '(max-width: 900px) calc(100vw - 40px), 30vw'
const MINOR_SIZES = '(max-width: 900px) calc(50vw - 24px), 14vw'

// One work's row. The first row's plates open with the opening (CSS); the
// rows below open theirs from the seam as they come up (data-wipe on the
// three together, left of the seam: LaterRow).
function Row({ ref, work, first, hidden, onOpen }) {
  const count = work.photos.length
  return (
    <li ref={ref} className="wk" id={work.id} hidden={hidden}>
      <article className="wk__in" aria-labelledby={`wk-${work.id}`}>
        <div className="wk__media" data-wipe={first ? undefined : 'l'}>
          {PLATES[work.id].map((index, place) => (
            <button
              key={index}
              type="button"
              className={PLATE_CLASSES[place]}
              aria-label={`${work.name}: снимка ${index + 1} от ${count}`}
              onClick={(event) => onOpen(work, index, event.currentTarget)}
            >
              <ResponsivePicture
                image={photoOf(work.photos[index])}
                alt=""
                sizes={place === 0 ? COVER_SIZES : MINOR_SIZES}
                priority={first && place === 0}
                eager={first && place > 0}
                className="grade wk__pic"
              />
            </button>
          ))}
        </div>
        <div className="wk__rec">
          <h2 className="wk__name" id={`wk-${work.id}`}>{work.name}</h2>
          <p className="wk__meta">
            <span>{lineOf(work)}</span>
            {work.status === 'rough' ? <> <span className="wk__tag">груб строеж</span></> : null}
          </p>
          <p className="wk__desc">{work.description}</p>
          <div className="wk__feat">
            <h3>Особености</h3>
            <ul>
              {work.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
          <p className="wk__act">
            <Button variant="link" arrow onClick={(event) => onOpen(work, 0, event.currentTarget)}>
              Разгледайте проекта
            </Button>
            <span className="wk__n tab">{`${count}\u00a0${plural(count, 'снимка', 'снимки')}`}</span>
          </p>
        </div>
      </article>
    </li>
  )
}

// A row below the first: the scope of its own wipes (useWipes), so that the
// opening, the head and the first row, lies in no motion's scope (spec
// M3/M4 §4.2). A row whose plates are already on screen when its wipes are
// set up, as the second row's top edge is on a desktop, stays as it is
// (src/motion/wipes.js).
function LaterRow(props) {
  const ref = useRef(null)
  useWipes(ref)
  return <Row {...props} ref={ref} />
}

export default function Register() {
  const list = useRef(null)
  const motionNow = useMotionNow()
  // The filter's choice, at once; the rows it shows, once a fold has faded
  // the rows it drops.
  const [pressed, setPressed] = useState('all')
  const [shown, setShown] = useState('all')
  // Once the filter has been used, the first row's opening is done with:
  // a row brought back never plays it again (works.css).
  const [folded, setFolded] = useState(false)
  const fold = useRef(null)
  const folding = useRef(false)
  const [book, setBook] = useState(null)
  // The book's component, once its chunk is in.
  const [BookView, setBookView] = useState(null)
  const opener = useRef(null)
  const warmed = useRef(false)
  const fetchBook = useCallback(() => loadBook().then(({ default: view }) => setBookView(() => view)), [])

  // The book's chunk, and Flip where motion plays, as a visitor comes near.
  const warm = () => {
    if (warmed.current) return
    warmed.current = true
    fetchBook().catch(() => {})
    if (motionNow()) loadFlip().catch(() => {})
  }

  function choose(next) {
    if (next === pressed || folding.current) return
    setFolded(true)
    setPressed(next)
    const motion = motionNow()
    if (!motion) {
      setShown(next)
      return
    }
    folding.current = true
    const { gsap } = motion
    const rows = [...list.current.children]
    const leaving = rows.filter((row, i) => !row.hidden && !fits(WORKS[i], next))
    const faded = new Promise((resolve) => {
      if (leaving.length === 0) resolve()
      else gsap.to(leaving, { opacity: 0, duration: 0.28, ease: 'power2.out', onComplete: resolve })
    })
    // Flip, or null where it cannot load (offline, or a new deploy that
    // replaced its chunk). The fold waits for the fade either way: cleared
    // while the fade plays, the rows it drops would end at opacity 0, and
    // come back unseen.
    const flipped = loadFlip().catch(() => null)
    Promise.all([flipped, faded]).then(([Flip]) => {
      const before = rows.filter((row) => !row.hidden)
      const staying = before.filter((row) => !leaving.includes(row))
      fold.current = { motion, Flip, state: Flip && staying.length > 0 ? Flip.getState(staying) : null, before, leaving }
      setShown(next)
    })
  }

  // The fold, once the rows have changed: the rows it dropped, hidden now,
  // lose their fade; the rows that stay go from where they were (Flip), the
  // rows it brings fade in. Without Flip, the rows it brings show at once.
  // Either way the triggers below are measured again when it is done.
  useLayoutEffect(() => {
    const pending = fold.current
    if (!pending) return
    fold.current = null
    const { motion, Flip, state, before, leaving } = pending
    const { gsap, ScrollTrigger } = motion
    if (leaving.length > 0) gsap.set(leaving, { clearProps: 'opacity' })
    const entering = [...list.current.children].filter((row) => !row.hidden && !before.includes(row))
    const done = () => {
      folding.current = false
      ScrollTrigger.refresh()
    }
    if (!Flip) {
      if (entering.length > 0) gsap.set(entering, { clearProps: 'opacity' })
      done()
      return
    }
    if (entering.length > 0) {
      gsap.set(entering, { opacity: 0 })
      gsap.to(entering, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.3, clearProps: 'opacity', onComplete: state ? undefined : done })
    }
    if (state) Flip.from(state, { duration: 0.75, ease: 'expo.inOut', onComplete: done })
    else if (entering.length === 0) done()
  }, [shown])

  const open = (work, at, element) => {
    const img = element.querySelector('img')
    opener.current = element
    setBook({ work, at, fromRect: img ? img.getBoundingClientRect() : null, fromSrc: img ? img.currentSrc || img.src : null })
    // Its chunk, if no pointer or focus came near first (a tap); should it
    // not load, nothing opens.
    if (!BookView) fetchBook().catch(() => setBook(null))
  }
  const close = useCallback(() => setBook(null), [])
  // The focus goes back to what opened the book, once it has gone.
  useEffect(() => {
    if (book) return
    const element = opener.current
    opener.current = null
    element?.focus({ preventScroll: true })
  }, [book])

  return (
    <section className="ob" id="top" aria-labelledby="ob-h">
      <Seam className="ob__seam" />
      <div className="ob__head">
        <h1 className="ob__h1" id="ob-h">
          <span className="line-mask">
            <span className="split-line">Обекти</span>
          </span>
        </h1>
        <div className="ob__intro">
          <p className="lead ob__lead">
            Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси и&nbsp;санирания.
          </p>
          <div className="ob__filter" role="group" aria-label="Покажи" onPointerOver={warm} onFocus={warm}>
            {FILTERS.map(({ id, long, short }) => (
              <button key={id} type="button" aria-pressed={pressed === id} onClick={() => choose(id)}>
                <span className="ob__fl">{long}</span>
                <span className="ob__fs" aria-hidden="true">{short}</span> <b>{COUNTS[id]}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
      <ol
        ref={list}
        className={folded ? 'ob__list is-folded' : 'ob__list'}
        onPointerOver={warm}
        onPointerDown={warm}
        onFocus={warm}
      >
        {WORKS.map((work, i) => {
          const Each = i === 0 ? Row : LaterRow
          return <Each key={work.id} work={work} first={i === 0} hidden={!fits(work, shown)} onOpen={open} />
        })}
      </ol>
      {book && BookView ? <BookView {...book} onClose={close} /> : null}
    </section>
  )
}
