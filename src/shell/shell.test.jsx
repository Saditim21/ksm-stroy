import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'
import { SITE, mapsUrl } from '../config/site'
import App from '../root'
import routes from '../routes'
import { inquiryTarget } from './handle'
import { NAV } from './nav'

// The site's shell in Diptych (spec §6.2–6.5) around every page: the header
// with the EU row, the menu, the footer, and the 404 page. Each test opens the
// real route table under the root route, as a visitor would
// (tests/contracts/site.jsx).

const SOFIA = 'гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38'
const GOTSE_DELCHEV = 'гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1'
const FULL_EU_TEXT = 'Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027.'
const SHORT_EU_TEXT = 'Проект № BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.'

const textOf = (element) => element.textContent.replace(/\s+/g, ' ')

// The site's header. A <header> inside <main> is no banner (HTML-AAM), but
// Testing Library counts every <header> as one, and the legacy home page has
// some of its own.
const siteHeader = async () => (await screen.findAllByRole('banner')).find((element) => !element.closest('main'))
const menuButton = () => screen.getByRole('button', { name: /Меню/ })

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the header', () => {
  it('holds the logo, „Меню“, the phone and „Запитване“, and no page links', async () => {
    renderSiteAt('/about')
    const header = await screen.findByRole('banner')
    expect(within(header).getByRole('link', { name: 'КСМ Строй, начална страница' })).toHaveAttribute('href', '/')
    expect(within(header).getByRole('button', { name: /Меню/ })).toHaveAttribute('aria-expanded', 'false')
    expect(within(header).getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
    expect(within(header).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact')
    expect(within(header).queryByRole('link', { name: 'Продажби' })).toBeNull()
  })

  // Spec §6.3, §14.1: the EU line is the header's top row on every page, seen
  // on landing without scrolling. Both versions of its text stay in the page,
  // and its box shows the longest one whose project number fits there
  // (src/styles/shell.css); no test here can see which.
  it('carries the EU row with the project number and „За проекта“', async () => {
    renderSiteAt('/about')
    const header = await siteHeader()
    const row = within(header)

    expect(row.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
    expect(row.getByRole('img', { name: 'Съфинансирано от Европейския съюз' })).toBeInTheDocument()
    expect(row.getByRole('img', { name: 'Програма „Конкурентоспособност и иновации в предприятията“' })).toBeInTheDocument()
    expect(textOf(header)).toContain(FULL_EU_TEXT)
    expect(textOf(header)).toContain(SHORT_EU_TEXT)
    // Wherever a version ends, the number stays in one piece.
    const numbers = row.getAllByText('№ BG16RFPR001-1.012-1485-C01')
    expect(numbers).toHaveLength(2)
    for (const number of numbers) expect(number).toHaveClass('nb')
  })

  // The logos are in every first viewport: lazy loading only held them back
  // (Chrome's LazyLoadImageIssue). They are no page's LCP image, so they take
  // no fetch priority from it.
  it('loads the EU logos at once, with no fetch priority', async () => {
    renderSiteAt('/about')
    const header = within(await siteHeader())

    for (const name of ['Съфинансирано от Европейския съюз', 'Програма „Конкурентоспособност и иновации в предприятията“']) {
      const logo = header.getByRole('img', { name })
      expect(logo).toHaveAttribute('loading', 'eager')
      expect(logo).not.toHaveAttribute('fetchpriority')
    }
  })

  it.each([
    ['/', '/contact'],
    ['/projects/golden-residence', '/contact?project=golden-residence'],
    ['/projects/mnogofamilna-sgrada/block-a', '/contact?project=mnogofamilna-sgrada'],
  ])('on %s, „Запитване“ opens %s', async (path, href) => {
    renderSiteAt(path)
    const header = within(await siteHeader())

    expect(header.getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', href)
  })

  // Spec §6.2: a page with its own inquiry (the handle's `inquiry`) takes
  // „Запитване“ to it.
  it('takes „Запитване“ to the page’s own inquiry where the handle says it has one', async () => {
    const router = createMemoryRouter(
      [{ path: '/', Component: App, children: [{ index: true, Component: () => <p id="zapitvane">Форма</p>, handle: { header: 'overlay', inquiry: true } }] }],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
    const header = within(await siteHeader())

    expect(header.getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '#zapitvane')
  })

  it('inquiryTarget: the page’s own inquiry, else the contact page with the project', () => {
    expect(inquiryTarget({ header: 'overlay', inquiry: true })).toBe('#zapitvane')
    expect(inquiryTarget({ header: 'solid', inquiry: true, project: 'golden-residence' })).toBe('#zapitvane')
    expect(inquiryTarget({ header: 'solid', project: 'golden-residence' })).toBe('/contact?project=golden-residence')
    expect(inquiryTarget({ header: 'solid' })).toBe('/contact')
  })

  it('lets a keyboard skip straight to the page', async () => {
    renderSiteAt('/about')

    expect(await screen.findByRole('link', { name: 'Към съдържанието' })).toHaveAttribute('href', '#main')
    expect(screen.getAllByRole('main')[0]).toHaveAttribute('id', 'main')
  })
})

describe('the header as the page scrolls', () => {
  const scrollTo = (y) => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
  }

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
  })

  // Spec §6.2: see-through over the hero until the page has scrolled 40 px,
  // then solid; scrolled, the EU row slides away (data-scrolled moves the
  // header up by its height) and the bar stays. It never hides.
  it('is see-through over Home until 40 px, then solid, and never hides', async () => {
    renderSiteAt('/')
    const header = await siteHeader()
    expect(header).toHaveAttribute('data-look', 'overlay')
    expect(header).not.toHaveAttribute('data-scrolled')

    scrollTo(41)
    await waitFor(() => expect(header).toHaveAttribute('data-look', 'solid'))
    expect(header).toHaveAttribute('data-scrolled')

    scrollTo(40)
    await waitFor(() => expect(header).toHaveAttribute('data-look', 'overlay'))
    expect(header).not.toHaveAttribute('data-scrolled')

    // Down past the first screen and back up a little: it stays.
    scrollTo(2000)
    await waitFor(() => expect(header).toHaveAttribute('data-scrolled'))
    expect(header).toHaveAttribute('data-look', 'solid')
    expect(header).not.toHaveAttribute('data-hidden')
    scrollTo(1500)
    await waitFor(() => expect(header).toHaveAttribute('data-scrolled'))
    expect(header).not.toHaveAttribute('data-hidden')
  })

  // The project pages open on production's light ground, so the bar is solid
  // over them from the top, as on every page with no hero under it; the EU
  // row stays until the page scrolls.
  it.each(['/about', '/projects/golden-residence', '/projects/mnogofamilna-sgrada'])('is solid from the top of %s', async (path) => {
    renderSiteAt(path)
    const header = await siteHeader()

    expect(header).toHaveAttribute('data-look', 'solid')
    expect(header).not.toHaveAttribute('data-scrolled')
    scrollTo(300)
    await waitFor(() => expect(header).toHaveAttribute('data-scrolled'))
  })
})

// How each page of src/routes.js frames the shell: its module's `handle`
// (src/shell/handle.js), read from the real modules. Home runs under the
// see-through header. The two project pages open on production's light
// ground, so they are solid, as are the explorers and every other page. The
// pages M2 has not yet rebuilt are legacy: they keep production's light look.
const GOLDEN_RESIDENCE = { project: 'golden-residence' }
const MNOGOFAMILNA = { project: 'mnogofamilna-sgrada' }
const HANDLES = {
  '/': { header: 'overlay', legacy: true },
  '/about': { header: 'solid', legacy: true },
  '/projects': { header: 'solid', legacy: true },
  '/projects/golden-residence': { header: 'solid', ...GOLDEN_RESIDENCE, legacy: true },
  '/projects/golden-residence/block-a': { header: 'solid', ...GOLDEN_RESIDENCE, legacy: true },
  '/projects/golden-residence/block-b': { header: 'solid', ...GOLDEN_RESIDENCE, legacy: true },
  '/projects/mnogofamilna-sgrada': { header: 'solid', ...MNOGOFAMILNA, legacy: true },
  '/projects/mnogofamilna-sgrada/block-a': { header: 'solid', ...MNOGOFAMILNA, legacy: true },
  '/projects/mnogofamilna-sgrada/block-b': { header: 'solid', ...MNOGOFAMILNA, legacy: true },
  // A redirect to /projects, which shows nothing of its own.
  '/projects/:id': undefined,
  '/contact': { header: 'solid', legacy: true },
  '/blog': { header: 'solid', legacy: true },
  '/eu-proekt': { header: 'solid' },
  '/*': { header: 'solid' },
}

describe('each page’s handle', () => {
  const modules = import.meta.glob(['/src/**/*.jsx', '!/src/**/*.test.jsx'], { eager: true })
  // The dev server's own pages (dev/*) are not part of the site.
  const pages = routes
    .filter(({ path }) => !path?.startsWith('dev/'))
    .map(({ index, path, file }) => [index ? '/' : `/${path}`, file])

  it('is decided for every page', () => {
    expect(pages.map(([path]) => path).sort()).toEqual(Object.keys(HANDLES).sort())
  })

  it.each(pages)('%s (%s)', (path, file) => {
    expect(modules[`/src/${file}`].handle).toEqual(HANDLES[path])
  })
})

// The ground the shell gives a page (src/root.jsx): dark by default, with the
// grain over it, and production's light ground on a legacy page, where focus
// rings turn onyx (.on-light, src/index.css) and no grain lies over it.
describe('the page’s ground', () => {
  it('is production’s light ground on a legacy page, with no grain', async () => {
    renderSiteAt('/about')
    await screen.findByText(/основана през месец септември 2008/)

    expect(document.getElementById('main')).toHaveClass('on-light', 'legacy-ground')
    expect(document.querySelector('.grain')).toBeNull()
  })

  it('is the dark ground on a rebuilt page, under the grain', async () => {
    renderSiteAt('/eu-proekt')
    await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

    const main = document.getElementById('main')
    expect(main).not.toHaveClass('on-light')
    expect(main).not.toHaveClass('legacy-ground')
    expect(document.querySelector('.grain')).toHaveAttribute('aria-hidden', 'true')
  })

  // Spec §4: an overlay page starts at the top, under the header; any other
  // starts below it.
  it('starts an overlay page at the top, under the header', async () => {
    renderSiteAt('/')
    await siteHeader()

    expect(document.getElementById('main')).not.toHaveClass('pt-[var(--header-h)]')
  })

  it('starts any other page below the header', async () => {
    renderSiteAt('/eu-proekt')
    await siteHeader()

    expect(document.getElementById('main')).toHaveClass('pt-[var(--header-h)]')
  })
})

describe('the menu', () => {
  async function openMenu(path) {
    const user = userEvent.setup()
    renderSiteAt(path)
    const button = await screen.findByRole('button', { name: /Меню/ })
    await user.click(button)
    return { user, button, menu: screen.getByRole('dialog', { name: 'Меню' }) }
  }

  it('the menu: six links, the live Golden Residence line, the details, the EU line', async () => {
    goOffline()
    renderSiteAt('/about')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Меню/ }))
    const menu = screen.getByRole('dialog', { name: 'Меню' })
    expect(within(menu).getAllByRole('link').slice(0, 6).map((a) => a.textContent))
      .toEqual(['Начало', 'Golden Residence', 'Продажби', 'Обекти', 'За нас', 'Контакти'])
    expect(within(menu).getByRole('link', { name: 'За нас' })).toHaveAttribute('aria-current', 'page')
    await waitFor(() => expect(menu).toHaveTextContent(/жк Левски Г · \d+ свободни/))
    for (const t of ['Телефон', 'Работно време', 'Адреси', 'Имейл', 'За проекта']) expect(menu).toHaveTextContent(t)

    const inMenu = within(menu)
    expect(inMenu.getByRole('link', { name: 'Golden Residence' })).toHaveAttribute('href', '/projects/golden-residence')
    for (const { label, tel } of SITE.phones) expect(inMenu.getByRole('link', { name: label })).toHaveAttribute('href', `tel:${tel}`)
    expect(inMenu.getByRole('link', { name: SITE.email })).toHaveAttribute('href', `mailto:${SITE.email}`)
    expect(textOf(menu)).toContain(SOFIA)
    expect(textOf(menu)).toContain(GOTSE_DELCHEV)
    expect(textOf(menu)).toContain('Пн–Пт 8:00–18:00 · Сб 9:00–14:00 · Нд почивен ден')
    expect(textOf(menu)).toContain(SHORT_EU_TEXT)
    expect(inMenu.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
  })

  // The prerender renders /about as /about/ and the browser runs it at
  // /about: both mark the same page (src/utils/pathname.js).
  it.each(['/about', '/about/'])('marks За нас as the page shown at %s', async (path) => {
    const { menu } = await openMenu(path)
    const inMenu = within(menu)

    expect(inMenu.getByRole('link', { name: 'За нас' })).toHaveAttribute('aria-current', 'page')
    expect(inMenu.getByRole('link', { name: 'Начало' })).not.toHaveAttribute('aria-current')
  })

  // A project's pages sit under Продажби, and a block's under Golden
  // Residence: each marks itself as their section.
  it('marks the sections of a block page', async () => {
    const { menu } = await openMenu('/projects/golden-residence/block-a')
    const inMenu = within(menu)

    expect(inMenu.getByRole('link', { name: 'Продажби' })).toHaveAttribute('aria-current', 'true')
    expect(inMenu.getByRole('link', { name: 'Golden Residence' })).toHaveAttribute('aria-current', 'true')
    expect(inMenu.getByRole('link', { name: 'Начало' })).not.toHaveAttribute('aria-current')
  })

  it('is a modal dialog on <body> that holds the page still while it is open', async () => {
    const { button, menu } = await openMenu('/projects/golden-residence')

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', menu.id)
    expect(menu).toHaveAttribute('aria-modal', 'true')
    // A portal on <body>, never inside the fixed header.
    expect(menu.parentElement).toBe(document.body)
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.backgroundColor).toBe('rgb(14, 13, 11)')
  })

  it('moves focus into the menu, keeps Tab inside, and Escape returns it to „Меню“', async () => {
    const { user, button, menu } = await openMenu('/about')
    const inMenu = within(menu)
    const first = inMenu.getByRole('link', { name: 'Начало' })

    await waitFor(() => expect(first).toHaveFocus())
    // Back from the first stop wraps to the last, „Затвори“, and on from there to the first.
    await user.tab({ shift: true })
    expect(inMenu.getByRole('button', { name: 'Затвори' })).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('closes from „Затвори“ and gives „Меню“ its focus back', async () => {
    const { user, button, menu } = await openMenu('/about')

    await user.click(within(menu).getByRole('button', { name: 'Затвори' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(button).toHaveFocus()
  })

  // Spec §6.4: a page link leaves the menu open until the router commits the
  // new page, which unmounts it in that same commit, so only the old
  // snapshot holds it and the doors close over it. The current page's own
  // link closes it at once.
  //
  // The next page here waits for its loader, as a route chunk that is still
  // loading would, so the test can tell the two apart: a menu that closed on
  // the click would be gone before the page came.
  it('a page link closes the menu with the page change; the current page’s link closes it at once', async () => {
    let release
    const loading = new Promise((resolve) => {
      release = resolve
    })
    const router = createMemoryRouter(
      [{
        path: '/',
        Component: App,
        children: [
          { path: 'about', Component: () => <p>Страницата за нас</p>, handle: { header: 'solid' } },
          { path: 'blog', loader: () => loading, Component: () => <p>Обектите</p>, handle: { header: 'solid' } },
        ],
      }],
      { initialEntries: ['/about'] },
    )
    const user = userEvent.setup()
    render(<RouterProvider router={router} />)
    await user.click(await screen.findByRole('button', { name: /Меню/ }))

    await user.click(within(screen.getByRole('dialog', { name: 'Меню' })).getByRole('link', { name: 'За нас' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(router.state.location.pathname).toBe('/about')
    expect(menuButton()).toHaveFocus()

    await user.click(menuButton())
    await user.click(within(screen.getByRole('dialog', { name: 'Меню' })).getByRole('link', { name: 'Обекти' }))
    expect(router.state.navigation.state).toBe('loading')
    expect(screen.getByRole('dialog', { name: 'Меню' })).toBeInTheDocument()

    // Every DOM change from here on: never a moment with neither the menu nor
    // the new page.
    const seen = []
    const observer = new MutationObserver(() => {
      seen.push({ open: Boolean(document.querySelector('[role="dialog"]')), shown: textOf(document.getElementById('main')).includes('Обектите') })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    try {
      await act(async () => release(null))
      await screen.findByText('Обектите')
    } finally {
      observer.disconnect()
    }
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.filter(({ open, shown }) => !open && !shown)).toEqual([])
    expect(document.documentElement.style.overflow).toBe('')
  })
})

describe('the footer', () => {
  it('the footer: details, both Maps links, „Бързи връзки“, © line and no title block', async () => {
    renderSiteAt('/projects/golden-residence')
    const footer = await screen.findByRole('contentinfo')
    const inFooter = within(footer)
    const text = textOf(footer)

    for (const fact of [
      'Водеща строителна компания в България с над 15 години опит.',
      SOFIA, GOTSE_DELCHEV,
      '+359 887 886 166', '+359 885 762 224',
      'ksm_str@abv.bg',
      'Пн–Пт 8:00–18:00', 'Сб 9:00–14:00', 'Нд почивен ден',
      FULL_EU_TEXT,
      '© 2026 КСМ Строй · КСМ СТРОЙ ООД',
    ]) {
      expect(text).toContain(fact)
    }
    for (const label of ['Телефон', 'Работно време', 'Имейл', 'Адреси', 'Бързи връзки']) {
      expect(inFooter.getByRole('heading', { level: 2, name: label })).toBeInTheDocument()
    }
    expect(inFooter.getByRole('link', { name: 'КСМ Строй, начална страница' })).toHaveAttribute('href', '/')
    for (const { label, tel } of SITE.phones) expect(inFooter.getByRole('link', { name: label })).toHaveAttribute('href', `tel:${tel}`)
    expect(inFooter.getByRole('link', { name: SITE.email })).toHaveAttribute('href', `mailto:${SITE.email}`)
    expect(inFooter.getAllByRole('link', { name: 'Отвори в Google Maps' }).map((link) => link.getAttribute('href')))
      .toEqual(SITE.offices.map((office) => mapsUrl(office)))
    const quickLinks = within(inFooter.getByRole('navigation', { name: 'Бързи връзки' })).getAllByRole('link')
    expect(quickLinks.map((link) => [link.textContent, link.getAttribute('href')])).toEqual(NAV.map(({ label, href }) => [label, href]))
    expect(inFooter.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', SITE.facebook)
    expect(inFooter.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
    expect(inFooter.queryByText(/Обект:/)).toBeNull()
  })
})

// Spec §11: the small links of the header, the menu and the footer have 44 px
// hit boxes (.hit, src/styles/shell.css), which overlap where links stack; the
// words of each, in one span, lie over all of them.
it('puts each small link’s words in the span that lies over the hit boxes', async () => {
  const user = userEvent.setup()
  renderSiteAt('/about')
  await user.click(await screen.findByRole('button', { name: /Меню/ }))
  const links = [...document.querySelectorAll('.hit')]

  expect(links.length).toBeGreaterThanOrEqual(14)
  for (const link of links) {
    expect(link.children, link.textContent).toHaveLength(1)
    expect(link.firstElementChild.tagName).toBe('SPAN')
    expect(link.firstElementChild.textContent).toBe(link.textContent)
  }
})

describe('the 404 page', () => {
  it('/nope says the page is not in the drawing and offers three ways back', async () => {
    renderSiteAt('/nope')

    expect(await screen.findByRole('heading', { level: 1, name: 'Тази страница я няма в чертежа.' })).toBeInTheDocument()
    const page = within(screen.getByRole('main'))
    expect(page.getByText('Проверете адреса или започнете от някоя от страниците по-долу.')).toBeInTheDocument()
    for (const [name, href] of [['Начало', '/'], ['Продажби', '/projects'], ['Контакти', '/contact']]) {
      expect(page.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })
})
