import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

// Production contract (main @7a741d5): a Golden Residence block page shows what
// the Google Sheets say. Блокиран is a status of its own: it is shown on the
// unit, explained in the legend and counted, and a blocked unit offers no
// inquiry. Text the status rules do not know („Скоро") is shown as the owner
// wrote it.
//
// Text and roles only, so the v2 explorer (M2) must keep this contract
// whatever its markup.

// Fake addresses for the sheets this page reads. Блок Б and Многофамилна stay
// unconfigured and use the data built into the site.
const SHEETS = {
  VITE_GOOGLE_SHEET_BLOCK_A: 'https://sheets.test/block-a?output=csv',
  VITE_GOOGLE_SHEET_GARAGES: 'https://sheets.test/garages?output=csv',
  VITE_GOOGLE_SHEET_PARKING: 'https://sheets.test/parking?output=csv',
}

// Блок А, floor 3: Блокиран, an empty cell (Свободен), text the rules do not
// know, and Продаден. The data built into the site has none of the first
// three on this floor, so these rows can only come from the sheet.
const CSV = {
  VITE_GOOGLE_SHEET_BLOCK_A: `Етаж,Апартамент,Застроена,Идеални,Обща,Вид,Изложение,Статус
3,А 301,54.36,7.82,62.18,2-стаен,Юг,Блокиран
3,А 302,88.75,12.73,101.48,3-стаен,Юг/Изток,
3,А 303,93.78,13.46,107.24,3-стаен,Изток,Скоро
3,А 304,59.36,8.52,67.88,2-стаен,Изток,Продаден`,
  VITE_GOOGLE_SHEET_GARAGES: `Номер,Застроена,Идеални,Обща,Тип,Статус
Г-001,21.07,12.94,34.01,Гараж,Свободен
Г-002,21.07,12.94,34.01,Гараж,Продадени`,
  VITE_GOOGLE_SHEET_PARKING: `Номер,Застроена,Идеални,Обща,Тип,Статус
ПМ-01,17.67,10.85,28.52,Паркомясто,Свободен`,
}

// An inquiry: „Изпратете запитване" in the explorer, the „Контакт" button on
// the legacy page.
const INQUIRY = /запитване|^контакт$/i

beforeEach(() => {
  for (const [name, url] of Object.entries(SHEETS)) vi.stubEnv(name, url)
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const name = Object.keys(SHEETS).find((key) => String(url).startsWith(SHEETS[key]))
    if (!name) throw new TypeError(`No such sheet in this test: ${url}`)
    return { ok: true, status: 200, text: async () => CSV[name] }
  }))
  // The sheets service reports each fetch on console.log.
  vi.spyOn(console, 'log').mockImplementation(() => {})
  // The service reads the sheet addresses when it loads, so the site is
  // imported afresh after they are set.
  vi.resetModules()
})

afterEach(() => {
  // Back to the blank addresses src/test/setup.js installs. vi.unstubAllEnvs()
  // would restore the developer's .env instead, and with it the live sheets.
  for (const name of Object.keys(SHEETS)) vi.stubEnv(name, '')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// Opens Блок А, then floor 3 through its own control, and waits for the
// sheet's rows.
async function openFloor3(user) {
  const site = await import('./site')
  site.renderSiteAt('/projects/golden-residence/block-a')
  const [floor] = await screen.findAllByText(/^(3 етаж|етаж 3)$/i, {}, { timeout: 15000 })
  await user.click(floor)
  await waitFor(() => expect(unitEntry('А 301')).toHaveAccessibleName(/Блокиран/), { timeout: 15000 })
  return site
}

// A unit's entry on the floor, named after the unit and carrying its status:
// a row of the legacy table, a button in the explorer.
function unitEntry(label) {
  const name = new RegExp(`^${label}(?!\\d)`)
  return screen.queryAllByRole('row', { name })[0] ?? screen.getAllByRole('button', { name })[0]
}

// The inquiry actions a unit offers. The site's header carries a „Запитване"
// on every page (src/shell), and the explorer's header one of its own, so only
// the page counts, and when the unit opens in a dialog, only the dialog.
function inquiryActions() {
  const scope = within(screen.queryByRole('dialog') ?? document.querySelector('main'))
  return [
    ...scope.queryAllByRole('button', { name: INQUIRY }),
    ...scope.queryAllByRole('link', { name: INQUIRY }),
  ]
}

it('shows every unit with its status from the sheet, and Блокиран in the legend and the count', async () => {
  const { pageText } = await openFloor3(userEvent.setup())

  expect(unitEntry('А 301')).toHaveAccessibleName(/Блокиран/)
  expect(unitEntry('А 302')).toHaveAccessibleName(/Свободен/)
  expect(unitEntry('А 303')).toHaveAccessibleName(/Скоро/)
  expect(unitEntry('А 304')).toHaveAccessibleName(/Продадени?/)

  // The legend names all four statuses.
  expect(pageText()).toMatch(/Свободен\s*Резервиран\s*Продадени?\s*Блокиран/)
  // One unit on the floor is blocked.
  expect(pageText()).toMatch(/(?<!\d)1\s*Блокирани|Блокирани:?\s*1(?!\d)/)
}, 30000)

it('offers an inquiry for a free unit but none for a blocked one', async () => {
  const user = userEvent.setup()
  await openFloor3(user)

  await user.click(unitEntry('А 301'))
  expect(inquiryActions()).toHaveLength(0)

  await user.keyboard('{Escape}')
  await user.click(unitEntry('А 302'))
  expect(inquiryActions()).not.toHaveLength(0)
}, 30000)
