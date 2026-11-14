import { createElement as h } from 'react'
import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { MOTION_GATE_SCRIPT, SCREEN_HEIGHT_SCRIPT } from './headScripts'
import { mockMatchMedia } from '../test/media'

// The inline scripts root.jsx puts in <head>. A browser runs each one while it
// is still parsing the HTML: before first paint, and long before React
// hydrates the page (spec §6.3). They write into <head>, except the motion
// gate, whose class on <html> is the one attribute a script writes there
// (spec §5.2): root.jsx renders <html> with no class and with
// suppressHydrationWarning, so hydration leaves the class alone.

const html = document.documentElement
let realInnerHeight
let restoreMedia
beforeEach(() => {
  realInnerHeight = window.innerHeight
})
afterEach(() => {
  window.innerHeight = realInnerHeight
  document.head.replaceChildren()
  document.body.replaceChildren()
  for (const { name } of [...html.attributes]) html.removeAttribute(name)
  restoreMedia?.()
  restoreMedia = undefined
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
})

// root.jsx's Layout, cut down to what decides where the scripts' work lands:
// <html> as root.jsx renders it, the scripts after the meta tags, the
// screen-height script first, and a <style> of React's own after them.
function Page({ css }) {
  return h('html', { lang: 'bg', suppressHydrationWarning: true },
    h('head', null,
      h('meta', { charSet: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('script', { dangerouslySetInnerHTML: { __html: SCREEN_HEIGHT_SCRIPT } }),
      h('script', { dangerouslySetInnerHTML: { __html: MOTION_GATE_SCRIPT } }),
      h('style', { dangerouslySetInnerHTML: { __html: css } }),
    ),
    h('body', null, h('main', null, 'КСМ Строй')),
  )
}

// Writes server HTML into this document the way a browser's parser does:
// <html> with its attributes first, then node after node, each inline script
// running the moment it is in place, while nothing after it exists yet.
function parse(markup) {
  const source = new DOMParser().parseFromString(markup, 'text/html')
  for (const { name } of [...html.attributes]) html.removeAttribute(name)
  for (const { name, value } of [...source.documentElement.attributes]) html.setAttribute(name, value)
  for (const part of ['head', 'body']) {
    document[part].replaceChildren()
    for (const node of [...source[part].childNodes]) {
      if (node.nodeName === 'SCRIPT') {
        // A script parsed by DOMParser never runs; one created here runs as it
        // is inserted, with document.currentScript set (jsdom, runScripts).
        const script = document.createElement('script')
        script.textContent = node.textContent
        document[part].appendChild(script)
      } else {
        document[part].appendChild(document.importNode(node, true))
      }
    }
  }
}

// A script jsdom runs sees jsdom's own window, of which the tests' `window`
// is a copy: mockMatchMedia's matchMedia goes there too, until restored.
function withMatchMediaInScripts(restore) {
  const scripts = globalThis.jsdom.window
  scripts.matchMedia = window.matchMedia
  return () => {
    delete scripts.matchMedia
    restore()
  }
}

// Hydrates the document; returns the errors React recovered from and what it
// logged.
async function hydrate(element) {
  const errors = []
  const logged = vi.spyOn(console, 'error')
  let root
  await act(async () => {
    root = hydrateRoot(document, element, { onRecoverableError: (error) => errors.push(error) })
  })
  return { root, errors, logged: logged.mock.calls }
}

describe('SCREEN_HEIGHT_SCRIPT', () => {
  it('writes the viewport height into a <style> in <head>, and nothing onto <html>', () => {
    window.innerHeight = 812
    new Function(SCREEN_HEIGHT_SCRIPT)()
    const style = document.getElementById('screen-h')
    expect(style.textContent).toBe(':root{--screen-h:812px}')
    expect(style.parentNode).toBe(document.head)
    expect(html.getAttribute('class')).toBe(null)
    expect(html.getAttribute('style')).toBe(null)
  })

  // In <head>, React 19 hydrates a <style> it rendered into the next <style>
  // it finds. The script's own <style> must not be the one it finds.
  it('leaves React its own <style> when the page hydrates', async () => {
    parse(renderToString(h(Page, { css: 'main{color:#EFE9DD}' })))
    const screenH = document.getElementById('screen-h')
    const height = screenH.textContent
    expect(height).toMatch(/^:root\{--screen-h:\d+px\}$/)

    const { root, errors, logged } = await hydrate(h(Page, { css: 'main{color:#EFE9DD}' }))
    expect(errors).toEqual([])
    expect(logged).toEqual([])

    // A change to React's <style> lands in React's <style>.
    await act(async () => root.render(h(Page, { css: 'main{color:#0E0D0B}' })))
    expect(document.getElementById('screen-h')).toBe(screenH)
    expect([...document.head.querySelectorAll('style')].map((style) => style.textContent))
      .toEqual([height, 'main{color:#0E0D0B}'])
    await act(async () => root.unmount())
  })
})

describe('MOTION_GATE_SCRIPT, through hydration', () => {
  it('follows the screen-height script in a <head> whose <html> React renders with no class', () => {
    const markup = renderToString(h(Page, { css: '' }))
    expect(markup).toContain('<html lang="bg">')
    const screenHeight = markup.indexOf(SCREEN_HEIGHT_SCRIPT)
    expect(screenHeight).toBeGreaterThan(-1)
    expect(markup.indexOf(MOTION_GATE_SCRIPT)).toBeGreaterThan(screenHeight)
  })

  // The first Home load of a session, in a browser that allows motion.
  it('marks <html> before React hydrates, and hydration keeps the mark', async () => {
    restoreMedia = withMatchMediaInScripts(mockMatchMedia())
    window.history.replaceState(null, '', '/')
    expect(sessionStorage.length).toBe(0)

    parse(renderToString(h(Page, { css: 'main{color:#EFE9DD}' })))
    expect(html.className).toBe('js intro')
    expect(html.getAttribute('lang')).toBe('bg')

    const { root, errors, logged } = await hydrate(h(Page, { css: 'main{color:#EFE9DD}' }))
    expect(errors).toEqual([])
    expect(logged).toEqual([])
    expect(html.className).toBe('js intro')

    await act(async () => root.render(h(Page, { css: 'main{color:#0E0D0B}' })))
    expect(html.className).toBe('js intro')
    await act(async () => root.unmount())
  })
})
