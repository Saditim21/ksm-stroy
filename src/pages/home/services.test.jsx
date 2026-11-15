import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'
import ServicesSection from './ServicesSection'

// The motion engine, for the entrance's case: a recording stand-in
// (src/test/gsap.js). Every other case runs without motion, as jsdom does.
const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

// „Нашите услуги“ as Diptych shows it (spec §6.9; extract §4.11): the
// user-approved heading over production's lead (Home.jsx:72), then three
// columns, each an article named by its title, with production's sentences
// (Home.jsx:16–27) and an outlined numeral that assistive technology skips.

const COLUMNS = [
  ['Жилищно строителство', 'Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт.'],
  ['Ремонти и реновация', 'Цялостни ремонти и модернизация на съществуващи сгради.'],
  ['Комерсиално строителство', 'Офисни сгради, складове и индустриални обекти.'],
]
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()

it('heads the section with „Строим, ремонтираме, завършваме.“ and production’s lead', () => {
  render(<ServicesSection />)
  const section = document.getElementById('uslugi')
  const h2 = within(section).getByRole('heading', { level: 2 })
  expect(text(h2)).toBe('Строим, ремонтираме, завършваме.')
  expect(h2.querySelector('em')).toHaveTextContent(/^завършваме$/)
  expect(section).toHaveAccessibleName('Строим, ремонтираме, завършваме.')
  expect(within(section).getByText('Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти.')).toBeInTheDocument()
})

// A title keeps its one-letter word on the next word's line with a
// non-breaking space (spec §3.3), which the name carries too.
const named = (title) => (name) => name.replace(/\s/g, ' ') === title

it('runs three columns, each an article named by its title, with production’s sentence', () => {
  render(<ServicesSection />)
  const articles = screen.getAllByRole('article')
  expect(articles.map((article) => text(article.querySelector('h3')))).toEqual(COLUMNS.map(([title]) => title))
  for (const [title, sentence] of COLUMNS) {
    const article = screen.getByRole('article', { name: named(title) })
    expect(within(article).getByRole('heading', { level: 3, name: named(title) })).toBeInTheDocument()
    expect(within(article).getByText(sentence)).toBeInTheDocument()
    // Focusable, so a keyboard opens the column as a pointer does.
    expect(article).toHaveAttribute('tabindex', '0')
  }
})

it('numbers the columns 01–03, hidden from assistive technology', () => {
  render(<ServicesSection />)
  const numerals = screen.getAllByRole('article').map((article) => article.querySelector('.svc__n'))
  expect(numerals.map((numeral) => numeral.textContent)).toEqual(['01', '02', '03'])
  for (const numeral of numerals) expect(numeral).toHaveAttribute('aria-hidden', 'true')
})

// The photos are decoration that opens behind each column: hidden from
// assistive technology, and loaded only as the section nears.
it('hides each column’s photo from assistive technology, and loads it lazily', () => {
  render(<ServicesSection />)
  for (const article of screen.getAllByRole('article')) {
    const photo = article.querySelector('.svc__img')
    expect(photo).toHaveAttribute('aria-hidden', 'true')
    expect(photo.querySelector('img')).toHaveAttribute('alt', '')
    expect(photo.querySelector('img')).toHaveAttribute('loading', 'lazy')
  }
})

// The entrance (spec §5.7; extract §4.11, the concept's home.js:211-217;
// ruling C9.5): once the row of columns reaches 84 % of the screen, the
// numerals rise 36 % and fade in over 1.2 s, 0.12 s apart, and the titles
// rise 22 px from 0.18 s; once, and never for a row already on screen. The
// numerals' own fade (their hover) is off while they rise.
describe('the entrance with motion', () => {
  let restoreMedia
  let flushMotion
  beforeEach(() => {
    recorder.reset()
    restoreMedia = mockMatchMedia()
    flushMotion = stubIdle()
  })
  afterEach(() => {
    restoreMedia()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // The row of columns `top` px from the top of jsdom's 768 px screen.
  function renderAt(top) {
    render(<ServicesSection />)
    const row = document.querySelector('#uslugi .svc__cols')
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y: top })
    return row
  }

  it('raises the numerals 36 % over 1.2 s and the titles 22 px from 0.18 s, 0.12 s apart, once the row reaches 84 %', async () => {
    const row = renderAt(2000)
    await flushMotion()

    const numerals = [...row.querySelectorAll('.svc__n')]
    const titles = [...row.querySelectorAll('.svc__t')]
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0]).toMatchObject({ method: 'set', vars: { transition: 'none' } })
    expect([...recorder.tweens[0].targets]).toEqual(numerals)

    expect(recorder.timelines).toHaveLength(1)
    const [entrance] = recorder.timelines
    expect(entrance.vars).toEqual({ scrollTrigger: { trigger: row, start: 'top 84%', once: true } })
    expect(entrance.steps.map(({ method, vars, position }) => ({ method, vars, position }))).toEqual([
      { method: 'from', vars: { yPercent: 36, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity,transition' }, position: 0 },
      { method: 'from', vars: { y: 22, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,opacity' }, position: 0.18 },
    ])
    expect([...entrance.steps[0].targets]).toEqual(numerals)
    expect([...entrance.steps[1].targets]).toEqual(titles)
  })

  it('leaves a row already on screen as it is', async () => {
    renderAt(500)
    await flushMotion()
    expect(recorder.timelines).toHaveLength(0)
    expect(recorder.tweens).toHaveLength(0)
  })
})
