import { act, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import Projects, { handle } from '../../routes/projects'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates Продажби's prerendered HTML (projects.prerender.test.jsx
// reads it as the build makes it, in Node), and what the browser knows (a
// fine pointer or a finger, motion allowed) must not change the first client
// render (plan, global rules; spec M3/M4 §7.1): no recoverable error and no
// console.error. Golden Residence's squares take their statuses once the
// store has its data, after hydration (here the data built into the site,
// offline). Rendered on the "server" here, then hydrated, as
// contact.hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/projects'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Projects, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [PATH] })} />
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

// Hydrates the prerendered page with `media` (mockMatchMedia's); every
// recoverable error is kept, to fail the test, and console.error is watched.
async function hydrate(media) {
  const html = renderToString(page())
  restore = mockMatchMedia(media)
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, page(), { onRecoverableError: (error) => errors.push(error) })
  })
  return { errors, logged }
}

const grSquares = () => [...container.querySelectorAll('.bd--gr .blk__grid button')]

it('hydrates with a fine pointer and motion allowed, and no recoverable error', async () => {
  const { errors, logged } = await hydrate({ fine: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(textOf(container.querySelector('h1'))).toBe('Продажби')
  expect(container.querySelectorAll('.bd--mn .blk__grid .s-free')).toHaveLength(16)
})

it('hydrates on a phone with no error', async () => {
  const { errors, logged } = await hydrate({ coarse: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})

// Spec §7.1: Golden Residence's squares, neutral in the HTML, take their
// statuses once the store has its data (the data built into the site here),
// with its counts, and the notice that labels them as not live.
it('colours Golden Residence’s squares once its data is in, after hydration, with the notice', async () => {
  const { errors, logged } = await hydrate({ fine: true })

  await waitFor(() => expect(grSquares().filter((square) => square.className === 's-none')).toHaveLength(0), { timeout: 15000 })
  expect(grSquares()).toHaveLength(192)
  expect(textOf(container.querySelector('.bd--gr .bd__count'))).toMatch(/^\d+ свободни от 192 в момента$/)
  expect(container.querySelector('.bd--gr .stale')).not.toBeNull()
  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
}, 30000)
