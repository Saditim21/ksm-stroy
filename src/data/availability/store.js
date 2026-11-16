// Live availability for the routes that show it (spec §6.4): one store for
// useSyncExternalStore (useAvailability.js), shared by every reader on a page.
//
// On the server, and while the browser hydrates, it is the placeholder
// { status: 'idle', data: null }. The first client subscriber starts the load:
//   1. api/availability, same origin, preloaded from the data routes' `links`;
//   2. if that fails (any answer but a 200 with its JSON, or none), the sheets
//      themselves, through the browser's fetchers in googleSheets.js, which
//      load then (loadSheets);
//   3. if those read nothing either, the data built into the site, as
//      'fallback'.
// `data` has the API's `projects` shape on every path, and `origin`, in the
// same shape, says where each slot's rows come from: 'live' (a sheet), or
// 'built-in', or null where there are none.
// - Golden Residence's counts arrive at hydration, so each of its slots has
//   rows: a tab the read had none for (the API or its fetcher could not read
//   it) shows the built-in rows, as ApartmentContext shows them, marked
//   'built-in' so the page can show them as dated.
// - A Многофамилна block without a live sheet has no rows after a live read:
//   its dated data is static and prerendered (spec §6.4). Only the fallback
//   carries it.
//
// It reads again when the visitor comes back to the tab and what it shows is
// more than a minute old, and when a page that reads it opens after the store
// had no reader (it hears no tab switch then) and what it shows is that old;
// never on a timer. A refresh never shows 'loading', never falls back to the
// built-in data wholesale, and keeps a tab's last live rows when only that tab
// fails, as ApartmentContext does.

import { normalizeStatus } from '../../utils/propertyStatus'

// The browser's fetchers and the legacy floor maps' last step
// (src/services/googleSheets.js, with sheetsCore.js's CSV reader): a chunk of
// their own, loaded only on the paths that use them, the sheets once the API
// has failed and the data built into the site, so neither is in a route's
// first-load JS (spec §10, M3 §10: the bytes Многофамилна's page adds to the
// shared chunks are freed here).
const loadSheets = () => import('../../services/googleSheets')

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
// A stalled connection gives up after this and takes the failure path: the
// sheets, then the built-in data. (No timeout where the browser has no
// AbortSignal.timeout, Safari before 16: the request waits, as it always did.)
const FETCH_TIMEOUT_MS = 10 * 1000

const GOLDEN_RESIDENCE = 'golden-residence'
const MNOGOFAMILNA = 'mnogofamilna-sgrada'

const IDLE = Object.freeze({ status: 'idle', data: null, origin: null, updatedAt: null })
const LOADING = Object.freeze({ status: 'loading', data: null, origin: null, updatedAt: null })
const ERROR = Object.freeze({ status: 'error', data: null, origin: null, updatedAt: null })

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
    [GOLDEN_RESIDENCE]: {
      'block-a': rowsOf(blockA),
      'block-b': rowsOf(blockB),
      garages: spotsOf(garages),
      parking: spotsOf(parking),
    },
    [MNOGOFAMILNA]: { 'block-a': rowsOf(mnogoA), 'block-b': rowsOf(mnogoB) },
  }
}

// `projects` with each slot replaced by fn(value, project, slot).
const eachSlot = (projects, fn) =>
  Object.fromEntries(Object.entries(projects).map(([project, slots]) => [
    project,
    Object.fromEntries(Object.entries(slots).map(([slot, value]) => [slot, fn(value, project, slot)])),
  ]))

// The store works on cells, { rows, from }: a slot's rows and where they come
// from. A slot without rows comes from nowhere (null).
const cellsOf = (projects, from) => eachSlot(projects, (rows) => ({ rows, from: rows ? from : null }))

// What the page shows now, as cells; null before the first load ends.
const shownCells = () =>
  snapshot.data && eachSlot(snapshot.data, (rows, project, slot) => ({ rows, from: snapshot.origin[project][slot] }))

function publishCells(status, cells, updatedAt) {
  publish({
    status,
    data: eachSlot(cells, ({ rows }) => rows),
    origin: eachSlot(cells, ({ from }) => from),
    updatedAt,
  })
}

async function fromApi() {
  try {
    const response = await fetch(AVAILABILITY_URL, {
      mode: 'cors',
      credentials: 'same-origin',
      signal: AbortSignal.timeout?.(FETCH_TIMEOUT_MS),
    })
    if (response.status !== 200) return null
    const { updatedAt, projects } = await response.json()
    if (!projects?.[GOLDEN_RESIDENCE] || !projects[MNOGOFAMILNA]) return null
    return { data: projects, updatedAt }
  } catch {
    return null
  }
}

// Each fetcher answers null for a sheet that is not configured or failed. A
// refresh clears their cache first: after an error they answer the expired
// rows, which would pass for new ones. Fetchers that did not load read
// nothing.
async function fromSheets({ refresh }) {
  const sheets = await loadSheets().catch(() => null)
  if (!sheets) return null
  if (refresh) sheets.clearCache()
  const settle = (read) => Promise.resolve().then(read).catch(() => null)
  const [blockA, blockB, garages, parking, mnogoA, mnogoB] = await Promise.all([
    settle(() => sheets.fetchApartmentData('blockA')),
    settle(() => sheets.fetchApartmentData('blockB')),
    settle(() => sheets.fetchGarageData('garages')),
    settle(() => sheets.fetchGarageData('parking')),
    settle(() => sheets.fetchApartmentData('mnogoA')),
    settle(() => sheets.fetchApartmentData('mnogoB')),
  ])
  if (![blockA, blockB, garages, parking, mnogoA, mnogoB].some(Boolean)) return null
  return {
    data: projectsOf({ blockA, blockB, garages, parking, mnogoA, mnogoB }),
    updatedAt: new Date().toISOString(),
  }
}

async function readLive({ refresh }) {
  return (await fromApi()) ?? (await fromSheets({ refresh }))
}

// The data built into the site, normalised like a sheet's rows (floor 0 out,
// statuses through normalizeStatus()). Each project's is a chunk of its own,
// loaded only when a slot needs it, with the sheets' (normalizeFloorData).
async function builtInGoldenResidence() {
  const [{ normalizeFloorData }, data] = await Promise.all([loadSheets(), import('../../constants/apartmentFallbackData')])
  return projectsOf({
    blockA: normalizeFloorData(data.getBlockAFallbackData()),
    blockB: normalizeFloorData(data.getBlockBFallbackData()),
    garages: data.getGaragesFallbackData(),
    parking: data.getParkingFallbackData(),
  })[GOLDEN_RESIDENCE]
}

async function builtInMnogofamilna() {
  const [{ normalizeFloorData }, data] = await Promise.all([loadSheets(), import('../../constants/mnogofamilnaFallbackData')])
  return projectsOf({
    mnogoA: normalizeFloorData(data.getMnogoAFallbackData()),
    mnogoB: normalizeFloorData(data.getMnogoBFallbackData()),
  })[MNOGOFAMILNA]
}

// Every slot from the built-in data. If Многофамилна's chunk fails to load,
// it has no rows and the rest stands; if Golden Residence's fails, this throws.
async function fromBuiltIn() {
  const [goldenResidence, mnogofamilna] = await Promise.all([
    builtInGoldenResidence(),
    builtInMnogofamilna().catch(() => ({ 'block-a': null, 'block-b': null })),
  ])
  return cellsOf({ [GOLDEN_RESIDENCE]: goldenResidence, [MNOGOFAMILNA]: mnogofamilna }, 'built-in')
}

// Each Golden Residence slot without rows takes the built-in ones. If even
// those fail to load, the slot stays empty until a later read fills it, and so
// does a slot the built-in data has none for (one a deploy has added).
async function withBuiltInGoldenResidence(cells) {
  const slots = cells[GOLDEN_RESIDENCE]
  if (Object.values(slots).every((cell) => cell.rows)) return cells
  const builtIn = await builtInGoldenResidence().catch(() => null)
  if (!builtIn) return cells
  return {
    ...cells,
    [GOLDEN_RESIDENCE]: Object.fromEntries(Object.entries(slots).map(([slot, cell]) => [
      slot,
      cell.rows || !builtIn[slot] ? cell : { rows: builtIn[slot], from: 'built-in' },
    ])),
  }
}

async function load() {
  publish(LOADING)
  try {
    const live = await readLive({ refresh: false })
    if (live) publishCells('ready', await withBuiltInGoldenResidence(cellsOf(live.data, 'live')), live.updatedAt)
    else publishCells('fallback', await fromBuiltIn(), null)
  } catch {
    // Not even the built-in data loaded.
    publish(ERROR)
  }
}

async function refresh() {
  const live = await readLive({ refresh: true })
  if (!live) return
  // A slot the new read has no rows for keeps its last live rows. Anything
  // else is as after a first load: built-in rows behind 'ready' only where
  // Golden Residence has nothing live. A slot or project the page has never
  // shown (a deploy added it) has no last rows.
  const shown = shownCells()
  const lastLive = (project, slot) => (shown?.[project]?.[slot]?.from === 'live' ? shown[project][slot] : null)
  const cells = eachSlot(cellsOf(live.data, 'live'), (cell, project, slot) => (cell.rows ? cell : lastLive(project, slot) ?? cell))
  publishCells('ready', await withBuiltInGoldenResidence(cells), live.updatedAt)
}

// load() and refresh() handle every failure they expect. Anything else is a
// bug: it is reported, and the next tab switch reads again all the same.
function start(read) {
  readAt = Date.now()
  reading = true
  read().catch((error) => {
    console.error('[availability] the read failed:', error)
  }).finally(() => {
    reading = false
  })
}

// Reads again if the tab is in view and what the page shows is more than a
// minute old.
function refreshIfStale() {
  if (document.visibilityState !== 'visible' || reading) return
  if (Date.now() - readAt <= STALE_AFTER_MS) return
  start(refresh)
}

export function subscribe(listener) {
  listeners.add(listener)
  // The first reader, on the first page that shows availability or on one the
  // visitor opens after pages without it. The store heard no tab switch while
  // it had no reader, so it checks the age of what it has now.
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', refreshIfStale)
    if (snapshot === IDLE) start(load)
    else refreshIfStale()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) document.removeEventListener('visibilitychange', refreshIfStale)
  }
}

export const getSnapshot = () => snapshot

// The prerendered value: the placeholder, never data.
export const getServerSnapshot = () => IDLE
