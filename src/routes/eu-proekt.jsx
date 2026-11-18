import { useEffect, useRef } from 'react'
import Button from '../components/ui/Button'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import Seam from '../components/ui/Seam'
import images from '../data/images/shell.json'
import useMotionAllowed from '../hooks/useMotionAllowed'
import useReveals from '../motion/useReveals'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/eu/eu.css'

// The page about the EU project, /eu-proekt (spec M3/M4 §7.5; the concept's
// eu-proekt.html), which the EU line on every page links to: a document,
// quiet, with one moment, in three parts.
// 1. #top, the seal on the fold: the co-funding plate sits on the seam, the
//    one thing on the site that crosses it; under it the title ends at the
//    seam and the statement starts after it.
// 2. #byudzhet, the page's moment: the page's width is the total budget, and
//    the seam moves from the centre to where the EU's grant ends.
// 3. #plakat: the poster's download and the disclaimer, across the seam.
// Every statement the EU visibility rules and the contract
// (tests/contracts/eu-visibility.test.jsx) need is the teammate's text, word
// for word (origin/vidimost-es src/pages/EuProekt.jsx): the emblem with
// „Съфинансирано от Европейския съюз“, the project's name and number, the
// programme, the fund, the aim, the budget, the dates, the poster and the
// disclaimer; each budget line is one run of text, and the poster has one
// link. Home's EU section, with the poster's picture, is not repeated here.
// A no-break space after „№“ and every one-letter word, and inside the
// amounts and the company's name (spec §4.5).

// The teammate's head; its share image is the site's (ruling M4-PF6: the
// page has no photo of its own).
export const meta = () => pageMeta({
  title: 'Дигитализация на предприятията | КСМ Строй',
  description:
    'КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027, съфинансирана от Европейския съюз.',
  path: '/eu-proekt',
})

// How the site's shell frames this page (src/shell/handle.js): below the
// solid header. It has no inquiry of its own: the header's „Запитване“ goes
// to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'solid' }

// The upright display face, which the title sets in the first viewport (it
// has no italic word, for it is the project's name): preloaded with the
// document the page is first loaded as, never again on a client-side visit
// (ruling C5.4, src/utils/documentPreloads.js).
const PRELOADS = [DISPLAY_FONT_PRELOADS[0]]

const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'

// The budget's four lines, each its label and its amount: one list item, one
// run of text, as the legacy page's list had them. Their places on the band
// are eu.css's: the total above it, the grant's half and KSM's own share
// meeting at the seam, the dates under it.
const BUDGET = [
  { place: 'total', label: 'Общ бюджет:', value: '35\u00a0320,04\u00a0евро' },
  { place: 'grant', label: 'Безвъзмездна финансова помощ:', value: '24\u00a0724,03\u00a0евро' },
  { place: 'own', label: 'Собствено съфинансиране:', value: '10\u00a0596,01\u00a0евро' },
  { place: 'time', label: 'Продължителност:', value: 'от 27.01.2026\u00a0г. до 27.01.2027\u00a0г.' },
]

// The co-funding plate's logos (the EU lockup and the ПКИП logo on their
// light plate, the shell's .eu__plate: their lettering is dark), each as
// wide as eu.css sets it at its height. They are in the first viewport, so
// they load at once, without the LCP's priority (ResponsivePicture's
// `eager`), and nothing ever hides them: the emblem shows on landing.
const EMBLEM = '(max-width: 900px) 227px, 300px'
const PROGRAMME = '(max-width: 900px) 152px, 202px'

// One masked line of the title: its mask, and the line that rises in it.
function Line({ children }) {
  return (
    <span className="line-mask">
      <span className="split-line">{children}</span>
    </span>
  )
}

// 1. The seal on the fold (spec §7.5). The plate first and on the seam, then
// the title, „Дигитализация на | предприятията“, ending at the seam in its
// two masks, authored by hand (spec §4.2: never split by script above the
// fold), and the statement after it. The entrance is eu.css's, all CSS from
// the first paint: the seam draws down, the title's lines rise, the
// statement fades up. The plate never moves.
function Seal() {
  return (
    <section className="doc" id="top" aria-labelledby="eu-h">
      <Seam className="doc__seam" />
      <div className="seal">
        <span className="eu__plate seal__plate">
          <ResponsivePicture image={images['eu-cofunded-bg']} alt="Съфинансирано от Европейския съюз" sizes={EMBLEM} eager imgClassName="seal__emblem" />
          <ResponsivePicture
            image={images['eu-pkip']}
            alt="Програма „Конкурентоспособност и иновации в предприятията“"
            sizes={PROGRAMME}
            eager
            imgClassName="seal__programme"
          />
        </span>
      </div>
      <div className="hinge doc__hinge">
        <h1 className="doc__h1" id="eu-h">
          <Line>Дигитализация на</Line> <Line>предприятията</Line>
        </h1>
        <div className="doc__text">
          <p className="doc__p1">
            КСМ СТРОЙ ООД изпълнява проект №&nbsp;BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма
            „Конкурентоспособност и&nbsp;иновации в&nbsp;предприятията“ 2021-2027, съфинансирана от Европейския съюз чрез
            Европейския фонд за регионално развитие.
          </p>
          <p className="doc__p2">
            Целта на проекта е&nbsp;да повиши нивото на дигитализация на КСМ&nbsp;СТРОЙ&nbsp;ООД. Внедряват се четири свързани
            системи: за управление на ресурсите (ERP), за работа с&nbsp;клиенти (CRM), за бизнес анализи (BI) и&nbsp;за
            електронно обучение на служителите. Така обектите, офертите и&nbsp;клиентските запитвания се водят на едно място,
            а&nbsp;решенията се вземат по актуални данни.
          </p>
        </div>
      </div>
    </section>
  )
}

// 2. The budget, the page's one moment (spec §7.5). The whole width is the
// total; the grant's half (umber) and KSM's own share (onyx) meet at a brass
// seam at 70 %, exactly 24 724,03 of 35 320,04 евро. No percentage is
// printed: the proportion is drawn, the amounts are the legacy text. On a
// phone it is a 14 px bar with the seam at 70 % over the list, with swatches.
//
// When the band is first seen, its seam travels from the centre to 70 % in
// 1.5 s, expo.inOut, by the registered --split (eu.css): once, as the band's
// halves (a phone's bar just above them) reach 88 % of the screen, where the
// concept's js/eu-proekt.js starts it. Its wait is CSS, the opening's kind of
// motion: wherever motion is allowed the band shows the seam at the centre
// from the first paint, the starting state of a keyframe, so a band whose
// edge already shows at the foot of the first viewport (1440 × 900) never
// jumps. Should nothing else happen, that keyframe brings it to 70 % after 4
// s (eu.css). Once the page has hydrated, where motion is allowed, the band
// is marked waiting (data-split="wait": it holds at the centre) until it is
// seen (data-split="seen": it travels); a band already in view by then
// travels at once, as the arrival's last beat. Where its keyframe has begun
// to move it before then (a slow first load), it is left to finish. Under
// reduced motion and without JS it rests at 70 %, the markup's final state.
function Budget() {
  const ref = useRef(null)
  const allowed = useMotionAllowed()

  useEffect(() => {
    const band = ref.current?.querySelector('.fund__list')
    const halves = band?.querySelector('.fund__grant')
    if (!allowed || !halves) return undefined
    const arrival = band.getAnimations?.().find((animation) => animation.animationName === 'eu-split')
    const timing = arrival?.effect?.getComputedTiming()
    if (timing && timing.localTime >= timing.delay) return undefined
    band.dataset.split = 'wait'
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      seen.disconnect()
      band.dataset.split = 'seen'
    }, { rootMargin: '0px 0px -12% 0px' })
    seen.observe(halves)
    return () => {
      seen.disconnect()
      delete band.dataset.split
    }
  }, [allowed])

  return (
    <div ref={ref} className="fund" id="byudzhet">
      <ul className="fund__list">
        {BUDGET.map(({ place, label, value }) => (
          <li key={place} className={`fund__${place}`}>
            <span className="fund__k">{label}</span> <span className="fund__v">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 3. The poster and the disclaimer, across the seam (spec §7.5): the one
// download link the contract counts, its ↓ drawn and hidden from assistive
// technology, so its name is its words; then the statement the programme
// requires, word for word. They come in with the system's reveals as the
// part comes up from below: the seam draws, the two halves fade up.
function Poster() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <div ref={ref} className="fin" id="plakat">
      <Seam draw />
      <div className="fin__l" data-fade="">
        <Button href={POSTER} download="Плакат A3 - КСМ Строй.pdf">
          Изтегли плаката (PDF)
          <svg className="arr arr--down" viewBox="0 0 10 14" width="10" height="14" aria-hidden="true" focusable="false">
            <path d="M5 0v12M1 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </Button>
      </div>
      <p className="fin__note" data-fade="">
        Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и&nbsp;при никакви обстоятелства не може да се приема, че
        този документ отразява официалното становище на Европейския съюз и&nbsp;Управляващия орган.
      </p>
    </div>
  )
}

export default function EuProekt() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <Seal />
      <Budget />
      <Poster />
    </>
  )
}
