import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useMotion from '../../motion/useMotion'
import useMotionNow from '../../motion/useMotionNow'
import useReveals from '../../motion/useReveals'
import ResponsivePicture from '../ui/ResponsivePicture'
import Seam from '../ui/Seam'
import './spreads.css'

// A gallery of spreads (Diptych spec §6.17; M3 §4.4, §6.2 #5; extract
// §4.28): two pictures at a time, one in each half of the stage, either side
// of the seam. Under the stage the spread's caption, in a live region,
// against the seam, and after it ← and → and the counter. The arrow keys
// turn the spreads anywhere in the section. The stage is a group named
// `label`, described as a gallery. Golden Residence's renders
// (GallerySection.jsx) and Многофамилна's photos and drawings
// (MnGallery.jsx) show through it.
//
//   Spreads({ id, headingId, heading, lead?, label, spreads })
//   spread = { left: half, right: half, caption, whole? }
//   half = { image, alt?, photo?, caption? }
// - `id` is the section's, `headingId` its heading's; `heading` and `lead`
//   are the hinge's words, `label` the stage's name.
// - A spread's `caption` is what its live caption says; a half's `image` is
//   its picture (a manifest entry), `alt` its text (none: the caption says
//   what the pictures show), `photo` the class that frames it.
// - A `whole` spread shows drawings: each whole on the umber, never
//   cropped, under its own title, its half's `caption` (spreads.css).
//
// With motion each new spread opens outward from the seam over the one on
// show, 1 s expo.inOut, settling from 1.08 (gr.js:229-269); on a phone both
// open from the top, the lower one 0.1 s later. As in the concept, which
// adds a layer for every change, a quick change opens over a spread still
// opening, and a spread chosen again before its pictures have left the stage
// opens as a fresh layer over everything, so the stage never shows through.
// Without motion the spread changes at once. Every spread's pictures are in
// the stage from the start, hidden but for those on show, so a change never
// waits for a download. The stage's halves open from the seam once, as it
// comes into view.

const SIZES = '(max-width: 900px) 100vw, 50vw'
const PHONE = '(max-width: 900px)'
const pad = (n) => String(n).padStart(2, '0')

// The spreads on show, bottom to top, one show per change:
// { spread, key, own, wipe }.
// - key: the show's own number, never reused.
// - own: the show uses its spread's layers, in the stage from the start. A
//   spread chosen again while an earlier show of it still holds those (under
//   an opening) gets layers of its own over the stack, made for the show and
//   gone with it.
// - wipe: the show opens; the first, and a change made at once, do not.
const FIRST_SHOW = [{ spread: 0, key: 0, own: true, wipe: false }]

// Stops the openings under way and takes off what they left on the layers,
// for a change made at once.
function clearWipes(root, wipes) {
  wipes.forEach((wipe) => wipe.kill())
  wipes.clear()
  root?.querySelectorAll('.gal__img').forEach((layer) => {
    layer.style.clipPath = ''
    const picture = layer.querySelector('img')
    if (picture) picture.style.transform = ''
  })
}

// Opens a spread's two layers outward from the seam, or from the top on a
// phone (gr.js:257-261).
function openSpread(gsap, [left, right], onComplete) {
  const phone = window.matchMedia(PHONE).matches
  const pictures = [left, right].map((layer) => layer.querySelector('img')).filter(Boolean)
  return gsap
    .timeline({ onComplete })
    .fromTo(left, { clipPath: phone ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' }, 0)
    .fromTo(right, { clipPath: phone ? 'inset(0% 0% 100% 0%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' }, phone ? 0.1 : 0)
    .fromTo(pictures, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0.1)
}

export default function Spreads({ id, headingId, heading, lead, label, spreads }) {
  const ref = useRef(null)
  useReveals(ref)
  const motionNow = useMotionNow()
  const [shows, setShows] = useState(FIRST_SHOW)
  const current = shows[shows.length - 1].spread
  // The last show's key; the openings under way, by show; the shows whose
  // opening has started.
  const lastKey = useRef(0)
  const wipes = useRef(new Map())
  const started = useRef(new Set())

  // The spread `step` away from the one on show, round from the last to the
  // first; from the latest state, so two quick clicks turn two spreads.
  function turn(step) {
    const key = ++lastKey.current
    const next = (stack) => (stack[stack.length - 1].spread + step + spreads.length) % spreads.length
    if (!motionNow()) {
      clearWipes(ref.current, wipes.current)
      setShows((stack) => [{ spread: next(stack), key, own: true, wipe: false }])
      return
    }
    setShows((stack) => {
      const spread = next(stack)
      const own = !stack.some((show) => show.own && show.spread === spread)
      return [...stack, { spread, key, own, wipe: true }]
    })
  }

  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowRight') turn(1)
    else if (event.key === 'ArrowLeft') turn(-1)
  }

  // Once a render has put a new show's layers on the stack, its opening
  // starts, before the browser paints them in full.
  useLayoutEffect(() => {
    const onStack = new Set(shows.map((show) => show.key))
    // A show that has left the stack has no opening left to run.
    for (const [key, wipe] of wipes.current) {
      if (onStack.has(key)) continue
      wipe.kill()
      wipes.current.delete(key)
    }
    for (const key of started.current) if (!onStack.has(key)) started.current.delete(key)

    const pending = shows.filter((show) => show.wipe && !started.current.has(show.key))
    if (pending.length === 0) return
    const motion = motionNow()
    for (const { key } of pending) {
      started.current.add(key)
      const layers = [...(ref.current?.querySelectorAll(`.gal__img[data-show="${key}"]`) ?? [])]
      if (!motion || layers.length !== 2) {
        // Motion went between the change and its render: the spread
        // changes at once.
        clearWipes(ref.current, wipes.current)
        const settled = ++lastKey.current
        setShows((stack) => [{ spread: stack[stack.length - 1].spread, key: settled, own: true, wipe: false }])
        return
      }
      const { gsap } = motion
      const wipe = openSpread(gsap, layers, () => {
        wipes.current.delete(key)
        gsap.set(layers, { clearProps: 'clipPath' })
        gsap.set(layers.map((layer) => layer.querySelector('img')).filter(Boolean), { clearProps: 'transform' })
        // The shows it has opened over go; any made after it stay.
        setShows((stack) => {
          const at = stack.findIndex((show) => show.key === key)
          return at > 0 ? stack.slice(at) : stack
        })
      })
      wipes.current.set(key, wipe)
    }
  }, [shows, motionNow])

  useEffect(() => {
    const running = wipes.current
    return () => {
      running.forEach((wipe) => wipe.kill())
      running.clear()
    }
  }, [])

  // The stage's halves open from the seam once, as it comes into view
  // (gr.js:267); on a phone, stacked, from the top. A stage already on
  // screen stays as it is.
  useMotion(ref, ({ gsap }) => {
    const stage = ref.current?.querySelector('.gal__stage')
    if (!stage || stage.getBoundingClientRect().top < window.innerHeight) return
    const phone = window.matchMedia(PHONE).matches
    gsap.from(stage.querySelectorAll('.gal__half'), {
      clipPath: (i) => (phone ? 'inset(0% 0% 100% 0%)' : i ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)'),
      duration: 1.2,
      ease: 'expo.inOut',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: stage, start: 'top 80%', once: true },
    })
  })

  // One layer of a half: a spread's own, or a show's. A show's own layer
  // loads its picture at once rather than lazily: the file is the one its
  // spread's layer has loaded already. A drawing's layer is a plate, its
  // title over it.
  const layer = (side, spread, show, depth, key) => {
    const { whole } = spreads[spread]
    const { image, alt = '', photo, caption } = spreads[spread][side]
    return (
      <div
        key={key}
        className={whole ? 'gal__img gal__img--whole' : 'gal__img'}
        data-spread={spread}
        data-show={show ? show.key : undefined}
        data-shown={show ? '' : undefined}
        style={show ? { zIndex: depth + 1 } : undefined}
      >
        {caption ? <p className="gal__title">{caption}</p> : null}
        <ResponsivePicture image={image} alt={alt} sizes={SIZES} imgClassName={photo} eager={Boolean(show && !show.own)} />
      </div>
    )
  }
  const half = (side) => (
    <div className={`gal__half gal__half--${side === 'left' ? 'l' : 'r'}`}>
      {spreads.map((_, spread) => {
        const depth = shows.findIndex((show) => show.own && show.spread === spread)
        return layer(side, spread, shows[depth], depth, `spread-${spread}`)
      })}
      {shows.map((show, depth) => (show.own ? null : layer(side, show.spread, show, depth, `show-${show.key}`)))}
    </div>
  )

  return (
    <section ref={ref} className="sec gal" id={id} aria-labelledby={headingId} onKeyDown={onKeyDown}>
      <div className="hinge">
        <h2 className="h2" id={headingId} data-split="">
          {heading}
        </h2>
        {lead ? (
          <p className="lead" data-fade="">
            {lead}
          </p>
        ) : null}
        <Seam draw />
      </div>
      <div className="gal__stage" role="group" aria-roledescription="галерия" aria-label={label}>
        {half('left')}
        {half('right')}
        <Seam />
      </div>
      <div className="gal__bar">
        <p className="gal__cap" aria-live="polite">
          {spreads[current].caption}
        </p>
        <div className="gal__ctl">
          <button type="button" aria-label="Предишни" onClick={() => turn(-1)}>
            <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
              <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <p className="gal__n">
            {pad(current + 1)} <span>/ {pad(spreads.length)}</span>
          </p>
          <button type="button" aria-label="Следващи" onClick={() => turn(1)}>
            <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
              <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <Seam />
      </div>
    </section>
  )
}
