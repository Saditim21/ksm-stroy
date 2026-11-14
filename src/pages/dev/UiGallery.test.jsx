import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import UiGallery from './UiGallery'

// /dev/ui shows every shared primitive (src/components/ui) on paper and on
// dusk, for review. Like /dev/tracer, src/routes.js routes it only under the
// dev server; scripts/check-dist.mjs fails if any of it reaches the build.

// vi.unstubAllEnvs() would also undo the blank sheet URLs of src/test/setup.js,
// so DEV is put back by hand.
const DEV = import.meta.env.DEV
afterEach(() => {
  vi.stubEnv('DEV', DEV)
  vi.resetModules()
})

it('shows every primitive on paper and on dusk', () => {
  render(<MemoryRouter><UiGallery /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  for (const ground of ['paper', 'dusk']) {
    const section = screen.getByRole('region', { name: `On ${ground}` })
    const inside = within(section)
    expect(inside.getByRole('heading', { level: 2, name: 'Създаваме пространства за мечтания живот' })).toBeInTheDocument()
    expect(inside.getAllByRole('link', { name: 'Запитване' }).length).toBeGreaterThan(0)
    expect(inside.getAllByText('кота +3,06').length).toBeGreaterThan(0)
    expect(inside.getByText('57,46 м²')).toBeInTheDocument()
    expect(inside.getByRole('list', { name: 'Легенда' })).toBeInTheDocument()
    expect(inside.getByText('Скоро')).toBeInTheDocument()
    expect(inside.getAllByText('—').length).toBeGreaterThan(0)
    expect(section.querySelector('picture img')).not.toBeNull()
  }
  expect(screen.getByRole('region', { name: 'On dusk' })).toHaveClass('on-dusk', 'bg-dusk', 'text-paper')
})

it('routes /dev/ui under the dev server only', async () => {
  const paths = async () => (await import('../../routes')).default.map((r) => r.path)
  expect(await paths()).toContain('dev/ui')
  vi.stubEnv('DEV', false)
  vi.resetModules()
  expect(await paths()).not.toContain('dev/ui')
})
