import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import App from '../root'
import { mockMatchMedia } from '../test/media'
import EuProekt, { handle } from './eu-proekt'

// The browser hydrates the EU page's prerendered HTML
// (eu-proekt.prerender.test.jsx reads it as the build makes it, in Node),
// and what the browser knows (a fine pointer or a finger, motion allowed or
// not) must not change the first client render (plan, global rules; spec
// M3/M4 §7.5, §12, ruling M4-PF11): no recoverable error and no
// console.error. Rendered on the "server" here, then hydrated, as
// about.hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/eu-proekt'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: EuProekt, handle }] }]
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

it('hydrates with a fine pointer and motion allowed, and no recoverable error', async () => {
  const { errors, logged } = await hydrate({ fine: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(textOf(container.querySelector('h1'))).toBe('Дигитализация на предприятията')
  expect(container.querySelectorAll('#byudzhet li')).toHaveLength(4)
  expect(container.querySelector('#byudzhet .fund__list').hasAttribute('style')).toBe(false)
})

it('hydrates on a phone with no error', async () => {
  const { errors, logged } = await hydrate({ coarse: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})

it('hydrates under reduced motion with no error', async () => {
  const { errors, logged } = await hydrate({ reduce: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})
