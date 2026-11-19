import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { meta } from '../../routes/about'

// За нас, „Стена“ (polish spec §4), opened as a visitor opens it
// (tests/contracts/site.jsx): the motto over a wall of the company's own
// photographs, how it began in production's words, the seven works, and the
// legacy page's services, values, mission and call to action.

const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('#top, the wall', () => {
  it('opens on the motto, not on names', async () => {
    renderSiteAt('/about')

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(textOf(h1)).toBe('Добрата работа – реклама за майстора')
    expect(textOf(document.querySelector('.wl__sub'))).toBe('КСМ Строй ООД, строителна компания от 2008 г.')
  })

  it('sets it over thirty-five of the company’s photographs, a decoration to assistive technology', async () => {
    renderSiteAt('/about')
    await screen.findByRole('heading', { level: 1 })

    const wall = document.querySelector('.wl__grid')
    expect(wall).toHaveAttribute('aria-hidden', 'true')
    expect(wall.querySelectorAll('.wl__t img')).toHaveLength(35)
    expect(wall.querySelectorAll('.wl__t--c')).toHaveLength(1)
  })
})

describe('#istoriya, how it began', () => {
  it('tells the founding in production’s words, the brothers’ names in the story', async () => {
    renderSiteAt('/about')
    const story = await screen.findByRole('region', { name: 'Семейство строители' })

    expect(textOf(story)).toContain('КСМ СТРОЙ ООД е основана през месец септември 2008 г. от двама братя Кадри и Сухат')
    expect(textOf(story)).toContain('„Добрата работа – реклама за майстора“')
    expect(within(story).getAllByRole('img')).toHaveLength(3)
  })
})

describe('#obekti, what they built', () => {
  it('names the seven works, each a link to its record on Обекти, and all of them', async () => {
    renderSiteAt('/about')
    const works = await screen.findByRole('region', { name: 'Какво сме построили' })

    const names = within(works).getAllByRole('heading', { level: 3 }).map(textOf)
    expect(names).toEqual([
      'Green Life – Paradise Gardens and Town House',
      'Айвазовски Парк',
      'Панорама Резидънс груб строеж',
      'Саниране 2017',
      'Сънни Хил блок 9',
      'Хотел Парадайс',
      'Читалище „Асен Златаров-1924“',
    ])
    expect(within(works).getByRole('link', { name: 'Айвазовски Парк' })).toHaveAttribute('href', '/blog#aivazovski')
    expect(within(works).getByRole('link', { name: 'Всички обекти' })).toHaveAttribute('href', '/blog')
  })
})

it('keeps the legacy page’s services, values, mission and call to action', async () => {
  renderSiteAt('/about')
  await screen.findByRole('heading', { level: 1 })

  // Their headings bind one-letter words with a no-break space.
  for (const name of [/^Какво\s+предлагаме\?$/, /^Какво\s+ни\s+прави\s+различни$/, /^Мисия\s+и\s+визия$/, /^Готови\s+сте\s+да\s+работите\s+с\s+нас\?$/])
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^Свържете\s+се\s+с\s+нас$/ })).toHaveAttribute('href', '/contact')
})

it('keeps production’s head', () => {
  expect(meta()).toContainEqual({ title: 'За нас - KSM Stroy | 15+ години опит в строителството' })
})
