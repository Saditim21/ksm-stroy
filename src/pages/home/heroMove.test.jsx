import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { mockMatchMedia } from '../../test/media'

// The hero move (spec §6.7; ruling F12): a plain left click on Home's Golden
// Residence half, with a fine pointer, from 901 px, under the motion gate and
// with the page at its top, grows the half over the whole hero for 0.8 s
// (home.css: data-moving, --s: 1), then lands on the Golden Residence page
// with the doors cut (vt-cut, src/utils/viewTransition.js), the page arriving
// as the hero (data-arrive="hero", src/root.jsx). Any other click follows the
// link through the doors.
//
// Home is opened as a visitor opens it (tests/contracts/site.jsx), offline,
// with a fine pointer that hovers (src/test/media.js), the gate's `js` on
// <html>, a 1440 px window and the page at its top. The motion engine never
// loads: the move is CSS and a timer.

vi.mock('../../motion/runtime', () => ({
  loadMotion: () => new Promise(() => {}),
  getMotion: () => null,
  scheduleInit: () => {},
}))

const GR = '/projects/golden-residence'
const half = () => screen.findByRole('link', { name: /^Golden Residence, жк Левски Г/ })
const html = () => document.documentElement
const arrival = () => document.querySelector('main#main > div').dataset.arrive
const setWindow = (prop, value) => Object.defineProperty(window, prop, { configurable: true, writable: true, value })

let restore
const innerWidth = window.innerWidth
beforeEach(() => {
  goOffline()
  html().classList.add('js')
  setWindow('innerWidth', 1440)
  setWindow('scrollY', 0)
})
afterEach(() => {
  vi.useRealTimers()
  restore?.()
  restore = undefined
  html().classList.remove('js', 'vt-cut')
  setWindow('innerWidth', innerWidth)
  setWindow('scrollY', 0)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The location's state carries the arrival to the router; this test's
// address bar copies only the URL (renderSiteAt pushes null), so the arrival
// is read where the page shows it, on its frame.
it('grows the Golden Residence half over the hero, then lands on its page with the doors cut, as the hero', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

  expect(fireEvent.click(link)).toBe(false)
  const hero = document.querySelector('section.hero')
  expect(hero).toHaveAttribute('data-moving')
  expect(hero.style.getPropertyValue('--s')).toBe('1')
  expect(window.location.pathname).toBe('/')

  await act(async () => { vi.advanceTimersByTime(799) })
  expect(window.location.pathname).toBe('/')
  expect(html()).not.toHaveClass('vt-cut')

  await act(async () => { vi.advanceTimersByTime(1) })
  expect(html()).toHaveClass('vt-cut')
  expect(window.location.pathname).toBe(GR)
  expect(document.querySelector('section.hero')).toBeNull()
  expect(arrival()).toBe('hero')
})

// A second click during the move starts nothing more: one navigation, the
// hero move's.
it('takes no second click while the half grows', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  const entries = window.history.length

  fireEvent.click(link)
  expect(fireEvent.click(link)).toBe(false)
  await act(async () => { vi.advanceTimersByTime(800) })
  expect(window.location.pathname).toBe(GR)
  expect(window.history.length).toBe(entries + 1)
  expect(arrival()).toBe('hero')
})

it('follows the link through the doors, with no cut, where there is no fine pointer', async () => {
  restore = mockMatchMedia({ fine: false })
  renderSiteAt('/')
  const link = await half()

  fireEvent.click(link)
  await waitFor(() => expect(window.location.pathname).toBe(GR))
  expect(html()).not.toHaveClass('vt-cut')
  expect(arrival()).toBe('doors')
})

// Spec M3 §6.6: the Многофамилна half goes to its page through the doors,
// even where the Golden Residence half would make the move: the move is
// Golden Residence's alone.
it('takes the Многофамилна half to its page through the doors, never the hero move', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await screen.findByRole('link', { name: /^Многофамилна сграда, ж\.к\. Връбница-1/ })

  fireEvent.click(link)
  expect(document.querySelector('section.hero')?.hasAttribute('data-moving') ?? false).toBe(false)
  await waitFor(() => expect(window.location.pathname).toBe('/projects/mnogofamilna-sgrada'))
  expect(html()).not.toHaveClass('vt-cut')
  expect(arrival()).toBe('doors')
})

// Each of the move's other conditions, one at a time: the link as any other.
it.each([
  ['a window narrower than 901 px', () => setWindow('innerWidth', 900)],
  ['a page scrolled past 8 px', () => setWindow('scrollY', 9)],
  ['no motion gate', () => html().classList.remove('js')],
  ['reduced motion switched on since the page loaded', () => { restore(); restore = mockMatchMedia({ fine: true, reduce: true }) }],
])('follows the link through the doors with %s', async (_, unmet) => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  unmet()

  fireEvent.click(link)
  expect(document.querySelector('section.hero')?.hasAttribute('data-moving') ?? false).toBe(false)
  await waitFor(() => expect(window.location.pathname).toBe(GR))
  expect(html()).not.toHaveClass('vt-cut')
  expect(arrival()).toBe('doors')
})

// A click that opens a tab or a window stays the browser's: the page takes
// it as it would any link. (jsdom opens no tab: once the page has had the
// click, the test keeps jsdom from loading another document.)
it('leaves a Ctrl-click to the browser', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  const seen = []
  const keepJsdomHere = (event) => {
    seen.push(event.defaultPrevented)
    event.preventDefault()
  }
  window.addEventListener('click', keepJsdomHere)

  try {
    fireEvent.click(link, { ctrlKey: true })
  } finally {
    window.removeEventListener('click', keepJsdomHere)
  }
  expect(seen).toEqual([false])
  expect(document.querySelector('section.hero')).not.toHaveAttribute('data-moving')
  expect(html()).not.toHaveClass('vt-cut')
})

// Review Focus 4: a move given up (another page taken during the 0.8 s, or
// Back) fires no navigation late.
it('the hero move is cancelled by unmount', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

  fireEvent.click(link)
  await act(async () => { vi.advanceTimersByTime(400) })
  fireEvent.click(within(screen.getByRole('banner')).getByRole('link', { name: 'За проекта' }))
  await act(async () => {})
  expect(window.location.pathname).toBe('/eu-proekt')

  await act(async () => { vi.advanceTimersByTime(2000) })
  expect(window.location.pathname).toBe('/eu-proekt')
  expect(html()).not.toHaveClass('vt-cut')
  expect(arrival()).toBe('doors')
})

// Review Focus 4, ruling C9.7: Back during the move, on a Home that is the
// first entry of the tab's history, takes the browser to another document.
// Chrome may then keep Home in its back/forward cache with the timer still
// pending, and a later Forward would bring the page back with the half grown
// and fire the navigation late. pagehide, which comes before the page is
// frozen, gives the move up: no navigation, no cut, and the half as it was.
it('gives the hero move up on pagehide', async () => {
  restore = mockMatchMedia({ fine: true })
  renderSiteAt('/')
  const link = await half()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

  fireEvent.click(link)
  await act(async () => { vi.advanceTimersByTime(400) })
  const hero = document.querySelector('section.hero')
  expect(hero).toHaveAttribute('data-moving')

  await act(async () => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })) })
  expect(hero).not.toHaveAttribute('data-moving')
  expect(hero.style.getPropertyValue('--s')).toBe('')

  await act(async () => { vi.advanceTimersByTime(2000) })
  expect(window.location.pathname).toBe('/')
  expect(html()).not.toHaveClass('vt-cut')

  // The page shown again (Forward, from the cache): the half moves anew on
  // the next click.
  await act(async () => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })) })
  expect(fireEvent.click(link)).toBe(false)
  expect(hero).toHaveAttribute('data-moving')
  await act(async () => { vi.advanceTimersByTime(800) })
  expect(window.location.pathname).toBe(GR)
})
