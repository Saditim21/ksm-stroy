import { fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'
import MnogofamilnaBlockSelection from '../components/MnogofamilnaBlockSelection'
import { ApartmentProvider } from '../context/ApartmentContext'
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
// measures the ring in Chrome.

const onDusk = (element) => element.closest('.on-dusk') !== null

const renderPage = (Page) => render(
  <MemoryRouter>
    <ApartmentProvider>{createElement(Page)}</ApartmentProvider>
  </MemoryRouter>,
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

// A project page's photo gallery and its full-screen viewer: dark throughout.
// (The Golden Residence page, rebuilt in Diptych, is dark throughout.)
it.each([
  { path: '/projects/mnogofamilna-sgrada', Page: MnogofamilnaBlockSelection },
])('$path: the photo gallery and its full-screen viewer are on dusk', async ({ Page }) => {
  renderPage(Page)

  fireEvent.click(screen.getByRole('button', { name: /Снимки/ }))
  const gallery = (await screen.findByText('Галерия със снимки')).closest('.fixed')
  const galleryControls = within(gallery).getAllByRole('button')
  expect(galleryControls.length).toBeGreaterThan(0)
  for (const control of galleryControls) expect(onDusk(control)).toBe(true)

  fireEvent.click(within(gallery).getAllByRole('img')[0])
  const viewer = (await screen.findByText('Кликнете навсякъде за затваряне')).closest('.fixed')
  const viewerControls = within(viewer).getAllByRole('button')
  expect(viewerControls.length).toBeGreaterThan(0)
  for (const control of viewerControls) expect(onDusk(control)).toBe(true)
})

// A block page's full-screen floor plan, opened from a free apartment: its
// bar and zoom controls sit on black; the gold card of the chosen apartment
// does not, and its „Контакт“ keeps the onyx ring.
it.each([
  { path: '/projects/golden-residence/block-a', floor: '1 етаж', apartment: 'А 101' },
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

// A project page's block cards: each card sits on the light page, so its own
// ring stays onyx; „Преглед на блока“ inside it sits on the photo's dark
// overlay. (framer-motion makes both focusable: they respond to a tap.)
it.each([
  { path: '/projects/mnogofamilna-sgrada', Page: MnogofamilnaBlockSelection },
])('$path: „Преглед на блока“ on each card’s photo is on dusk; the cards are not', ({ Page }) => {
  renderPage(Page)

  const pills = screen.getAllByText('Преглед на блока').map((label) => label.parentElement)
  expect(pills).toHaveLength(2)
  for (const pill of pills) expect(onDusk(pill)).toBe(true)
  for (const name of ['БЛОК А', 'БЛОК Б']) {
    expect(onDusk(screen.getByRole('heading', { name }).closest('.cursor-pointer')), name).toBe(false)
  }
})
