import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import WorksSection from './WorksSection'

// „Нашите обекти“ (spec §6.10; extract §4.12): production's completed works
// (Blog.jsx:128–197), each a button that brings its cover into the sticky
// panel beside the list. The panel is decoration, hidden from assistive
// technology; the list carries the names.

const WORKS = [
  ['Green Life – Paradise Gardens and Town House', 'гр. Созопол · жилищен комплекс · 2018'],
  ['Айвазовски Парк', 'гр. Поморие · жилищен комплекс'],
  ['Панорама Резидънс', 'гр. Созопол · жилищен комплекс'],
  ['Сънни Хил блок 9', 'кв. Меден Рудник, гр. Бургас · жилищна сграда'],
  ['Хотел Парадайс', 'с. Огняново · хотелски комплекс'],
  ['Читалище „Асен Златаров-1924“', 'с. Огняново, община Гърмен · обществена сграда'],
]
const normal = (value) => value.replace(/\s+/g, ' ').trim()
const list = () => screen.getByRole('list')
const buttons = () => within(list()).getAllByRole('button')
const caption = () => normal(document.querySelector('#obekti .works__cap').textContent)

it('heads the section „Нашите обекти“, with Blog’s description', () => {
  render(<WorksSection />)
  const section = document.getElementById('obekti')
  expect(section).toHaveAccessibleName('Нашите обекти')
  expect(within(section).getByRole('heading', { level: 2 }).querySelector('em')).toHaveTextContent(/^обекти$/)
  expect(within(section).getByText('Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси и санирания.')).toBeInTheDocument()
})

it('lists the six works in order, each button named by the work and its line', () => {
  render(<WorksSection />)
  const names = buttons().map((button) => normal(button.textContent))
  expect(names).toHaveLength(6)
  names.forEach((name, i) => {
    const [work, line] = WORKS[i]
    expect(name.startsWith(`${work} `), name).toBe(true)
    expect(name.endsWith(` ${line}`), name).toBe(true)
  })
  buttons().forEach((button, i) => expect(button).toHaveAccessibleName(names[i]))
  expect(within(buttons()[2]).getByText('груб строеж')).toBeInTheDocument()
})

it('starts on the first work, its cover in the panel', () => {
  render(<WorksSection />)
  expect(buttons()[0]).toHaveAttribute('aria-current', 'true')
  expect(buttons().slice(1).filter((button) => button.hasAttribute('aria-current'))).toEqual([])
  expect(caption()).toBe('Green Life – Paradise Gardens and Town House, гр. Созопол')
})

it('brings the work clicked into the panel, „{name}, {place}“ under it', async () => {
  const user = userEvent.setup({ delay: null })
  render(<WorksSection />)
  await user.click(buttons()[2])
  expect(buttons()[2]).toHaveAttribute('aria-current', 'true')
  expect(buttons()[0]).not.toHaveAttribute('aria-current')
  expect(caption()).toBe('Панорама Резидънс, гр. Созопол')
  expect(document.querySelector('#obekti .works__img[data-shown="top"] img')).toHaveAttribute('src', expect.stringContaining('/img/work-panorama-'))
})

// The keyboard chooses as the pointer does: focus is the choice.
it('brings a work into the panel when its button takes the focus', async () => {
  const user = userEvent.setup({ delay: null })
  render(<WorksSection />)
  await user.tab()
  await user.tab()
  expect(buttons()[1]).toHaveFocus()
  expect(buttons()[1]).toHaveAttribute('aria-current', 'true')
  expect(caption()).toBe('Айвазовски Парк, гр. Поморие')
})

// The covers are decoration: the panel is hidden from assistive technology,
// and each cover's alt is empty. All six are in the page, so a change of work
// never waits for a download; the ones not shown are hidden.
it('keeps every cover in the hidden panel, only the chosen one shown', () => {
  render(<WorksSection />)
  const media = document.querySelector('#obekti .works__media')
  expect(media).toHaveAttribute('aria-hidden', 'true')
  const layers = [...media.querySelectorAll('.works__img')]
  expect(layers).toHaveLength(6)
  expect(layers.map((layer) => layer.getAttribute('data-shown'))).toEqual(['top', null, null, null, null, null])
  for (const img of media.querySelectorAll('img')) {
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('loading', 'lazy')
  }
})
