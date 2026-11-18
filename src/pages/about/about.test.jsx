import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../../tests/contracts/site'
import * as aboutModule from '../../routes/about'

// За нас (spec M3/M4 §7.4), opened as a visitor opens it
// (tests/contracts/site.jsx), offline. jsdom has no matchMedia, so there is
// no motion here: the page is its final state, the founding drawn, every
// section shown (about.motion.test.jsx plays the reveals). The cases (ruling
// M4-PF11): the founding sentence the contract reads, in one element; the
// shell around a page with no inquiry of its own; production's head; and the
// two actions of the call to action, each opening its page.

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The contract (tests/contracts/site.jsx: /about shows „основана през месец
// септември 2008“): the founding figure's caption, one element, says it.
it('says the founding sentence in <main>, as the founding figure’s caption', async () => {
  renderSiteAt('/about')
  const caption = await screen.findByText(/основана през месец септември 2008/)

  expect(caption.tagName).toBe('FIGCAPTION')
  expect(caption.closest('figure')).toHaveClass('lineage')
  expect(mainText()).toMatch(/основана през месец септември 2008/)
  // The drawing says it to the eye only: a screen reader hears the caption once.
  expect(caption.closest('figure').querySelector('.lineage__draw')).toHaveAttribute('aria-hidden', 'true')
})

// The shell: За нас has no inquiry of its own, so the header's „Запитване“
// goes to the contact page's form (M3/M4 spec §8), and the page, rebuilt, is
// on the dark ground under the grain. Ruling C5.4: its preloads go out with
// the prerendered document only (about.prerender.test.jsx), so a render in
// the browser adds none.
it('is a solid page that sends „Запитване“ to the contact form, on the dark ground, and adds no preload in the browser', async () => {
  renderSiteAt('/about')
  await screen.findByRole('heading', { level: 1, name: 'Добре дошли в\u00a0КСМ Строй ООД' })

  expect(aboutModule.handle).toEqual({ header: 'solid' })
  expect('links' in aboutModule).toBe(false)
  expect(within(document.querySelector('header')).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact#zapitvane')
  expect(document.getElementById('main')).not.toHaveClass('legacy-ground')
  expect(document.querySelector('.grain')).not.toBeNull()
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})

// Production's head (its src/utils/seo.js `about`), and its share image
// (spec M3/M4 §11): the page's first photo wide enough for 1200 × 630, the
// aerial of Хотел Парадайс under the figures.
it('keeps production’s head', () => {
  const head = aboutModule.meta()

  expect(head).toContainEqual({ title: 'За нас - KSM Stroy | 15+ години опит в строителството' })
  expect(head).toContainEqual({
    name: 'description',
    content: 'Научете повече за екипа на KSM Stroy - експерти в строителството с над 15 години опит, 200+ завършени проекта и 50+ доволни клиенти в София и цяла България.',
  })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/about' })
  expect(head).toContainEqual({ property: 'og:image', content: 'https://www.ksmstroy.com/img/about-slider-2-og.jpg' })
})

// Spec §7.4: the call to action's two ways, to Контакти and to Обекти.
it('opens Контакти from „Свържете се с нас“', async () => {
  renderSiteAt('/about')
  const work = (await screen.findByRole('heading', { level: 2, name: 'Готови сте да работите с\u00a0нас?' })).closest('section')

  fireEvent.click(within(work).getByRole('link', { name: 'Свържете се с\u00a0нас' }))

  expect(await screen.findByRole('heading', { level: 1, name: 'Как можете да се свържете с\u00a0нас' })).toBeInTheDocument()
  await waitFor(() => expect(window.location.pathname).toBe('/contact'))
}, 30000)

it('opens Обекти from „Разгледайте проектите“', async () => {
  renderSiteAt('/about')
  const work = (await screen.findByRole('heading', { level: 2, name: 'Готови сте да работите с\u00a0нас?' })).closest('section')

  fireEvent.click(within(work).getByRole('link', { name: 'Разгледайте проектите' }))

  expect(await screen.findByRole('heading', { level: 1, name: 'Обекти' })).toBeInTheDocument()
  await waitFor(() => expect(window.location.pathname).toBe('/blog'))
}, 30000)
