import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { named } from '../../explorer/testing'

// A Многофамилна block page (spec M3 §6.5), opened as a visitor opens it
// (tests/contracts/site.jsx), offline: its numbers are the dated snapshot of
// 01.12.2025. The block's floors run as rows beside its facade, and a row
// and its floor on the facade are one hot floor: pointing at or focusing
// either lights both. A row's „Отворете плана“, a unit of its plan, or its
// floor on the facade opens the explorer's plan stage, which gives the focus
// back to the row it came from.

const pathOf = (id) => `/projects/mnogofamilna-sgrada/${id}`
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const row = (key) => document.querySelector(`#explorer .mbr[data-k="${key}"]`)
const rail = (key) => document.querySelector(`#explorer .fx__cnt[data-k="${key}"]`)
const facade = () => document.querySelector('#explorer .fx')
const openButton = (key) => within(row(key)).getByRole('button', { name: 'Отворете плана' })
// The routes contract's „блок А“ and „блок Б“ (tests/contracts/site.jsx).
const BLOCK = {
  'А': /блок\s+[аa](?![а-яёa-z])/i,
  'Б': /блок\s+[бb](?![а-яёa-z])/i,
}

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  resetInquiry()
  document.documentElement.removeAttribute('data-eu-hold')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe.each([
  ['block-a', 'А'],
  ['block-b', 'Б'],
])('/projects/mnogofamilna-sgrada/%s', (id, letter) => {
  beforeEach(() => {
    renderSiteAt(pathOf(id))
  })

  it('opens on the way back, then the H1, then the block’s facts', async () => {
    const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
    const main = document.querySelector('main')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(text(h1)).toBe(`Многофамилна сграда, блок ${letter}`)
    expect(within(main).getAllByRole('link')[0]).toBe(within(main).getByRole('link', { name: 'Към Многофамилна сграда' }))
    expect(within(main).getByText('72 апартамента · 9 етажа (2–10) · 8 на етаж', { normalizer: (value) => value.replace(/\s+/g, ' ').trim() })).toBeInTheDocument()
  })

  // The routes contract (tests/contracts/site.jsx): the page names the
  // building and its block.
  it('names its building and its block as the routes contract reads the page', async () => {
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })

    expect(mainText()).toMatch(/Многофамилна/)
    expect(mainText()).toMatch(BLOCK[letter])
  })

  it('has one main, its floors with the block’s own facade, then the inquiry', async () => {
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
    const mains = document.querySelectorAll('main')

    expect(mains).toHaveLength(1)
    expect(facade()).toHaveAttribute('data-block', letter)
    expect(mains[0].querySelectorAll('#explorer .mbr')).toHaveLength(9)
    expect(within(mains[0]).getByRole('heading', { level: 2, name: named('Свържете се с нас') })).toBeInTheDocument()
    expect([...mains[0].querySelectorAll('section[id]')].map((section) => section.id)).toEqual(['explorer', 'kontakti'])
  })
})

describe('a row and its floor on the facade, one hot floor (spec M3 §6.5)', () => {
  beforeEach(async () => {
    renderSiteAt(pathOf('block-a'))
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
  })

  it('focusing a row’s „Отворете плана“ marks that floor hot on the facade', () => {
    act(() => openButton('А-7').focus())

    expect(row('А-7')).toHaveClass('is-hot')
    expect(rail('А-7')).toHaveClass('is-hot')
    expect(facade()).toHaveClass('is-hot')
    expect(row('А-5')).not.toHaveClass('is-hot')
  })

  // The same hot floor, whichever side points at it.
  it('pointing at a floor on the facade marks its row; pointing at a row, its floor', () => {
    fireEvent.pointerOver(rail('А-5'), { pointerType: 'mouse' })
    expect(row('А-5')).toHaveClass('is-hot')
    expect(rail('А-5')).toHaveClass('is-hot')

    fireEvent.pointerOver(row('А-3'), { pointerType: 'mouse' })
    expect(rail('А-3')).toHaveClass('is-hot')
    expect(row('А-3')).toHaveClass('is-hot')
    expect(row('А-5')).not.toHaveClass('is-hot')
    expect(rail('А-5')).not.toHaveClass('is-hot')
  })

  // The pointer leaving the rows lets the floor go after the hot floor's
  // 320 ms; coming back to the same row before then keeps it lit (a flick
  // across the seam and back), as moving to any other row would.
  it('keeps a row lit when the pointer leaves the rows and comes back to it within 320 ms', () => {
    vi.useFakeTimers()
    try {
      const rows = document.querySelector('#explorer .mbl__rows')
      fireEvent.pointerOver(row('А-5'), { pointerType: 'mouse' })
      fireEvent.pointerLeave(rows, { pointerType: 'mouse' })
      fireEvent.pointerOver(row('А-5'), { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(320))

      expect(row('А-5')).toHaveClass('is-hot')
      expect(rail('А-5')).toHaveClass('is-hot')

      fireEvent.pointerLeave(rows, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(320))

      expect(row('А-5')).not.toHaveClass('is-hot')
      expect(rail('А-5')).not.toHaveClass('is-hot')
    } finally {
      vi.useRealTimers()
    }
  })

  // A finger passing over a row lights nothing: a touch only taps.
  it('lights nothing for a finger passing over a row', () => {
    fireEvent.pointerOver(row('А-3'), { pointerType: 'touch' })

    expect(facade()).not.toHaveClass('is-hot')
    expect(row('А-3')).not.toHaveClass('is-hot')
  })

  it('activating „Отворете плана“ opens the stage of that floor, and its close gives the focus back to it', async () => {
    const button = openButton('А-7')
    act(() => button.focus())
    fireEvent.click(button)

    const stage = await screen.findByRole('dialog', { name: named('Блок А · Етаж 7') }, { timeout: 15000 })
    fireEvent.keyDown(stage, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(button))
  }, 30000)

  // A unit of a row's plan opens the stage on its floor, then its panel.
  it('a unit of a row’s plan opens its floor’s stage and the unit’s panel', async () => {
    fireEvent.click(row('А-9').querySelector('.mbr__plan .u-hit[data-suffix="02"]'))

    expect(await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })).toBeInTheDocument()
    expect(document.querySelector('.ps')).not.toBeNull()
  }, 30000)
})

// Spec M3 §6.4, §6.5; Review Focus 2: on a block page a bare ?floor names
// the block's own floor; a floor the building does not have opens nothing.
describe('deep links', () => {
  it.each([
    ['block-a', 'Блок А · Етаж 7'],
    ['block-b', 'Блок Б · Етаж 7'],
  ])('a bare ?floor=7 on %s opens floor 7 of this block', async (id, dialog) => {
    renderSiteAt(`${pathOf(id)}?floor=7`)

    expect(await screen.findByRole('dialog', { name: named(dialog) }, { timeout: 15000 })).toBeInTheDocument()
  }, 30000)

  it.each(['1', '11'])('?floor=%s opens nothing', async (floor) => {
    renderSiteAt(`${pathOf('block-a')}?floor=${floor}`)
    await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })

    // Long enough for the dialogs' chunk, had anything asked for it.
    await act(() => new Promise((resolve) => { setTimeout(resolve, 300) }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.documentElement).not.toHaveAttribute('data-eu-hold')
  })
})
