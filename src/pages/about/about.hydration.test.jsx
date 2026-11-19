import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import About, { handle } from '../../routes/about'
import { mockMatchMedia } from '../../test/media'

// The browser hydrates За нас's prerendered HTML (about.prerender.test.jsx),
// and what the browser knows (a pointer or a finger, motion allowed or not,
// the light theme) must not change the first client render: no recoverable
// error and no console.error. The motion engine never loads here.

vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const PATH = '/about'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: About, handle }] }]
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
  document.documentElement.removeAttribute('data-theme')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

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
  expect(textOf(container.querySelector('h1'))).toBe('Добрата работа – реклама за майстора')
  expect(container.querySelectorAll('.wl__t')).toHaveLength(35)
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

it('hydrates over the light theme with no error', async () => {
  document.documentElement.setAttribute('data-theme', 'light')
  const { errors, logged } = await hydrate({ fine: true })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
})
