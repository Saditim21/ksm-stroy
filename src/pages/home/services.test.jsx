import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import ServicesSection from './ServicesSection'

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
