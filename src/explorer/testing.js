// A test helper, never imported by the site: the sheets snapshot the concept
// shows and the smoke run serves (scripts/smoke/fixtures/sheets/, extract
// §5.4), read as api/availability.js reads a tab (sheetsCore's apartmentRows
// and spotRows), so a test can hand the explorer the data the store gives.
//
// snapshotData() is the store's `data`; snapshotAvailability() the whole
// snapshot useAvailability() returns, with each Golden Residence slot's
// origin `origin` ('live' by default, or { 'block-a': 'built-in', … } for
// some slots). ExplorerTestProvider renders a project's explorer, as a
// route's page does.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { apartmentRows, spotRows } from '../services/sheetsCore'
import { ExplorerProvider } from './ExplorerContext'

const read = (name) => readFileSync(join(cwd(), 'scripts/smoke/fixtures/sheets', name), 'utf8')

export function snapshotData() {
  return {
    'golden-residence': {
      'block-a': apartmentRows(read('gr-block-a.csv')),
      'block-b': apartmentRows(read('gr-block-b.csv')),
      garages: spotRows(read('gr-garages.csv')),
      parking: spotRows(read('gr-parking.csv')),
    },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  }
}

const SLOTS = ['block-a', 'block-b', 'garages', 'parking']

export function snapshotAvailability(origin = {}) {
  const of = (slot) => (typeof origin === 'string' ? origin : origin[slot] ?? 'live')
  return {
    status: 'ready',
    data: snapshotData(),
    origin: {
      'golden-residence': Object.fromEntries(SLOTS.map((slot) => [slot, of(slot)])),
      'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
    },
    updatedAt: '2026-11-14T12:00:00.000Z',
  }
}

// The store before its data: the prerendered placeholder, or the read under
// way.
export const LOADING = Object.freeze({ status: 'loading', data: null, origin: null, updatedAt: null })

// The store before any read: on the server, and while the page hydrates.
export const IDLE = Object.freeze({ status: 'idle', data: null, origin: null, updatedAt: null })

// A name matcher for getByRole: the accessible name with its white space,
// no-break spaces included, read as single spaces. The explorer's titles keep
// the no-break space of „Блок А“ (spec §3.3), which a plain string would have
// to spell.
export const named = (expected) => (name) => name.replace(/\s+/g, ' ').trim() === expected

/**
 * A project's explorer, for a test: `children` inside the ExplorerProvider of
 * `project` (and `routeBlock`, a block route's letter), under a router at
 * `path`, as a route's page has them once it has hydrated. The store is the
 * test's own: useAvailability mocked, as the explorer's tests do.
 */
export function ExplorerTestProvider({ project, routeBlock = null, path = '/', children }) {
  const page = createElement(ExplorerProvider, { project, routeBlock }, children)
  return createElement(MemoryRouter, { initialEntries: [path] }, createElement(Routes, null, createElement(Route, { path: '*', element: page })))
}
