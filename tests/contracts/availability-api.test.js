// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../api/availability.js'

// Contract for api/availability.js (spec §6.4): the Vercel Function, next to
// api/odoo-lead.js, that reads every published sheet server-side and answers
// with the site's availability as one same-origin JSON, cached at the edge.
//
// This file lives in tests/, never in api/: Vercel deploys every file in api/
// as a serverless function.

const ENDPOINT = 'http://localhost/api/availability'
const get = () => new Request(ENDPOINT)

// Today's tabs (google-sheets-data/), served as they are: header row, BOM and
// line endings untouched.
const fixture = (name) => readFileSync(new URL(`../../google-sheets-data/${name}`, import.meta.url), 'utf8')

const TABS = {
  BLOCK_A: { url: 'https://sheets.test/block-a?output=csv', csv: fixture('golden-residence-block-a.csv') },
  BLOCK_B: { url: 'https://sheets.test/block-b?output=csv', csv: fixture('golden-residence-block-b.csv') },
  GARAGES: { url: 'https://sheets.test/garages?output=csv', csv: fixture('golden-residence-garages.csv') },
  PARKING: { url: 'https://sheets.test/parking?output=csv', csv: fixture('golden-residence-parking.csv') },
  MNOGO_A: { url: 'https://sheets.test/mnogo-a?output=csv', csv: fixture('mnogofamilna-vhod-a.csv') },
  MNOGO_B: { url: 'https://sheets.test/mnogo-b?output=csv', csv: fixture('mnogofamilna-vhod-b.csv') },
}
const ALL = Object.keys(TABS)

// Where each tab's rows go in the answer.
const SLOT = {
  BLOCK_A: ['golden-residence', 'block-a'],
  BLOCK_B: ['golden-residence', 'block-b'],
  GARAGES: ['golden-residence', 'garages'],
  PARKING: ['golden-residence', 'parking'],
  MNOGO_A: ['mnogofamilna-sgrada', 'block-a'],
  MNOGO_B: ['mnogofamilna-sgrada', 'block-b'],
}
const slotOf = (projects, key) => projects[SLOT[key][0]][SLOT[key][1]]

const everyTab = (value) => Object.fromEntries(ALL.map((key) => [key, value]))

// Gives these tabs their addresses. The others stay blank, as
// src/test/setup.js leaves every one of them.
function configure(keys = ALL) {
  for (const key of keys) vi.stubEnv(`VITE_GOOGLE_SHEET_${key}`, TABS[key].url)
}

// Google answers each tab with its fixture, or as `answers` says: a body and a
// status, or a function of the request's init that makes the whole reply. Any
// other address is a request the test did not expect.
function google(answers = {}) {
  const fetch = vi.fn(async (url, init) => {
    const key = ALL.find((name) => String(url).startsWith(TABS[name].url))
    if (!key) throw new TypeError(`No such tab in this test: ${url}`)
    const answer = answers[key]
    if (typeof answer === 'function') return answer(init)
    return new Response(answer?.body ?? TABS[key].csv, { status: answer?.status ?? 200 })
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const unit = (rows, label) => rows.find((row) => row.unit === label)
// trim() also drops the BOM the Многофамилна exports start with.
const headerOf = (csv) => csv.split(/\r?\n/)[0].split(',').map((name) => name.trim())

let errorLog

beforeEach(() => {
  // The function reports every tab it could not read.
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // Back to the blank addresses src/test/setup.js installs. vi.unstubAllEnvs()
  // would restore the developer's .env instead, and with it the live sheets.
  for (const key of ALL) vi.stubEnv(`VITE_GOOGLE_SHEET_${key}`, '')
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('GET', () => {
  it('merges every tab into its project and normalises the statuses', async () => {
    configure()
    // Блок А with a Блокиран unit and an empty Статус cell.
    const blockA = TABS.BLOCK_A.csv
      .replace('1,А 101,57.46,8.22,65.68,2-стаен,Юг,Свободен', '1,А 101,57.46,8.22,65.68,2-стаен,Юг,Блокиран')
      .replace('1,А 102,97.74,14.00,111.74,3-стаен,Юг/Изток,Свободен', '1,А 102,97.74,14.00,111.74,3-стаен,Юг/Изток,')
    expect(blockA).toMatch(/^1,А 102,.*,Юг\/Изток,\r?$/m)
    google({ BLOCK_A: { body: blockA } })

    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8')
    const body = await res.json()
    expect(body.sources).toEqual(everyTab('ok'))
    expect(new Date(body.updatedAt).toISOString()).toBe(body.updatedAt)

    const gr = body.projects['golden-residence']
    expect(gr['block-a']).toHaveLength(96)
    expect(gr['block-b']).toHaveLength(96)
    expect(gr.garages).toHaveLength(113)
    expect(gr.parking).toHaveLength(68)
    // Блокиран is a status of its own; an empty cell is free.
    expect(unit(gr['block-a'], 'А 101').status).toBe('Блокиран')
    expect(unit(gr['block-a'], 'А 102').status).toBe('Свободен')

    // Every status goes through propertyStatus.js, so the Многофамилна
    // „Продаден" and the Golden Residence „Продадени" are one status.
    const mnogo = body.projects['mnogofamilna-sgrada']
    expect(unit(mnogo['block-a'], 'А-101').status).toBe('Продадени')
    const apartments = [...gr['block-a'], ...gr['block-b'], ...mnogo['block-a'], ...mnogo['block-b']]
    expect(new Set(apartments.map((row) => row.status))).toEqual(new Set(['Свободен', 'Резервиран', 'Продадени', 'Блокиран']))
    expect(new Set([...gr.garages, ...gr.parking].map((spot) => spot.status))).toEqual(new Set(['Свободен', 'Продадени']))

    // Floor 0 holds the Многофамилна garages, which no page lists.
    expect(mnogo['block-a']).toHaveLength(72)
    expect(mnogo['block-b']).toHaveLength(72)
    expect(apartments.some((row) => row.floor === '0')).toBe(false)
  })

  it("reads today's column names: the fixture header rows pass through as they are", async () => {
    // The header rows of the published tabs. Sheet columns are never renamed
    // (spec §6.4): goldenresidence.dianahomes.bg reads the same tabs.
    expect(headerOf(TABS.BLOCK_A.csv)).toEqual(['Етаж', 'Апартамент', 'Застроена', 'Идеални', 'Обща', 'Вид', 'Изложение', 'Статус'])
    expect(headerOf(TABS.BLOCK_B.csv)).toEqual(headerOf(TABS.BLOCK_A.csv))
    expect(headerOf(TABS.GARAGES.csv)).toEqual(['Номер', 'Застроена', 'Идеални', 'Обща', 'Тип', 'Статус'])
    expect(headerOf(TABS.PARKING.csv)).toEqual(headerOf(TABS.GARAGES.csv))
    expect(headerOf(TABS.MNOGO_A.csv)).toEqual(['Етаж', 'Апартамент', 'Вид', 'Застроена', 'Идеални', 'Обща', 'Изложение', 'Статус'])
    expect(headerOf(TABS.MNOGO_B.csv)).toEqual(headerOf(TABS.MNOGO_A.csv))
    configure()
    google()

    const { projects } = await (await handler.fetch(get())).json()

    // Each column lands in its field, whatever its place in the tab.
    expect(projects['golden-residence']['block-a'][0]).toEqual({
      unit: 'А 101', floor: '1', type: '2-стаен',
      area: { built: '57.46', ideal: '8.22', total: '65.68' },
      exposure: 'Юг', status: 'Свободен', price: '',
    })
    expect(projects['golden-residence'].garages[0]).toEqual({
      number: 'Г-001', type: 'Гараж', area: { built: '21.07', ideal: '12.94', total: '34.01' }, status: 'Свободен',
    })
    expect(projects['golden-residence'].parking[0]).toEqual({
      number: 'ПМ-01', type: 'Паркомясто', area: { built: '17.67', ideal: '10.85', total: '28.52' }, status: 'Свободен',
    })
    expect(projects['mnogofamilna-sgrada']['block-a'][0]).toEqual({
      unit: 'А-101', floor: '2', type: '2-стаен',
      area: { built: '58.32', ideal: '', total: '63.87' },
      exposure: 'Север', status: 'Продадени', price: '',
    })
  })

  it('passes the optional Цена column through as the price', async () => {
    configure(['BLOCK_A'])
    google({ BLOCK_A: { body: 'Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус,Цена\r\n1,А 101,2-стаен,57.46,8.22,65.68,"Юг, Изток",Свободен,"95 000 €"\r\n' } })

    const { projects } = await (await handler.fetch(get())).json()

    expect(projects['golden-residence']['block-a']).toEqual([expect.objectContaining({ unit: 'А 101', exposure: 'Юг, Изток', price: '95 000 €' })])
  })

  it('answers 200 when one tab fails: that tab is an error and the others are filled', async () => {
    configure()
    google({ BLOCK_B: { status: 500, body: 'Internal Server Error' } })

    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    const { sources, projects } = await res.json()
    expect(sources).toEqual({ ...everyTab('ok'), BLOCK_B: 'error' })
    // No rows rather than an empty list: none of the tab's units is gone.
    expect(projects['golden-residence']['block-b']).toBeNull()
    expect(projects['golden-residence']['block-a']).toHaveLength(96)
    expect(projects['golden-residence'].garages).toHaveLength(113)
    expect(projects['golden-residence'].parking).toHaveLength(68)
    expect(projects['mnogofamilna-sgrada']['block-a']).toHaveLength(72)
    expect(projects['mnogofamilna-sgrada']['block-b']).toHaveLength(72)
    expect(errorLog).toHaveBeenCalled()
  })

  it('lets the edge keep a good answer for 30 s and serve it stale for 5 minutes', async () => {
    configure()
    google()

    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('public, s-maxage=30, stale-while-revalidate=300')
  })

  it('skips a tab with no address silently: missing, no request, no log', async () => {
    configure(['BLOCK_A', 'BLOCK_B', 'GARAGES', 'PARKING'])
    const fetch = google()

    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    const { sources, projects } = await res.json()
    expect(sources).toEqual({ ...everyTab('ok'), MNOGO_A: 'missing', MNOGO_B: 'missing' })
    expect(projects['mnogofamilna-sgrada']).toEqual({ 'block-a': null, 'block-b': null })
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(errorLog).not.toHaveBeenCalled()
  })

  it.each([
    ['every tab answers 500', () => new Response('Internal Server Error', { status: 500 })],
    ['Google cannot be reached', () => Promise.reject(new TypeError('fetch failed'))],
  ])('answers 503, never cached, when %s', async (_, reply) => {
    configure()
    google(everyTab(reply))

    const res = await handler.fetch(get())

    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect((await res.json()).sources).toEqual(everyTab('error'))
    expect(errorLog).toHaveBeenCalled()
  })

  it('answers 503, never cached, when no tab has an address', async () => {
    const fetch = google()

    const res = await handler.fetch(get())

    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect((await res.json()).sources).toEqual(everyTab('missing'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('asks for every tab at once and gives up on a silent one after 8 seconds', async () => {
    configure()
    // Блок А never answers on its own; it fails the way fetch does when the
    // caller's AbortController fires.
    const fetch = google({
      BLOCK_A: (init) => new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')))
      }),
    })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    let answered = false
    const pending = handler.fetch(get()).finally(() => { answered = true })
    // In parallel: every tab is asked for while Блок А still hangs.
    await vi.waitUntil(() => fetch.mock.calls.length === ALL.length)
    await vi.advanceTimersByTimeAsync(7900)
    expect(answered).toBe(false)
    await vi.advanceTimersByTimeAsync(100)
    const res = await pending

    expect(res.status).toBe(200)
    expect((await res.json()).sources).toEqual({ ...everyTab('ok'), BLOCK_A: 'error' })
    expect(errorLog).toHaveBeenCalled()
  })
})

describe('a body that is not the tab is an error, never rows', () => {
  // Google sometimes answers a published tab with 200 and an HTML error or
  // sign-in page.
  const HTML_ERROR_PAGE = `<!DOCTYPE html>
<html><head><title>Error 404 (Not Found)</title></head>
<body><h1>Тази страница не е достъпна</h1></body></html>`

  it.each([
    ['BLOCK_A', 'a 200 that is an HTML page', HTML_ERROR_PAGE],
    ['GARAGES', 'a 200 that is an HTML page', HTML_ERROR_PAGE],
    ['BLOCK_B', 'a tab with its header row only', 'Етаж,Апартамент,Застроена,Идеални,Обща,Вид,Изложение,Статус\r\n'],
    // Without Статус every unit would read as free.
    ['BLOCK_A', 'an apartment tab without its Статус column', TABS.BLOCK_A.csv.replace('Статус', 'Status')],
    ['PARKING', 'a parking tab without its Статус column', TABS.PARKING.csv.replace('Статус', 'Състояние')],
    // Without Номер no row names a place.
    ['GARAGES', 'a garage tab without its Номер column', TABS.GARAGES.csv.replace('Номер', 'Гараж')],
  ])('%s: %s', async (key, _, body) => {
    configure()
    google({ [key]: { body } })

    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    const { sources, projects } = await res.json()
    expect(sources).toEqual({ ...everyTab('ok'), [key]: 'error' })
    expect(slotOf(projects, key)).toBeNull()
  })

  it('leaves out the garage and parking rows that have no Номер', async () => {
    configure(['GARAGES'])
    google({ GARAGES: { body: 'Номер,Застроена,Идеални,Обща,Тип,Статус\nГ-001,21.07,12.94,34.01,Гараж,Продадени\n,,,,,\n ,1,1,1,Гараж,Свободен\n' } })

    const { projects } = await (await handler.fetch(get())).json()

    expect(projects['golden-residence'].garages.map((spot) => [spot.number, spot.status])).toEqual([['Г-001', 'Продадени']])
  })
})

describe('other methods', () => {
  it.each(['POST', 'PUT', 'DELETE', 'PATCH'])('answers %s with 405 and names GET as allowed', async (method) => {
    configure()
    const fetch = google()

    const res = await handler.fetch(new Request(ENDPOINT, { method }))

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET')
    expect(fetch).not.toHaveBeenCalled()
  })
})

// Vercel runs the function as plain Node ESM, where a relative import without
// its .js does not resolve. Vitest resolves it all the same, so only a real
// Node process shows it.
it('loads in plain Node, as Vercel runs it', () => {
  const handlerUrl = new URL('../../api/availability.js', import.meta.url).href
  const script = `const { default: handler } = await import(${JSON.stringify(handlerUrl)})
const res = await handler.fetch(new Request('http://localhost/api/availability', { method: 'POST' }))
process.stdout.write(String(res.status))`

  expect(execFileSync(process.execPath, ['--input-type=module', '--eval', script], { encoding: 'utf8' })).toBe('405')
})
