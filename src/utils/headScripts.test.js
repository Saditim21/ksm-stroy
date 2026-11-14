import { createElement as h } from 'react'
import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { SCREEN_HEIGHT_SCRIPT } from './headScripts'

// The inline scripts root.jsx puts in <head>. A browser runs each one while it
// is still parsing the HTML: before first paint, and long before React
// hydrates the page (spec §6.3).

let realInnerHeight
beforeEach(() => {
  realInnerHeight = window.innerHeight
})
afterEach(() => {
  window.innerHeight = realInnerHeight
  document.head.replaceChildren()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

// root.jsx's Layout, cut down to what decides where the script's <style>
// lands: the script follows the meta tags, and React renders a <style> of its
// own after it.
function Page({ css }) {
  return h('html', null,
    h('head', null,
      h('meta', { charSet: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('script', { dangerouslySetInnerHTML: { __html: SCREEN_HEIGHT_SCRIPT } }),
      h('style', { dangerouslySetInnerHTML: { __html: css } }),
    ),
    h('body', null, h('main', null, 'КСМ Строй')),
  )
}

// Writes server HTML into this document the way a browser's parser does: node
// after node, each inline script running the moment it is in place, while
// nothing after it exists yet.
function parse(html) {
  const source = new DOMParser().parseFromString(html, 'text/html')
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

describe('SCREEN_HEIGHT_SCRIPT', () => {
  it('writes the viewport height into a <style> in <head>, and nothing onto <html>', () => {
    window.innerHeight = 812
    new Function(SCREEN_HEIGHT_SCRIPT)()
    const style = document.getElementById('screen-h')
    expect(style.textContent).toBe(':root{--screen-h:812px}')
    expect(style.parentNode).toBe(document.head)
    expect(document.documentElement.getAttribute('class')).toBe(null)
    expect(document.documentElement.getAttribute('style')).toBe(null)
  })

  // In <head>, React 19 hydrates a <style> it rendered into the next <style>
  // it finds. The script's own <style> must not be the one it finds.
  it('leaves React its own <style> when the page hydrates', async () => {
    const html = renderToString(h(Page, { css: 'main{color:#14202F}' }))
    parse(html)
    const screenH = document.getElementById('screen-h')
    const height = screenH.textContent
    expect(height).toMatch(/^:root\{--screen-h:\d+px\}$/)

    const errors = []
    const logged = vi.spyOn(console, 'error')
    let root
    await act(async () => {
      root = hydrateRoot(document, h(Page, { css: 'main{color:#14202F}' }), {
        onRecoverableError: (error) => errors.push(error),
      })
    })
    expect(errors).toEqual([])
    expect(logged.mock.calls).toEqual([])

    // A change to React's <style> lands in React's <style>.
    await act(async () => root.render(h(Page, { css: 'main{color:#1F3A63}' })))
    expect(document.getElementById('screen-h')).toBe(screenH)
    expect([...document.head.querySelectorAll('style')].map((style) => style.textContent))
      .toEqual([height, 'main{color:#1F3A63}'])
    await act(async () => root.unmount())
  })
})
