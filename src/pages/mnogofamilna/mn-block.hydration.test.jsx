import { act, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { named } from '../../explorer/testing'
import App from '../../root'
import MnogofamilnaBlock, { handle } from '../../routes/mnogofamilna-block'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates a Многофамилна block page's prerendered HTML
// (mn-block.prerender.test.jsx reads it as the build makes it, in Node), and
// what the browser knows (a fine pointer, motion allowed, the query string)
// must not change the first client render (plan, global rules; spec §6.2):
// no recoverable error and no console.error, on the page and on its deep
// links, which open their dialogs once it has hydrated (spec §7.10, M3
// §6.5). Rendered on the "server" here, then hydrated, as
// mn.hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const pathOf = (id) => `/projects/mnogofamilna-sgrada/${id}`
const page = (id, at = pathOf(id)) => {
  const path = pathOf(id)
  const routes = [{ path: '/', Component: App, children: [{ id: path.slice(1), path: path.slice(1), Component: MnogofamilnaBlock, handle }] }]
  return <RouterProvider router={createMemoryRouter(routes, { initialEntries: [at] })} />
}
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

// Hydrates the block page `id`, prerendered (as the build builds it, with no
// query), at `at`; every recoverable error is kept, to fail the test, and
// console.error is watched.
async function hydrateAt(id, at) {
  const html = renderToString(page(id))
  restore = mockMatchMedia({ fine: true })
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, page(id, at), { onRecoverableError: (error) => errors.push(error) })
  })
  return { errors, logged }
}

it.each([
  ['block-a', 'А', 2],
  ['block-b', 'Б', 7],
])('hydrates %s with a fine pointer and motion allowed, and no recoverable error', async (id, letter, lit) => {
  const { errors, logged } = await hydrateAt(id, pathOf(id))

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(textOf(container.querySelector('h1'))).toBe(`Многофамилна сграда, блок ${letter}`)
  expect(container.querySelectorAll('[data-lit]')).toHaveLength(lit)
  expect(container.querySelectorAll('#explorer .mbr')).toHaveLength(9)
  expect(container.querySelector('#f-name')).not.toBeNull()
})

// Spec M3 §6.5: a bare ?floor=7 is the block's own floor, its plan stage
// open once the page has hydrated, the HTML having been built without it.
it('hydrates block-a at ?floor=7 with no error, then opens the stage of floor 7', async () => {
  const { errors, logged } = await hydrateAt('block-a', `${pathOf('block-a')}?floor=7`)

  expect(await screen.findByRole('dialog', { name: named('Блок А · Етаж 7') }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

it('hydrates block-b at ?unit=Б-702 with no error, then opens Б-702’s panel', async () => {
  const { errors, logged } = await hydrateAt('block-b', `${pathOf('block-b')}?unit=${encodeURIComponent('Б-702')}`)

  expect(await screen.findByRole('dialog', { name: 'Б-702' }, { timeout: 15000 })).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)
