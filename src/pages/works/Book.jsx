import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useScrollLock from '../../hooks/useScrollLock'
import useSwipe from '../../hooks/useSwipe'
import { loadFlip } from '../../motion/flip'
import useMotionNow from '../../motion/useMotionNow'
import { trapTab } from '../../utils/trapTab'
import { lineOf, photoOf } from './works'
import './book.css'

// A work's book, Обекти's moment (spec M3/M4 §7.2; the concept's
// obekti.html:232-250 and js/obekti.js:74-253): the work's photos over the
// whole screen, a real dialog named after the work. Register.jsx loads it,
// with this chunk's stylesheet (book.css), only once a visitor comes near
// a work, and mounts it while it is open: `work` (works.js), `at`, the
// photo it opens at (the title page for the first), `fromRect` and
// `fromSrc`, the plate's photo it opens from (its box and its file), and
// onClose, which takes it away.
//
// - The bar: the work's name and line, the counter („02–03 / 06“, live) and
//   „Затвори“. The stage: two pages on the seam. On a desktop the title page
//   comes first, the record (production's „За проекта“ and „Особености“),
//   facing the first photo, then the photos two by two; a phone shows one
//   photo at a time (spec §7.2). Each photo in true colour (spec §4.3), at
//   its own size or below (book.css, from its --w and --h). The foot: ← and
//   →, and a strip of every photo, the shown ones marked.
// - Keys, anywhere while it is open: ← and → turn the pages, round from the
//   last to the first, Home and End go to the first and the last, Escape
//   closes it, and Tab stays inside. A swipe turns the pages too (useSwipe).
// - A modal dialog: a portal on <body>, the page behind it inert, which
//   Lenis leaves alone (data-lenis-prevent) and which holds the page still
//   (useScrollLock); the focus moves to „Затвори“, and Register.jsx gives it
//   back to the plate.
// - With motion (useMotionNow), and from a plate: the plate flies into its
//   photo's place in the book (Flip.fit, 0.9 s expo.inOut; its picture fills
//   the flight cropped, never stretched), its grade lifting to true colour
//   on the way, while the book fades in under it, its bar and foot after,
//   the seam draws down and the facing page opens from the seam; the photo
//   takes the plate's place as it lands. The flight waits for Flip and for
//   the photo to be ready to paint (as the concept does, at most 0.26 s for
//   the photo); without a plate, or should they not be ready within 0.4 s,
//   the book fades in. A page turns from the seam: the left one opens from
//   its right edge, the right one from its left (from the top on a phone),
//   over the page it covers, which goes once it has turned. Closing, it
//   fades out; a close while the flight still waits means it never starts.
//   Without motion all of it is at once, and Flip is never asked for (spec
//   §7.2: under reduced motion it opens at once).

const PHONE = '(max-width: 900px)'
const FOCUS_AT_ONCE_MS = 30
const FLIP_WAIT_MS = 400
const DECODE_WAIT_MS = 260
const OPEN = 'inset(0% 0% 0% 0%)'
const FROM_THE_SEAM = { l: 'inset(0% 0% 0% 100%)', r: 'inset(0% 100% 0% 0%)' }
const FROM_THE_TOP = 'inset(0% 0% 100% 0%)'
const TRUE_COLOUR = 'saturate(1) sepia(0) brightness(1) contrast(1)'
const PAGE_SIZES = '(max-width: 900px) 100vw, 50vw'

const isPhone = () => typeof window.matchMedia === 'function' && window.matchMedia(PHONE).matches
const twoDigits = (n) => String(n).padStart(2, '0')
const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms))
const wrap = (i, n) => ((i % n) + n) % n

// The book's spreads, each [left, right]: on a desktop the record facing
// the first photo, then the photos two by two; on a phone one photo each.
function spreadsOf(count, single) {
  if (single) return Array.from({ length: count }, (_, i) => [i])
  const spreads = [['record', 0]]
  for (let i = 1; i < count; i += 2) spreads.push(i + 1 < count ? [i, i + 1] : [i, null])
  return spreads
}
const photosOf = (spread) => spread.filter((item) => typeof item === 'number')

// Makes everything on <body> but the book inert while it is open, and gives
// back what it took.
function inertOthers(book) {
  const made = []
  for (const element of document.body.children) {
    if (element === book || element.tagName === 'SCRIPT' || element.hasAttribute('inert')) continue
    element.setAttribute('inert', '')
    made.push(element)
  }
  return () => made.forEach((element) => element.removeAttribute('inert'))
}

const ARROW_BACK = (
  <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
    <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
const ARROW_ON = (
  <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
    <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

// One side of a spread in one layer: the record, a photo, or an empty page.
function Leaf({ work, item, layer }) {
  if (item === 'record') {
    return (
      <div className="bk__fig bk__fig--rec" data-layer={layer}>
        <div className="bk__rec">
          <p className="serif">{work.name}</p>
          <p className="small">{lineOf(work)}</p>
          <h3>За проекта</h3>
          <p>{work.description}</p>
          <h3>Особености</h3>
          <ul>
            {work.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        </div>
      </div>
    )
  }
  if (item == null) return <div className="bk__fig" data-layer={layer} aria-hidden="true" />
  const image = photoOf(work.photos[item])
  return (
    <figure className="bk__fig" data-layer={layer} data-photo={item} style={{ '--w': `${image.w}px`, '--h': `${image.h}px` }}>
      <ResponsivePicture image={image} alt={`${work.name}, снимка ${item + 1}`} sizes={PAGE_SIZES} eager className="bk__pic" />
    </figure>
  )
}

export default function Book({ work, at = 0, fromRect = null, fromSrc = null, onClose }) {
  const root = useRef(null)
  const strip = useRef(null)
  const titleId = useId()
  const motionNow = useMotionNow()
  const count = work.photos.length
  const [single, setSingle] = useState(isPhone)
  const spreads = useMemo(() => spreadsOf(count, single), [count, single])
  const spreadAt = (photo) => spreads.findIndex((spread) => spread.includes(photo))
  // The spreads on show, bottom to top, each by a photo of it: one, or two
  // while a page turns over another.
  const [layers, setLayers] = useState(() => [{ key: 0, photo: at }])
  const keys = useRef(0)
  const turning = useRef(null)
  const opening = useRef(null)
  // The plate in flight, while it flies.
  const flying = useRef(null)
  const closing = useRef(false)
  const top = layers[layers.length - 1]
  const current = spreadAt(top.photo)
  const shown = photosOf(spreads[current])
  useScrollLock()

  // A phone shows a photo a page, a desktop two: the book follows a turn of
  // the screen, the photo on show kept.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const list = window.matchMedia(PHONE)
    const change = () => {
      setSingle(list.matches)
      setLayers((now) => now.slice(-1))
    }
    list.addEventListener('change', change)
    return () => list.removeEventListener('change', change)
  }, [])

  // A turn under way ends where it would have.
  const endTurn = () => {
    const turn = turning.current
    if (!turn) return
    turning.current = null
    turn.timeline.kill()
    turn.gsap.set(turn.targets, { clearProps: 'clipPath,transform' })
  }

  const goTo = useCallback((index) => {
    const next = wrap(index, spreads.length)
    if (next === current) return
    const photo = photosOf(spreads[next])[0]
    const key = ++keys.current
    if (!motionNow()) {
      setLayers([{ key, photo }])
      return
    }
    endTurn()
    setLayers((now) => [now[now.length - 1], { key, photo }])
  }, [current, spreads, motionNow])
  const turn = useCallback((step) => goTo(current + step), [goTo, current])

  // The page turn, over the spread it covers, which goes once it has turned.
  useLayoutEffect(() => {
    if (layers.length < 2) return
    const motion = motionNow()
    const last = layers[layers.length - 1]
    if (!motion) {
      setLayers([last])
      return
    }
    const { gsap } = motion
    const leaves = [...root.current.querySelectorAll(`.bk__page > [data-layer="${last.key}"]`)]
    const pictures = leaves.flatMap((leaf) => [...leaf.querySelectorAll('img')])
    const timeline = gsap.timeline({
      onComplete: () => {
        turning.current = null
        setLayers((now) => (now[now.length - 1].key === last.key ? [last] : now))
      },
    })
    for (const leaf of leaves) {
      const from = single ? FROM_THE_TOP : FROM_THE_SEAM[leaf.parentElement.classList.contains('bk__page--l') ? 'l' : 'r']
      timeline.fromTo(leaf, { clipPath: from }, { clipPath: OPEN, duration: 0.95, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
    }
    if (pictures.length > 0) timeline.fromTo(pictures, { scale: 1.06 }, { scale: 1, duration: 1.3, ease: 'expo.out', clearProps: 'transform' }, 0.08)
    turning.current = { timeline, gsap, targets: [...leaves, ...pictures] }
    // A turn plays once, as its spread is laid over the last: the screen
    // turning, or the motion setting changing, meanwhile changes nothing (a
    // turn of the screen lays the spread on show alone, above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  // Closes, with the fade where motion plays (the plate too, should it still
  // be in flight), then hands over to the page.
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const motion = motionNow()
    if (!motion) {
      onClose()
      return
    }
    opening.current?.kill()
    motion.gsap.to([root.current, flying.current].filter(Boolean), { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: onClose })
  }, [motionNow, onClose])

  // The opening, before the book's first paint: the page behind made inert,
  // then the flight, or the fade, or nothing; then the focus moves in,
  // unless the keyboard has already taken it there.
  useLayoutEffect(() => {
    const book = root.current
    const giveBack = inertOthers(book)
    let alive = true
    let timer = 0
    let fly = null
    let target = null
    const focusIn = () => {
      if (!book.contains(document.activeElement)) book.querySelector('.bk__close')?.focus({ preventScroll: true })
    }
    const settle = (ms) => {
      clearTimeout(timer)
      if (ms > 0) timer = setTimeout(focusIn, ms)
      else focusIn()
    }
    const motion = motionNow()
    if (!motion) {
      settle(FOCUS_AT_ONCE_MS)
    } else {
      const { gsap } = motion
      gsap.set(book, { opacity: 0 })
      target = fromRect && fromSrc ? book.querySelector(`.bk__page figure[data-photo="${at}"] img`) : null
      // Flip, once it and the photo are ready, or null to fade in.
      const ready = () => Promise.all([loadFlip(), Promise.race([target.decode?.().catch(() => {}), wait(DECODE_WAIT_MS)])]).then(([Flip]) => Flip)
      const flipping = target ? Promise.race([ready(), wait(FLIP_WAIT_MS)]).catch(() => null) : Promise.resolve(null)
      flipping.then((Flip) => {
        // Closed meanwhile (it fades out, then goes): nothing opens.
        if (!alive || closing.current) return
        const landed = () => {
          if (target) target.style.visibility = ''
          fly?.remove()
          fly = null
          flying.current = null
          settle(0)
        }
        const timeline = gsap.timeline({ onComplete: landed })
        opening.current = timeline
        if (!Flip) {
          timeline.fromTo(book, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
          return
        }
        fly = document.createElement('div')
        fly.className = 'bk-fly'
        Object.assign(fly.style, {
          left: `${fromRect.left}px`,
          top: `${fromRect.top}px`,
          width: `${fromRect.width}px`,
          height: `${fromRect.height}px`,
          backgroundImage: `url("${fromSrc}")`,
        })
        document.body.appendChild(fly)
        flying.current = fly
        target.style.visibility = 'hidden'
        const facing = [...book.querySelectorAll('.bk__page > [data-layer]')].filter((leaf) => !leaf.contains(target))
        timeline
          .fromTo(book, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
          .fromTo([book.querySelector('.bk__bar'), book.querySelector('.bk__foot')], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.35)
          .fromTo(book.querySelector('.bk__seam'), { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'expo.out' }, 0.3)
          .set(target, { visibility: 'visible' }, 0.9)
          .set(fly, { opacity: 0 }, 0.92)
        if (facing.length > 0) {
          timeline.fromTo(
            facing,
            { clipPath: (_, leaf) => (single ? FROM_THE_TOP : FROM_THE_SEAM[leaf.parentElement.classList.contains('bk__page--l') ? 'l' : 'r']) },
            { clipPath: OPEN, duration: 0.95, ease: 'expo.inOut', clearProps: 'clipPath' },
            0.62,
          )
        }
        Flip.fit(fly, target, { duration: 0.9, ease: 'expo.inOut', scale: false })
        gsap.to(fly, { filter: TRUE_COLOUR, duration: 0.9, ease: 'expo.inOut' })
      })
    }
    return () => {
      alive = false
      clearTimeout(timer)
      opening.current?.kill()
      fly?.remove()
      flying.current = null
      if (target) target.style.visibility = ''
      giveBack()
    }
    // It opens once, as it mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keys, anywhere while it is open, from its first paint: a key pressed as
  // soon as the book shows already turns it.
  useLayoutEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'Tab') {
        trapTab(event, root.current)
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        turn(event.key === 'ArrowRight' ? 1 : -1)
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        goTo(event.key === 'Home' ? 0 : spreads.length - 1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close, turn, goTo, spreads.length])

  // The strip keeps the photos on show in view.
  useEffect(() => {
    const box = strip.current
    const thumb = box?.querySelector('[aria-current="true"]')
    if (!thumb || typeof box.scrollTo !== 'function') return
    const [shownBox, stripBox] = [thumb.getBoundingClientRect(), box.getBoundingClientRect()]
    if (shownBox.left >= stripBox.left && shownBox.right <= stripBox.right) return
    box.scrollTo({ left: thumb.offsetLeft - stripBox.width / 2 + shownBox.width / 2, behavior: motionNow() ? 'smooth' : 'auto' })
  }, [current, motionNow])

  const { handlers } = useSwipe(turn)
  const [first, second] = shown

  return createPortal(
    <div ref={root} className="bk" role="dialog" aria-modal="true" aria-labelledby={titleId} data-lenis-prevent="">
      <div className="bk__bar">
        <div className="bk__id">
          <h2 className="bk__title" id={titleId}>{work.name}</h2>
          <p className="bk__meta">{lineOf(work)}</p>
        </div>
        <p className="bk__n tab" aria-live="polite">
          {`${twoDigits(first + 1)}${second == null ? '' : `–${twoDigits(second + 1)}`}`} <span>/ {twoDigits(count)}</span>
        </p>
        <button type="button" className="bk__close" onClick={close}>
          <i aria-hidden="true" />
          Затвори
        </button>
      </div>
      <div className="bk__stage" {...handlers}>
        <div className="bk__page bk__page--l">
          {layers.map(({ key, photo }) => (
            <Leaf key={key} work={work} item={spreads[spreadAt(photo)][0]} layer={key} />
          ))}
        </div>
        <Seam className="bk__seam" />
        <div className="bk__page bk__page--r">
          {single ? null : layers.map(({ key, photo }) => (
            <Leaf key={key} work={work} item={spreads[spreadAt(photo)][1]} layer={key} />
          ))}
        </div>
      </div>
      <div className="bk__foot">
        <button type="button" className="bk__nav" aria-label="Предишни снимки" onClick={() => turn(-1)}>
          {ARROW_BACK}
        </button>
        <div ref={strip} className="bk__strip" role="group" aria-label="Всички снимки на обекта">
          {work.photos.map((id, i) => (
            <button
              key={id}
              type="button"
              aria-label={`Снимка ${i + 1} от ${count}`}
              aria-current={shown.includes(i) ? 'true' : undefined}
              onClick={() => goTo(spreadAt(i))}
            >
              <ResponsivePicture image={photoOf(id)} alt="" sizes="96px" className="bk__thumb" />
            </button>
          ))}
        </div>
        <button type="button" className="bk__nav" aria-label="Следващи снимки" onClick={() => turn(1)}>
          {ARROW_ON}
        </button>
      </div>
    </div>,
    document.body,
  )
}
