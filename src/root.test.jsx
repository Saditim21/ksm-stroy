import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { Layout } from './root'

// The document root.jsx puts around every page. React Router's head and
// script components need the framework's context, which a test has not got;
// they render nothing here.
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  Links: () => null,
  Meta: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
}))

const documentHtml = () => renderToStaticMarkup(<MemoryRouter><Layout><p>Страница</p></Layout></MemoryRouter>)

// The browser's bar takes the page's ground, paper (spec §3.1), as the web
// manifest says.
it('gives the browser the paper theme colour, the manifest’s', () => {
  const manifest = JSON.parse(readFileSync(join(cwd(), 'public/site.webmanifest'), 'utf8'))

  expect(manifest.theme_color).toBe('#F1F2EF')
  expect(documentHtml()).toContain('<meta name="theme-color" content="#F1F2EF"/>')
})
