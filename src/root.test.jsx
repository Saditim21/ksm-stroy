import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { waitFor } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../tests/contracts/site'
import { Layout } from './root'
import { mockMatchMedia } from './test/media'

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

// The browser's bar takes the page's ground, paper (spec §3.1), as the web
// manifest says.
it('gives the browser the paper theme colour, the manifest’s', () => {
  const manifest = JSON.parse(readFileSync(join(cwd(), 'public/site.webmanifest'), 'utf8'))

  expect(manifest.theme_color).toBe('#F1F2EF')
  expect(documentHtml()).toContain('<meta name="theme-color" content="#F1F2EF"/>')
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
