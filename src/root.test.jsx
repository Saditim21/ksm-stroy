import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../tests/contracts/site'
import LenisScrollSync from './motion/LenisScrollSync'
import App, { Layout } from './root'
import { mockMatchMedia } from './test/media'
import { MOTION_GATE_SCRIPT, SCREEN_HEIGHT_SCRIPT, THEME_SCRIPT } from './utils/headScripts'

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

// Polish spec §5: the visitor's theme is on <html> before the first paint,
// set by the theme script right after the gate, before the stylesheet.
it('runs the theme script right after the gate, before the stylesheet', () => {
  const html = renderToString(<MemoryRouter><Layout><p /></Layout></MemoryRouter>)
  const gate = html.indexOf(MOTION_GATE_SCRIPT)
  const theme = html.indexOf(THEME_SCRIPT)
  expect(theme).toBeGreaterThan(gate)
  expect(html.slice(gate + MOTION_GATE_SCRIPT.length, theme)).toBe('</script><script>')
  expect(theme).toBeLessThan(html.indexOf('<style>'))
})

// Onyx from the first paint, before the stylesheet has loaded.
it('paints the onyx ground before the stylesheet', () => {
  const critical = /<style>([^<]*)<\/style>/.exec(documentHtml())?.[1]

  expect(critical).toContain('background-color:#0E0D0B')
  // A visitor who chose light gets the light ground at once, never onyx first.
  expect(critical).toContain('[data-theme=light] body{background-color:#ECE6DA;color:#17140F}')
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
// build the router themselves, with a page for each path, and keep it. The
// app renders as Layout has it in the document, with LenisScrollSync after it.
describe('arrival and focus', () => {
  const page = (text, handle = { header: 'solid' }) => ({ Component: () => <p>{text}</p>, handle })
  // The site keeps rendering while a route change's view transition is up (the
  // header, the data), and React runs that change's passive effects,
  // LenisScrollSync's among them, before it renders again. renderAgain()
  // stands in for that.
  let renderAgain
  function Site() {
    const [, setRenders] = useState(0)
    renderAgain = () => act(() => setRenders((renders) => renders + 1))
    return (
      <>
        <App />
        <LenisScrollSync />
      </>
    )
  }
  function renderApp(path) {
    goOffline()
    const router = createMemoryRouter(
      [{
        path: '/',
        Component: Site,
        children: [
          { index: true, ...page('Начало', { header: 'overlay' }) },
          { path: 'eu-proekt', ...page('Проект на ЕС') },
          { path: 'about', ...page('Страницата за нас') },
          // A page with a section a link's hash can name.
          {
            path: 'team',
            Component: () => (
              <section id="ekip" aria-label="Екипът">
                <p>Екипът</p>
              </section>
            ),
            handle: { header: 'solid' },
          },
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

  // Ruling FR2 (spec §5.6 as amended): a page a link with a hash opens lands
  // at the hash's element (ScrollRestoration scrolls it into view), and the
  // focus goes there too, with no scroll of its own, so the keyboard and a
  // screen reader start where the link promised (Home's teaser ways into
  // #explorer). An element that takes no focus gets tabindex="-1" for it.
  it('focuses the element a link’s hash names on the page it opens', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    const { router } = renderApp('/eu-proekt')
    await act(() => router.navigate('/team#ekip'))
    await shows('Екипът')
    const section = document.getElementById('ekip')
    await waitFor(() => expect(document.activeElement).toBe(section))
    expect(section).toHaveAttribute('tabindex', '-1')
    const call = focus.mock.contexts.indexOf(section)
    expect(focus.mock.calls[call]).toEqual([{ preventScroll: true }])
  })

  it('focuses <main> when the hash names nothing on the page', async () => {
    const { router } = renderApp('/eu-proekt')
    await act(() => router.navigate('/about#nowhere'))
    await shows('Страницата за нас')
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

  // The frame is keyed by the path: a hash or query change is the same page,
  // and the focus stays where it is (spec §5.6, ruling C9.2). The focus is
  // moved off <main> first, so a hash change that took it back there would
  // show.
  it('keeps the frame, its data-arrive and the focus through a hash change', async () => {
    const { router } = renderApp('/eu-proekt')
    await act(() => router.navigate('/about'))
    await shows('Страницата за нас')
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('main#main')))
    const shown = frame()
    const link = within(screen.getByRole('contentinfo')).getByRole('link', { name: 'За нас' })
    act(() => link.focus())
    expect(document.activeElement).toBe(link)

    await act(() => router.navigate('/about#ekip'))
    expect(router.state.location.hash).toBe('#ekip')
    expect(frame()).toBe(shown)
    expect(frame()).toHaveAttribute('data-arrive', 'doors')
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    expect(document.activeElement).toBe(link)
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

    // The hero move's cut and Back's are theirs to keep, until their change is
    // over (below).
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

    // A browser's same-document view transitions, as far as the doors need
    // them (CSS View Transitions, as Chrome runs them):
    // - startViewTransition() captures the view being left, then runs the
    //   update, in which React applies the new page;
    // - it then sets up the pseudo-elements, styled by the stylesheet with
    //   <html>'s classes as they are, and `ready` resolves: React calls the
    //   route boundary's onEnter and onExit;
    // - the stylesheet styles them as long as the transition is up: a class
    //   change on <html> restyles them at once, so lifting `vt-cut` starts the
    //   doors on them (src/styles/motion.css), from the page left;
    // - the transition is up until the frame after its animations have all
    //   finished, and then `finished` resolves.
    // Each transition records the cut it was started with, the cut its
    // pseudo-elements were styled with, and the cut every class change on
    // <html> left while it was up.
    function browserViewTransitions() {
      const transitions = []
      const listed = []
      let up = null
      const watch = new MutationObserver(() => {
        if (up) up.cuts.push(html.classList.contains('vt-cut'))
      })
      watch.observe(html, { attributes: true, attributeFilter: ['class'] })
      document.startViewTransition = ({ update }) => {
        let resolveReady
        let resolveAnimations
        let resolveFinished
        const ready = new Promise((resolve) => { resolveReady = resolve })
        const finished = new Promise((resolve) => { resolveFinished = resolve })
        const animation = {
          effect: { pseudoElement: '::view-transition-group(root)', target: html, getKeyframes: () => [], setKeyframes() {} },
          finished: new Promise((resolve) => { resolveAnimations = resolve }),
          cancel() {},
        }
        const over = async () => {
          up = null
          listed.splice(listed.indexOf(animation), 1)
          resolveFinished()
          await act(async () => {})
        }
        const transition = {
          cutAtStart: html.classList.contains('vt-cut'),
          cuts: [],
          ready,
          // Its animations finish; it stays up until the next frame.
          endAnimations: () => act(async () => resolveAnimations()),
          // The next frame: it is over.
          over,
        }
        transitions.push(transition)
        listed.push(animation)
        queueMicrotask(async () => {
          await update()
          transition.cut = html.classList.contains('vt-cut')
          up = transition
          resolveReady()
        })
        return { ready, finished, updateCallbackDone: ready, skipTransition: over, types: new Set() }
      }
      document.getAnimations = () => [...listed]
      html.getAnimations = () => [...listed]
      Object.defineProperty(document, 'fonts', { configurable: true, value: { status: 'loaded', ready: Promise.resolve() } })
      vi.stubGlobal('CSS', { escape: (name) => name })
      // Every page in view, as React measures it before naming it.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1024, 768))
      return {
        transitions,
        restore() {
          watch.disconnect()
          delete document.startViewTransition
          delete document.getAnimations
          delete html.getAnimations
          delete document.fonts
        },
      }
    }

    // The text of every page main shows, in order, each once as it comes.
    function pagesShown() {
      const shown = [frame().textContent]
      new MutationObserver(() => {
        const text = frame()?.textContent
        if (text !== shown.at(-1)) shown.push(text)
      }).observe(document.getElementById('main'), { childList: true, subtree: true })
      return shown
    }

    // Back and Forward are instant (spec §5.6): one view transition each,
    // which the cut keeps from its start until it is over, so its doors never
    // start, and the page left never shows again. Its animations end a frame
    // before it does: the cut lifted then would start the doors there, from
    // the page left.
    it('switches at once on Back and Forward: one view transition each, cut until it is over', async () => {
      const browser = browserViewTransitions()
      try {
        const { router } = renderApp('/eu-proekt')
        const shown = pagesShown()

        fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'За нас' }))
        await shows('Страницата за нас')
        await waitFor(() => expect(browser.transitions).toHaveLength(1))
        const [doors] = browser.transitions
        await act(() => doors.ready)
        expect(doors).toMatchObject({ cutAtStart: false, cut: false })
        await renderAgain()
        await doors.endAnimations()
        await doors.over()

        const steps = [
          { address: '/eu-proekt', delta: -1, page: 'Проект на ЕС' },
          { address: '/about', delta: 1, page: 'Страницата за нас' },
        ]
        for (const [i, { address, delta, page }] of steps.entries()) {
          pop(address)
          await act(() => router.navigate(delta))
          await shows(page)
          await waitFor(() => expect(browser.transitions).toHaveLength(2 + i))
          const transition = browser.transitions[1 + i]
          await act(() => transition.ready)
          expect(transition).toMatchObject({ cutAtStart: true, cut: true })
          expect(frame()).toHaveAttribute('data-arrive', 'pop')

          await renderAgain()
          await transition.endAnimations()
          expect(html.classList.contains('vt-cut')).toBe(true)
          await transition.over()
          expect(html.classList.contains('vt-cut')).toBe(false)
          expect(transition.cuts).not.toContain(false)
        }

        expect(browser.transitions).toHaveLength(3)
        expect(shown).toEqual(['Проект на ЕС', 'Страницата за нас', 'Проект на ЕС', 'Страницата за нас'])
      } finally {
        browser.restore()
      }
    })

    // A link, the open menu's among them, runs the doors once: one view
    // transition, never cut.
    it('runs the doors once for a page link in the open menu', async () => {
      const browser = browserViewTransitions()
      try {
        renderApp('/eu-proekt')
        fireEvent.click(screen.getByRole('button', { name: /Меню/ }))
        fireEvent.click(within(screen.getByRole('dialog', { name: 'Меню' })).getByRole('link', { name: 'За нас' }))
        await shows('Страницата за нас')
        await waitFor(() => expect(browser.transitions).toHaveLength(1))
        const [doors] = browser.transitions
        await act(() => doors.ready)
        expect(doors).toMatchObject({ cutAtStart: false, cut: false })
        await renderAgain()
        await doors.endAnimations()
        await doors.over()

        expect(doors.cuts).not.toContain(true)
        expect(browser.transitions).toHaveLength(1)
        expect(screen.queryByRole('dialog', { name: 'Меню' })).toBeNull()
      } finally {
        browser.restore()
      }
    })
  })
})

// The page's ground: the root snapshot's dark one, with the page in its one
// frame, the snapshot the doors open and close on the seam. No page is legacy
// any more (spec M3/M4 §9): the legacy pages' light ground, which <main>
// carried as .legacy-ground, left with them, and a handle that still says
// `legacy` changes nothing. Never a utility of <main>'s own, which would
// paint under the doors.
describe('the page’s ground', () => {
  it('is the dark one under every page, whatever its handle says, with the page in its frame', async () => {
    goOffline()
    const router = createMemoryRouter(
      [{ path: '/', Component: App, children: [{ index: true, Component: () => <p>Стара страница</p>, handle: { header: 'solid', legacy: true } }] }],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
    await screen.findByText('Стара страница')

    const main = document.getElementById('main')
    expect(main).not.toHaveClass('on-light')
    expect(main).not.toHaveClass('legacy-ground')
    expect(main.className).not.toMatch(/(^|\s)bg-/)
    expect(main.children).toHaveLength(1)
    expect(main.firstElementChild).toHaveClass('page-frame')
    expect(document.querySelector('.grain')).toHaveAttribute('aria-hidden', 'true')
  })

  it('frames a rebuilt page the same way', async () => {
    goOffline()
    renderSiteAt('/eu-proekt')
    await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

    const main = document.getElementById('main')
    expect(main).not.toHaveClass('legacy-ground')
    expect(main.children).toHaveLength(1)
    expect(main.firstElementChild).toHaveClass('page-frame')
  })
})
