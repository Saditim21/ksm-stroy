import { act, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../tests/contracts/site'
import { handle } from './not-found'

// The 404 page (spec M3/M4 §7.6), its head first. /404 is a prerendered page
// that answers 200, and the host serves its HTML for every URL with no page
// of its own, so it is never indexed and names no page as its canonical one,
// in any build: a production build (IS_PRODUCTION_BUILD, src/seo/stage.js)
// included.

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
})

it.each([true, false])('is noindex with no canonical link (production build: %s)', async (production) => {
  vi.stubGlobal('IS_PRODUCTION_BUILD', production)
  vi.resetModules()
  const { meta } = await import('./not-found')

  const head = meta()

  expect(head).toContainEqual({ title: 'Страницата не е намерена - KSM Stroy' })
  expect(head).toContainEqual({ name: 'robots', content: 'noindex, nofollow' })
  expect(head.filter((tag) => tag.rel === 'canonical' || tag.property === 'og:url')).toEqual([])
  // Spec M3/M4 §11: the 404 has no picture to share.
  expect(head.filter((tag) => tag.property === 'og:image')).toEqual([])
})

// Then the page, opened as a visitor opens an address with no page
// (tests/contracts/site.jsx), offline. jsdom has no matchMedia, so there is
// no motion here: the drawing is drawn (not-found.motion.test.jsx: it is CSS
// only). The cases (ruling M4-PF11): the heading and its no-break spaces,
// the drawing as a picture only, the three ways back, the outlines' one
// screen pixel, and the shell around the page.
describe('the page', () => {
  const SENTENCE = 'Тази страница я няма в чертежа.'

  beforeEach(() => {
    goOffline()
  })

  // Spec §7.6: the heading says the page is not in the drawing, „я“ and „в“
  // bound to the words after them. Its name is the sentence as it is
  // spoken, which the contract finds it by (tests/contracts/dev-routes.test.jsx).
  it('says the page is not in the drawing, „я“ and „в“ bound to the next words', async () => {
    renderSiteAt('/nope')

    const h1 = await screen.findByRole('heading', { level: 1, name: SENTENCE })
    expect(h1.textContent.replace(/\s+/g, ' ')).toBe(SENTENCE)
    expect(h1.textContent).toContain('я\u00a0няма в\u00a0чертежа.')
    expect(screen.getAllByRole('heading', { level: 1 })).toEqual([h1])
  })

  // Spec §7.6: the drawing is a picture only, hidden from assistive
  // technology, and no text in it names a project (src/routes.test.jsx).
  it('shows the drawing as a picture only: 11 outlines plus one dashed, and no text', async () => {
    renderSiteAt('/nope')
    await screen.findByRole('heading', { level: 1, name: SENTENCE })

    const drawing = document.querySelector('main figure')
    expect(drawing).toHaveAttribute('aria-hidden', 'true')
    expect(drawing.querySelectorAll('.lost__units path')).toHaveLength(11)
    expect(drawing.querySelectorAll('.lost__gone')).toHaveLength(1)
    expect(drawing.textContent).toBe('')
    expect(within(screen.getByRole('main')).queryAllByRole('img')).toEqual([])
    expect(mainText()).not.toMatch(/Golden Residence|Многофамилна|КСМ Строй ООД/)
  })

  it('offers three ways back: Начало, Продажби, Контакти', async () => {
    renderSiteAt('/nope')
    await screen.findByRole('heading', { level: 1, name: SENTENCE })

    const links = within(screen.getByRole('main')).getAllByRole('link')
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Начало', '/'],
      ['Продажби', '/projects'],
      ['Контакти', '/contact'],
    ])
  })

  // Spec §7.6: the explorer's brass unit outlines, one screen pixel wide
  // whatever the drawing's size (the concept's js/404.js; PlanSvg.jsx's
  // fit()): the drawing's units per screen pixel, its viewBox's 850 over its
  // width on screen, measured again as it changes size.
  it('keeps the outlines one screen pixel wide as the drawing changes size', async () => {
    const watched = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) { this.callback = callback }
      observe(element) { watched.push({ element, callback: this.callback }) }
      disconnect() {}
    })
    let width = 425
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      const w = this.closest?.('figure') ? width : 0
      return { top: 0, bottom: 0, left: 0, right: w, width: w, height: 0, x: 0, y: 0 }
    })
    renderSiteAt('/nope')
    await screen.findByRole('heading', { level: 1, name: SENTENCE })

    const svg = document.querySelector('main figure svg')
    expect(svg.style.getPropertyValue('--u')).toBe('2.000')
    const watch = watched.find(({ element }) => element === svg)
    expect(watch).toBeDefined()
    width = 680
    act(() => watch.callback([]))
    expect(svg.style.getPropertyValue('--u')).toBe('1.250')
  })

  // The shell: the page has no inquiry of its own, so the header's
  // „Запитване“ goes to the contact page's form; its preload goes out with
  // the prerendered document only (not-found.prerender.test.jsx), so a
  // render in the browser adds none.
  it('is a solid page that sends „Запитване“ to the contact form, and adds no preload in the browser', async () => {
    renderSiteAt('/nope')
    await screen.findByRole('heading', { level: 1, name: SENTENCE })

    expect(handle).toEqual({ header: 'solid' })
    expect(within(document.querySelector('header')).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact#zapitvane')
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
  })
})
