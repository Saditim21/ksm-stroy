import { useRef } from 'react'
import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'
import useWipes from '../../motion/useWipes'
import { PHOTOS } from './photos'

// #rabota, the call to action (spec M3/M4 §7.4; the concept's
// za-nas.html:243-255): production's heading and lead (About.jsx:846-875) on
// the left, with its two ways, „Свържете се с нас“ (solid) to Контакти and
// „Разгледайте проектите“ (outline) to Обекти; on the right, the legacy
// slider's first photo (slider01), opening from the seam.
//
// The heading rises line by line, the copy fades up and the seam draws as
// they come into view (useReveals); the photo opens from the seam
// (useWipes). The markup is the final state.

// The photo covers its half, as tall as the section (about.css): its height
// crops it at the sides, to about 80 % of the screen's width on a desktop
// (1,107 px at 1440 × 900) and beyond the screen on a phone, where it
// stands 4:3.
const SIZES = '(max-width: 900px) 115vw, 80vw'

export default function Work() {
  const ref = useRef(null)
  useReveals(ref)
  useWipes(ref)

  return (
    <section ref={ref} className="cta" id="rabota" aria-labelledby="cta-h">
      <Seam draw />
      <div className="cta__l">
        <h2 className="h2" id="cta-h" data-split="">
          Готови сте да работите с&nbsp;<em>нас</em>?
        </h2>
        <p className="lead" data-fade="">
          Свържете се с&nbsp;нашия екип за консултация и&nbsp;да обсъдим как можем да реализираме вашия&nbsp;проект.
        </p>
        <div className="cta__acts" data-fade="">
          <Button to="/contact" variant="solid">
            Свържете се с&nbsp;нас
          </Button>
          <Button to="/blog">Разгледайте проектите</Button>
        </div>
      </div>
      <figure className="cta__ph" data-wipe="r">
        <ResponsivePicture image={PHOTOS.finished} alt="KSM Stroy строителни проекти" sizes={SIZES} className="grade" />
      </figure>
    </section>
  )
}
