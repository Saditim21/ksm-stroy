import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import useMotionAllowed from './useMotionAllowed'
import useMediaQuery from './useMediaQuery'
import useCoarsePointer from './useCoarsePointer'
import useFinePointer from './useFinePointer'
import useHydrated from './useHydrated'
import { mockMatchMedia } from '../test/media'

// The build prerenders every page in Node, where there is no window, and the
// browser hydrates that HTML. The first client render must produce the same
// markup (spec §6.2), so a hook that reads the browser while rendering breaks
// hydration wherever the browser answers differently from the server. Each
// test renders on the "server" first, then lets the browser answer otherwise
// and hydrates the HTML.

let container
let root
let restore
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})
afterEach(() => {
  act(() => root?.unmount())
  root = undefined
  container.remove()
  restore?.()
  restore = undefined
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
})

// A browser that answers these queries as given, and matches no other.
function installMatchMedia(answers) {
  restore = mockMatchMedia()
  for (const [query, matches] of Object.entries(answers)) window.matchMedia(query).matches = matches
}

// Hydrates the server's HTML. Returns the errors React recovered from (a
// hydration mismatch is one) and what it logged.
async function hydrate(html, element) {
  container.innerHTML = html
  const errors = []
  const logged = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(error) })
  })
  return { errors, logged: logged.mock.calls }
}

describe.each([
  ['useMotionAllowed', () => useMotionAllowed(), { '(prefers-reduced-motion: reduce)': false }],
  ['useMediaQuery', () => useMediaQuery('(min-width: 768px)'), { '(min-width: 768px)': true }],
  ['useCoarsePointer', () => useCoarsePointer(), { '(pointer: coarse)': true }],
  ['useFinePointer', () => useFinePointer(), { '(hover: hover) and (pointer: fine)': true }],
])('%s', (_hook, useAnswer, browser) => {
  const Probe = () => (useAnswer() ? 'on' : 'off')

  it('hydrates without a mismatch where the browser says yes, then says yes', async () => {
    const html = renderToString(<Probe />)
    expect(html).toBe('off')
    installMatchMedia(browser)
    const { errors, logged } = await hydrate(html, <Probe />)
    expect(errors).toEqual([])
    expect(logged).toEqual([])
    expect(container.textContent).toBe('on')
  })
})

describe('useHydrated', () => {
  it('is false in the server HTML and true after hydration', async () => {
    const Probe = () => String(useHydrated())
    const html = renderToString(<Probe />)
    expect(html).toBe('false')
    const { errors, logged } = await hydrate(html, <Probe />)
    expect(errors).toEqual([])
    expect(logged).toEqual([])
    expect(container.textContent).toBe('true')
  })

  // A deep link such as /projects/golden-residence/block-a?floor=3 opens the
  // page that was prerendered without a query string. A view that waits for
  // useHydrated before it reads the query hydrates against that HTML, then
  // shows the floor (plan, Review Focus 1).
  it('lets a view show the query state of a deep link once hydrated', async () => {
    const Floor = () => (useHydrated() ? new URLSearchParams(window.location.search).get('floor') : '—')
    const html = renderToString(<Floor />)
    expect(html).toBe('—')
    window.history.replaceState(null, '', '/projects/golden-residence/block-a?floor=3')
    const { errors, logged } = await hydrate(html, <Floor />)
    expect(errors).toEqual([])
    expect(logged).toEqual([])
    expect(container.textContent).toBe('3')
  })
})
