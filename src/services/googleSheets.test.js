import { afterEach, vi } from 'vitest'
import { normalizeFloorData, parseCSV, transformToApartmentData } from './googleSheets'

const CSV = `Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус
1,А 101,2-стаен,57.46,8.22,65.68,Юг,Свободен
1,"А 102",3-стаен,97.74,14.00,111.74,"Юг, Изток",Продаден
2,А 201,2-стаен,54.36,7.82,62.18,Юг,Резервиран`

const CSV_WITH_PRICE = `Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус,Цена
1,А 101,2-стаен,57.46,8.22,65.68,Юг,Свободен,95000 €`

test('parseCSV handles quoted values containing commas', () => {
  const rows = parseCSV(CSV)
  expect(rows).toHaveLength(3)
  expect(rows[1]['Изложение']).toBe('Юг, Изток')
})

test('transformToApartmentData groups by floor and maps columns', () => {
  const data = transformToApartmentData(parseCSV(CSV))
  expect(Object.keys(data)).toEqual(['1', '2'])
  expect(data[1]).toHaveLength(2)
  expect(data[1][0]).toMatchObject({
    apartment: 'А 101', built: '57.46', ideal: '8.22', вид: '2-стаен',
    total: '65.68', изложение: 'Юг', status: 'Свободен', цена: '',
  })
})

test('Цена column passes through when present', () => {
  const data = transformToApartmentData(parseCSV(CSV_WITH_PRICE))
  expect(data[1][0].цена).toBe('95000 €')
})

// main @7a741d5 normalises the Статус cell; the redesign added Цена on the
// next line. The port keeps both.
test('the row mapping normalises the status next to the price', () => {
  const csv = `Етаж,Апартамент,Статус,Цена
1,А 101,Продаден,95000 €
1,А 102,Блокиран,
1,А 103,,`
  const rows = transformToApartmentData(parseCSV(csv))[1]
  expect(rows.map((row) => [row.status, row.цена])).toEqual([
    ['Продадени', '95000 €'],
    ['Блокиран', ''],
    ['Свободен', ''],
  ])
})

test('a sheet drops floor 0', () => {
  const data = transformToApartmentData(parseCSV(`Етаж,Апартамент,Статус
0,Гараж А-1,Свободен
3,А-301,Продаден`))
  expect(data).toEqual({ 3: [expect.objectContaining({ apartment: 'А-301', status: 'Продадени' })] })
})

// The Многофамилна data built into the site goes through the same step as a
// sheet's rows (ApartmentContext), so both read the same way.
test('normalizeFloorData drops floor 0 and normalises every status', () => {
  const fallback = {
    0: [{ apartment: 'Гараж А-1', status: 'Свободен' }],
    3: [
      { apartment: 'А-301', вид: '2-стаен', status: 'Продаден' },
      { apartment: 'А-302', вид: '3-стаен', status: '' },
      { apartment: 'А-303', вид: '3-стаен', status: 'Скоро' },
    ],
  }
  expect(normalizeFloorData(fallback)).toEqual({
    3: [
      { apartment: 'А-301', вид: '2-стаен', status: 'Продадени' },
      { apartment: 'А-302', вид: '3-стаен', status: 'Свободен' },
      { apartment: 'А-303', вид: '3-стаен', status: 'Скоро' },
    ],
  })
  // The data built into the site is never changed in place.
  expect(fallback[3][0].status).toBe('Продаден')
})

// Google occasionally answers a published-sheet URL with 200 + an HTML error
// or sign-in page. That must engage the fallback data, not blank the site.
const HTML_ERROR_PAGE = `<!DOCTYPE html>
<html><head><title>Error 404 (Not Found)</title></head>
<body><h1>Тази страница не е достъпна</h1></body></html>`

const GARAGES = `Номер,Застроена,Идеални,Обща,Тип,Статус
Г-001,21.07,12.94,34.01,Гараж,Продадени`

// The service reports every fetch and every failure on the console; these
// tests check what it returns.
async function loadServiceWithSheet(envKey, body) {
  vi.stubEnv(envKey, 'https://docs.google.com/spreadsheets/d/e/x/pub?gid=0&single=true&output=csv')
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => body })))
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.resetModules()
  return import('./googleSheets')
}

// Back to the blank URLs src/test/setup.js installs. vi.unstubAllEnvs() would
// restore the developer's .env instead, and with it the live sheet URLs.
const SHEET_ENV = [
  'VITE_GOOGLE_SHEET_BLOCK_A', 'VITE_GOOGLE_SHEET_BLOCK_B',
  'VITE_GOOGLE_SHEET_GARAGES', 'VITE_GOOGLE_SHEET_PARKING',
  'VITE_GOOGLE_SHEET_MNOGO_A', 'VITE_GOOGLE_SHEET_MNOGO_B',
]

afterEach(() => {
  for (const name of SHEET_ENV) vi.stubEnv(name, '')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
})

test('fetchApartmentData falls back when a 200 parses to zero floors', async () => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_BLOCK_A', HTML_ERROR_PAGE)
  await expect(svc.fetchApartmentData('blockA')).resolves.toBeNull()
  expect(fetch).toHaveBeenCalled()
})

// Each line of the page parses as a row with no Номер: kept, every one of them
// was a phantom „Свободен" garage.
test('fetchGarageData falls back when a 200 is an HTML page', async () => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_GARAGES', HTML_ERROR_PAGE)
  await expect(svc.fetchGarageData('garages')).resolves.toBeNull()
  expect(fetch).toHaveBeenCalled()
})

test('fetchGarageData keeps only the rows with a Номер', async () => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_PARKING', `${GARAGES}
,,,,,
 ,1,1,1,Гараж,Свободен`)
  const rows = await svc.fetchGarageData('parking')
  expect(rows.map((row) => [row.number, row.status])).toEqual([['Г-001', 'Продадени']])
})

// Sheet columns are never renamed (spec §6.4). Without Статус every place
// would read as free; without Номер no row names a place.
test.each([
  ['Статус', 'Номер,Застроена,Идеални,Обща,Тип\nГ-001,21.07,12.94,34.01,Гараж'],
  ['Номер', 'Гараж,Застроена,Идеални,Обща,Тип,Статус\nГ-001,21.07,12.94,34.01,Гараж,Продадени'],
])('fetchGarageData falls back when the tab has no %s column', async (_column, body) => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_GARAGES', body)
  await expect(svc.fetchGarageData('garages')).resolves.toBeNull()
})

// The same rule for an apartment tab (sheetsCore.js): without Статус every unit
// would read as free; without Етаж or Апартамент no row names a unit.
test.each([
  ['Статус', 'Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение\n1,А 101,2-стаен,57.46,8.22,65.68,Юг'],
  ['Апартамент', 'Етаж,Вид,Застроена,Идеални,Обща,Изложение,Статус\n1,2-стаен,57.46,8.22,65.68,Юг,Продаден'],
  ['Етаж', 'Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус\nА 101,2-стаен,57.46,8.22,65.68,Юг,Продаден'],
])('fetchApartmentData falls back when the tab has no %s column', async (_column, body) => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_BLOCK_A', body)
  await expect(svc.fetchApartmentData('blockA')).resolves.toBeNull()
})

// The Многофамилна sheets are optional: skipping them must not log twice a
// page load (finding 5 of the M0 review).
test('an unconfigured sheet is skipped silently, without a request', async () => {
  vi.stubGlobal('fetch', vi.fn())
  const log = vi.spyOn(console, 'log')
  vi.resetModules()
  const svc = await import('./googleSheets')

  await expect(svc.fetchApartmentData('mnogoA')).resolves.toBeNull()
  await expect(svc.fetchGarageData('parking')).resolves.toBeNull()

  expect(fetch).not.toHaveBeenCalled()
  expect(log).not.toHaveBeenCalled()
})

test('a good sheet still returns data (guard does not over-reach)', async () => {
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_BLOCK_A', CSV)
  await expect(svc.fetchApartmentData('blockA')).resolves.toMatchObject({
    1: [expect.objectContaining({ apartment: 'А 101' }), expect.anything()],
  })
})

// A custom request header (there used to be Cache-Control: no-cache) makes the
// fetch a non-simple CORS request, so the browser preflights every sheet with
// an OPTIONS request, twice because Google redirects the published URL. A
// GET with only cache: 'no-store' and the _cb cache-buster needs none.
test('sheets are fetched with no custom request headers', async () => {
  vi.stubEnv('VITE_GOOGLE_SHEET_PARKING', 'https://docs.google.com/spreadsheets/d/e/x/pub?gid=3&single=true&output=csv')
  const svc = await loadServiceWithSheet('VITE_GOOGLE_SHEET_BLOCK_A', CSV)
  fetch.mockImplementation(async (url) => ({ ok: true, text: async () => (url.includes('gid=3') ? GARAGES : CSV) }))

  await expect(svc.fetchApartmentData('blockA')).resolves.not.toBeNull()
  await expect(svc.fetchGarageData('parking')).resolves.not.toBeNull()

  expect(fetch).toHaveBeenCalledTimes(2)
  for (const [url, init] of fetch.mock.calls) {
    expect(typeof url).toBe('string')
    expect(url).toMatch(/^https:\/\/docs\.google\.com\/.*&_cb=\d+$/)
    expect(init).toEqual({ cache: 'no-store' })
  }
})
