import { act, render, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The direct fetchers of the fallback path are mocked; normalizeFloorData and
// the rest of the service are real.
const sheets = vi.hoisted(() => ({
  fetchApartmentData: vi.fn(),
  fetchGarageData: vi.fn(),
  clearCache: vi.fn(),
}))
vi.mock('../../services/googleSheets', async (importOriginal) => ({ ...(await importOriginal()), ...sheets }))

const row = (unit, floor, status, extra = {}) => ({
  unit, floor, type: '2-стаен', area: { built: '54.36', ideal: '7.82', total: '62.18' }, exposure: 'Юг', status, price: '', ...extra,
})
const spot = (number, status) => ({ number, type: 'Гараж', area: { built: '21.07', ideal: '12.94', total: '34.01' }, status })

// What api/availability.js answers.
const API_BODY = {
  updatedAt: '2026-11-14T08:00:00.000Z',
  sources: { BLOCK_A: 'ok', BLOCK_B: 'ok', GARAGES: 'ok', PARKING: 'ok', MNOGO_A: 'missing', MNOGO_B: 'missing' },
  projects: {
    'golden-residence': {
      'block-a': [row('А 301', '3', 'Блокиран')],
      'block-b': [row('Б 101', '1', 'Свободен')],
      garages: [spot('Г-001', 'Свободен')],
      parking: [spot('ПМ-01', 'Продадени')],
    },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  },
}

// What it answers, with 503, when it could read no tab.
const API_DOWN = {
  updatedAt: '2026-11-14T08:00:00.000Z',
  sources: { BLOCK_A: 'error', BLOCK_B: 'error', GARAGES: 'error', PARKING: 'error', MNOGO_A: 'missing', MNOGO_B: 'missing' },
  projects: {
    'golden-residence': { 'block-a': null, 'block-b': null, garages: null, parking: null },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  },
}

// What it answers when it could not read Блок Б: that slot is null.
const API_NO_BLOCK_B = structuredClone(API_BODY)
API_NO_BLOCK_B.sources.BLOCK_B = 'error'
API_NO_BLOCK_B.projects['golden-residence']['block-b'] = null

// The API, answering `body` with `status`, as fetch does.
const api = (body = API_BODY, status = 200) =>
  vi.fn(async () => ({ ok: status >= 200 && status < 300, status, json: async () => body }))
const unreachable = () => vi.fn(async () => { throw new TypeError('Failed to fetch') })
// A stalled connection: no answer, until the request's signal aborts it.
const stalled = () => vi.fn((url, init) => new Promise((_, reject) => {
  init?.signal?.addEventListener('abort', () => reject(init.signal.reason))
}))

// Rows of the data built into the site, as the store gives them.
const BUILT_IN = {
  b101: { unit: 'Б 101', floor: '1', type: '2-стаен', area: { built: '57.46', ideal: '8.22', total: '65.68' }, exposure: 'Юг', status: 'Свободен', price: '' },
  pm01: { number: 'ПМ-01', type: 'Паркомясто', area: { built: '17.67', ideal: '10.85', total: '28.52' }, status: 'Свободен' },
}

// Where each slot's rows come from (the snapshot's `origin`).
const origin = (goldenResidence, mnogofamilna = { 'block-a': null, 'block-b': null }) => ({
  'golden-residence': goldenResidence,
  'mnogofamilna-sgrada': mnogofamilna,
})
const ALL_LIVE = { 'block-a': 'live', 'block-b': 'live', garages: 'live', parking: 'live' }
const ALL_BUILT_IN = { 'block-a': 'built-in', 'block-b': 'built-in', garages: 'built-in', parking: 'built-in' }

// The chunk of Golden Residence's built-in data fails to load, as a dynamic
// import does when the network drops.
function builtInChunkFails() {
  vi.doMock('../../constants/apartmentFallbackData', () => {
    throw new TypeError('Failed to fetch dynamically imported module')
  })
}

// What the direct fetchers answer: the legacy floor maps and place lists.
const FLOORS = {
  blockA: { 3: [{ apartment: 'А 301', built: '54.36', ideal: '7.82', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Блокиран', цена: '' }] },
  blockB: { 1: [{ apartment: 'Б 101', built: '57.46', ideal: '8.22', вид: '2-стаен', total: '65.68', изложение: 'Юг', status: 'Свободен', цена: '95 000 €' }] },
  mnogoA: { 2: [{ apartment: 'А-101', built: '58.32', ideal: '', вид: '2-стаен', total: '63.87', изложение: 'Север', status: 'Продадени', цена: '' }] },
}
const PLACES = {
  garages: [{ number: 'Г-001', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' }],
  parking: [{ number: 'ПМ-01', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' }],
}
// A fetcher left out answers null: unconfigured, or failed.
const answering = (answers) => async (key) => answers[key] ?? null

const unitOf = (rows, label) => rows.find((r) => r.unit === label)

// The tab's visibility as the browser reports it, and the event it fires.
function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => state !== 'visible' })
  document.dispatchEvent(new Event('visibilitychange'))
}

// The visitor leaves the tab for `ms`, then comes back.
async function awayFor(ms) {
  await act(async () => {
    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(ms)
    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)
  })
}

let useAvailability
let availabilityPreload
let seen
let statuses
let hydrated

// Shows the hook's status, and keeps what it last gave and every status it
// went through.
function Probe() {
  seen = useAvailability()
  statuses.push(seen.status)
  return seen.status
}

// Renders a reader on a fake clock that also runs on with real time (the
// built-in data and the store's own steps are promises it cannot hurry), and
// waits for the first load to end in `status`. Returns the page.
async function renderLoaded(fetch, status = 'ready') {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('fetch', fetch)
  const page = render(createElement(Probe))
  await waitFor(() => expect(seen.status).toBe(status))
  return page
}

// Hydrates `html`, a prerendered Probe, as the browser does. Returns the
// container and what React recovered from (a mismatch is one).
async function hydrateProbe(html) {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  statuses = []
  const errors = []
  await act(async () => {
    const root = hydrateRoot(container, createElement(Probe), { onRecoverableError: (error) => errors.push(error) })
    hydrated.push({ root, container })
  })
  return { container, errors }
}

beforeEach(async () => {
  // A fresh store for every test: it lives at module level.
  vi.resetModules()
  ;({ useAvailability, availabilityPreload } = await import('./useAvailability'))
  seen = undefined
  statuses = []
  hydrated = []
  sheets.fetchApartmentData.mockReset().mockImplementation(answering({}))
  sheets.fetchGarageData.mockReset().mockImplementation(answering({}))
  sheets.clearCache.mockReset()
})

afterEach(() => {
  for (const { root, container } of hydrated) {
    act(() => root.unmount())
    container.remove()
  }
  vi.doUnmock('../../constants/apartmentFallbackData')
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  // Back to jsdom's own visibility.
  delete document.visibilityState
  delete document.hidden
})

describe('prerender', () => {
  it('renders idle on the server and asks for nothing', () => {
    const fetch = api()
    vi.stubGlobal('fetch', fetch)

    expect(renderToString(createElement(Probe))).toBe('idle')
    expect(seen).toEqual({ status: 'idle', data: null, origin: null, updatedAt: null })
    expect(fetch).not.toHaveBeenCalled()
    expect(sheets.fetchApartmentData).not.toHaveBeenCalled()
  })

  it('hydrates the prerendered placeholder without a mismatch, then loads', async () => {
    vi.stubGlobal('fetch', api())
    const logged = vi.spyOn(console, 'error')

    const { container, errors } = await hydrateProbe(renderToString(createElement(Probe)))
    await waitFor(() => expect(container.textContent).toBe('ready'))

    expect(errors).toEqual([])
    expect(logged).not.toHaveBeenCalled()
    // The first client render is the server's.
    expect(statuses[0]).toBe('idle')
  })

  // A part of a page can hydrate after the rest (a Suspense boundary), once
  // the store already has data. Its first render must still be the HTML's.
  it('hydrates the placeholder where a part hydrates after the data has loaded', async () => {
    vi.stubGlobal('fetch', api())
    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    const { container, errors } = await hydrateProbe('idle')
    await waitFor(() => expect(container.textContent).toBe('ready'))

    expect(errors).toEqual([])
    expect(statuses[0]).toBe('idle')
  })
})

describe('the first load', () => {
  it('is ready with the API answer, asked for once however many read it', async () => {
    const fetch = api()
    vi.stubGlobal('fetch', fetch)

    render(createElement('div', null, createElement(Probe), createElement(Probe)))
    await waitFor(() => expect(seen.status).toBe('ready'))

    // Многофамилна has no sheet, so no rows: its dated data is static and
    // prerendered (spec §6.4), and the store loads none of it.
    expect(seen.data).toEqual(API_BODY.projects)
    expect(seen.origin).toEqual(origin(ALL_LIVE))
    expect(seen.updatedAt).toBe(API_BODY.updatedAt)
    expect(statuses).toContain('loading')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(sheets.fetchApartmentData).not.toHaveBeenCalled()
  })

  // Golden Residence's counts arrive at hydration (spec §6.4), so each of its
  // slots shows rows: those built into the site where the read had none,
  // marked so the page can show them as dated, as production's ApartmentContext
  // filled them.
  it('shows the built-in rows, marked built-in, for a Golden Residence tab the API could not read', async () => {
    vi.stubGlobal('fetch', api(API_NO_BLOCK_B))

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    const gr = seen.data['golden-residence']
    expect(gr['block-a']).toEqual(API_BODY.projects['golden-residence']['block-a'])
    expect(gr.parking).toEqual(API_BODY.projects['golden-residence'].parking)
    expect(gr['block-b']).toHaveLength(96)
    expect(unitOf(gr['block-b'], 'Б 101')).toEqual(BUILT_IN.b101)
    expect(seen.origin).toEqual(origin({ ...ALL_LIVE, 'block-b': 'built-in' }))
    expect(seen.data['mnogofamilna-sgrada']).toEqual({ 'block-a': null, 'block-b': null })
    expect(seen.updatedAt).toBe(API_NO_BLOCK_B.updatedAt)
    // The API answered for every tab; the store does not read one again.
    expect(sheets.fetchApartmentData).not.toHaveBeenCalled()
  })

  it('shows the built-in Golden Residence rows when the API could read only Многофамилна', async () => {
    const mnogoA = [row('А-101', '2', 'Продадени', { area: { built: '58.32', ideal: '', total: '63.87' }, exposure: 'Север' })]
    const mnogoB = [row('Б-101', '2', 'Свободен', { exposure: 'Север' })]
    const onlyMnogo = structuredClone(API_DOWN)
    onlyMnogo.sources.MNOGO_A = 'ok'
    onlyMnogo.sources.MNOGO_B = 'ok'
    onlyMnogo.projects['mnogofamilna-sgrada'] = { 'block-a': mnogoA, 'block-b': mnogoB }
    vi.stubGlobal('fetch', api(onlyMnogo))

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    const gr = seen.data['golden-residence']
    expect([gr['block-a'], gr['block-b'], gr.garages, gr.parking].map((rows) => rows.length)).toEqual([96, 96, 113, 68])
    expect(gr.parking[0]).toEqual(BUILT_IN.pm01)
    expect(seen.data['mnogofamilna-sgrada']).toEqual({ 'block-a': mnogoA, 'block-b': mnogoB })
    expect(seen.origin).toEqual(origin(ALL_BUILT_IN, { 'block-a': 'live', 'block-b': 'live' }))
    expect(seen.updatedAt).toBe(onlyMnogo.updatedAt)
  })

  it('leaves a Golden Residence tab empty when even its built-in rows fail to load', async () => {
    builtInChunkFails()
    vi.stubGlobal('fetch', api(API_NO_BLOCK_B))

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    expect(seen.data).toEqual(API_NO_BLOCK_B.projects)
    expect(seen.origin).toEqual(origin({ ...ALL_LIVE, 'block-b': null }))
  })

  // <link rel=preload as=fetch crossorigin=anonymous> is a CORS request with
  // same-origin credentials. Chrome reuses it only for a fetch() that makes
  // the same request; with any other credentials mode it fetches twice and
  // warns that the preload went unused.
  it('makes the request its preload makes, so the browser reuses the response', async () => {
    const fetch = api()
    vi.stubGlobal('fetch', fetch)

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    expect(availabilityPreload).toEqual({ rel: 'preload', href: '/api/availability', as: 'fetch', crossOrigin: 'anonymous' })
    // The signal is the request's timeout; it is no part of what the
    // preload matches on.
    expect(fetch).toHaveBeenCalledWith('/api/availability', { mode: 'cors', credentials: 'same-origin', signal: expect.any(AbortSignal) })
  })

  // A stalled connection must not keep the page loading for minutes: the
  // API's fetch gives up after 10 s, and the store takes the path it takes on
  // any failure, the sheets, then the data built into the site. Never zeros.
  it('gives up on an API that never answers after 10 s, and falls back as on any failure', async () => {
    const timer = new AbortController()
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timer.signal)
    vi.stubGlobal('fetch', stalled())

    render(createElement(Probe))
    await waitFor(() => expect(timeout).toHaveBeenCalledWith(10_000))
    expect(seen.status).toBe('loading')

    await act(async () => timer.abort(new DOMException('The operation timed out.', 'TimeoutError')))
    await waitFor(() => expect(seen.status).toBe('fallback'))

    expect(sheets.fetchApartmentData).toHaveBeenCalled()
    const gr = seen.data['golden-residence']
    expect([gr['block-a'], gr['block-b'], gr.garages, gr.parking].map((rows) => rows.length)).toEqual([96, 96, 113, 68])
    expect(seen.origin).toEqual(origin(ALL_BUILT_IN, { 'block-a': 'built-in', 'block-b': 'built-in' }))
  })

  it.each([
    ['answers 503', () => api(API_DOWN, 503)],
    ['cannot be reached', unreachable],
    ['answers something other than its JSON', () => vi.fn(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <') } }))],
  ])('reads the sheets directly when the API %s', async (_, makeFetch) => {
    vi.stubGlobal('fetch', makeFetch())
    sheets.fetchApartmentData.mockImplementation(answering(FLOORS))
    sheets.fetchGarageData.mockImplementation(answering(PLACES))

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    // The fetchers' rows, in the API's shape. Многофамилна Вход Б has no
    // sheet, so no rows.
    expect(seen.data).toEqual({
      'golden-residence': {
        'block-a': [row('А 301', '3', 'Блокиран')],
        'block-b': [row('Б 101', '1', 'Свободен', { area: { built: '57.46', ideal: '8.22', total: '65.68' }, price: '95 000 €' })],
        garages: [spot('Г-001', 'Свободен')],
        parking: [{ number: 'ПМ-01', type: 'Паркомясто', area: { built: '17.67', ideal: '10.85', total: '28.52' }, status: 'Продадени' }],
      },
      'mnogofamilna-sgrada': {
        'block-a': [row('А-101', '2', 'Продадени', { area: { built: '58.32', ideal: '', total: '63.87' }, exposure: 'Север' })],
        'block-b': null,
      },
    })
    expect(seen.origin).toEqual(origin(ALL_LIVE, { 'block-a': 'live', 'block-b': null }))
    expect(new Date(seen.updatedAt).toISOString()).toBe(seen.updatedAt)
    expect(sheets.fetchApartmentData.mock.calls.map(([block]) => block).sort()).toEqual(['blockA', 'blockB', 'mnogoA', 'mnogoB'])
    expect(sheets.fetchGarageData.mock.calls.map(([type]) => type).sort()).toEqual(['garages', 'parking'])
  })

  it('shows the built-in rows for the Golden Residence tabs the sheets could not give', async () => {
    vi.stubGlobal('fetch', unreachable())
    sheets.fetchApartmentData.mockImplementation(answering({ blockA: FLOORS.blockA }))

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('ready'))

    const gr = seen.data['golden-residence']
    expect(gr['block-a']).toEqual([row('А 301', '3', 'Блокиран')])
    expect([gr['block-b'], gr.garages, gr.parking].map((rows) => rows.length)).toEqual([96, 113, 68])
    expect(unitOf(gr['block-b'], 'Б 101')).toEqual(BUILT_IN.b101)
    expect(seen.data['mnogofamilna-sgrada']).toEqual({ 'block-a': null, 'block-b': null })
    expect(seen.origin).toEqual(origin({ ...ALL_BUILT_IN, 'block-a': 'live' }))
  })

  it.each([
    ['answer null', async () => null],
    ['fail', async () => { throw new Error('boom') }],
  ])('falls back to the built-in data when the API is down and the sheets %s', async (_, fetcher) => {
    vi.stubGlobal('fetch', unreachable())
    sheets.fetchApartmentData.mockImplementation(fetcher)
    sheets.fetchGarageData.mockImplementation(fetcher)

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('fallback'))

    expect(seen.updatedAt).toBeNull()
    const gr = seen.data['golden-residence']
    expect(gr['block-a']).toHaveLength(96)
    expect(gr['block-b']).toHaveLength(96)
    expect(gr.garages).toHaveLength(113)
    expect(gr.parking).toHaveLength(68)
    expect(unitOf(gr['block-a'], 'А 101')).toEqual({
      unit: 'А 101', floor: '1', type: '', area: { built: '57.46', ideal: '8.22', total: '65.68' }, exposure: '', status: 'Свободен', price: '',
    })
    expect(gr.garages[0]).toEqual({ number: 'Г-001', type: 'Гараж', area: { built: '21.07', ideal: '12.94', total: '34.01' }, status: 'Свободен' })
    // Многофамилна's dated data, normalised like a sheet: floor 0 (its
    // garages) left out, and „Продаден" read as Продадени.
    const mnogo = seen.data['mnogofamilna-sgrada']
    expect(mnogo['block-a']).toHaveLength(72)
    expect(mnogo['block-b']).toHaveLength(72)
    expect(unitOf(mnogo['block-a'], 'А-101').status).toBe('Продадени')
    expect(mnogo['block-a'].some((r) => r.floor === '0')).toBe(false)
    expect(seen.origin).toEqual(origin(ALL_BUILT_IN, { 'block-a': 'built-in', 'block-b': 'built-in' }))
  })

  it('is an error when nothing live answers and the built-in data fails to load', async () => {
    builtInChunkFails()
    vi.stubGlobal('fetch', unreachable())

    render(createElement(Probe))
    await waitFor(() => expect(seen.status).toBe('error'))

    expect(seen).toEqual({ status: 'error', data: null, origin: null, updatedAt: null })
  })
})

describe('refresh', () => {
  it('reads again when the visitor comes back after more than a minute, without going back to loading', async () => {
    const fetch = api()
    await renderLoaded(fetch)
    const changed = structuredClone(API_BODY)
    changed.updatedAt = '2026-11-14T08:01:01.000Z'
    changed.projects['golden-residence']['block-a'] = [row('А 301', '3', 'Свободен')]
    fetch.mockImplementation(api(changed))
    statuses = []

    await awayFor(61_000)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(seen.data).toEqual(changed.projects)
    expect(seen.updatedAt).toBe(changed.updatedAt)
    expect(statuses).not.toContain('loading')
  })

  it('reads nothing again when what it shows is under a minute old, or on a timer', async () => {
    const fetch = api()
    await renderLoaded(fetch)

    await awayFor(30_000)
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => { await vi.advanceTimersByTimeAsync(5 * 60_000) })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(sheets.fetchApartmentData).not.toHaveBeenCalled()
  })

  it('keeps what it shows when a refresh finds nothing live', async () => {
    const fetch = api()
    await renderLoaded(fetch)
    fetch.mockImplementation(unreachable())

    await awayFor(61_000)

    expect(fetch).toHaveBeenCalledTimes(2)
    // The direct fetchers, past their own cache, answered nothing either.
    expect(sheets.clearCache).toHaveBeenCalled()
    expect(sheets.fetchApartmentData).toHaveBeenCalled()
    expect(seen).toEqual({ status: 'ready', data: API_BODY.projects, origin: origin(ALL_LIVE), updatedAt: API_BODY.updatedAt })
  })

  it("keeps a tab's last rows when only that tab fails on a refresh", async () => {
    const fetch = api()
    await renderLoaded(fetch)
    const partial = structuredClone(API_NO_BLOCK_B)
    partial.updatedAt = '2026-11-14T08:01:01.000Z'
    partial.projects['golden-residence']['block-a'] = [row('А 301', '3', 'Свободен')]
    fetch.mockImplementation(api(partial))

    await awayFor(61_000)

    expect(seen.data['golden-residence']['block-a']).toEqual([row('А 301', '3', 'Свободен')])
    expect(seen.data['golden-residence']['block-b']).toEqual(API_BODY.projects['golden-residence']['block-b'])
    expect(seen.origin).toEqual(origin(ALL_LIVE))
    expect(seen.updatedAt).toBe(partial.updatedAt)
  })

  // A deploy can add a tab, or a project, the API could not read yet: a slot
  // with no rows that the page has never shown. A refresh takes it as it
  // comes, and the next refresh still runs.
  it('takes a slot it has never shown on a refresh, and keeps refreshing', async () => {
    const fetch = api()
    await renderLoaded(fetch)
    const grown = structuredClone(API_BODY)
    grown.updatedAt = '2026-11-14T08:01:01.000Z'
    grown.projects['golden-residence']['block-a'] = [row('А 301', '3', 'Свободен')]
    grown.projects['golden-residence']['block-c'] = null
    grown.projects['third-project'] = { 'block-a': null }
    fetch.mockImplementation(api(grown))
    const logged = vi.spyOn(console, 'error')

    await awayFor(61_000)
    // block-c has no rows, so the store loads the built-in chunk to look for
    // some, which takes a moment.
    await waitFor(() => expect(seen.updatedAt).toBe(grown.updatedAt))

    expect(seen.data['golden-residence']['block-a']).toEqual([row('А 301', '3', 'Свободен')])
    expect(seen.data['golden-residence']['block-c']).toBeNull()
    expect(seen.data['third-project']).toEqual({ 'block-a': null })
    expect(seen.origin['golden-residence']).toEqual({ ...ALL_LIVE, 'block-c': null })
    expect(seen.origin['third-project']).toEqual({ 'block-a': null })
    expect(logged).not.toHaveBeenCalled()

    const later = structuredClone(grown)
    later.updatedAt = '2026-11-14T08:02:30.000Z'
    fetch.mockImplementation(api(later))
    await awayFor(61_000)

    await waitFor(() => expect(seen.updatedAt).toBe(later.updatedAt))
  })

  // Should a refresh fail where nothing expects it to, it says so on the
  // console, and the store still refreshes the next time.
  it('reports a refresh that fails unexpectedly, and refreshes the next time', async () => {
    const fetch = api()
    await renderLoaded(fetch)
    const broken = structuredClone(API_BODY)
    broken.updatedAt = '2026-11-14T08:01:01.000Z'
    Object.defineProperty(broken.projects['golden-residence'], 'block-a', { enumerable: true, get: () => { throw new Error('unreadable slot') } })
    fetch.mockImplementation(vi.fn(async () => ({ ok: true, status: 200, json: async () => broken })))
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})

    await awayFor(61_000)

    expect(logged).toHaveBeenCalledWith(expect.stringMatching(/availability/), expect.any(Error))
    expect(seen.updatedAt).toBe(API_BODY.updatedAt)

    const fixed = structuredClone(API_BODY)
    fixed.updatedAt = '2026-11-14T08:02:30.000Z'
    fetch.mockImplementation(api(fixed))
    await awayFor(61_000)

    expect(seen.updatedAt).toBe(fixed.updatedAt)
  })

  it('marks a tab live once a refresh reads it', async () => {
    const fetch = api(API_NO_BLOCK_B)
    await renderLoaded(fetch)
    expect(seen.origin).toEqual(origin({ ...ALL_LIVE, 'block-b': 'built-in' }))
    fetch.mockImplementation(api())

    await awayFor(61_000)

    expect(seen.data).toEqual(API_BODY.projects)
    expect(seen.origin).toEqual(origin(ALL_LIVE))
  })

  // After a live read every store looks the same, however it started: the
  // built-in Golden Residence rows only where nothing live came, and no
  // Многофамилна rows without a sheet.
  it('turns the fallback into live rows where a refresh reads them, and built-in rows where it does not', async () => {
    const fetch = unreachable()
    await renderLoaded(fetch, 'fallback')
    fetch.mockImplementation(api(API_NO_BLOCK_B))

    await awayFor(61_000)
    // The built-in rows come from a chunk, which takes a moment to load.
    await waitFor(() => expect(seen.status).toBe('ready'))

    const gr = seen.data['golden-residence']
    expect(gr['block-a']).toEqual(API_BODY.projects['golden-residence']['block-a'])
    expect(gr['block-b']).toHaveLength(96)
    expect(unitOf(gr['block-b'], 'Б 101')).toEqual(BUILT_IN.b101)
    expect(seen.data['mnogofamilna-sgrada']).toEqual({ 'block-a': null, 'block-b': null })
    expect(seen.origin).toEqual(origin({ ...ALL_LIVE, 'block-b': 'built-in' }))
    expect(seen.updatedAt).toBe(API_NO_BLOCK_B.updatedAt)
  })
})

// The visitor goes from a page that reads availability (Home) to one that
// does not (Контакти), then back. While no page reads the store, it hears no
// tab switch, so a page that reads it again must not show what it read long
// ago.
describe('a page that reads it again', () => {
  it('reads again when it opens after more than a minute without a reader, tab switches included', async () => {
    const fetch = api()
    const home = await renderLoaded(fetch)
    const changed = structuredClone(API_BODY)
    changed.updatedAt = '2026-11-14T08:01:01.000Z'
    changed.projects['golden-residence']['block-a'] = [row('А 301', '3', 'Свободен')]
    fetch.mockImplementation(api(changed))

    home.unmount()
    await awayFor(61_000)
    // Nothing is read for a page that does not show it.
    expect(fetch).toHaveBeenCalledTimes(1)

    statuses = []
    render(createElement(Probe))
    await waitFor(() => expect(seen.data).toEqual(changed.projects))

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(seen.updatedAt).toBe(changed.updatedAt)
    expect(statuses).not.toContain('loading')
  })

  it('reads nothing again when it opens within a minute', async () => {
    const fetch = api()
    const home = await renderLoaded(fetch)

    home.unmount()
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
    render(createElement(Probe))
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('waits for the tab to be visible when it opens in a hidden tab', async () => {
    const fetch = api()
    const home = await renderLoaded(fetch)

    home.unmount()
    await act(async () => {
      setVisibility('hidden')
      await vi.advanceTimersByTimeAsync(61_000)
    })
    render(createElement(Probe))
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      setVisibility('visible')
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
