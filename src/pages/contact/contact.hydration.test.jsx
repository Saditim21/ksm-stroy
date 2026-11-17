import { act, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import App from '../../root'
import Contact, { handle } from '../../routes/contact'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates Контакти's prerendered HTML (contact.prerender.test.jsx
// reads it as the build makes it, in Node), and what the browser knows (a
// fine pointer, motion allowed, the query string, the hash) must not change
// the first client render (plan, global rules; spec M3/M4 §7.3): no
// recoverable error and no console.error, on the page and on the links that
// land on its form, whose prefill applies once it has hydrated. Rendered on
// the "server" here, then hydrated, as mn.hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/contact'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Contact, handle }] }]
const page = (at = PATH) => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [at] })} />
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const checked = () => container.querySelector('input[type="radio"]:checked')?.value

let container
let root
let restore
beforeEach(() => {
  goOffline()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
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
  expect(textOf(container.querySelector('h1'))).toBe('Как можете да се свържете с нас')
  expect(checked()).toBe('golden-residence')
  expect(container.querySelector('#f-name')).not.toBeNull()
})

// Spec §7.3: a link's prefill applies once the page has hydrated, the HTML
// having been built without it.
it('hydrates at ?project=mn&apartment=Б-702 with no error, then chooses Многофамилна with its chip', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?project=mn&apartment=${encodeURIComponent('Б-702')}`)

  await waitFor(() => expect(checked()).toBe('mnogofamilna'))
  expect(await screen.findByText('Апартамент Б-702')).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})

it('hydrates at ?project=stroitelstvo#zapitvane with no error, then opens the construction group', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?project=stroitelstvo#zapitvane`)

  await waitFor(() => expect(checked()).toBe('build'))
  expect(await screen.findByLabelText('Тип проект')).toBeInTheDocument()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})

// Golden Residence's apartments are known once the store's data is in (the
// built-in data, offline).
it('hydrates at ?apartment=А 301 with no error, then shows its chip once the data is in', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}?apartment=${encodeURIComponent('А 301')}`)

  expect(await screen.findByText('Апартамент А 301', {}, { timeout: 15000 })).toBeInTheDocument()
  expect(checked()).toBe('golden-residence')
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)

it('hydrates at #zapitvane with no error', async () => {
  const { errors, logged } = await hydrateAt(`${PATH}#zapitvane`)

  await waitFor(() => expect(document.documentElement.hasAttribute('data-eu-hold')).toBe(true))
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})
