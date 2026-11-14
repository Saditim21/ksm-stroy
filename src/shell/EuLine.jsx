import { Link } from 'react-router'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import images from '../data/images/shell.json'

// The EU co-funding line of project BG16RFPR001-1.012-1485-C01 (spec §8.1,
// §14.1; the teammate's EuStrip, origin/vidimost-es): the co-funding lockup,
// the programme's logo, one line about the project and „За проекта“, which
// opens the page about it. The header carries it on every page, where it is
// seen on landing without scrolling; the mobile menu and the footer carry it
// on dusk.
//
// tone 'paper' is the header's strip, 36 px on paper. Its text keeps to one
// line and ends in an ellipsis where the room runs out; under 640 px it is
// the short version. On a phone narrower than 480 px not even the short line's
// first words fit beside the two logos, so the text gives way and the logos
// and „За проекта“ stay.
//
// tone 'dusk' sets both logos on a paper plate, because their lettering is
// dark on a transparent ground and would vanish on dusk, and lets the text
// wrap beside or under it.
//
// Spec §3.2: a non-breaking space after „№“ and after the one-letter words.
const TEXT = 'Проект „Дигитализация на предприятията“, №\u00a0BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и\u00a0иновации в\u00a0предприятията“ 2021-2027.'
const SHORT_TEXT = 'Проект №\u00a0BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.'

// The logos at a fixed height; `sizes` is the width that height gives each.
const LOGOS = {
  paper: { height: 'h-6', emblem: '109px', programme: '87px' },
  dusk: { height: 'h-[26px]', emblem: '119px', programme: '94px' },
}

function Logos({ tone }) {
  const { height, emblem, programme } = LOGOS[tone]
  return (
    <>
      <ResponsivePicture
        image={images['eu-cofunded-bg']}
        alt="Съфинансирано от Европейския съюз"
        sizes={emblem}
        className="shrink-0"
        imgClassName={`${height} w-auto`}
      />
      <ResponsivePicture
        image={images['eu-pkip']}
        alt="Програма „Конкурентоспособност и иновации в предприятията“"
        sizes={programme}
        className="shrink-0"
        imgClassName={`${height} w-auto`}
      />
    </>
  )
}

// The text, short under 640 px. The other version is display: none, so a
// screen reader reads one.
function Text() {
  return (
    <>
      <span className="sm:hidden">{SHORT_TEXT}</span>
      <span className="hidden sm:inline">{TEXT}</span>
    </>
  )
}

export default function EuLine({ tone = 'paper' }) {
  if (tone === 'dusk') {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-text text-[13px] leading-[1.45] text-paper/80">
        <span className="flex shrink-0 items-center gap-3.5 bg-paper px-3 py-2">
          <Logos tone="dusk" />
        </span>
        <p className="max-w-[46em]">
          <Text />{' '}
          <Link
            to="/eu-proekt"
            className="font-medium text-paper underline decoration-paper/50 decoration-1 underline-offset-[3px] hover:decoration-paper"
          >
            За проекта
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-paper font-text text-graphite">
      <div className="site-wrap flex h-[var(--eu-h)] items-center gap-3.5">
        <span className="flex shrink-0 items-center gap-2.5">
          <Logos tone="paper" />
        </span>
        <p className="hidden min-w-0 flex-1 truncate text-[12px] leading-tight min-[480px]:block">
          <Text />
        </p>
        <Link
          to="/eu-proekt"
          className="ml-auto flex h-full shrink-0 items-center text-[12.5px] font-medium text-ink underline decoration-gold-ink decoration-1 underline-offset-[3px] hover:decoration-2"
        >
          За проекта
        </Link>
      </div>
    </div>
  )
}
