// @vitest-environment node
/* global BUILD_YEAR */
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import App from '../root'

// The build prerenders every page in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// §5.5). The shell renders there in full: the EU row, the bar, the footer,
// with nothing hidden, faded or moved, the header in its top-of-page state,
// and no menu, which only a tap opens.

const page = (handle) => ({ Component: () => <p>Страница</p>, handle })

function prerender(path) {
  const router = createMemoryRouter(
    [{
      path: '/',
      Component: App,
      children: [
        { index: true, ...page({ header: 'overlay' }) },
        { path: 'about', ...page() },
        { path: 'projects/golden-residence', ...page({ header: 'solid', project: 'golden-residence' }) },
      ],
    }],
    { initialEntries: [path] },
  )
  // React separates neighbouring text nodes with an empty comment.
  return renderToString(<RouterProvider router={router} />).replaceAll('<!-- -->', '')
}

// Ruling C4.9: the footer's © line takes the year from the build, which Vite
// writes into the code, so the prerender and the browser show the same year.
test('Vite writes the year of the build into the code', async () => {
  const { default: config } = await import('../../vite.config.js')
  expect(config.define.BUILD_YEAR).toBe(JSON.stringify(new Date().getFullYear()))
})

// „Продажби“ comes from the footer's quick links: the header holds no page
// links (spec §6.2).
test.each(['/', '/about', '/projects/golden-residence'])('%s: the shell prerenders complete with no window', (path) => {
  expect(typeof window).toBe('undefined')
  const html = prerender(path)

  for (const text of ['BG16RFPR001-1.012-1485-C01', 'За проекта', 'Продажби', '+359 887 886 166', 'Запитване', 'КСМ СТРОЙ ООД', `© ${BUILD_YEAR} КСМ Строй`]) {
    expect(html).toContain(text)
  }
  expect(html).not.toContain('role="dialog"')
})

test.each(['/', '/about', '/projects/golden-residence'])('%s: nothing in the shell starts hidden, faded or moved', (path) => {
  const html = prerender(path)
  const styles = [...html.matchAll(/\sstyle="([^"]*)"/g)].map(([, style]) => style)

  expect(styles.filter((style) => /opacity|transform|translate|scale|visibility|clip/.test(style))).toEqual([])
  expect(html).not.toMatch(/\bopacity-0\b|\binvisible\b|-translate-y-full|data-hidden|data-scrolled/)
})

test('the header starts see-through only over a page that asks for it', () => {
  expect(prerender('/')).toContain('data-look="overlay"')
  expect(prerender('/about')).toContain('data-look="solid"')
})
