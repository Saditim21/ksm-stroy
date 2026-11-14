import { existsSync, statSync } from 'node:fs'
import { URL as FileURL, fileURLToPath } from 'node:url'
import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ROUTES, goOffline, mainText, pageText, renderSiteAt } from './site'

// Production contract (main @d356cad): the home page carries the EU
// co-funding information of project BG16RFPR001-1.012-1485-C01 (ПКИП
// 2021-2027) and links to its A3 poster. Required for the project's EU
// visibility obligations; never drop it in a redesign.
//
// Since the v2 shell (spec §8.1, §14.1), every page carries the EU line: the
// co-funding emblem, the project number and a link to /eu-proekt, the page
// about the project (the teammate's text, origin/vidimost-es).

const PROJECT_NUMBER = 'BG16RFPR001-1.012-1485-C01'
const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'
const EMBLEM = 'Съфинансирано от Европейския съюз'

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const linksTo = (href, name) =>
  screen.getAllByRole('link', name ? { name } : undefined).filter((link) => link.getAttribute('href') === href)

// The page itself, not only the EU line every page carries.
it('the home page names the EU project and links to its poster', async () => {
  renderSiteAt('/')

  await waitFor(() => expect(mainText()).toContain(PROJECT_NUMBER), { timeout: 15000 })
  expect(linksTo(POSTER).length).toBeGreaterThan(0)
}, 30000)

// Every URL of the production contract, the contact page and the project's
// own page.
const PAGES = [...ROUTES.map(({ path }) => path), '/contact', '/eu-proekt']

it.each(PAGES)('%s carries the EU line: the emblem, the project number and „За проекта“', async (path) => {
  renderSiteAt(path)

  await waitFor(() => expect(linksTo('/eu-proekt', 'За проекта').length).toBeGreaterThan(0), { timeout: 15000 })
  expect(pageText()).toContain(PROJECT_NUMBER)
  expect(screen.getAllByRole('img', { name: EMBLEM }).length).toBeGreaterThan(0)
}, 30000)

it('/eu-proekt describes the project, its budget and dates, and links the poster', async () => {
  renderSiteAt('/eu-proekt')

  expect(await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' }, { timeout: 15000 })).toBeInTheDocument()
  for (const line of [
    `КСМ СТРОЙ ООД изпълнява проект № ${PROJECT_NUMBER} „Дигитализация на предприятията“`,
    'Внедряват се четири свързани системи',
    'Общ бюджет: 35 320,04 евро',
    'Безвъзмездна финансова помощ: 24 724,03 евро',
    'Собствено съфинансиране: 10 596,01 евро',
    'Продължителност: от 27.01.2026 г. до 27.01.2027 г.',
    'Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД',
  ]) {
    expect(mainText()).toContain(line)
  }
  expect(linksTo(POSTER, 'Изтегли плаката (PDF)').length).toBe(1)
}, 30000)

it('the poster the home page links to ships with the site', () => {
  // node:url's URL: jsdom's global URL is not a file URL Node can read.
  const file = fileURLToPath(new FileURL(`../../public${POSTER}`, import.meta.url))
  expect(existsSync(file)).toBe(true)
  expect(statSync(file).size).toBeGreaterThan(0)
})
