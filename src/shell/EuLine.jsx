import { Link } from 'react-router'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import images from '../data/images/shell.json'

// The EU co-funding line of project BG16RFPR001-1.012-1485-C01 (spec §6.3,
// §14.1): the co-funding lockup and the programme's logo on a light plate
// (#F7F4EE: their lettering is dark on a transparent ground), one line about
// the project and „За проекта“, which opens the page about it, with a 44 px
// hit box. The look is src/styles/shell.css's.
//
// - row: the header's 36 px top row, on every page, so it is seen on landing
//   without scrolling; logos 20 px tall. The text takes the room the logos
//   and „За проекта“ leave, and that box shows the full text when it holds it
//   through the project number, else the short text when that fits through
//   the number, else nothing; an ellipsis may end the rest of a text, never
//   the number. Both versions stay in the page and CSS shows one, which is
//   the one a screen reader reads.
// - footer: the full text beside 28 px logos.
// - menu: the short text beside 28 px logos.
//
// Spec §3.3: a non-breaking space after „№“ and after the one-letter words;
// the number never breaks at its hyphens.

const NUMBER = <span className="nb">№&nbsp;BG16RFPR001-1.012-1485-C01</span>

function FullText() {
  return (
    <>
      Проект „Дигитализация на предприятията“, {NUMBER}, по Програма „Конкурентоспособност и&nbsp;иновации в&nbsp;предприятията“ 2021-2027.
    </>
  )
}

function ShortText() {
  return <>Проект {NUMBER}, съфинансиран от ЕС.</>
}

// Each logo's width at the height its line sets it at: its `sizes`. The
// header's row loads its logos at once (`eager`): it shows them in every
// first viewport. The footer's and the menu's plates set them larger, which
// a high-DPR phone turns into the next files up, so theirs load only as they
// near the screen: the footer's far below the fold, the menu's as it opens.
const WIDTHS = {
  row: { emblem: '91px', programme: '73px' },
  plate: { emblem: '128px', programme: '102px' },
}

function Plate({ widths, eager }) {
  return (
    <span className="eu__plate">
      <ResponsivePicture image={images['eu-cofunded-bg']} alt="Съфинансирано от Европейския съюз" sizes={widths.emblem} eager={eager} />
      <ResponsivePicture
        image={images['eu-pkip']}
        alt="Програма „Конкурентоспособност и иновации в предприятията“"
        sizes={widths.programme}
        eager={eager}
      />
    </span>
  )
}

function More() {
  return (
    <Link to="/eu-proekt" prefetch="intent" className="hit">
      <span>За проекта</span>
    </Link>
  )
}

export default function EuLine({ variant = 'row' }) {
  if (variant === 'footer' || variant === 'menu') {
    // Whole class names, which Tailwind's content scan keeps
    // (src/styles/shell.css sits in its components layer).
    return (
      <div className={variant === 'footer' ? 'eu eu--footer' : 'eu eu--menu'}>
        <Plate widths={WIDTHS.plate} />
        <p>
          {variant === 'footer' ? <FullText /> : <ShortText />} <More />
        </p>
      </div>
    )
  }

  return (
    <div className="eu eu--row">
      <Plate widths={WIDTHS.row} eager />
      <p className="eu__text">
        <span className="eu__short">
          <ShortText />
        </span>
        <span className="eu__full">
          <FullText />
        </span>
      </p>
      <More />
    </div>
  )
}
