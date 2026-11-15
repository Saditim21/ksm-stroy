import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { grFree } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import grImages from '../../data/images/golden-residence.json'
import { plural } from '../../utils/format'

// The Golden Residence hero, #top (spec §6.14, §8.2; extract §4.17): the dusk
// render over the whole screen, the page's one H1, „Golden Residence“, the
// address, and two facts on either side of a seam: the 192 apartments in 2
// blocks, and the free ones now, live: `—` in the prerendered HTML and until
// the data arrives (RollingNumber), then the count, rolling once. Then the
// two actions: the apartments, in the explorer, and the inquiry on this
// page.
//
// The render and its framing are Home's Golden Residence half's (sizes 100vw,
// 50 % 62 %), at the same height, so the hero move from Home (spec §6.7)
// lands on this very frame. The entrance is gr.css's, all CSS from the first
// paint: the picture settles, the title's two words rise, the rest comes up
// after them; after the hero move the picture is already in place, and the
// rest starts sooner (spec §5.5).

// A non-breaking space inside „жк Левски Г“ and after a one-letter word
// (spec §3.3).
const ADDRESS = <>ул. Ген. Климент Бояджиев, жк&nbsp;Левски&nbsp;Г, София</>

// One word of the title: its mask, and the word that rises inside it.
function Word({ children }) {
  return (
    <span className="line-mask">
      <span className="split-line">{children}</span>
    </span>
  )
}

export default function GrHero() {
  const free = grFree(useAvailability())

  return (
    <section className="grhero" id="top" aria-labelledby="gr-h">
      <div className="grhero__media">
        <ResponsivePicture image={grImages['gr-dusk']} alt="Golden Residence по здрач, визуализация" sizes="100vw" priority />
      </div>
      <div className="grhero__in">
        <h1 className="grhero__title" id="gr-h">
          <Word>Golden</Word>{' '}
          <Word>
            <em>Residence</em>
          </Word>
        </h1>
        <p className="grhero__addr">{ADDRESS}</p>
        <div className="grhero__facts">
          <Seam />
          <p className="fact fact--l">
            <span className="num">{GR_FACTS.apartments}</span>{' '}
            <span>
              апартамента в&nbsp;{GR_FACTS.blocks}&nbsp;блока
            </span>
          </p>
          <p className="fact fact--r">
            <RollingNumber value={free} className="num" />{' '}
            <span>{plural(free, 'свободен', 'свободни')} в&nbsp;момента</span>
          </p>
        </div>
        <div className="grhero__actions">
          <Button href="#explorer" variant="solid">
            Изберете апартамент
          </Button>
          <Button href="#zapitvane">Запитване</Button>
        </div>
      </div>
    </section>
  )
}
