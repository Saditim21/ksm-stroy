import { useRef, useState } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import useMotion from '../../motion/useMotion'
import { PHOTOS, WALL, WALL_CENTRE } from './photos'

// За нас's opening, #top, the page's one moment (polish spec §4; the concept
// design/2026-11-19-polish-concepts/ab-a.html): thirty-five of the company's
// own photographs as a wall larger than the screen, darkened, the motto over
// it, „Добрата работа –“ over „реклама за майстора“, and the company in a
// line. On a photograph, so dark in both themes.
//
// The wall comes up from its centre out and the motto rises (about.css, CSS
// from the first paint, under the motion gate). Then the scroll, pinned and
// scrubbed, zooms the wall about its centre tile, Хотел Парадайс from the air,
// until that tile covers the screen: the others fade, the motto's lines part
// to either side, the full-size photograph takes over from the tile, and its
// name and a line about the company arrive. Under reduced motion, or before
// the engine loads, it is the wall and the motto: nothing pins, and what only
// the zoom shows is not there (about.css).
//
// The wall is decoration, hidden from assistive technology; the H1 is the
// page's, and the story below carries the words.

// The tiles' widths on the screen (about.css: 7 across 152vw, 5 across 190vw
// on a phone), every one at the lowest priority, after the page's code; the
// centre's larger, as the zoom brings it up before the full photograph.
const TILE_SIZES = '(max-width: 900px) 37vw, 21vw'
const CENTRE_SIZES = '(max-width: 900px) 60vw, 33vw'

// A tile's distance from the centre in steps, for the opening's stagger
// (about.css: --d); the grid is 7 × 5 (5 × 7 on a phone, the same count).
const distance = (i) => Math.hypot((i % 7) - 3, Math.floor(i / 7) - 2)

export default function Wall() {
  const ref = useRef(null)
  // The full-size photograph the zoom ends on: in the page only once the
  // reader scrolls into the zoom, so it costs the page's first load nothing
  // (its LCP), and never covers the wall where the zoom cannot run (reduced
  // motion, no engine).
  const [full, setFull] = useState(false)

  useMotion(ref, ({ gsap }) => {
    const root = ref.current
    const pin = root?.querySelector('.wl__pin')
    const grid = root?.querySelector('.wl__grid')
    const centre = root?.querySelector('.wl__t--c')
    if (!pin || !grid || !centre) return
    // The other tiles' photographs, which the zoom fades: the tiles themselves
    // belong to the opening's CSS (about.css), whose animation would outrank
    // an inline opacity while it runs.
    const others = [...grid.children].filter((tile) => tile !== centre).map((tile) => tile.querySelector('img')).filter(Boolean)
    // The scale at which the centre tile covers the screen, from its laid-out
    // size (offsetWidth: a transform never changes it), a little past.
    const cover = () => Math.max(window.innerWidth / centre.offsetWidth, window.innerHeight / centre.offsetHeight) * 1.02
    // The grid's centring as GSAP keeps it (about.css sets the same), so the
    // zoom's scale never turns it into pixels that a resize would leave wrong:
    // GSAP reads the stylesheet's translate(-50%, -50%) as pixels, so those go
    // to 0 as the percentages take over.
    gsap.set(grid, { x: 0, y: 0, xPercent: -50, yPercent: -50 })

    gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${window.innerHeight * 1.9}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        // The zoom needs the full photograph only near its end (0.86 below);
        // at the top, before any scroll, its progress is a hair above 0.
        onUpdate: (self) => {
          if (self.progress > 0.01) setFull(true)
        },
      },
    })
      .to(grid, { scale: cover, ease: 'power2.in', duration: 1 }, 0)
      // From 1, never from what the opening shows now: the setup may run while
      // the tiles, the line and the hint are still coming up (about.css), and
      // a tween that read their opacity then would keep them hidden.
      .fromTo(others, { opacity: 1 }, { opacity: 0, ease: 'power1.in', duration: 0.75, immediateRender: false }, 0.05)
      .to(root.querySelector('.wl__veil'), { opacity: 0, duration: 0.6 }, 0.2)
      .to(root.querySelector('.wl__l'), { xPercent: -60, opacity: 0, ease: 'power2.in', duration: 0.55 }, 0)
      .to(root.querySelector('.wl__r'), { xPercent: 60, opacity: 0, ease: 'power2.in', duration: 0.55 }, 0)
      .fromTo([root.querySelector('.wl__sub'), root.querySelector('.wl__hint')], { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, 0)
      .to(root.querySelector('.wl__full'), { opacity: 1, duration: 0.18 }, 0.86)
      .fromTo(root.querySelector('.wl__after'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 1)
      .to({}, { duration: 0.25 })
  })

  return (
    <section ref={ref} className="wl dark" id="top" aria-labelledby="about-h">
      <div className="wl__pin">
        <div className="wl__grid" aria-hidden="true">
          {WALL.map((image, i) => (
            <div key={image.path} className={i === WALL_CENTRE ? 'wl__t wl__t--c' : 'wl__t'} style={{ '--d': distance(i).toFixed(2) }}>
              <ResponsivePicture image={image} alt="" sizes={i === WALL_CENTRE ? CENTRE_SIZES : TILE_SIZES} fetchPriority="low" />
            </div>
          ))}
        </div>
        <div className="wl__full" aria-hidden="true">
          {full ? <ResponsivePicture image={PHOTOS.aerial} alt="" sizes="100vw" /> : null}
        </div>
        <div className="wl__veil" aria-hidden="true" />
        <div className="wl__text">
          <h1 className="wl__h1" id="about-h">
            <span className="wl__l">
              <span>Добрата работа –</span>
            </span>{' '}
            <span className="wl__r">
              <span>реклама за майстора</span>
            </span>
          </h1>
          <p className="wl__sub">КСМ Строй ООД, строителна компания от&nbsp;2008&nbsp;г.</p>
        </div>
        <div className="wl__after" aria-hidden="true">
          <p className="wl__cap">Хотел Парадайс, с.&nbsp;Огняново</p>
          <p className="wl__line">Строим жилищни, обществени и&nbsp;индустриални сгради – от изкопа до последния детайл.</p>
        </div>
        <p className="wl__hint" aria-hidden="true">
          <i />
          Превъртете
        </p>
      </div>
    </section>
  )
}
