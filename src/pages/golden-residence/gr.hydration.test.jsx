import { act, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import GoldenResidence, { handle } from '../../routes/golden-residence'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates the Golden Residence page's prerendered HTML
// (gr.prerender.test.jsx reads it as the build makes it, in Node), and what
// the browser knows (a fine pointer, motion allowed, the query string) must
// not change the first client render (plan, global rules; spec §6.2).
// Rendered on the "server" here, then hydrated, as
// src/hooks/hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/projects/golden-residence'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: GoldenResidence, handle }] }]
const page = (at = PATH) => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [at] })} />
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

let container
let root
let restore
beforeEach(() => {
  goOffline()
  container = document.createElement('div')
  document.body.appendChild(container)
})
afterEach(() => {
  act(() => root?.unmount())
  root = undefined
  container.remove()
  restore?.()
  restore = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// Hydrates the prerendered page (built, as the build builds it, with no
// query) at `at`; every recoverable error is kept, to fail the test, and
// console.error is watched.
async function hydrateAt(at) {
  const html = renderToString(page())
  restore = mockMatchMedia({ fine: true })
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, page(at), { onRecoverableError: (error) => errors.push(error) })
  })
  return { errors, logged }
}

it('hydrates with a fine pointer and motion allowed, and no recoverable error', async () => {
  const { errors, logged } = await hydrateAt(PATH)

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(textOf(container.querySelector('h1'))).toBe('Golden Residence')
  expect(container.querySelector('#f-name')).not.toBeNull()
})

// Spec §7.10: ?view=list is read once the page has hydrated, so the HTML,
// built at „Визуално“, hydrates as it is; then „По критерии“ is selected and
// the list, loaded on the landing (ruling C8.5), comes in.
it('hydrates at ?view=list with no error, then selects „По критерии“', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?view=list`)

  await waitFor(() => expect(screen.getByRole('tab', { name: 'По критерии' })).toHaveAttribute('aria-selected', 'true'))
  expect(screen.getByRole('tab', { name: 'Визуално' })).toHaveAttribute('aria-selected', 'false')
  expect(await screen.findByRole('group', { name: 'Статус' }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)
