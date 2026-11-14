import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../tests/contracts/site'
import App, { Layout } from './root'
import { mockMatchMedia } from './test/media'
import { MOTION_GATE_SCRIPT, SCREEN_HEIGHT_SCRIPT } from './utils/headScripts'

// The document root.jsx puts around every page, and the app inside it. React
// Router's head and script components need the framework's context, which a
// test has not got; they render nothing here.
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  Links: () => null,
  Meta: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const documentHtml = () => renderToStaticMarkup(<MemoryRouter><Layout><p>Страница</p></Layout></MemoryRouter>)

// The browser's bar takes the page's ground, onyx (spec §2.1), as the web
// manifest says.
it('gives the browser the onyx theme colour, the manifest’s', () => {
  const manifest = JSON.parse(readFileSync(join(cwd(), 'public/site.webmanifest'), 'utf8'))

  expect(manifest.theme_color).toBe('#0E0D0B')
  expect(manifest.background_color).toBe('#0E0D0B')
  expect(documentHtml()).toContain('<meta name="theme-color" content="#0E0D0B"/>')
})

// The motion gate (spec §5.2) runs right after the screen-height script. Its
// class is the one attribute a script writes on <html>: React renders none
// there (src/utils/headScripts.test.js hydrates the gate's class).
it('renders <html lang="bg"> with no class, the gate script right after the screen-height one', () => {
  const html = renderToString(<MemoryRouter><Layout><p /></Layout></MemoryRouter>)

  expect(html).toContain('<html lang="bg">')
  const screenHeight = html.indexOf(SCREEN_HEIGHT_SCRIPT)
  const gate = html.indexOf(MOTION_GATE_SCRIPT)
  expect(screenHeight).toBeGreaterThan(-1)
  expect(gate).toBeGreaterThan(screenHeight)
  expect(html.slice(screenHeight + SCREEN_HEIGHT_SCRIPT.length, gate)).toBe('</script><script>')
})

// Onyx from the first paint, before the stylesheet has loaded.
it('paints the onyx ground before the stylesheet', () => {
  const critical = /<style>([^<]*)<\/style>/.exec(documentHtml())?.[1]

  expect(critical).toContain('background-color:#0E0D0B')
})

// --screen-h (src/utils/screenHeight.js): the head script writes it before
// first paint, and from the moment the app is up in the browser it follows the
// screen, as trackScreenHeight() decides (with a mouse, every resize).
it('keeps --screen-h following the screen once the app is up', async () => {
  const root = document.documentElement
  const screenHeight = (height) => Object.defineProperty(root, 'clientHeight', { configurable: true, value: height })
  const restore = mockMatchMedia({ reduce: true })
  goOffline()
  screenHeight(700)
  try {
    renderSiteAt('/about')
    await waitFor(() => expect(document.getElementById('screen-h')?.textContent).toBe(':root{--screen-h:700px}'))

    screenHeight(640)
    window.dispatchEvent(new Event('resize'))
    expect(document.getElementById('screen-h').textContent).toBe(':root{--screen-h:640px}')
  } finally {
    restore()
    delete root.clientHeight
    document.getElementById('screen-h')?.remove()
  }
}, 30000)

// How a page arrives (spec §5.5, §5.6): the keyed page frame's data-arrive
// sets the entrance delay (src/styles/motion.css). The first page the app
// renders, prerendered and then hydrated, has none; a page Back or Forward
// brings is `pop`; the hero move's target is `hero`; every other page comes
// through the doors. On every page but the first, focus moves to <main>.
//
// renderSiteAt's memory router never reads window.history, so these cases
// build the router themselves, with a page for each path, and keep it.
describe('arrival and focus', () => {
  const page = (text, handle = { header: 'solid' }) => ({ Component: () => <p>{text}</p>, handle })
  function renderApp(path) {
    goOffline()
    const router = createMemoryRouter(
      [{
        path: '/',
        Component: App,
        children: [
          { index: true, ...page('Начало', { header: 'overlay' }) },
          { path: 'eu-proekt', ...page('Проект на ЕС') },
          { path: 'about', ...page('Страницата за нас') },
        ],
      }],
      { initialEntries: [path] },
    )
    return { router, ...render(<RouterProvider router={router} />) }
  }
  const frame = () => document.querySelector('main#main > div')
  const shows = (text) => waitFor(() => expect(frame()).toHaveTextContent(text))

  afterEach(() => document.documentElement.removeAttribute('class'))

  it('gives the first page no data-arrive, and leaves focus where it is', () => {
    renderApp('/eu-proekt')
    expect(frame()).toHaveTextContent('Проект на ЕС')
    expect(frame()).not.toHaveAttribute('data-arrive')
    expect(document.activeElement).toBe(document.body)
  })

  it('brings a page a link opens through the doors, and focuses <main>', async () => {
    renderApp('/eu-proekt')
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'За нас' }))
    await shows('Страницата за нас')
    expect(frame()).toHaveAttribute('data-arrive', 'doors')
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('main#main')))
  })

  // React Router gives the first entry the key "default", and Back restores
  // it: a check of the key would take this for the first load.
  it('Back gives data-arrive="pop"', async () => {
    const { router } = renderApp('/eu-proekt')
    expect(router.state.location.key).toBe('default')
    await act(() => router.navigate('/about'))
    await shows('Страницата за нас')

    await act(() => router.navigate(-1))
    await shows('Проект на ЕС')
    expect(router.state.location.key).toBe('default')
    expect(frame()).toHaveAttribute('data-arrive', 'pop')
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('main#main')))
  })

  it('gives the hero move’s target data-arrive="hero"', async () => {
    const { router } = renderApp('/')
    await act(() => router.navigate('/about', { state: { arrive: 'hero' } }))
    await shows('Страницата за нас')
    expect(frame()).toHaveAttribute('data-arrive', 'hero')
  })

  // The frame is keyed by the path: a hash or query change is the same page.
  it('keeps the frame and its data-arrive through a hash change', async () => {
    const { router } = renderApp('/eu-proekt')
    await act(() => router.navigate('/about'))
    await shows('Страницата за нас')
    const shown = frame()

    await act(() => router.navigate('/about#ekip'))
    expect(router.state.location.hash).toBe('#ekip')
    expect(frame()).toBe(shown)
    expect(frame()).toHaveAttribute('data-arrive', 'doors')
  })

  // The doors close the whole view, the root snapshot with the page
  // (src/utils/viewTransition.js), and the server's <html> has no style.
  it('keeps the root in every route change while the app is up', () => {
    const html = document.documentElement
    const { unmount } = renderApp('/eu-proekt')
    expect(html.style.viewTransitionName).toBe('root')
    unmount()
    expect(html.style.viewTransitionName).toBe('')
  })

  // `vt-cut` turns a route change's doors off (src/utils/viewTransition.js).
  // In the browser the address bar is the router's location; here the memory
  // router stands in for it, so each popstate sets the address it leaves.
  describe('the doors’ cut', () => {
    const html = document.documentElement
    const pop = (url) => {
      window.history.replaceState(null, '', url)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
    afterEach(() => window.history.replaceState(null, '', '/'))

    // Back and Forward bring another page, and are instant.
    it('cuts the doors on a popstate that brings another page, while the app is up', () => {
      const { unmount } = renderApp('/eu-proekt')
      pop('/about')
      expect(html.classList.contains('vt-cut')).toBe(true)

      html.classList.remove('vt-cut')
      unmount()
      pop('/eu-proekt')
      expect(html.classList.contains('vt-cut')).toBe(false)
    })

    // A fragment the browser follows (the skip link, a legacy page's
    // #section) fires a popstate and keeps the page: no doors to cut, and a cut
    // would wait for the next route change to clear it, which would then run
    // without its doors. The DOM standard (and jsdom) runs the app's capturing
    // listener before the router's; Chrome runs window's listeners in the
    // order they were added, the router's first, and React has applied a change
    // that runs no view transition by the time the app's listener runs.
    it('leaves no cut for a fragment the browser follows, before or after the router has it', async () => {
      const { router } = renderApp('/eu-proekt')
      pop('/eu-proekt#main')
      expect(html.classList.contains('vt-cut')).toBe(false)
      await act(() => router.navigate('/eu-proekt#main'))
      expect(html.classList.contains('vt-cut')).toBe(false)

      await act(() => router.navigate('/eu-proekt#kontakt'))
      pop('/eu-proekt#kontakt')
      expect(html.classList.contains('vt-cut')).toBe(false)
    })

    // A cut still on when a link is followed was left by a change that never
    // came (Back to a page still loading when the link was followed, a hero
    // move given up). The page the doors bring lifts it as React applies the
    // page, before the view transition sets up the doors.
    it('lifts a cut left over when a page comes through the doors', async () => {
      renderApp('/eu-proekt')
      html.classList.add('vt-cut')
      fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'За нас' }))
      await shows('Страницата за нас')
      expect(frame()).toHaveAttribute('data-arrive', 'doors')
      expect(html.classList.contains('vt-cut')).toBe(false)
    })

    // The hero move's cut and Back's are theirs to keep, until LenisScrollSync
    // clears them once their change is over.
    it('keeps the cut of a page the hero move or Back brings', async () => {
      const { router } = renderApp('/')
      html.classList.add('vt-cut')
      await act(() => router.navigate('/about', { state: { arrive: 'hero' } }))
      await shows('Страницата за нас')
      expect(html.classList.contains('vt-cut')).toBe(true)

      await act(() => router.navigate(-1))
      await shows('Начало')
      expect(frame()).toHaveAttribute('data-arrive', 'pop')
      expect(html.classList.contains('vt-cut')).toBe(true)
    })
  })
})
