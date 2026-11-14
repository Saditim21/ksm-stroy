// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import App from '../root'

// The build prerenders every page in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// §5.2.1). The shell renders there in full: the EU line, the bar, the footer
// and its title block, with nothing hidden, faded or moved, and no menu, which
// only a tap opens.

const page = (handle) => ({ Component: () => <p>Страница</p>, handle })

function prerender(path) {
  const router = createMemoryRouter(
    [{
      path: '/',
      Component: App,
      children: [
        { index: true, ...page({ header: 'overlay' }) },
        { path: 'about', ...page() },
        { path: 'projects/golden-residence', ...page({ header: 'overlay', project: 'golden-residence', object: 'Golden Residence' }) },
      ],
    }],
    { initialEntries: [path] },
  )
  // React separates neighbouring text nodes with an empty comment.
  return renderToString(<RouterProvider router={router} />).replaceAll('<!-- -->', '')
}

test.each(['/', '/about', '/projects/golden-residence'])('%s: the shell prerenders complete with no window', (path) => {
  expect(typeof window).toBe('undefined')
  const html = prerender(path)

  for (const text of ['BG16RFPR001-1.012-1485-C01', 'За проекта', 'Продажби', '+359 887 886 166', 'Запитване', 'КСМ СТРОЙ ООД', '© 2026 КСМ Строй']) {
    expect(html).toContain(text)
  }
  expect(html).not.toContain('role="dialog"')
})

test.each(['/', '/about', '/projects/golden-residence'])('%s: nothing in the shell starts hidden, faded or moved', (path) => {
  const html = prerender(path)
  const styles = [...html.matchAll(/\sstyle="([^"]*)"/g)].map(([, style]) => style)

  expect(styles.filter((style) => /opacity|transform|translate|scale|visibility|clip/.test(style))).toEqual([])
  expect(html).not.toMatch(/\bopacity-0\b|\binvisible\b|-translate-y-full|data-hidden/)
})

test('the header starts see-through only over a page that asks for it', () => {
  expect(prerender('/')).toContain('data-look="overlay"')
  expect(prerender('/about')).toContain('data-look="solid"')
})

test('the title block names the object on a project page only', () => {
  expect(prerender('/projects/golden-residence')).toContain('Обект: Golden Residence')
  expect(prerender('/about')).not.toContain('Обект:')
})
