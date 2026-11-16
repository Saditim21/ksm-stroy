import { fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'
import Blog from './Blog'
import Contact from './Contact'
import Projects from './Projects'

// A focus ring takes the colour of its ground's text (src/index.css; spec
// §11). A legacy page is a light ground inside the dark site (.on-light), so
// its rings are onyx, or ivory under an ancestor that names a dark ground with
// .on-dusk. The legacy pages' near-black grounds (#1a1a1a, #2c2c2c, black
// overlays) are dark grounds, where an onyx ring cannot be seen (WCAG 2.4.7).
// So each marks itself .on-dusk, or a tighter wrapper does, and never a light
// card inside it: the card's controls keep the onyx ring. jsdom applies no
// CSS: src/styles/focus-ring.test.js pins the rules, and the smoke run
// measures the ring in Chrome. No page the site serves is wrapped in the
// legacy ApartmentProvider any more, so neither are these.

const onDusk = (element) => element.closest('.on-dusk') !== null

const renderPage = (Page) => render(
  <MemoryRouter>{createElement(Page)}</MemoryRouter>,
)

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('/projects: the closing call to action is on dusk; the filters on the light ground are not', () => {
  renderPage(Projects)

  for (const name of ['Свържете се с нас', 'Попитайте за цени']) {
    const button = screen.getByRole('button', { name })
    expect(onDusk(button), name).toBe(true)
    expect(onDusk(button.closest('a')), `${name}: its link`).toBe(true)
  }
  expect(onDusk(screen.getByRole('button', { name: /^Всички/ }))).toBe(false)
})

it('/blog: the closing call to action and the project viewer are on dusk; the filters are not', async () => {
  renderPage(Blog)

  for (const name of ['Свържете се с нас', 'Поръчайте оферта']) {
    expect(onDusk(screen.getByRole('button', { name })), name).toBe(true)
  }
  expect(onDusk(screen.getByRole('button', { name: /^Всички проекти/ }))).toBe(false)

  fireEvent.click(screen.getByText('Айвазовски Парк'))
  const viewer = (await screen.findByRole('button', { name: 'Миниатюра 1' })).closest('.fixed')
  const controls = within(viewer).getAllByRole('button')
  // The close button, the two arrows and the seven thumbnails.
  expect(controls).toHaveLength(10)
  for (const control of controls) expect(onDusk(control)).toBe(true)
})

it('/contact: the closing band is on dusk; the form is not', () => {
  renderPage(Contact)

  for (const name of ['Отиди до формата за безплатна оферта', 'Обади се на +359 887 886 166']) {
    expect(onDusk(screen.getByRole('link', { name })), name).toBe(true)
  }
  expect(onDusk(screen.getByRole('button', { name: /Изпрати съобщение/ }))).toBe(false)
})

// A Многофамилна block page's full-screen floor plan, opened from a free
// apartment: its bar and zoom controls sit on black; the gold card of the
// chosen apartment does not, and its „Контакт“ keeps the onyx ring. (The
// Golden Residence block pages are the Diptych explorer, dark throughout.)
it.each([
  { path: '/projects/mnogofamilna-sgrada/block-a', floor: 'Етаж 9', apartment: 'А-802' },
])('$path: the full-screen plan’s bar and zoom controls are on dusk; the apartment’s gold card is not', async ({ path, floor, apartment }) => {
  renderSiteAt(path)

  fireEvent.click(await screen.findByText(floor, {}, { timeout: 15000 }))
  const row = (await screen.findAllByText(apartment)).map((cell) => cell.closest('tr')).find(Boolean)
  fireEvent.click(row)
  const viewer = (await screen.findByRole('button', { name: '✕' })).closest('.fixed')
  for (const name of ['✕', 'Увеличи', 'Намали', 'Нулирай']) {
    expect(onDusk(within(viewer).getByRole('button', { name })), name).toBe(true)
  }
  expect(onDusk(within(viewer).getByRole('button', { name: 'Контакт' }))).toBe(false)
}, 30000)
