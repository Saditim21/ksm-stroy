// @vitest-environment node
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import About from './About'

// The build pre-renders the legacy pages in Node, and a visitor sees that HTML
// until the JS runs. It is their final visual state (plan, global rules): no
// element starts faded out, collapsed or moved away for an entrance animation
// to bring it in later. (Home, the Golden Residence page and its block
// pages, the Многофамилна page and its block pages, and Обекти, rebuilt, are
// src/pages/home/home.prerender.test.jsx's,
// src/pages/golden-residence/gr.prerender.test.jsx's,
// src/explorer/BlockPage.prerender.test.jsx's,
// src/pages/mnogofamilna/mn.prerender.test.jsx's,
// src/pages/mnogofamilna/mn-block.prerender.test.jsx's and
// src/pages/works/blog.prerender.test.jsx's.) No page the site
// serves is wrapped in the legacy ApartmentProvider any more, so neither are
// these.

const prerender = (Page) => renderToString(
  <MemoryRouter>{createElement(Page)}</MemoryRouter>,
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
])('$path pre-renders every element in its final place', ({ Page, text }) => {
  const html = prerender(Page)
  expect(html).toContain(text)
  expect(hiddenElements(html)).toEqual([])
})
