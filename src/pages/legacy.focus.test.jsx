import { fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import HeroCarousel from '../components/ui/HeroCarousel'
import { ApartmentProvider } from '../context/ApartmentContext'
import Blog from './Blog'
import Contact from './Contact'
import Projects from './Projects'

// A focus ring takes the colour of its ground's text (src/index.css; decision
// of 2026-11-14): ink, or paper under an ancestor that names a dark ground
// with .on-dusk. The legacy pages' near-black grounds (#1a1a1a, #2c2c2c,
// black overlays) are dark grounds, where an ink ring measures about 1.1:1
// and cannot be seen (WCAG 2.4.7). So each marks itself .on-dusk, or a tighter
// wrapper does, and never a light card inside it: the card's controls keep
// the ink ring. jsdom applies no CSS: src/styles/focus-ring.test.js pins the
// rules, and the smoke run measures the ring in Chrome.

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

it('Home: the hero’s text column, arrows and dots are on dusk; its white availability card is not', () => {
  renderPage(HeroCarousel)

  for (const name of ['Разгледай проектите', 'Свържи се с нас']) {
    expect(onDusk(screen.getByRole('link', { name })), name).toBe(true)
  }
  for (const name of ['Предишен слайд', 'Следващ слайд', 'Слайд 1', 'Слайд 2']) {
    expect(onDusk(screen.getByRole('button', { name })), name).toBe(true)
  }
  expect(onDusk(screen.getByRole('link', { name: 'Виж проектите в продажба' }))).toBe(false)
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
