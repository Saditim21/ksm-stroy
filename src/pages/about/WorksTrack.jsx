import { useRef } from 'react'
import { Link } from 'react-router'
import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import useMotion from '../../motion/useMotion'
import useReveals from '../../motion/useReveals'
import { WORKS } from './photos'

// What they built, #obekti (polish spec §4): Обекти's seven works, each a
// stack of three of its photographs, its name (a link to its record on
// Обекти, /blog#<id>) and its place and type, then „Всички обекти“.
//
// On a desktop, where motion runs, the section pins and its track slides
// sideways with the scroll; each stack fans out as it reaches the middle of
// the screen and gathers as it leaves. On a phone, and without motion, the
// works stand in a column, each stack fanned a little (about.css). The stacks
// are decoration: the names carry the words.

const PHONE = '(max-width: 900px)'
// The three photographs at rest, back to front: [rotation, x %, y %].
const REST = [[-7, -9, 5], [5, 8, -3], [-2, 0, 0]]
const SPREAD = [[-8, -16, -7], [6, 14, 5], [-1, 0, 0]]

export default function WorksTrack() {
  const ref = useRef(null)
  useReveals(ref)

  useMotion(ref, ({ gsap }) => {
    const root = ref.current
    const track = root?.querySelector('.trk__track')
    if (!track || window.matchMedia(PHONE).matches) return
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40)
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.trk__pin'), start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
    })
    for (const stack of root.querySelectorAll('.trk__stack')) {
      const photos = [...stack.children].reverse()
      gsap.timeline({ scrollTrigger: { trigger: stack, containerAnimation: slide, start: 'left 85%', end: 'right 15%', scrub: true } })
        .to(photos, { rotation: (k) => SPREAD[k][0], xPercent: (k) => SPREAD[k][1], yPercent: (k) => SPREAD[k][2], ease: 'sine.inOut', duration: 1 })
        .to(photos, { rotation: (k) => REST[k][0], xPercent: (k) => REST[k][1], yPercent: (k) => REST[k][2], ease: 'sine.inOut', duration: 1 })
    }
  })

  return (
    <section ref={ref} className="trk" id="obekti" aria-labelledby="trk-h">
      <div className="trk__pin">
        <div className="trk__head">
          <h2 className="h2" id="trk-h" data-split="">
            Какво сме <em>построили</em>
          </h2>
          <p className="trk__sub" data-fade="">Седем обекта от Созопол до Огняново</p>
        </div>
        <ol className="trk__track">
          {WORKS.map(({ id, name, meta, rough, photos }) => (
            <li key={id} className="trk__p">
              <div className="trk__stack" aria-hidden="true">
                {[...photos].reverse().map((image, i) => (
                  <div key={image.path} className="trk__ph" data-n={2 - i}>
                    <ResponsivePicture image={image} alt="" sizes="(max-width: 900px) 86vw, 34vw" />
                  </div>
                ))}
              </div>
              <h3 className="trk__n">
                <Link to={`/blog#${id}`} prefetch="intent">
                  {name}
                </Link>
                {rough ? (
                  <>
                    {' '}
                    <span className="trk__tag">груб строеж</span>
                  </>
                ) : null}
              </h3>
              <p className="trk__m">{meta}</p>
            </li>
          ))}
          <li className="trk__end">
            <p>И&nbsp;още обекти в&nbsp;портфолиото ни.</p>
            <Button to="/blog">Всички обекти</Button>
          </li>
        </ol>
      </div>
    </section>
  )
}
