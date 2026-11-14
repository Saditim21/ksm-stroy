/**
 * Availability: every published sheet, read server-side and answered as one
 * same-origin JSON (spec §6.4). The site's store (src/data/availability)
 * preloads it on the data routes. When it fails, the browser reads the sheets
 * itself, as it did before.
 *
 * GET answers 200 with
 *   { updatedAt, sources: { BLOCK_A: 'ok' | 'error' | 'missing', … },
 *     projects: { 'golden-residence': { 'block-a', 'block-b', garages, parking },
 *                 'mnogofamilna-sgrada': { 'block-a', 'block-b' } } }
 * The rows and statuses come from src/services/sheetsCore.js, the same reader
 * the browser uses. A tab that is not 'ok' gives null, never an empty list: an
 * empty list would read as every unit gone. The edge keeps a 200 for 30 s and
 * serves it stale for 5 more minutes while it refreshes. When no tab could be
 * read, 503, never cached.
 *
 * Settings: the Vercel environment variables the client build reads too,
 * VITE_GOOGLE_SHEET_BLOCK_A, _BLOCK_B, _GARAGES, _PARKING, _MNOGO_A and
 * _MNOGO_B. A blank one is skipped ('missing'): the Многофамилна tabs are
 * optional.
 *
 * Web Handler signature (export default { fetch }), as api/odoo-lead.js.
 */

import { apartmentRows, spotRows } from '../src/services/sheetsCore.js'

const TAB_TIMEOUT_MS = 8000
const CACHE_OK = 'public, s-maxage=30, stale-while-revalidate=300'

// Each tab: its key in `sources` (and its variable's suffix), where its rows
// go, and how a tab of its kind reads.
const TABS = [
  { key: 'BLOCK_A', project: 'golden-residence', slot: 'block-a', read: apartmentRows },
  { key: 'BLOCK_B', project: 'golden-residence', slot: 'block-b', read: apartmentRows },
  { key: 'GARAGES', project: 'golden-residence', slot: 'garages', read: spotRows },
  { key: 'PARKING', project: 'golden-residence', slot: 'parking', read: spotRows },
  { key: 'MNOGO_A', project: 'mnogofamilna-sgrada', slot: 'block-a', read: apartmentRows },
  { key: 'MNOGO_B', project: 'mnogofamilna-sgrada', slot: 'block-b', read: apartmentRows },
]

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })

// A published tab's rows, read past Google's cache (the _cb buster the
// browser's fetchers use too) and given up after 8 s, the body included.
async function fetchTab(url, read) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TAB_TIMEOUT_MS)
  try {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}_cb=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return read(await response.text())
  } finally {
    clearTimeout(timeout)
  }
}

// One tab as a source: its rows, or why it has none.
async function loadTab({ key, read }) {
  const url = process.env[`VITE_GOOGLE_SHEET_${key}`]?.trim()
  if (!url) return { source: 'missing', rows: null }
  try {
    return { source: 'ok', rows: await fetchTab(url, read) }
  } catch (error) {
    const reason = error?.name === 'AbortError' ? `timeout after ${TAB_TIMEOUT_MS} ms` : error?.message
    console.error(`[availability] ${key} could not be read:`, reason)
    return { source: 'error', rows: null }
  }
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
    }

    const results = await Promise.all(TABS.map(loadTab))

    const sources = {}
    const projects = { 'golden-residence': {}, 'mnogofamilna-sgrada': {} }
    TABS.forEach(({ key, project, slot }, index) => {
      sources[key] = results[index].source
      projects[project][slot] = results[index].rows
    })
    const body = { updatedAt: new Date().toISOString(), sources, projects }

    // Nothing read, so nothing worth keeping at the edge; the site reads the
    // sheets itself.
    if (!results.some((result) => result.source === 'ok')) {
      return json(body, 503, { 'Cache-Control': 'no-store' })
    }
    return json(body, 200, { 'Cache-Control': CACHE_OK })
  },
}
