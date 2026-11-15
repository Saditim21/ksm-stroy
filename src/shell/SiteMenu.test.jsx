import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import SiteMenu from './SiteMenu'

// The menu's live Golden Residence line (spec §6.4, §9): „—“ while the
// availability loads, then the free apartments of both blocks, never a fake
// zero. A file of its own, so the availability store, which every reader on
// a page shares, starts empty here: the shell's tests leave it loaded.

const row = (unit, status) => ({ unit, floor: '1', type: '2-стаен', area: { built: '', ideal: '', total: '' }, exposure: '', status, price: '' })

// What api/availability.js answers: two free apartments, one in each block.
const API_BODY = {
  updatedAt: '2026-11-15T08:00:00.000Z',
  sources: { BLOCK_A: 'ok', BLOCK_B: 'ok', GARAGES: 'ok', PARKING: 'ok', MNOGO_A: 'missing', MNOGO_B: 'missing' },
  projects: {
    'golden-residence': {
      'block-a': [row('А 101', 'Свободен'), row('А 102', 'Продадени')],
      'block-b': [row('Б 101', ''), row('Б 102', 'Резервиран'), row('Б 103', 'Блокиран')],
      garages: [],
      parking: [],
    },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('reads „—“ until the availability arrives, then the free apartments of both blocks', async () => {
  let answer
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
    answer = resolve
  })))
  render(
    <MemoryRouter initialEntries={['/about']}>
      <SiteMenu id="site-menu" pathname="/about" onClose={() => {}} />
    </MemoryRouter>,
  )
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  expect(menu).toHaveTextContent('жк Левски Г · — свободни')

  await act(async () => answer({ ok: true, status: 200, json: async () => API_BODY }))
  await waitFor(() => expect(menu).toHaveTextContent('жк Левски Г · 2 свободни'))
})

// Ruling C4.8: one free apartment is „1 свободен“, the singular. A fresh copy
// of the menu, so its availability store starts empty again.
it('says „1 свободен“ when one apartment is free', async () => {
  vi.resetModules()
  const { default: FreshMenu } = await import('./SiteMenu')
  const goldenResidence = { ...API_BODY.projects['golden-residence'], 'block-b': [row('Б 101', 'Продадени')] }
  const oneFree = { ...API_BODY, projects: { ...API_BODY.projects, 'golden-residence': goldenResidence } }
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => oneFree })))
  render(
    <MemoryRouter initialEntries={['/about']}>
      <FreshMenu id="site-menu" pathname="/about" onClose={() => {}} />
    </MemoryRouter>,
  )
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  await waitFor(() => expect(menu).toHaveTextContent('жк Левски Г · 1 свободен'))
  expect(menu).not.toHaveTextContent('1 свободни')
})
