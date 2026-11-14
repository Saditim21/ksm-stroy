import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'
import routes from '../routes'

// The site's shell (plan Task 9, spec §8.1) around every page: the header with
// the EU line, the mobile menu, the footer with its title block, and the 404
// page. Each test opens the real route table under the root route, as a
// visitor would (tests/contracts/site.jsx).

const PAGES = [
  ['Начало', '/'],
  ['Продажби', '/projects'],
  ['Обекти', '/blog'],
  ['За нас', '/about'],
  ['Контакти', '/contact'],
]
const SOFIA = 'гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38'
const GOTSE_DELCHEV = 'гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1'

const textOf = (element) => element.textContent.replace(/\s+/g, ' ')

// The site's header. A <header> inside <main> is no banner (HTML-AAM), but
// Testing Library counts every <header> as one, and the legacy home page has
// some of its own.
const siteHeader = async () => (await screen.findAllByRole('banner')).find((element) => !element.closest('main'))

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the header', () => {
  it('links the five pages and the phone', async () => {
    renderSiteAt('/about')
    const header = within(await siteHeader())

    for (const [name, href] of PAGES) expect(header.getByRole('link', { name })).toHaveAttribute('href', href)
    expect(header.getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
    // Under 1024 px the number gives way to an icon.
    expect(header.getByRole('link', { name: 'Обадете се' })).toHaveAttribute('href', 'tel:+359887886166')
  })

  // The prerender renders /about as /about/ (trailing slash) and the browser
  // hydrates it at /about. Both must mark the same link, or the first client
  // render differs from the HTML (hydration error #418).
  it.each(['/about', '/about/'])('marks За нас as the current page at %s', async (url) => {
    renderSiteAt(url)
    const header = within(await siteHeader())

    expect(header.getByRole('link', { name: 'За нас' })).toHaveAttribute('aria-current', 'page')
    expect(header.getByRole('link', { name: 'Начало' })).not.toHaveAttribute('aria-current')
  })

  // A project's pages sit under Продажби, which marks itself as their section.
  it('marks Продажби as the section of a project page', async () => {
    renderSiteAt('/projects/golden-residence/block-a')
    const header = within(await siteHeader())

    expect(header.getByRole('link', { name: 'Продажби' })).toHaveAttribute('aria-current', 'true')
    expect(header.getByRole('link', { name: 'Начало' })).not.toHaveAttribute('aria-current')
  })

  it.each([
    ['/', '/contact'],
    ['/projects/golden-residence', '/contact?project=golden-residence'],
    ['/projects/mnogofamilna-sgrada/block-a', '/contact?project=mnogofamilna-sgrada'],
  ])('on %s, Запитване opens %s', async (path, href) => {
    renderSiteAt(path)
    const header = within(await siteHeader())

    expect(header.getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', href)
  })

  // The EU line rides in the header on every page (spec §8.1, §14.1), not
  // only in the footer. Both versions of its text stay in the page, and CSS
  // shows one (src/index.css): under 640 px the short text, whole, in a row
  // of its own; from 640 px the longest one whose project number fits the
  // row. No test here can see that; this one checks what the header holds.
  it('carries the EU line: the lockup, the programme, the project number and „За проекта“', async () => {
    renderSiteAt('/about')
    const banner = await siteHeader()
    const header = within(banner)

    expect(header.getByRole('img', { name: 'Съфинансирано от Европейския съюз' })).toBeInTheDocument()
    expect(header.getByRole('img', { name: 'Програма „Конкурентоспособност и иновации в предприятията“' })).toBeInTheDocument()
    expect(header.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
    expect(textOf(banner)).toContain(
      'Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027.',
    )
    expect(textOf(banner)).toContain('Проект № BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.')
    // Wherever a version wraps, the number stays in one piece.
    const numbers = header.getAllByText('№ BG16RFPR001-1.012-1485-C01')
    expect(numbers).toHaveLength(2)
    for (const number of numbers) expect(number).toHaveClass('whitespace-nowrap')
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
    window.dispatchEvent(new Event('scroll'))
  }

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
  })

  it.each(['/', '/projects/golden-residence', '/projects/mnogofamilna-sgrada'])('is see-through over %s until 80 px down, then paper', async (path) => {
    renderSiteAt(path)
    const header = await siteHeader()
    expect(header).toHaveAttribute('data-look', 'overlay')

    scrollTo(81)
    await waitFor(() => expect(header).toHaveAttribute('data-look', 'solid'))
    scrollTo(40)
    await waitFor(() => expect(header).toHaveAttribute('data-look', 'overlay'))
  })

  it('is paper from the top of a page with no hero under it', async () => {
    renderSiteAt('/about')

    expect(await siteHeader()).toHaveAttribute('data-look', 'solid')
  })

  it('after the first screen, hides going down and comes back going up', async () => {
    renderSiteAt('/about')
    const header = await siteHeader()

    scrollTo(window.innerHeight - 10)
    await waitFor(() => expect(header).toHaveAttribute('data-look', 'solid'))
    expect(header).not.toHaveAttribute('data-hidden')

    scrollTo(window.innerHeight + 300)
    await waitFor(() => expect(header).toHaveAttribute('data-hidden'))

    scrollTo(window.innerHeight + 200)
    await waitFor(() => expect(header).not.toHaveAttribute('data-hidden'))
  })
})

// How each page of src/routes.js frames the shell: its module's `handle`
// (src/shell/handle.js), read from the real modules (plan Task 9, Step 2).
// Home and the two project pages run under the see-through header: Home's
// hero and the project pages' dusk openings carry its paper text. The
// explorers and every other page are solid.
const GOLDEN_RESIDENCE = { project: 'golden-residence', object: 'Golden Residence' }
const MNOGOFAMILNA = { project: 'mnogofamilna-sgrada', object: 'Многофамилна жилищна сграда' }
const HANDLES = {
  '/': { header: 'overlay' },
  '/about': { header: 'solid' },
  '/projects': { header: 'solid' },
  '/projects/golden-residence': { header: 'overlay', ...GOLDEN_RESIDENCE },
  '/projects/golden-residence/block-a': { header: 'solid', ...GOLDEN_RESIDENCE },
  '/projects/golden-residence/block-b': { header: 'solid', ...GOLDEN_RESIDENCE },
  '/projects/mnogofamilna-sgrada': { header: 'overlay', ...MNOGOFAMILNA },
  '/projects/mnogofamilna-sgrada/block-a': { header: 'solid', ...MNOGOFAMILNA },
  '/projects/mnogofamilna-sgrada/block-b': { header: 'solid', ...MNOGOFAMILNA },
  // A redirect to /projects, which shows nothing of its own.
  '/projects/:id': undefined,
  '/contact': { header: 'solid' },
  '/blog': { header: 'solid' },
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

describe('the mobile menu', () => {
  async function openMenu(path) {
    const user = userEvent.setup()
    renderSiteAt(path)
    const button = await screen.findByRole('button', { name: 'Меню' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    return { user, button, menu: screen.getByRole('dialog', { name: 'Меню' }) }
  }

  it('opens from its button; Escape closes it and gives the button its focus back', async () => {
    const { user, button, menu } = await openMenu('/projects/golden-residence')

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(menu).toHaveAttribute('aria-modal', 'true')
    // A portal on <body>, never inside the fixed header (spec §8.1).
    expect(menu.parentElement).toBe(document.body)
    expect(document.documentElement.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('holds the links, the inquiry, the phone, the email, both offices and the EU line', async () => {
    const { menu } = await openMenu('/projects/golden-residence')
    const inMenu = within(menu)

    for (const [name, href] of PAGES) expect(inMenu.getByRole('link', { name })).toHaveAttribute('href', href)
    expect(inMenu.getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact?project=golden-residence')
    expect(inMenu.getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
    expect(inMenu.getByRole('link', { name: 'ksm_str@abv.bg' })).toHaveAttribute('href', 'mailto:ksm_str@abv.bg')
    expect(textOf(menu)).toContain(SOFIA)
    expect(textOf(menu)).toContain(GOTSE_DELCHEV)
    expect(textOf(menu)).toContain('BG16RFPR001-1.012-1485-C01')
    expect(inMenu.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
  })

  it('takes the focus and keeps the keyboard inside while it is open', async () => {
    const { user, menu } = await openMenu('/about')
    const inMenu = within(menu)
    expect(inMenu.getByRole('button', { name: 'Затворете менюто' })).toHaveFocus()

    await user.tab({ shift: true })
    const first = document.activeElement
    expect(menu).toContainElement(first)
    // Back from the first stop wraps to the last, and on from the last to the first.
    await user.tab({ shift: true })
    expect(inMenu.getByRole('link', { name: 'За проекта' })).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()
  })

  it('closes from its close button', async () => {
    const { user, button, menu } = await openMenu('/about')

    await user.click(within(menu).getByRole('button', { name: 'Затворете менюто' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('closes when one of its links is followed', async () => {
    const { user, menu } = await openMenu('/about')

    await user.click(within(menu).getByRole('link', { name: 'Продажби' }))
    await waitFor(() => expect(window.location.pathname).toBe('/projects'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.documentElement.style.overflow).toBe('')
  })
})

describe('the footer', () => {
  it('gives both offices, both phones, the email and the hours', async () => {
    renderSiteAt('/about')
    const footer = await screen.findByRole('contentinfo')
    const text = textOf(footer)

    for (const fact of [
      'Водеща строителна компания в България с над 15 години опит.',
      SOFIA, GOTSE_DELCHEV,
      '+359 887 886 166', '+359 885 762 224',
      'ksm_str@abv.bg',
      'Пн–Пт 8:00–18:00', 'Сб 9:00–14:00', 'Нд почивен ден',
      '© 2026 КСМ Строй',
    ]) {
      expect(text).toContain(fact)
    }
    const inFooter = within(footer)
    expect(inFooter.getByRole('link', { name: '+359 885 762 224' })).toHaveAttribute('href', 'tel:+359885762224')
    expect(inFooter.getByRole('link', { name: 'ksm_str@abv.bg' })).toHaveAttribute('href', 'mailto:ksm_str@abv.bg')
    expect(inFooter.getAllByRole('link', { name: 'Отвори в Google Maps' }).map((link) => link.getAttribute('href'))).toEqual(
      [SOFIA, GOTSE_DELCHEV].map((address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`),
    )
    for (const [name, href] of PAGES) expect(inFooter.getByRole('link', { name })).toHaveAttribute('href', href)
    expect(inFooter.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/ksm.stroi/')
    expect(inFooter.getByRole('link', { name: 'За проекта' })).toHaveAttribute('href', '/eu-proekt')
  })
})

describe('the title block', () => {
  it.each([
    ['/projects/golden-residence', 'Обект: Golden Residence'],
    ['/projects/golden-residence/block-b', 'Обект: Golden Residence'],
    ['/projects/mnogofamilna-sgrada', 'Обект: Многофамилна жилищна сграда'],
  ])('names the object on %s', async (path, object) => {
    renderSiteAt(path)
    const footer = within(await screen.findByRole('contentinfo'))

    expect(footer.getByText('КСМ СТРОЙ ООД')).toBeInTheDocument()
    expect(footer.getByText(object)).toBeInTheDocument()
    expect(footer.getByText('2026')).toBeInTheDocument()
  })

  it.each(['/', '/about', '/eu-proekt'])('names no object on %s', async (path) => {
    renderSiteAt(path)
    const footer = within(await screen.findByRole('contentinfo'))

    expect(footer.getByText('КСМ СТРОЙ ООД')).toBeInTheDocument()
    expect(footer.queryByText(/^Обект:/)).not.toBeInTheDocument()
  })
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
