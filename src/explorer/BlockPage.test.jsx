import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../tests/contracts/site'

// A Golden Residence block page, /projects/golden-residence/block-a and
// block-b (spec §7.11, §8.3): the way back to the building, the H1 and the
// block's facts, then the explorer on its own block and the inquiry. Opened
// as a visitor opens it (tests/contracts/site.jsx), offline.

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const follows = (first, second) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)
// The routes contract's „блок А“ and „блок Б“ (tests/contracts/site.jsx).
const BLOCK = {
  'А': /блок\s+[аa](?![а-яёa-z])/i,
  'Б': /блок\s+[бb](?![а-яёa-z])/i,
}

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe.each([
  ['block-a', 'А'],
  ['block-b', 'Б'],
])('/projects/golden-residence/%s', (id, letter) => {
  beforeEach(() => {
    renderSiteAt(`/projects/golden-residence/${id}`)
  })

  it('opens on the way back, then the H1, then the block’s facts', async () => {
    const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
    const main = document.querySelector('main')
    const back = within(main).getByRole('link', { name: 'Към Golden Residence' })
    const facts = within(main).getByText('96 апартамента · 8 етажа · 12 на етаж')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(text(h1)).toBe(`Golden Residence, блок ${letter}`)
    expect(h1.querySelector('em')).toHaveTextContent(new RegExp(`^${letter}$`))
    expect(back).toHaveAttribute('href', '/projects/golden-residence')
    expect(within(main).getAllByRole('link')[0]).toBe(back)
    expect(follows(back, h1)).toBe(true)
    expect(follows(h1, facts)).toBe(true)
  })

  it('has one main, which holds the explorer, on its own block, and the inquiry', async () => {
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
    const mains = document.querySelectorAll('main')

    expect(mains).toHaveLength(1)
    expect(mains[0].querySelector('section#explorer')).not.toBeNull()
    expect(mains[0].querySelector('#zapitvane')).not.toBeNull()
    expect(mains[0].querySelector('#explorer .fx')).toHaveAttribute('data-block', letter)
    expect(within(mains[0]).getByRole('heading', { level: 2, name: 'Запитване за Golden Residence' })).toBeInTheDocument()
  })

  // Without the facts line the H1 would run into the next text („…блок
  // АИзберете“), which the routes contract's pattern rejects.
  it('names its block as the routes contract reads the page', async () => {
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
    expect(mainText()).toMatch(BLOCK[letter])
    expect(mainText()).toMatch(/Golden Residence/)
  })
})

// Spec §7.11, ruling FR3: „По критерии“ on a block page starts on that block,
// as its facade does: 96 of the 192, its pill pressed.
it.each([
  ['block-a', 'А'],
  ['block-b', 'Б'],
])('/projects/golden-residence/%s?view=list starts the list on its own block', async (id, letter) => {
  renderSiteAt(`/projects/golden-residence/${id}?view=list`)
  const blocks = await screen.findByRole('group', { name: 'Блок' }, { timeout: 15000 })
  expect(within(blocks).getByRole('button', { name: letter })).toHaveAttribute('aria-pressed', 'true')
  expect(text(document.querySelector('.lv__meta'))).toMatch(/^96 от 192 · /)
})
