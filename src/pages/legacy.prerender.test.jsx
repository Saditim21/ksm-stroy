// @vitest-environment node
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ApartmentProvider } from '../context/ApartmentContext'
import About from './About'
import Projects from './Projects'
import Blog from './Blog'
import Contact from './Contact'
import GoldenResidenceBlockSelection from '../components/GoldenResidenceBlockSelection'
import MnogofamilnaBlockSelection from '../components/MnogofamilnaBlockSelection'

// The build pre-renders the legacy pages in Node, and a visitor sees that HTML
// until the JS runs. It is their final visual state (plan, global rules): no
// element starts faded out, collapsed or moved away for an entrance animation
// to bring it in later.

const prerender = (Page) => renderToString(
  <MemoryRouter>
    <ApartmentProvider>{createElement(Page)}</ApartmentProvider>
  </MemoryRouter>,
)

// The inline styles that keep an element out of sight: what framer-motion
// writes for the first frame of an entrance animation.
const HIDING = [
  /(^|;)opacity:0(;|$)/, // faded out
  /(^|;)(width|height):0(px)?(;|$)/, // collapsed
  /(^|;)transform:(?!none(;|$))/, // moved or scaled away from its place
]

const hiddenElements = (html) =>
  [...html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*?\sstyle="([^"]*)"/g)]
    .filter(([, , style]) => HIDING.some((re) => re.test(style)))
    .map(([, tag, style]) => `<${tag} style="${style}">`)

test.each([
  { path: '/about', Page: About, text: 'Мисия и визия' },
  { path: '/projects/golden-residence', Page: GoldenResidenceBlockSelection, text: 'Изберете блок за преглед' },
  { path: '/projects/mnogofamilna-sgrada', Page: MnogofamilnaBlockSelection, text: 'Многофамилна жилищна сграда' },
])('$path pre-renders every element in its final place', ({ Page, text }) => {
  const html = prerender(Page)
  expect(html).toContain(text)
  expect(hiddenElements(html)).toEqual([])
})

// Every page has its H1 in the HTML a visitor without JS gets (spec §6.7; the
// smoke run checks it in the browser). These three had none on main either:
// until M2 to M4 rebuild them, each names itself in a visually hidden H1,
// with its name in the menu. (Home, rebuilt, is src/pages/home/home.prerender.test.jsx's.)
test.each([
  { path: '/projects', Page: Projects, name: 'Продажби' },
  { path: '/blog', Page: Blog, name: 'Обекти' },
  { path: '/contact', Page: Contact, name: 'Контакти' },
])('$path pre-renders one H1, $name', ({ Page, name }) => {
  const headings = [...prerender(Page).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
    .map(([, inner]) => inner.replace(/<[^>]+>/g, '').trim())
  expect(headings).toEqual([name])
})

// A lazy photo renders no <img> before the JS runs; its <noscript> fallback is
// all a visitor without JS gets, so it must not wait for a load event.
test.each([
  { path: '/projects', Page: Projects },
  { path: '/blog', Page: Blog },
])('$path gives its photos a visible <noscript> fallback', ({ Page }) => {
  const fallbacks = [...prerender(Page).matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)]
    .flatMap(([, inner]) => inner.match(/<img\b[^>]*>/g) ?? [])
  expect(fallbacks.length).toBeGreaterThan(0)
  expect(fallbacks.filter((img) => /\sclass="[^"]*\bopacity-0\b/.test(img))).toEqual([])
})
