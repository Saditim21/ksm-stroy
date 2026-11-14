import { Link } from 'react-router'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import images from '../data/images/shell.json'

// The EU co-funding line of project BG16RFPR001-1.012-1485-C01 (spec §8.1,
// §14.1; the teammate's EuStrip, origin/vidimost-es): the co-funding lockup,
// the programme's logo, one line about the project and „За проекта“, which
// opens the page about it. The header carries it on every page, where it is
// seen on landing without scrolling; the mobile menu and the footer carry it
// on umber.
//
// tone 'paper' is the header's strip, on onyx (src/index.css, .eu-line). From
// 640 px it is one 36 px row, and its text box, the room the logos and
// „За проекта“ leave, shows the longest version of the text whose project
// number fits there whole, with an ellipsis for the rest: the short text on a
// tablet, the full one on a desktop. Under 640 px the logos and „За проекта“
// keep the 36 px row and the short text takes a second row, whole, in two
// lines. The number never shows cut, and never breaks at its hyphens.
//
// tone 'dusk' lets the text wrap beside or under the logos, the short version
// under 640 px.
//
// Both set the logos on the light plate (#F7F4EE, spec §6.3): their lettering
// is dark on a transparent ground and would vanish on the dark grounds.
//
// Spec §3.2: a non-breaking space after „№“ and after the one-letter words.

const NUMBER = <span className="whitespace-nowrap">№&nbsp;BG16RFPR001-1.012-1485-C01</span>

function FullText() {
  return (
    <>
      Проект „Дигитализация на предприятията“, {NUMBER}, по Програма „Конкурентоспособност и&nbsp;иновации в&nbsp;предприятията“ 2021-2027.
    </>
  )
}

// In two spans, which are its two lines in the header under 640 px.
function ShortText() {
  return (
    <>
      <span>Проект {NUMBER},</span> <span>съфинансиран от ЕС.</span>
    </>
  )
}

// The logos at a fixed height; `sizes` is the width that height gives each.
// They load at once (`eager`): the header shows them in every first viewport.
// The menu and the footer ask for the same files, which have loaded by then.
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
        eager
        className="shrink-0"
        imgClassName={`${height} w-auto`}
      />
      <ResponsivePicture
        image={images['eu-pkip']}
        alt="Програма „Конкурентоспособност и иновации в предприятията“"
        sizes={programme}
        eager
        className="shrink-0"
        imgClassName={`${height} w-auto`}
      />
    </>
  )
}

// The text in the menu and the footer, short under 640 px. The other version
// is display: none, so a screen reader reads one.
function Text() {
  return (
    <>
      <span className="sm:hidden">
        <ShortText />
      </span>
      <span className="hidden sm:inline">
        <FullText />
      </span>
    </>
  )
}

export default function EuLine({ tone = 'paper' }) {
  if (tone === 'dusk') {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-text text-[13px] leading-[1.45] text-ivory/80">
        <span className="flex shrink-0 items-center gap-3.5 bg-[#F7F4EE] px-3 py-2">
          <Logos tone="dusk" />
        </span>
        <p className="max-w-[46em]">
          <Text />{' '}
          <Link
            to="/eu-proekt"
            className="font-medium text-ivory underline decoration-brass decoration-1 underline-offset-[3px] hover:decoration-brass-l"
          >
            За проекта
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-onyx font-text text-stone">
      <div className="eu-line site-wrap">
        <span className="eu-line-logos flex items-center gap-2.5 bg-[#F7F4EE] px-2 py-1">
          <Logos tone="paper" />
        </span>
        {/* Both versions stay in the page; CSS shows one (src/index.css), and
            a screen reader reads that one. */}
        <p className="eu-line-text text-[12px] leading-tight">
          <span className="eu-line-short">
            <ShortText />
          </span>
          <span className="eu-line-full">
            <FullText />
          </span>
        </p>
        <Link
          to="/eu-proekt"
          className="eu-line-more flex h-full items-center text-[12.5px] font-medium text-ivory underline decoration-brass decoration-1 underline-offset-[3px] hover:decoration-2"
        >
          За проекта
        </Link>
      </div>
    </div>
  )
}
