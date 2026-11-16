import { presetInquiry } from '../../components/inquiry/inquiryStore'
import Button from '../../components/ui/Button'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import { FacadeCaption } from '../../explorer/ExplorerSection'
import Facade from '../../explorer/Facade'
import useExplorer from '../../explorer/useExplorer'
import { bindAddress, plural } from '../../utils/format'

// Многофамилна's opening, #explorer (spec M3 §6.2 #1, §6.3; the concept's
// mnogofamilna.html:66-84): the explorer itself. The building is a diptych of
// its own, two blocks either side of a courtyard, and the seam runs down
// that courtyard, through the name and the facade.
// - The H1 reads across the seam, „Многофамилна | жилищна *сграда*“, each
//   part in a mask of its own, authored by hand, as Home's slogan is (spec
//   M3 §4.2): never split by script above the fold.
// - Under it, the УПИ address, the facts, „144 апартамента в 2 блока“ |
//   „16 свободни по данни към 01.12.2025“ (the model's, from the dated
//   snapshot, in the prerendered HTML: never `—`, never a zero; the date
//   goes only with live rows, whose count then rolls in, M3 §5), and the two
//   ways on: „Запитване“, which presets Многофамилна and glides to the form,
//   and „По критерии“, which glides to the list (#spisak), its section
//   loading it as the glide focuses it (MnList.jsx).
// - Then the night facade (Facade.jsx with Многофамилна's project: its lit
//   floors, crops and fades are projects/mn.js's and mn-facade.css's), its
//   caption saying what lights, as of when, then what the explorer's facade
//   says everywhere: what its rails count and how to open a floor, in a
//   desktop's words and a phone's (FacadeCaption, ExplorerSection.jsx).
//
// The entrance is mn.css's and mn-facade.css's, all CSS from the first
// paint: the name rises across the seam, the rest comes up after it, the
// render settles and the lit floors switch on, bottom to top.

// A no-break space binds what an address keeps together (bindAddress).
const ADDRESS = bindAddress('УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София')

// One part of the title: its mask, and the line that rises inside it.
function Part({ side, children }) {
  return (
    <span className={`line-mask mnx__${side}`}>
      <span className="split-line">{children}</span>
    </span>
  )
}

// „Запитване“ (spec §5.3): a plain left click presets the inquiry with the
// building, which glides the page there (inquiryStore.js), and takes the
// jump from the browser and the router, so the address stays as it was. A
// click that opens a tab or a window, and the page without its script,
// follow the link to #zapitvane.
function toInquiry(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  presetInquiry({ option: 'mnogofamilna' })
}

export default function MnHero() {
  const { project, model, dated, openFloor, railFocus, railFocused } = useExplorer()
  const free = model ? model.totals.available : null
  const lit = dated ? `, по данни към ${dated}` : ''
  const caption = () => (
    <>
      Светят етажите със свободни апартаменти{lit}. <FacadeCaption />
    </>
  )

  return (
    <section className="mnx" id="explorer" aria-labelledby="mn-h">
      <div className="mnx__head">
        <Seam />
        <h1 className="mnx__h1" id="mn-h">
          <Part side="l">Многофамилна</Part>{' '}
          <Part side="r">
            жилищна <em>сграда</em>
          </Part>
        </h1>
        <p className="mnx__addr">{ADDRESS}</p>
        <div className="mnx__facts">
          <p className="mnx__fact mnx__fact--l">
            <span className="num">{project.total}</span>{' '}
            <span>
              апартамента в&nbsp;{MN_FACTS.blocks}&nbsp;блока
            </span>
          </p>
          <p className="mnx__fact mnx__fact--r">
            <RollingNumber value={free} className="num" />{' '}
            <span>
              {plural(free, 'свободен', 'свободни')} {dated ? `по данни към ${dated}` : 'в момента'}
            </span>
          </p>
        </div>
        <div className="mnx__actions">
          <Button href="#zapitvane" variant="solid" onClick={toInquiry}>
            Запитване
          </Button>
          <Button href="#spisak">По критерии</Button>
        </div>
      </div>
      <div className="mnx__facade">
        <Facade
          project={project}
          model={model}
          mode="full"
          focusRail={railFocus}
          onOpenFloor={openFloor}
          onRailFocused={railFocused}
          caption={caption}
        />
      </div>
    </section>
  )
}
