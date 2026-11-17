import { useRef } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'
import useWipes from '../../motion/useWipes'
import { PHOTOS } from './photos'

// #opit, the figures (spec M3/M4 §7.4, §2; the concept's za-nas.html:171-188):
// the legacy hero's two ingredients, its slider and its counters, kept and
// calmed, mid-page. Two aerial photos meet on the seam, slider02 and the
// legacy Hotel Paradise card's, both decorative; the four legacy figures
// (About.jsx:67-72) sit at their foot, two per half, as plain serif text with
// lowercase labels: they never count up (QUESTIONS.md asks the client to
// confirm them).
//
// The figures fade up and the seam draws as the band comes into view
// (useReveals); the photos open from the seam (useWipes). The markup is the
// final state.

// Each photo covers its half of the band (about.css), whose height crops it
// at the sides: about 65 % of the screen wide on a desktop (936 px for the
// aerial view at 1440 × 900), and nearly the whole screen on a phone, where
// the halves stand 3:4.
const SIZES = '(max-width: 900px) 90vw, 65vw'

const FIGURES = [
  [['15+', 'години опит'], ['200+', 'завършени проекта']],
  [['50+', 'доволни клиенти'], ['100\u00a0%', 'качество и\u00a0гаранция']],
]

export default function Figures() {
  const ref = useRef(null)
  useReveals(ref)
  useWipes(ref)

  return (
    <div ref={ref} className="band" id="opit">
      <div className="band__ph band__ph--l" data-wipe="l">
        <ResponsivePicture image={PHOTOS.aerial} alt="" sizes={SIZES} className="grade" />
      </div>
      <div className="band__ph band__ph--r" data-wipe="r">
        <ResponsivePicture image={PHOTOS.hotel} alt="" sizes={SIZES} className="grade" />
      </div>
      <Seam draw />
      <div className="band__facts">
        {FIGURES.map((half, i) => (
          <dl key={half[0][0]} className={`band__half band__half--${i ? 'r' : 'l'}`}>
            {half.map(([figure, label]) => (
              <div key={figure} className="fig" data-fade="">
                <dt>{figure}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </div>
  )
}
