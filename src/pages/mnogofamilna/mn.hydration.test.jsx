import { act, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { named } from '../../explorer/testing'
import App from '../../root'
import Mnogofamilna, { handle } from '../../routes/mnogofamilna'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates the Многофамилна page's prerendered HTML
// (mn.prerender.test.jsx reads it as the build makes it, in Node), and what
// the browser knows (a fine pointer, motion allowed, the query string) must
// not change the first client render (plan, global rules; spec §6.2): no
// recoverable error and no console.error, on the page and on its deep links,
// which open their dialogs once it has hydrated (spec §7.10). Rendered on the
// "server" here, then hydrated, as gr.hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/projects/mnogofamilna-sgrada'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Mnogofamilna, handle }] }]
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
  resetInquiry()
  document.documentElement.removeAttribute('data-eu-hold')
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
  expect(textOf(container.querySelector('h1'))).toBe('Многофамилна жилищна сграда')
  expect(container.querySelectorAll('[data-lit]')).toHaveLength(9)
  expect(container.querySelector('#f-name')).not.toBeNull()
})

// Spec §7.10, M3 §6.4: a floor's deep link opens its plan stage once the
// page has hydrated, the HTML having been built without it.
it('hydrates at ?floor=Б-5 with no error, then opens the stage of Б-5', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?floor=${encodeURIComponent('Б-5')}`)

  expect(await screen.findByRole('dialog', { name: named('Блок Б · Етаж 5') }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

it('hydrates at ?unit=А-802 with no error, then opens А-802’s panel', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?unit=${encodeURIComponent('А-802')}`)

  expect(await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

// Spec M3 §6.2 #3: ?view=list lands on the list, which loads at once.
it('hydrates at ?view=list with no error, then shows the list', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?view=list`)

  await waitFor(() => expect(container.querySelector('#spisak .lv__meta')).not.toBeNull(), { timeout: 15000 })
  expect(textOf(container.querySelector('#spisak .lv__meta'))).toBe('144 от 144 · 16 свободни')
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

// Review Focus 2, ruling PF17: a label no unit has opens nothing, and
// Golden Residence's format (a space for the dash) reads as the unit.
it('hydrates at ?unit=А-1001 with no error, and opens no dialog', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?unit=${encodeURIComponent('А-1001')}`)

  // Long enough for the dialogs' chunk, had anything asked for it.
  await act(() => new Promise((resolve) => { setTimeout(resolve, 300) }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})

it('hydrates at ?unit=А 101 with no error, and opens А-101’s panel', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?unit=${encodeURIComponent('А 101')}`)

  expect(await screen.findByRole('dialog', { name: 'А-101' }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)
