import { fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import Blog from './Blog'

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
