// Live availability for the routes that show it (spec §6.4): one store for
// useSyncExternalStore (useAvailability.js), shared by every reader on a page.
//
// On the server, and while the browser hydrates, it is the placeholder
// { status: 'idle', data: null }. The first client subscriber starts the load:
//   1. api/availability, same origin, preloaded from the data routes' `links`;
//   2. if that fails (any answer but a 200 with its JSON, or none), the sheets
//      themselves, through the browser's fetchers in googleSheets.js;
//   3. if those read nothing either, the data built into the site, as
//      'fallback'.
// `data` has the API's `projects` shape on every path. A slot without live
// rows is null: a Многофамилна block without a sheet, or a tab that failed.
//
// It reads again when the visitor comes back to the tab and what it shows is
// more than a minute old; never on a timer. A refresh never shows 'loading',
// never falls back to the built-in data, and keeps a tab's last rows when only
// that tab fails, as ApartmentContext does.

import { normalizeStatus } from '../../utils/propertyStatus'
import { clearCache, fetchApartmentData, fetchGarageData, normalizeFloorData } from '../../services/googleSheets'

const AVAILABILITY_URL = '/api/availability'

// For a data route's `links`. crossorigin=anonymous makes the preload a CORS
// request with same-origin credentials, the request fromApi() makes, so the
// browser hands the preloaded response to the store. With credentials 'omit'
// Chrome would fetch twice and warn that the preload went unused.
export const availabilityPreload = Object.freeze({
  rel: 'preload',
  href: AVAILABILITY_URL,
  as: 'fetch',
  crossOrigin: 'anonymous',
})

const STALE_AFTER_MS = 60 * 1000

const IDLE = Object.freeze({ status: 'idle', data: null, updatedAt: null })
const LOADING = Object.freeze({ status: 'loading', data: null, updatedAt: null })

let snapshot = IDLE
const listeners = new Set()
// When what the page shows was asked for: the first load or the last refresh.
let readAt = 0
let reading = false

function publish(next) {
  snapshot = Object.freeze(next)
  for (const listener of listeners) listener()
}

// The legacy shapes the fetchers and the built-in data keep, as the API's
// rows. The statuses go through normalizeStatus() on every path.
function rowsOf(floors) {
  if (!floors) return null
  return Object.entries(floors).flatMap(([floor, apartments]) =>
    apartments.map((apartment) => ({
      unit: apartment.apartment ?? '',
      floor,
      type: apartment.вид ?? '',
      area: { built: apartment.built ?? '', ideal: apartment.ideal ?? '', total: apartment.total ?? '' },
      exposure: apartment.изложение ?? '',
      status: normalizeStatus(apartment.status),
      price: apartment.цена ?? '',
    })))
}

function spotsOf(places) {
  if (!places) return null
  return places.map((place) => ({
    number: place.number ?? '',
    type: place.type ?? '',
    area: { built: place.built ?? '', ideal: place.ideal ?? '', total: place.total ?? '' },
    status: normalizeStatus(place.status),
  }))
}

function projectsOf({ blockA, blockB, garages, parking, mnogoA, mnogoB }) {
  return {
    'golden-residence': {
      'block-a': rowsOf(blockA),
      'block-b': rowsOf(blockB),
      garages: spotsOf(garages),
      parking: spotsOf(parking),
    },
    'mnogofamilna-sgrada': { 'block-a': rowsOf(mnogoA), 'block-b': rowsOf(mnogoB) },
  }
}

async function fromApi() {
  try {
    const response = await fetch(AVAILABILITY_URL, { mode: 'cors', credentials: 'same-origin' })
    if (response.status !== 200) return null
    const { updatedAt, projects } = await response.json()
    if (!projects?.['golden-residence'] || !projects['mnogofamilna-sgrada']) return null
    return { data: projects, updatedAt }
  } catch {
    return null
  }
}

// Each fetcher answers null for a sheet that is not configured or failed. A
// refresh clears their cache first: after an error they answer the expired
// rows, which would pass for new ones.
async function fromSheets({ refresh }) {
  if (refresh) clearCache()
  const settle = (read) => Promise.resolve().then(read).catch(() => null)
  const [blockA, blockB, garages, parking, mnogoA, mnogoB] = await Promise.all([
    settle(() => fetchApartmentData('blockA')),
    settle(() => fetchApartmentData('blockB')),
    settle(() => fetchGarageData('garages')),
    settle(() => fetchGarageData('parking')),
    settle(() => fetchApartmentData('mnogoA')),
    settle(() => fetchApartmentData('mnogoB')),
  ])
  if (![blockA, blockB, garages, parking, mnogoA, mnogoB].some(Boolean)) return null
  return {
    data: projectsOf({ blockA, blockB, garages, parking, mnogoA, mnogoB }),
    updatedAt: new Date().toISOString(),
  }
}

// The data built into the site, loaded only on this path. Многофамилна's
// dated data goes through normalizeFloorData() like a sheet's rows; if its
// chunk fails to load, Многофамилна has no rows and the rest stands.
async function fromBuiltIn() {
  const [goldenResidence, mnogo] = await Promise.all([
    import('../../constants/apartmentFallbackData'),
    import('../../constants/mnogofamilnaFallbackData').catch(() => null),
  ])
  return projectsOf({
    blockA: normalizeFloorData(goldenResidence.getBlockAFallbackData()),
    blockB: normalizeFloorData(goldenResidence.getBlockBFallbackData()),
    garages: goldenResidence.getGaragesFallbackData(),
    parking: goldenResidence.getParkingFallbackData(),
    mnogoA: mnogo && normalizeFloorData(mnogo.getMnogoAFallbackData()),
    mnogoB: mnogo && normalizeFloorData(mnogo.getMnogoBFallbackData()),
  })
}

async function readLive({ refresh }) {
  return (await fromApi()) ?? (await fromSheets({ refresh }))
}

async function load() {
  publish(LOADING)
  try {
    const live = await readLive({ refresh: false })
    if (live) publish({ status: 'ready', ...live })
    else publish({ status: 'fallback', data: await fromBuiltIn(), updatedAt: null })
  } catch {
    // Not even the built-in data loaded.
    publish({ status: 'error', data: null, updatedAt: null })
  }
}

// A slot the new read has no rows for keeps the rows it showed.
const keepLastRows = (shown, read) =>
  Object.fromEntries(Object.entries(read).map(([project, slots]) => [
    project,
    Object.fromEntries(Object.entries(slots).map(([slot, rows]) => [slot, rows ?? shown[project]?.[slot] ?? null])),
  ]))

async function refresh() {
  const live = await readLive({ refresh: true })
  if (!live) return
  // Live rows only ever merge with live rows: built-in data is never kept
  // behind a 'ready'.
  const data = snapshot.status === 'ready' ? keepLastRows(snapshot.data, live.data) : live.data
  publish({ status: 'ready', data, updatedAt: live.updatedAt })
}

function start(read) {
  readAt = Date.now()
  reading = true
  read().catch(() => {}).finally(() => {
    reading = false
  })
}

function onVisibilityChange() {
  if (document.visibilityState !== 'visible' || reading) return
  if (Date.now() - readAt <= STALE_AFTER_MS) return
  start(refresh)
}

export function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) document.addEventListener('visibilitychange', onVisibilityChange)
  if (snapshot === IDLE) start(load)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

export const getSnapshot = () => snapshot

// The prerendered value: the placeholder, never data.
export const getServerSnapshot = () => IDLE
