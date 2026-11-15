import { act, screen, waitFor, within } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import App from '../root'
import BlockPageRoute, { handle } from '../routes/golden-residence-block'
import { mockMatchMedia } from '../test/media'
import { loadSurfaces } from './loadSurfaces'
import { named } from './testing'

// The build prerenders /projects/golden-residence/block-a without a query,
// and a deep link hydrates that HTML (spec §6.2, §7.10): the HTML holds no
// dialog, the hydration finds what it was rendered from, and only then do
// ?floor and ?unit open the stage and the unit panel. Rendered on the
// "server" here, then hydrated at the deep link, with a fine pointer and
// motion allowed, as home.prerender.test.jsx and gr.hydration.test.jsx do.

// The motion engine never loads here: hydration is the question.
vi.mock('../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/projects/golden-residence/block-a'
const routes = () => [{ path: '/', Component: App, children: [{ id: PATH.slice(1), path: PATH.slice(1), Component: BlockPageRoute, handle }] }]
const page = (at) => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [at] })} />
// React separates neighbouring text nodes with an empty comment.
const prerender = () => renderToString(page(PATH))
const rows = (dialog) => dialog.querySelectorAll('tbody tr')

beforeAll(() => loadSurfaces())

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

// Hydrates the prerendered HTML at `at`; every recoverable error is kept, to
// fail the test.
async function hydrateAt(at) {
  const html = prerender()
  restore = mockMatchMedia({ fine: true })
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, page(at), { onRecoverableError: (error) => errors.push(error) })
  })
  return { html, errors, logged }
}

it('prerenders the block page with no dialog', () => {
  const html = prerender()
  expect(html).toContain('Golden Residence, блок')
  expect(html).not.toMatch(/role="dialog"/)
})

it('hydrates at ?floor=3 with no error, then opens the stage on А-3', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?floor=3`)

  const stage = await screen.findByRole('dialog', { name: named('Блок А · Етаж 3') }, { timeout: 15000 })
  await waitFor(() => expect(rows(stage)).toHaveLength(12), { timeout: 15000 })
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

it('hydrates at ?floor=3&unit=А%20301 with no error, then opens the stage and the unit panel on А 301', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?floor=3&unit=%D0%90%20301`)

  const panel = await screen.findByRole('dialog', { name: 'А 301' }, { timeout: 15000 })
  // The stage under the panel: open on А-3, inert and hidden.
  const stage = document.querySelector('.ps')
  expect(stage).toHaveAttribute('role', 'dialog')
  expect(stage.querySelector('.ps__title').textContent.replace(/\s+/g, ' ')).toBe('Блок А · Етаж 3')
  expect(stage).toHaveAttribute('aria-hidden', 'true')
  expect(stage).toHaveAttribute('inert')
  expect(within(panel).getByRole('button', { name: 'Изпратете запитване' })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)
