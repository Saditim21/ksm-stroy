import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { meta } from '../../routes/projects'

// Продажби, „Две сгради“ (polish spec §3), opened as a visitor opens it
// (tests/contracts/site.jsx), offline, so the store ends on the data built
// into the site: Golden Residence's built-in rows (127 free of 192: 12
// ателиета, 53 двустайни, 31 тристайни, 31 with no type; free from 43,98 to
// 114,58 м²) and Многофамилна's snapshot of 01.12.2025 (16 free of 144: 6
// двустайни, 10 тристайни).

const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const half = (key) => document.querySelector(`.gw__half--${key}`)
const ledger = () => screen.getByRole('region', { name: 'Етаж по етаж' })
const list = () => screen.getByRole('region', { name: 'Свободни апартаменти' })
const rowsOf = (region) => within(region).queryAllByRole('link').filter((link) => link.classList.contains('fl__row'))

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function openPage() {
  renderSiteAt('/projects')
  await waitFor(() => expect(textOf(half('gr').querySelector('.gw__count'))).toMatch(/^127 /), { timeout: 15000 })
}

describe('#top, the two buildings', () => {
  it('opens on both buildings, each with its free apartments of all', async () => {
    await openPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Продажби' })).toBeInTheDocument()
    expect(within(half('gr')).getByRole('heading', { level: 2, name: 'Golden Residence' })).toBeInTheDocument()
    expect(within(half('mn')).getByRole('heading', { level: 2, name: 'Многофамилна сграда' })).toBeInTheDocument()
    expect(textOf(half('gr').querySelector('.gw__count'))).toBe('127 свободни апартамента от 192')
    expect(textOf(half('mn').querySelector('.gw__count'))).toBe('16 свободни апартамента от 144, по данни към 01.12.2025')
    expect(within(half('gr')).getByRole('img', { name: 'Golden Residence по здрач, визуализация' })).toBeInTheDocument()
  }, 30000)

  it('says the rest in words, under a bar of the statuses', async () => {
    await openPage()

    expect(within(half('gr')).getByRole('img', { name: '127 свободни, 6 резервирани, 59 продадени' })).toHaveClass('sbar')
    expect(textOf(half('gr').querySelector('.gw__rest'))).toBe('6 резервирани, 59 продадени')
    expect(textOf(half('mn').querySelector('.gw__rest'))).toBe('6 резервирани, 122 продадени')
  }, 30000)

  it('counts the free apartments by type, and gives the range of their areas', async () => {
    await openPage()

    const types = (key) => [...half(key).querySelectorAll('.gw__types li')].map(textOf)
    expect(types('gr')).toEqual(['12 ателиета', '53 двустайни', '31 тристайни'])
    expect(types('mn')).toEqual(['6 двустайни', '10 тристайни'])
    expect(textOf(half('gr').querySelector('.gw__area'))).toBe('Свободните са от 43,98 до 114,58 м².')
  }, 30000)

  it('leads to each building, and to its free apartments alone', async () => {
    await openPage()

    expect(within(half('gr')).getByRole('link', { name: 'Разгледайте сградата' })).toHaveAttribute('href', '/projects/golden-residence#explorer')
    expect(within(half('mn')).getByRole('link', { name: 'Разгледайте сградата' })).toHaveAttribute('href', '/projects/mnogofamilna-sgrada')

    await userEvent.click(within(half('mn')).getByRole('link', { name: 'Само свободните' }))
    expect(within(list()).getByRole('button', { name: /^Многофамилна/ })).toHaveAttribute('aria-pressed', 'true')
    expect(rowsOf(list()).every((row) => row.textContent.includes('Многофамилна'))).toBe(true)
  }, 30000)
})

describe('#etazhi, floor by floor', () => {
  it('shows Golden Residence first: a row a floor, top floor first, each with its free count', async () => {
    await openPage()

    const rows = within(ledger()).getAllByRole('button', { name: /^Блок/ })
    expect(rows).toHaveLength(16)
    expect(rows[0]).toHaveAccessibleName('Блок А, етаж 8: 12 свободни от 12')
    expect(rows.find((row) => row.getAttribute('aria-label').startsWith('Блок Б, етаж 3'))).toHaveAccessibleName('Блок Б, етаж 3: няма свободни от 12')
    expect(rows[0].querySelectorAll('.fr__c > i')).toHaveLength(12)
  }, 30000)

  it('switches to Многофамилна: floors 10 to 2, labelled as on its page', async () => {
    await openPage()
    await userEvent.click(within(ledger()).getByRole('button', { name: 'Многофамилна сграда' }))

    const rows = within(ledger()).getAllByRole('button', { name: /^Блок/ })
    expect(rows).toHaveLength(18)
    expect(rows[0]).toHaveAccessibleName('Блок А, етаж 10: няма свободни от 8')
    expect(rows.find((row) => row.getAttribute('aria-label').startsWith('Блок А, етаж 9'))).toHaveAccessibleName('Блок А, етаж 9: 2 свободни от 8')
  }, 30000)

  it('opens a floor to its free apartments, each a link to it on its building’s page', async () => {
    await openPage()
    await userEvent.click(within(ledger()).getByRole('button', { name: 'Многофамилна сграда' }))
    const row = within(ledger()).getByRole('button', { name: /^Блок А, етаж 9:/ })

    await userEvent.click(row)

    expect(row).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(row.getAttribute('aria-controls'))
    const links = within(panel).getAllByRole('link')
    expect(links.map((link) => textOf(link.querySelector('b')))).toEqual(['А-802', 'А-808'])
    expect(links[0]).toHaveAttribute('href', '/projects/mnogofamilna-sgrada?unit=%D0%90-802')

    await userEvent.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'false')
  }, 30000)
})

describe('#svobodni, the free apartments', () => {
  it('lists both buildings’ free apartments, ten, then the rest on request', async () => {
    await openPage()

    expect(textOf(list().querySelector('.fl__sum'))).toBe('143 от 143 свободни в двете сгради')
    expect(rowsOf(list())).toHaveLength(10)
    await userEvent.click(within(list()).getByRole('button', { name: 'Покажи още 133' }))
    expect(rowsOf(list())).toHaveLength(143)
  }, 30000)

  it('filters by building, rooms and floor, each choice with its count', async () => {
    await openPage()
    const choice = (name) => within(list()).getByRole('button', { name })

    expect(choice(/^Многофамилна 16$/)).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(choice(/^Многофамилна 16$/))
    await userEvent.click(choice(/^Тристаен 10$/))

    expect(textOf(list().querySelector('.fl__sum'))).toBe('10 от 143 свободни в двете сгради')
    expect(rowsOf(list())).toHaveLength(10)
    expect(rowsOf(list()).every((row) => /Многофамилна.*тристаен/.test(textOf(row)))).toBe(true)
  }, 30000)

  it('says what to do when nothing matches', async () => {
    await openPage()
    await userEvent.click(within(list()).getByRole('button', { name: /^Многофамилна/ }))
    await userEvent.click(within(list()).getByRole('button', { name: /^Ателие 0$/ }))

    expect(rowsOf(list())).toHaveLength(0)
    expect(list()).toHaveTextContent('Няма свободни апартаменти с тези условия')
  }, 30000)

  it('links each apartment to it on its building’s page', async () => {
    await openPage()

    const [first] = rowsOf(list())
    expect(textOf(first.querySelector('.fl__id'))).toBe('А 101')
    expect(first).toHaveAttribute('href', '/projects/golden-residence?unit=%D0%90%20101#explorer')
  }, 30000)
})

it('keeps production’s head', () => {
  const head = meta()
  expect(head).toContainEqual({ title: 'Продажби - KSM Stroy' })
})
