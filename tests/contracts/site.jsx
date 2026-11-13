import { render } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../../src/App'

// Helpers for the contract tests that open the whole site, not one component.

// Opens `path` the way a visitor does: the real App, with its router,
// providers and route table.
export function renderSiteAt(path) {
  window.history.replaceState(null, '', path)
  return render(<App />)
}

// No network: every fetch fails, so the apartment availability falls back to
// the data built into the site (src/test/setup.js already blanks the sheet
// URLs). The sheets service reports the fallback on console.log; mute it.
export function goOffline() {
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new TypeError('Failed to fetch (tests run offline)')
  }))
  vi.spyOn(console, 'log').mockImplementation(() => {})
}

// All the text on the page with whitespace collapsed. It ignores the markup,
// so a redesign that keeps the words keeps these tests green.
export const pageText = () => document.body.textContent.replace(/\s+/g, ' ')
