import { waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'

// Polish spec §5: in the light theme, what sits on photographs keeps the dark
// values (`.dark`, src/index.css), so its words and lines stay readable on the
// picture: the openings over photographs, Home's works panel, the contact
// form's pictures. Продажби's halves and За нас's wall are their own pages'
// tests (src/pages/projects, src/pages/about); the explorer's dialogs are
// PlanStage's and UnitPanel's.

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it.each([
  ['/', '.hero'],
  ['/', '.works__media'],
  ['/projects/golden-residence', '.grhero'],
  ['/projects/mnogofamilna-sgrada', '.mnx'],
  ['/contact', '.ask__media'],
])('%s keeps %s dark in both themes', async (path, selector) => {
  renderSiteAt(path)
  await waitFor(() => expect(document.querySelector(selector)).not.toBeNull(), { timeout: 15000 })
  expect(document.querySelector(selector)).toHaveClass('dark')
}, 30000)
