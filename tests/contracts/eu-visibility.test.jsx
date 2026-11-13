import { existsSync, statSync } from 'node:fs'
import { URL as FileURL, fileURLToPath } from 'node:url'
import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, pageText, renderSiteAt } from './site'

// Production contract (main @d356cad): the home page carries the EU
// co-funding information of project BG16RFPR001-1.012-1485-C01 (ПКИП
// 2021-2027) and links to its A3 poster. Required for the project's EU
// visibility obligations; never drop it in a redesign.

const PROJECT_NUMBER = 'BG16RFPR001-1.012-1485-C01'
const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('the home page names the EU project and links to its poster', async () => {
  renderSiteAt('/')

  await waitFor(() => expect(pageText()).toContain(PROJECT_NUMBER), { timeout: 15000 })
  const posterLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === POSTER)
  expect(posterLinks.length).toBeGreaterThan(0)
}, 30000)

it('the poster the home page links to ships with the site', () => {
  // node:url's URL: jsdom's global URL is not a file URL Node can read.
  const file = fileURLToPath(new FileURL(`../../public${POSTER}`, import.meta.url))
  expect(existsSync(file)).toBe(true)
  expect(statSync(file).size).toBeGreaterThan(0)
})
