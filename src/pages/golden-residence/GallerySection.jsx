import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import grImages from '../../data/images/golden-residence.json'
import useMotion from '../../motion/useMotion'
import useMotionNow from '../../motion/useMotionNow'
import useReveals from '../../motion/useReveals'

// „Golden Residence отблизо“, #galeriya (spec §6.17, §8.2; extract §4.28):
// three spreads of two renders, one in each half of the stage, either side
// of the seam. Under the stage the caption, in a live region, against the
// seam, and after it ← and → and the counter. The arrow keys turn the
// spreads anywhere in the section. The stage is a group named
// „Визуализации“, described as a gallery; its renders are decoration, the
// caption says what they show.
//
// With motion each new spread opens outward from the seam over the one on
// show, 1 s expo.inOut, settling from 1.08 (gr.js:229-269); on a phone both
// open from the top, the lower one 0.1 s later. As in the concept, which
// adds a layer for every change, a quick change opens over a spread still
// opening, and a spread chosen again before its renders have left the stage
// opens as a fresh layer over everything, so the stage never shows through.
// Without motion the spread changes at once. Every spread's renders are in
// the stage from the start, hidden but for those on show, so a change never
// waits for a download. The stage's halves open from the seam once, as it
// comes into view.

const SPREADS = [
  {
    left: { image: grImages['gr-corner'], photo: 'gal__photo--corner' },
    right: { image: grImages['gr-facade-detail'] },
    caption: <>Изчистени линии и&nbsp;фасада с&nbsp;бронзови рамки около просторните остъклени тераси.</>,
  },
  {
    left: { image: grImages['gr-end-towers'], photo: 'gal__photo--towers' },
    right: { image: grImages['gr-parking'], photo: 'gal__photo--parking' },
    caption: <>Двата блока откъм двора и&nbsp;паркинга: по осем жилищни етажа, по 12 апартамента на етаж.</>,
  },
  {
    left: { image: grImages['gr-long-facade'], photo: 'gal__photo--facade' },
    right: { image: grImages['gr-dusk'], photo: 'gal__photo--dusk' },
    caption: <>Golden Residence през деня и&nbsp;по здрач.</>,
  },
]

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

export default function GallerySection() {
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
    const next = (stack) => (stack[stack.length - 1].spread + step + SPREADS.length) % SPREADS.length
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
  // spread's layer has loaded already.
  const layer = (side, spread, show, depth, key) => {
    const { image, photo } = SPREADS[spread][side]
    return (
      <div
        key={key}
        className="gal__img"
        data-spread={spread}
        data-show={show ? show.key : undefined}
        data-shown={show ? '' : undefined}
        style={show ? { zIndex: depth + 1 } : undefined}
      >
        <ResponsivePicture image={image} alt="" sizes={SIZES} imgClassName={photo} eager={Boolean(show && !show.own)} />
      </div>
    )
  }
  const half = (side) => (
    <div className={`gal__half gal__half--${side === 'left' ? 'l' : 'r'}`}>
      {SPREADS.map((_, spread) => {
        const depth = shows.findIndex((show) => show.own && show.spread === spread)
        return layer(side, spread, shows[depth], depth, `spread-${spread}`)
      })}
      {shows.map((show, depth) => (show.own ? null : layer(side, show.spread, show, depth, `show-${show.key}`)))}
    </div>
  )

  return (
    <section ref={ref} className="sec gal" id="galeriya" aria-labelledby="gal-h" onKeyDown={onKeyDown}>
      <div className="hinge">
        <h2 className="h2" id="gal-h" data-split="">
          Golden Residence <em>отблизо</em>
        </h2>
        <p className="lead" data-fade="">
          Визуализации на сградата, фасадата и&nbsp;двора.
        </p>
        <Seam draw />
      </div>
      <div className="gal__stage" role="group" aria-roledescription="галерия" aria-label="Визуализации">
        {half('left')}
        {half('right')}
        <Seam />
      </div>
      <div className="gal__bar">
        <p className="gal__cap" aria-live="polite">
          {SPREADS[current].caption}
        </p>
        <div className="gal__ctl">
          <button type="button" aria-label="Предишни" onClick={() => turn(-1)}>
            <svg viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
              <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <p className="gal__n">
            {pad(current + 1)} <span>/ {pad(SPREADS.length)}</span>
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
