import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { mockMatchMedia } from '../../test/media'
import Home, { handle } from '../Home'

// The browser hydrates Home's prerendered HTML (home.prerender.test.jsx
// reads it as the build makes it, in Node), and what the browser knows (a
// fine pointer, motion allowed) must not change the first client render
// (plan, global rules; spec §6.2). Rendered on the "server" here, then
// hydrated, as src/hooks/hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const routes = () => [{ path: '/', Component: App, children: [{ index: true, Component: Home, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: ['/'] })} />
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

it('hydrates with a fine pointer and motion allowed, and no recoverable error', async () => {
  const html = renderToString(page())
  restore = mockMatchMedia({ fine: true })
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')

  await act(async () => {
    root = hydrateRoot(container, page(), { onRecoverableError: (error) => errors.push(error) })
  })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(textOf(container.querySelector('h1'))).toBe('Създаваме пространства за мечтания живот')
  expect(container.querySelector('#f-name')).not.toBeNull()
})
