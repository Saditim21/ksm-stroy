import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { loadFlip } from '../../motion/flip'
import { meta } from '../../routes/blog'
import { WORKS } from './works'

// Обекти (spec M3/M4 §7.2), opened as a visitor opens it
// (tests/contracts/site.jsx), offline: the filter folds the register to the
// works it names. jsdom has no matchMedia, so there is no motion here: the
// rows change at once, and Flip, which folds them where there is motion, is
// never asked for (blog.motion.test.jsx plays the fold).

vi.mock('../../motion/flip', () => ({ loadFlip: vi.fn(() => new Promise(() => {})) }))

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const shown = () => [...document.querySelectorAll('#top .wk')].filter((row) => !row.hidden).map((row) => row.id)
const pressed = (filter) => within(filter).getAllByRole('button').map((button) => button.getAttribute('aria-pressed'))

it('folds the register to the works the filter names, at once without motion, and never loads Flip', async () => {
  renderSiteAt('/blog')
  const filter = await screen.findByRole('group', { name: 'Покажи' })
  expect(shown()).toEqual(WORKS.map(({ id }) => id))

  fireEvent.click(within(filter).getByRole('button', { name: 'Груб строеж 1' }))
  expect(shown()).toEqual(['panorama'])
  expect(pressed(filter)).toEqual(['false', 'false', 'true'])
  expect(screen.queryByRole('heading', { name: 'Айвазовски Парк' })).toBeNull()
  expect(screen.getByRole('heading', { level: 2, name: 'Панорама Резидънс' })).toBeInTheDocument()

  fireEvent.click(within(filter).getByRole('button', { name: 'Завършени проекти 6' }))
  expect(shown()).toEqual(['green-life', 'aivazovski', 'sanirane', 'sunny-hill', 'hotel-paradise', 'chitalishte'])
  expect(pressed(filter)).toEqual(['false', 'true', 'false'])

  fireEvent.click(within(filter).getByRole('button', { name: 'Всички проекти 7' }))
  expect(shown()).toEqual(WORKS.map(({ id }) => id))
  expect(pressed(filter)).toEqual(['true', 'false', 'false'])

  expect(loadFlip).not.toHaveBeenCalled()
  expect(document.querySelectorAll('#top .wk[style]')).toHaveLength(0)
})

// A row the filter folds away takes its plates and its action out of the
// keyboard's path with it.
it('takes a folded row’s plates out of reach', async () => {
  renderSiteAt('/blog')
  const filter = await screen.findByRole('group', { name: 'Покажи' })

  fireEvent.click(within(filter).getByRole('button', { name: 'Груб строеж 1' }))

  expect(screen.queryByRole('button', { name: 'Айвазовски Парк: снимка 7 от 7' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Панорама Резидънс: снимка 18 от 23' })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Разгледайте проекта' })).toHaveLength(1)
})

// The shell: Обекти has no inquiry of its own, so the header's „Запитване“
// goes to the contact page's form (M3/M4 spec §8), and the page is on the
// dark ground under the grain, rebuilt.
it('sends the header’s „Запитване“ to the contact form, on the dark ground', async () => {
  renderSiteAt('/blog')
  await screen.findByRole('group', { name: 'Покажи' })

  expect(within(document.querySelector('header')).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact#zapitvane')
  expect(document.getElementById('main')).not.toHaveClass('legacy-ground')
  expect(document.querySelector('.grain')).not.toBeNull()
})

// Production's head (its Blog.jsx), and its share image (spec M3/M4 §11): a
// work the page shows, the Читалище „Асен Златаров“ finished, the one work
// whose photos are wide enough for 1200 × 630.
it('keeps production’s head and shares a finished work', () => {
  const head = meta()
  expect(head).toContainEqual({ title: 'Обекти - KSM Stroy' })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/blog' })
  expect(head).toContainEqual({ property: 'og:image', content: 'https://www.ksmstroy.com/img/work-chitalishte-3-og.jpg' })
})
