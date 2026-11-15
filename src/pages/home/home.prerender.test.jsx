import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { mockMatchMedia } from '../../test/media'
import Home, { handle } from '../Home'

// The build prerenders Home in Node, and that HTML is the final visual state
// until the JS runs (plan, global rules; spec §5.5, §6.2): the slogan, the
// dated Многофамилна count and the intro's doors are in it, the Golden
// Residence count is `—`, and nothing in the opening starts hidden, faded or
// moved: the opening's motion is CSS under the gate (home.css). The browser
// then hydrates that HTML; what it knows (a fine pointer, motion allowed)
// must not change the first client render. Each test renders on the
// "server", then hydrates, as src/hooks/hydration.test.jsx does.

// The motion engine never loads here: hydration is the question, and GSAP
// and Lenis have no business in jsdom.
vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const routes = () => [{ path: '/', Component: App, children: [{ index: true, Component: Home, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: ['/'] })} />
// The HTML to read, without the empty comments React puts between
// neighbouring text nodes (which hydration needs, so it gets the raw HTML).
const prerender = () => renderToString(page()).replaceAll('<!-- -->', '')
const parse = (html) => new DOMParser().parseFromString(html, 'text/html')
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

it('prerenders the slogan, the dated Многофамилна count and the intro’s doors', () => {
  const html = prerender()
  const doc = parse(html)

  expect(textOf(doc.querySelector('h1'))).toBe('Създаваме пространства за мечтания живот')
  expect(html).toContain('class="intro-doors"')
  expect(textOf(doc.querySelector('.half--mn .half__count'))).toContain('16')
  expect(doc.querySelector('.half--mn').getAttribute('aria-label')).toContain('16 свободни апартамента от 144')
})

// The Golden Residence count arrives at hydration (spec §9): `—` until then,
// and a name with no count to read out.
it('prerenders the Golden Residence count as —, and names the half without it', () => {
  const doc = parse(prerender())
  const half = doc.querySelector('section.hero a.half--gr')

  expect(textOf(half.querySelector('.half__count'))).toMatch(/^— /)
  expect(half.getAttribute('aria-label')).toBe('Golden Residence, жк Левски Г. Изберете апартамент.')
})

it('starts nothing in the opening hidden, faded, moved or clipped', () => {
  const hero = parse(prerender()).querySelector('section.hero')
  const styles = [...hero.querySelectorAll('[style]')].map((element) => element.getAttribute('style'))

  expect(hero).not.toBeNull()
  expect(styles.filter((style) => /opacity|transform|clip|visibility/.test(style))).toEqual([])
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
})
