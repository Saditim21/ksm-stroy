#!/usr/bin/env node
// The smoke run (spec §12, real browser): the production build in system
// Chrome, served as Vercel serves it (static-server.mjs, port 4190). Run
// `npm run build` first; `npm run verify` runs both.
//
// Every prerendered path (react-router.config.js) and a few deep links,
// redirects and an unknown URL, each at 1440×900 (DPR 1) and at 390×844 (DPR
// 2, touch, a phone's user agent), each in a fresh browser profile. A visit
// fails on:
//   - a console error or warning, a page error, or a React hydration message
//     in any console line (HYDRATION);
//   - a same-origin request that fails or answers 400 or more. Of the
//     requests Chrome drops (net::ERR_ABORTED), only the two duplicates it
//     makes for nobody pass, and only when another request of the visit
//     loaded their URL: its own background revalidation (initiator
//     "other"), and a preload of the document the page fetched for itself
//     (excusedAbort()). Any other, the availability store's own fetch above
//     all, fails;
//   - the stale-data notice (src/explorer/StaleNotice.jsx) on the page: the
//     availability store ended on the data built into the site, though the
//     local API answers (checked once, before the visits: the static server
//     runs api/availability.js over saved sheets);
//   - the wrong status, redirect or final URL;
//   - two copies of the site: more than one main#main, or a tree at the top
//     of <body> (or a main#main) that React does not own. That is what a
//     page shows when the host answers with HTML the client router does not
//     match to the same route: React skips the prerendered tree and renders
//     the live one beside it, with no error in the console;
//   - the EU line's „За проекта“ link not visible in the first viewport,
//     without scrolling: a box of its own inside the viewport, opacity 1 up
//     its ancestors, visibility visible, and nothing over it (the element at
//     its centre is the link's own). On / the poster PDF links, scrolled to,
//     must be visible too. jsdom cannot see CSS hide anything; this can.
//     A deep link that opens a dialog (its visit's `dialog`: a floor's plan
//     stage or a unit's panel, spec §7.10) first jumps to the explorer, and
//     the dialog lies over the page. Its visit must show that dialog, open
//     and named, and the EU line all the same (spec §1.9, §14.1: in view on
//     landing), which the landing keeps above its dialogs
//     (src/explorer/ExplorerContext.jsx). There the page has scrolled, by
//     the jump, and must have.
// And a path fails when its HTML, loaded with JavaScript off, has anything
// but exactly one H1 (spec §11).
//
// One more check, the scroll lock: on a phone with reduced motion (so without
// Lenis), the page scrolled to y=1500, the menu opens and Esc closes it; the
// page must stay at y=1500 throughout.
//
// Then the focus ring (spec §11), in its ground's text colour: at 1440×900,
// Tab from the top of each page in FOCUS_RING reaches each of its stops in
// turn, and each shows a solid 2 px ring of its colour. On /, the EU row's
// „За проекта“, the header's „Запитване“ and the Golden Residence half, whose
// ring rides on an inset overlay (its ::after), all ivory on the dark site;
// on /contact, the legacy form's „Изпрати съобщение“, onyx on production's
// light ground (.on-light, src/index.css). jsdom cannot compute a ring's
// colour; Chrome can.
//
// And the phone opening (spec §6.7): on / at real phone screens under the EU
// row (PHONE_HERO), once its entrance has settled, the H1 sits on two lines,
// broken after „пространства“ (spec §3.2: two lines down to 320 px), and it
// never overlaps the Golden Residence info. Then the same page with a
// reader's text spacing (WCAG 1.4.12, spec §11: it holds at 320–360 px,
// TEXT_SPACING): the H1, however many lines it takes, still clear of the
// Golden Residence info; each half's info whole on its side of the seam; the
// page no wider than the screen (anything wider, anywhere on the page, would
// widen the layout viewport, and the fixed header with it, past the screen's
// edge); the header's „За проекта“ and „Меню“ within the screen; the EU
// row's logos in their own proportions; and the live count's digits whole in
// their one-digit window. jsdom lays out no text; Chrome does.
//
// And the explorer (spec §7.2–7.6, §7.10), each step failing with its name:
//   - desktop mouse, /projects/golden-residence at 1440×900: #explorer
//     scrolled into view, a real mouse over the centre of floor А-5's
//     polygon shows aside.fxp--a, titled „Блок А · Етаж 5“, within 600 ms;
//     a click opens the dialog of that name, and Escape closes it;
//   - keyboard, the same page at 1440×900: Tab from the top reaches a rail,
//     whose floor's panel shows, and the rail carries its solid 2 px ring;
//   - phone, the same page at 390×844 with touch: a tap on floor А-3 shows
//     the sheet, titled „Блок А · Етаж 3“, and only that; a second tap
//     opens the dialog of that name;
//   - deep link, /projects/golden-residence/block-a?floor=3 at 1440×900:
//     the dialog „Блок А · Етаж 3“ once the page has hydrated.
// No step may log a console error or warning, or a page error.
//
// Visits wait for hydration and then until 4.5 s after the load event, so
// Chrome's warning about a preload that went unused is heard: it came about
// 3.5 s after the load event in Chrome 157 (for an as="fetch" preload, such
// as the availability API's on the data routes).
//
// Screenshots of each first viewport go to $SMOKE_SHOTS (default:
// <os tmpdir>/ksmstroy-smoke). Chrome is $CHROME_PATH, else its usual place
// on Windows and macOS, else `google-chrome` on the PATH.
//
// usage: node scripts/smoke/smoke.mjs [path …] [--scroll-lock] [--focus-ring] [--phone-hero] [--explorer]
//   with arguments, only the paths given (a path not listed below is
//   expected to answer 200), the scroll lock only with --scroll-lock, the
//   focus ring only with --focus-ring, the phone opening only with
//   --phone-hero and the explorer only with --explorer.

import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import config from '../../react-router.config.js'
import { BUILD_DIR, DEFAULT_PORT, createStaticServer } from './static-server.mjs'

// The functions handed to page.evaluate() run in the page, with its globals.
/* global document, getComputedStyle, innerHeight, innerWidth, scrollY, window */

const ORIGIN = `http://127.0.0.1:${DEFAULT_PORT}`
const SHOTS = path.resolve(process.env.SMOKE_SHOTS || path.join(os.tmpdir(), 'ksmstroy-smoke'))
const NOT_FOUND_TEXT = 'Тази страница я няма в чертежа.'
const POSTER_PDF = '/eu/plakat-ksm-stroy-a3.pdf'
// React's hydration errors: the words in a development build, the codes of
// the minified ones in production (418 mismatch, 423 recovered by a client
// render, 425 text mismatch).
const HYDRATION = /hydrat|#418|#423|#425/i
const UNUSED_PRELOAD_WINDOW_MS = 4500
const HYDRATION_TIMEOUT_MS = 20000

const VIEWPORTS = [
  { label: '1440×900', slug: 'desktop', viewport: { width: 1440, height: 900, deviceScaleFactor: 1 } },
  {
    label: '390×844',
    slug: 'mobile',
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  },
]

// What a visit expects: by default a 200 at the path it asked for.
const VISITS = [
  ...config.prerender.map((pathname) => ({ path: pathname })),
  { path: '/projects/golden-residence/block-a?floor=3', dialog: 'Блок А · Етаж 3' },
  { path: '/projects/golden-residence/block-b?floor=2&unit=%D0%91%20201', dialog: 'Б 201' },
  { path: '/contact?apartment=%D0%90%20301' },
  { path: '/about/', redirect: { status: 308, to: '/about' } },
  { path: '/projects/1', redirect: { to: '/projects' } },
  { path: '/nope', status: 404, text: NOT_FOUND_TEXT },
  // URLs a client route could match although the host answers them with the
  // 404 page or with another page's HTML: a block that does not exist, a
  // file's own name, a name in the wrong case (the host's lookup is
  // case-sensitive).
  { path: '/projects/golden-residence/block-c', status: 404, text: NOT_FOUND_TEXT },
  { path: '/projects/mnogofamilna-sgrada/x', status: 404, text: NOT_FOUND_TEXT },
  { path: '/index.html', redirect: { status: 308, to: '/' } },
  { path: '/About', status: 404, text: NOT_FOUND_TEXT },
]
const CHECKS = ['--scroll-lock', '--focus-ring', '--phone-hero', '--explorer']
const ARGS = process.argv.slice(2)
const FULL_RUN = ARGS.length === 0
const ONLY = ARGS.filter((arg) => !CHECKS.includes(arg))
const RUN = FULL_RUN ? VISITS : ONLY.map((only) => VISITS.find((v) => v.path === only) ?? { path: only })
const RUN_SCROLL_LOCK = FULL_RUN || ARGS.includes('--scroll-lock')
const RUN_FOCUS_RING = FULL_RUN || ARGS.includes('--focus-ring')
const RUN_PHONE_HERO = FULL_RUN || ARGS.includes('--phone-hero')
const RUN_EXPLORER = FULL_RUN || ARGS.includes('--explorer')

// The scroll lock check: where the page is scrolled to when the menu opens.
const SCROLL_LOCK = { path: '/about', y: 1500 }

// The focus ring check: on each page, the controls Tab reaches, in order, and
// the ring each must show, solid, 2 px, in its ground's text colour. A stop
// is the focused element whose text is `text`, or, with `prefix`, starts with
// it (the Golden Residence half's text carries a live count). With `pseudo`,
// the ring is read from that pseudo-element: the hero halves draw theirs on an
// inset overlay (spec §11).
const FOCUS_RING = [
  {
    path: '/',
    stops: [
      { text: 'За проекта', ring: 'rgb(239, 233, 221)', ground: 'the EU row over the opening: ivory' },
      { text: 'Запитване', ring: 'rgb(239, 233, 221)', ground: 'the see-through header: ivory' },
      { text: 'Golden Residence', prefix: true, pseudo: '::after', ring: 'rgb(239, 233, 221)', ground: 'the Golden Residence half, on its overlay: ivory' },
    ],
  },
  {
    path: '/contact',
    stops: [
      { text: 'Изпрати съобщение', ring: 'rgb(14, 13, 11)', ground: 'the legacy form on production’s light ground: onyx' },
    ],
  },
]
const MAX_TABS = 60

// The phone opening check (spec §6.7): real phone screens under the EU row,
// where the H1 must take two lines, broken after „пространства“ (spec §3.2),
// and stay clear of the Golden Residence info.
const PHONE_HERO = {
  path: '/',
  sizes: [
    { width: 390, height: 664 },
    { width: 375, height: 667 },
    { width: 360, height: 640 },
    { width: 320, height: 560 },
  ],
}
// WCAG 1.4.12's text spacing as a reader's stylesheet sets it: line height
// 1.5, letter spacing 0.12 em, word spacing 0.16 em, paragraphs 2 em apart.
const TEXT_SPACING = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }'
// How far a logo may stand from its own proportions (rounding), and how far
// a part may reach over the seam's half pixel.
const LOGO_TOLERANCE = 0.02
const SEAM_TOLERANCE_PX = 1

// The explorer's steps (spec §7): the Golden Residence page's, and a deep
// link to a floor of block А. A floor's title, in its panel, its sheet and
// its plan stage's name, is „Блок А · Етаж 5“ (titleOf).
const titleOf = (key) => {
  const [block, floor] = key.split('-')
  return `Блок ${block} · Етаж ${floor}`
}
const EXPLORER = {
  path: '/projects/golden-residence',
  // The floor the mouse points at, and the one a finger taps.
  mouseFloor: 'А-5',
  tapFloor: 'А-3',
  deepLink: { path: '/projects/golden-residence/block-a?floor=3', floor: 'А-3' },
  // How soon the edge panel must show once the mouse is over its floor.
  panelWithinMs: 600,
  // The rails' focus ring (spec §11): its style and width.
  ring: 'solid 2px',
}

// The availability API, which the static server runs over the saved sheets:
// Golden Residence's four sources must read, so every store ends on live rows.
const AVAILABILITY = '/api/availability'
const GOLDEN_RESIDENCE_SOURCES = ['BLOCK_A', 'BLOCK_B', 'GARAGES', 'PARKING']

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  if (process.platform === 'win32') return 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return 'google-chrome'
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const sameOrigin = (url) => {
  try {
    return new URL(url).origin === ORIGIN
  } catch {
    return false
  }
}
const relative = (url) => {
  const { pathname, search } = new URL(url)
  return `${pathname}${search}`
}
const slugOf = (pathname) =>
  decodeURIComponent(pathname).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'home'

// A request Chrome dropped (net::ERR_ABORTED) that is no failure: a
// duplicate it made for nobody and drops at its next garbage collection, of
// a URL another request of the visit loaded (Task 6's analysis). Either its
// own background revalidation of a response stale on arrival, initiator
// "other" (the availability API's Cache-Control is the CDN's,
// s-maxage=30, stale-while-revalidate=300, pinned by api/availability.js and
// its contract), or a preload of the document (`preloads`, the hrefs of its
// <link rel="preload">) that the page's own fetch did not take. Anything else
// is a failure: above all the store's own fetch (initiator "script"), whose
// 10 s timeout would drop the page to the built-in data.
function excusedAbort(request, { loaded, preloads }) {
  const url = request.url()
  if (!loaded.has(url)) return false
  const initiator = request.initiator()?.type
  return initiator === 'other' || ((initiator === 'parser' || initiator === 'preload') && preloads.includes(url))
}

// Whether the local availability API answers with Golden Residence's live
// rows: null if it does, else what it answered. Not fetch(), which refuses
// port 4190 (a bad port in the Fetch standard).
function availabilityProblem() {
  return new Promise((resolve) => {
    const request = http.get(`${ORIGIN}${AVAILABILITY}`, { timeout: 15000 }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        body += chunk
      })
      response.on('end', () => {
        if (response.statusCode !== 200) {
          resolve(`it answered ${response.statusCode}`)
          return
        }
        try {
          const { sources = {} } = JSON.parse(body)
          const missing = GOLDEN_RESIDENCE_SOURCES.filter((source) => sources[source] !== 'ok')
          resolve(missing.length === 0 ? null : missing.map((source) => `${source} ${sources[source] ?? 'absent'}`).join(', '))
        } catch (error) {
          resolve(`its answer is not JSON: ${error.message}`)
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error('no answer in 15 s')))
    request.on('error', (error) => resolve(error.message))
  })
}

// In the page: the links to `pathname` (with `text`, when given), each as
// whether a visitor sees it now: nothing over it either, so a dialog over the
// page hides it. With `scroll`, each is first scrolled to, one after the
// other; without it, the page must not have scrolled, unless it `jumped`, as
// a deep link jumps to the explorer (spec §7.10).
async function inspectLinks({ pathname, text, scroll, jumped = false }) {
  const describe = (node) => (node
    ? `<${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}${[...node.classList].map((name) => `.${name}`).join('')}>`
    : 'nothing')
  const pathOf = (a) => {
    try {
      return new URL(a.href).pathname
    } catch {
      return null
    }
  }
  const links = [...document.querySelectorAll('a[href]')].filter(
    (a) => pathOf(a) === pathname && (text === undefined || a.textContent.trim() === text),
  )
  const states = []
  for (const link of links) {
    if (scroll) {
      link.scrollIntoView({ block: 'center' })
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
    const box = link.getBoundingClientRect()
    let opacity = 1
    for (let node = link; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
    const { visibility } = getComputedStyle(link)
    const inViewport = box.top >= 0 && box.left >= 0 && box.bottom <= innerHeight && box.right <= innerWidth
    const issues = []
    if (box.width === 0 || box.height === 0) issues.push(`box ${box.width}×${box.height}`)
    if (opacity !== 1) issues.push(`opacity ${opacity}`)
    if (visibility !== 'visible') issues.push(`visibility ${visibility}`)
    if (!inViewport) issues.push(`outside the viewport (${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}×${Math.round(box.height)})`)
    else if (box.width > 0 && box.height > 0) {
      const over = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      if (!over || !link.contains(over)) issues.push(`covered by ${describe(over)}`)
    }
    if (!scroll && !jumped && scrollY !== 0) issues.push(`the page scrolled to ${scrollY}`)
    states.push({ index: states.length, issues })
  }
  return states
}

// In the page: the names of the dialogs open on top (none hidden under
// another), by the text their aria-labelledby names, else their aria-label.
function openDialogs() {
  return [...document.querySelectorAll('[role="dialog"]')]
    .filter((dialog) => dialog.getAttribute('aria-hidden') !== 'true')
    .map((dialog) => (document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent ?? dialog.getAttribute('aria-label') ?? '').replace(/\s+/g, ' ').trim())
}

// In the page: the problems with its trees. One main#main, owned by React (a
// fiber on the node), and no element at the top of <body> that React does not
// own, as the prerendered tree is when React has skipped it.
function appTrees() {
  const owned = (node) => Object.keys(node).some((key) => key.startsWith('__reactFiber$'))
  const name = (node) => `<${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}>`
  const mains = [...document.querySelectorAll('main#main')]
  const problems = []
  if (mains.length > 1) problems.push(`the DOM holds ${mains.length} main#main: two copies of the site`)
  for (const [index, main] of mains.entries()) {
    if (!owned(main)) problems.push(`main#main ${index + 1} of ${mains.length} has no React fiber`)
  }
  const skip = ['SCRIPT', 'LINK', 'STYLE', 'TEMPLATE', 'NOSCRIPT']
  for (const node of document.body.children) {
    if (!skip.includes(node.tagName) && !owned(node)) {
      problems.push(`a tree without a React fiber at the top of <body>: ${name(node)}, ${node.querySelectorAll('main#main').length} main#main inside`)
    }
  }
  return problems
}

// One visit at one size: every problem found, and the first viewport's shot.
async function visit(browser, userAgents, { path: pathname, redirect, status = 200, text, dialog }, size, shot, { liveData }) {
  const problems = []
  // Closing the profile aborts what is still loading; that is not the page's doing.
  let closing = false
  const report = (problem) => {
    if (!closing) problems.push(problem)
  }
  // A request Chrome drops (net::ERR_ABORTED) is judged at the end, against
  // what the visit loaded (excusedAbort()). On any build a forced garbage
  // collection after the load drops the duplicates it excuses (Task 6, base
  // d3c4d6b included), and a page whose motion runs during the visit, as
  // Home's facade intro on the way to the poster, collects garbage within it.
  const loaded = new Set()
  const aborted = []
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    await page.setViewport(size.viewport)
    await page.setUserAgent(size.viewport.isMobile ? userAgents.mobile : userAgents.desktop)
    const documentUrl = `${ORIGIN}${pathname}`
    // An unknown URL's own 404 is the answer the visit expects.
    const expected404 = (url) => status === 404 && url === documentUrl
    page.on('console', (message) => {
      const type = message.type()
      const line = message.text()
      if (expected404(message.location()?.url) && /^Failed to load resource/.test(line)) return
      if (['error', 'warn', 'warning', 'assert'].includes(type) || HYDRATION.test(line)) {
        report(`console.${type}: ${line.slice(0, 500)}`)
      }
    })
    page.on('pageerror', (error) => report(`page error: ${String(error?.message ?? error).slice(0, 500)}`))
    page.on('requestfinished', (request) => {
      const answer = request.response()
      if (sameOrigin(request.url()) && answer && answer.status() < 400) loaded.add(request.url())
    })
    page.on('requestfailed', (request) => {
      if (!sameOrigin(request.url())) return
      if (request.failure()?.errorText === 'net::ERR_ABORTED') aborted.push(request)
      else report(`request failed: ${relative(request.url())} (${request.failure()?.errorText})`)
    })
    page.on('response', (response) => {
      const url = response.url()
      if (sameOrigin(url) && response.status() >= 400 && !expected404(url)) {
        report(`request answered ${response.status()}: ${relative(url)}`)
      }
    })

    let response
    try {
      response = await page.goto(documentUrl, { waitUntil: 'load', timeout: 30000 })
    } catch (error) {
      problems.push(`navigation: ${error.message}`)
      return { problems, statuses: '—' }
    }
    const loadedAt = Date.now()
    const hops = [...response.request().redirectChain().map((request) => request.response()), response]
    const statuses = hops.map((hop) => hop?.status() ?? '?').join(' → ')

    if (redirect) {
      const [first] = hops
      // Vercel may send an absolute Location.
      const location = first?.headers().location && relative(new URL(first.headers().location, documentUrl).href)
      if (hops.length < 2 || (redirect.status && first.status() !== redirect.status)) {
        problems.push(`expected a ${redirect.status ?? '3xx'} redirect to ${redirect.to}, got ${statuses}`)
      } else if (location !== redirect.to) {
        problems.push(`expected a redirect to ${redirect.to}, got one to ${location}`)
      } else if (response.status() !== 200) {
        problems.push(`the redirect's target answered ${response.status()}`)
      }
    } else if (hops.length > 1 || response.status() !== status) {
      problems.push(`expected ${status}, got ${statuses}`)
    }

    try {
      try {
        await page.waitForFunction(() => {
          const main = document.getElementById('main')
          return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
        }, { timeout: HYDRATION_TIMEOUT_MS })
      } catch {
        problems.push(`not hydrated ${HYDRATION_TIMEOUT_MS / 1000} s after load (no React fiber on #main)`)
      }
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {})
      await delay(Math.max(0, loadedAt + UNUSED_PRELOAD_WINDOW_MS - Date.now()))

      problems.push(...await page.evaluate(appTrees))
      const finalPath = relative(page.url())
      const expectedPath = redirect?.to ?? pathname
      if (finalPath !== expectedPath) problems.push(`ended at ${finalPath}, expected ${expectedPath}`)
      if (text) {
        const shown = await page.evaluate(() => document.getElementById('main')?.textContent.replace(/\s+/g, ' ') ?? '')
        if (!shown.includes(text)) problems.push(`the page does not say „${text}“`)
      }

      const euLinks = await page.evaluate(inspectLinks, { pathname: '/eu-proekt', text: 'За проекта', scroll: false, jumped: Boolean(dialog) })
      if (euLinks.length === 0) problems.push('no „За проекта“ link to /eu-proekt')
      else if (!euLinks.some(({ issues }) => issues.length === 0)) {
        problems.push(`„За проекта“ is not visible in the first viewport: ${euLinks[0].issues.join(', ')}`)
      }
      if (dialog) {
        const shown = await page.evaluate(openDialogs)
        if (!shown.includes(dialog)) problems.push(`the deep link shows no dialog „${dialog}“ (open: ${shown.map((name) => `„${name}“`).join(', ') || 'none'})`)
        if (await page.evaluate(() => scrollY) === 0) problems.push('the deep link did not jump to the explorer')
      }

      await page.screenshot({ path: shot })

      if (pathname === '/') {
        const posterLinks = await page.evaluate(inspectLinks, { pathname: POSTER_PDF, scroll: true })
        if (posterLinks.length === 0) problems.push(`no link to ${POSTER_PDF}`)
        for (const { index, issues } of posterLinks) {
          if (issues.length > 0) problems.push(`poster PDF link ${index + 1} is not visible when scrolled to: ${issues.join(', ')}`)
        }
      }

      // The store's data, once the visit has waited for it (src/data/availability).
      if (liveData) {
        const notice = await page.evaluate(() => document.querySelector('.stale')?.textContent.replace(/\s+/g, ' ').trim() ?? null)
        if (notice) problems.push(`the availability ended on the data built into the site, though the local API answers: the page shows „${notice.slice(0, 48)}…“`)
      }

      const preloads = await page.evaluate(() => [...document.querySelectorAll('link[rel="preload"]')].map((link) => link.href))
      for (const request of aborted) {
        if (!excusedAbort(request, { loaded, preloads })) {
          report(`request failed: ${relative(request.url())} (${request.failure()?.errorText}, initiator ${request.initiator()?.type ?? 'unknown'})`)
        }
      }
    } catch (error) {
      // A navigation nobody expected, for one, takes the page's context away.
      problems.push(`the checks stopped: ${error.message.split('\n')[0]}`)
    }
    return { problems, statuses }
  } finally {
    closing = true
    await context.close()
  }
}

// The H1s of a path's HTML, loaded with JavaScript off: the table's cell, and
// the problem unless there is exactly one.
async function headingWithoutJs(browser, pathname) {
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    await page.setJavaScriptEnabled(false)
    await page.setViewport(VIEWPORTS[0].viewport)
    await page.goto(`${ORIGIN}${pathname}`, { waitUntil: 'load', timeout: 30000 })
    // innerText reads a <br> as the space it shows.
    const headings = await page.evaluate(() =>
      [...document.querySelectorAll('h1')].map((h1) => (h1.innerText || h1.textContent).replace(/\s+/g, ' ').trim()))
    if (headings.length === 0) return { cell: 'FAIL: none', problems: ['its HTML has no H1 with JavaScript off'] }
    if (headings.length > 1) {
      return {
        cell: `FAIL: ${headings.length}`,
        problems: [`its HTML has ${headings.length} H1s with JavaScript off, not one: ${headings.map((text) => `„${text}“`).join(', ')}`],
      }
    }
    if (!headings[0]) return { cell: 'FAIL: empty', problems: ['its H1 is empty with JavaScript off'] }
    return { cell: clip(headings[0], COLUMNS[2]), problems: [] }
  } catch (error) {
    return { cell: 'FAIL', problems: [`with JavaScript off: ${error.message}`] }
  } finally {
    await context.close()
  }
}

// The scroll lock (useScrollLock) on a phone with reduced motion, where Lenis
// does not run: the page scrolled to SCROLL_LOCK.y, the menu opened from its
// button and closed with Esc. The page must not move. The button is clicked
// in the page (the header has slid away by then), as a tap on it would.
async function scrollLock(browser, userAgents) {
  const { y } = SCROLL_LOCK
  const problems = []
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    page.on('pageerror', (error) => problems.push(`page error: ${String(error?.message ?? error).slice(0, 500)}`))
    await page.setViewport(VIEWPORTS[1].viewport)
    await page.setUserAgent(userAgents.mobile)
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.goto(`${ORIGIN}${SCROLL_LOCK.path}`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForFunction(() => {
      const main = document.getElementById('main')
      return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
    }, { timeout: HYDRATION_TIMEOUT_MS })
    // Scrolled there once the page has loaded what it shows near that point,
    // so nothing loading above moves it afterwards.
    const scrollTo = (to) => page.evaluate((top) => window.scrollTo(0, top), to)
    await scrollTo(y)
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {})
    await scrollTo(y)
    await delay(300)
    const at = () => page.evaluate(() => Math.round(scrollY))
    const before = await at()
    if (before !== y) return [`the page scrolled to ${before}, not ${y}: is it shorter than that?`]

    await page.evaluate(() => document.querySelector('button[aria-label="Меню"]').click())
    await page.waitForSelector('[role="dialog"][aria-label="Меню"]', { timeout: 5000 })
    await delay(300)
    const open = await at()
    if (open !== y) problems.push(`scrollY ${open} while the menu is open, not ${y}`)

    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 5000 })
    await delay(300)
    const closed = await at()
    if (closed !== y) problems.push(`scrollY ${closed} after Esc closed the menu, not ${y}`)
  } catch (error) {
    problems.push(`the check stopped: ${error.message.split('\n')[0]}`)
  } finally {
    await context.close()
  }
  return problems
}

// In the page: the focused element's text.
function focusedText() {
  return document.activeElement.textContent.replace(/\s+/g, ' ').trim()
}

// In the page: the focused element's text and ring, read from `pseudo` when
// given (the element's own box otherwise), once the ring has settled. A legacy
// control's transition-all eases the ring in over 300 ms, from its text colour
// and the initial 3 px; until then it is neither colour.
async function focusedRing(pseudo) {
  const element = document.activeElement
  await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})))
  const style = getComputedStyle(element, pseudo ?? null)
  return {
    text: element.textContent.replace(/\s+/g, ' ').trim(),
    visible: element.matches(':focus-visible'),
    ring: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
  }
}

// Whether the focused element's text is the stop's: the whole text, or its
// start for a `prefix` stop.
const isStop = ({ text, prefix }, reached) => (prefix ? reached?.startsWith(text) : reached === text)

// The focus ring on one page of FOCUS_RING: the keyboard tabs from the top of
// the page to each stop in turn, and each must show its ring. The stops are a
// few dozen Tabs from the top at most.
async function focusRingOn(browser, userAgents, { path: pathname, stops }) {
  const problems = []
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    page.on('pageerror', (error) => problems.push(`page error: ${String(error?.message ?? error).slice(0, 500)}`))
    await page.setViewport(VIEWPORTS[0].viewport)
    await page.setUserAgent(userAgents.desktop)
    await page.goto(`${ORIGIN}${pathname}`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForFunction(() => {
      const main = document.getElementById('main')
      return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
    }, { timeout: HYDRATION_TIMEOUT_MS })

    for (const stop of stops) {
      const { text, pseudo, ring, ground } = stop
      let reached
      for (let tabs = 0; tabs < MAX_TABS && !isStop(stop, reached); tabs += 1) {
        await page.keyboard.press('Tab')
        reached = await page.evaluate(focusedText)
      }
      if (!isStop(stop, reached)) {
        problems.push(`${MAX_TABS} Tabs never reached „${text}“ (focus on „${reached}“)`)
        break
      }
      const focused = await page.evaluate(focusedRing, pseudo)
      const expected = `solid 2px ${ring}`
      const where = pseudo ? `its ${pseudo}` : 'it'
      if (!isStop(stop, focused.text) || !focused.visible) {
        problems.push(`„${text}“ lost its focus or :focus-visible (now „${focused.text}“)`)
      } else if (focused.ring !== expected) {
        problems.push(`„${text}“ shows a ${focused.ring} ring on ${where}, not ${expected} (${ground})`)
      }
    }
  } catch (error) {
    problems.push(`the check stopped: ${error.message.split('\n')[0]}`)
  } finally {
    await context.close()
  }
  return problems
}

// In the page: the boxes of the H1 and of the Golden Residence info, and the
// line each part of the slogan sits on (0 for the first), once the fonts have
// loaded and the opening's entrance has settled. Parts whose tops lie within
// half the H1's font size of each other share a line.
async function openingBoxes() {
  await document.fonts.ready
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})))
  const box = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return null
    const { top, right, bottom, left } = element.getBoundingClientRect()
    return { top, right, bottom, left }
  }
  const title = document.querySelector('h1')
  const near = title ? parseFloat(getComputedStyle(title).fontSize) / 2 : 0
  const tops = []
  const lines = [...(title?.querySelectorAll('[data-part]') ?? [])].map((part) => {
    const { top } = part.getBoundingClientRect()
    const line = tops.findIndex((other) => Math.abs(other - top) < near)
    return line >= 0 ? line : tops.push(top) - 1
  })
  return { title: box('h1'), info: box('.half--gr .half__info'), lines }
}

// In the page, under TEXT_SPACING: the boxes of the H1, the two infos, the
// seam, the opening and the header's „За проекта“ and „Меню“; the screen's
// width and the layout viewport's, which grows past the screen when anything
// on the page is wider; and how far each of the EU row's logos stands from
// its own proportions.
function spacedOpening() {
  const box = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return null
    const { top, right, bottom, left } = element.getBoundingClientRect()
    return { top, right, bottom, left }
  }
  const logos = [...document.querySelectorAll('.hdr .eu__plate img')]
    .filter((img) => img.complete && img.naturalWidth > 0)
    .map((img) => {
      const { width, height } = img.getBoundingClientRect()
      return { name: img.alt, off: Math.abs(width / height / (img.naturalWidth / img.naturalHeight) - 1) }
    })
  // A live count's digits (RollingNumber): each column's strip of ten
  // digits, and the one-digit window it shows them through.
  const digits = [...document.querySelectorAll('.hero .roll-strip')].map((strip) => ({
    line: strip.getBoundingClientRect().height / 10,
    window: strip.closest('[aria-hidden="true"]')?.getBoundingClientRect().height ?? 0,
  }))
  return {
    title: box('h1'),
    gr: box('.half--gr .half__info'),
    seam: box('.hero__seam'),
    mn: box('.half--mn .half__info'),
    hero: box('.hero'),
    more: box('.hdr__eu a.hit'),
    menu: box('.hdr__menu'),
    screen: document.documentElement.clientWidth,
    layout: innerWidth,
    logos,
    digits,
  }
}

// What a phone opening measured under TEXT_SPACING (spacedOpening) gets
// wrong: a part over the next, an info across the seam or past the opening's
// foot, a page wider than the screen, a header control past the screen's
// edge, a squeezed logo, a live count's digits taller than their window.
function spacingProblems(size, { title, gr, seam, mn, hero, more, menu, screen, layout, logos, digits }) {
  const at = `${size} with text spacing`
  const missing = Object.entries({ H1: title, 'Golden Residence info': gr, seam, 'Многофамилна info': mn, opening: hero, '„За проекта“': more, '„Меню“': menu })
    .filter(([, found]) => !found)
    .map(([name]) => name)
  if (missing.length > 0) return [`${at}: no ${missing.join(', ')} in the page`]
  const span = ({ top, bottom }) => `${Math.round(top)}–${Math.round(bottom)}`
  const line = (seam.top + seam.bottom) / 2
  const problems = []
  if (title.bottom > gr.top && gr.bottom > title.top) {
    problems.push(`${at}: the H1 (${span(title)}) overlaps the Golden Residence info (${span(gr)})`)
  }
  if (gr.bottom > line + SEAM_TOLERANCE_PX) {
    problems.push(`${at}: the Golden Residence info (${span(gr)}) runs below the seam at ${Math.round(line)}, into the other half`)
  }
  if (mn.top < line - SEAM_TOLERANCE_PX) {
    problems.push(`${at}: the Многофамилна info (${span(mn)}) starts above the seam at ${Math.round(line)}, where its half is not`)
  }
  if (mn.bottom > hero.bottom + SEAM_TOLERANCE_PX) {
    problems.push(`${at}: the Многофамилна info (${span(mn)}) runs past the opening's foot at ${Math.round(hero.bottom)}`)
  }
  if (layout > screen) {
    problems.push(`${at}: the page is ${layout} px wide on a ${screen} px screen; something on it is wider than the screen, and the fixed header widens with it`)
  }
  for (const [name, control] of [['„За проекта“', more], ['„Меню“', menu]]) {
    if (control.right > screen + 0.5) problems.push(`${at}: the header's ${name} ends at ${Math.round(control.right)}, past the screen's ${screen} px`)
  }
  for (const { name, off } of logos) {
    if (off > LOGO_TOLERANCE) problems.push(`${at}: the EU row's logo „${name}“ is squeezed ${Math.round(off * 100)} % out of its proportions`)
  }
  const cut = digits.find(({ line, window }) => Math.abs(line - window) > 0.5)
  if (cut) {
    problems.push(`${at}: the Golden Residence count's digits take ${cut.line.toFixed(1)} px each in a ${cut.window.toFixed(1)} px window, which cuts them`)
  }
  return problems
}

// The phone opening (PHONE_HERO): at each real phone screen, in a fresh
// profile, the slogan's four parts must sit two to a line, „Създаваме
// пространства“ over „за мечтания живот“, and the H1's box and the Golden
// Residence info's box must not overlap. Then, with TEXT_SPACING on, the
// opening and the header must hold (spacingProblems).
async function phoneHero(browser, userAgents) {
  const problems = []
  for (const { width, height } of PHONE_HERO.sizes) {
    const context = await browser.createBrowserContext()
    try {
      const page = await context.newPage()
      await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
      await page.setUserAgent(userAgents.mobile)
      await page.goto(`${ORIGIN}${PHONE_HERO.path}`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForFunction(() => {
        const main = document.getElementById('main')
        return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
      }, { timeout: HYDRATION_TIMEOUT_MS })
      const { title, info, lines } = await page.evaluate(openingBoxes)
      const size = `${width}×${height}`
      if (!title || !info) {
        problems.push(`${size}: no ${title ? 'Golden Residence info' : 'H1'} in the opening`)
      } else {
        if (lines.join(' ') !== '0 0 1 1') {
          problems.push(`${size}: the H1 takes ${new Set(lines).size} lines, not two broken after „пространства“ (its parts sit on lines ${lines.map((line) => line + 1).join(', ')})`)
        }
        if (title.bottom > info.top && info.bottom > title.top && title.right > info.left && info.right > title.left) {
          problems.push(`${size}: the H1 (${Math.round(title.top)}–${Math.round(title.bottom)}) overlaps the Golden Residence info (${Math.round(info.top)}–${Math.round(info.bottom)})`)
        }
      }
      await page.addStyleTag({ content: TEXT_SPACING })
      problems.push(...spacingProblems(size, await page.evaluate(spacedOpening)))
    } catch (error) {
      problems.push(`${width}×${height}: the check stopped: ${error.message.split('\n')[0]}`)
    } finally {
      await context.close()
    }
  }
  return problems
}

// The explorer (spec §7.2–7.6, §7.10): its four steps, each in a fresh
// profile, each failing with its name.

// Whether the page shows the surface `selector` (an edge panel, the sheet)
// open with the title `title` (its `titleSelector`): a box of its own on the
// screen, visible, and that title.
function surfaceShows(selector, titleSelector, title) {
  const surface = document.querySelector(selector)
  if (!surface) return { shows: false, state: 'not in the page' }
  const style = getComputedStyle(surface)
  const box = surface.getBoundingClientRect()
  const said = surface.querySelector(titleSelector)?.textContent.replace(/\s+/g, ' ').trim() ?? ''
  const onScreen = box.width > 0 && box.height > 0 && box.right > 0 && box.bottom > 0 && box.left < innerWidth && box.top < innerHeight
  const state = `${surface.hasAttribute('data-open') ? 'open' : 'closed'}, visibility ${style.visibility}, ${onScreen ? 'on screen' : `off screen (${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}×${Math.round(box.height)})`}, titled „${said}“`
  const shows = surface.hasAttribute('data-open') && style.visibility === 'visible' && style.display !== 'none' && onScreen && said === title
  return { shows, state }
}

// In the page: the centre of a floor's polygon on the facade, and what the
// pointer would land on there.
function floorCentre(key) {
  const floor = document.querySelector(`.fx__floor[data-k="${key}"]`)
  if (!floor) return null
  const { left, top, width, height } = floor.getBoundingClientRect()
  const x = left + width / 2
  const y = top + height / 2
  const there = document.elementFromPoint(x, y)
  const onScreen = x > 0 && y > 0 && x < innerWidth && y < innerHeight
  return { x, y, onScreen, hits: there === floor, there: there ? `<${there.tagName.toLowerCase()}${[...there.classList].map((name) => `.${name}`).join('')}>` : 'nothing' }
}

// Waits until the page's scroll has held still for 300 ms (Lenis glides).
async function settled(page) {
  let last = await page.evaluate(() => scrollY)
  for (let at = 0; at < 4000; at += 150) {
    await delay(150)
    const now = await page.evaluate(() => scrollY)
    if (now === last && at >= 300) return
    last = now
  }
}

// Polls the page until `fn` (in the page) answers { shows: true }, for at
// most `ms`: its last answer.
async function within(page, ms, fn, ...args) {
  const until = Date.now() + ms
  let answer = await page.evaluate(fn, ...args)
  while (!answer.shows && Date.now() < until) {
    await delay(25)
    answer = await page.evaluate(fn, ...args)
  }
  return answer
}

// Whether the dialog `name` is open on top, within `ms`.
async function dialogOpens(page, name, ms) {
  try {
    await page.waitForFunction((wanted) => {
      const names = [...document.querySelectorAll('[role="dialog"]')]
        .filter((dialog) => dialog.getAttribute('aria-hidden') !== 'true')
        .map((dialog) => (document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent ?? dialog.getAttribute('aria-label') ?? '').replace(/\s+/g, ' ').trim())
      return names.includes(wanted)
    }, { timeout: ms }, name)
    return true
  } catch {
    return false
  }
}

// A page in a fresh profile at `size`, its console errors and warnings, page
// errors and hydration messages reported as the step's problems, at the
// Golden Residence page (or `path`), hydrated.
async function explorerPage(context, userAgents, size, problems, path = EXPLORER.path) {
  const page = await context.newPage()
  page.on('console', (message) => {
    const type = message.type()
    const line = message.text()
    if (['error', 'warn', 'warning', 'assert'].includes(type) || HYDRATION.test(line)) problems.push(`console.${type}: ${line.slice(0, 300)}`)
  })
  page.on('pageerror', (error) => problems.push(`page error: ${String(error?.message ?? error).slice(0, 300)}`))
  await page.setViewport(size.viewport)
  await page.setUserAgent(size.viewport.isMobile ? userAgents.mobile : userAgents.desktop)
  await page.goto(`${ORIGIN}${path}`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForFunction(() => {
    const main = document.getElementById('main')
    return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
  }, { timeout: HYDRATION_TIMEOUT_MS })
  return page
}

// The edge panel of a floor's block.
const panelOf = (key) => `aside.fxp--${key.startsWith('А') ? 'a' : 'b'}`
const openNames = async (page) => (await page.evaluate(openDialogs)).map((name) => `„${name}“`).join(', ') || 'none'

// Desktop mouse: #explorer in view, a real mouse over the centre of floor
// А-5's polygon shows block А's edge panel within 600 ms; a click opens the
// floor's plan stage, and Escape closes it.
async function explorerMouse(page, problems) {
  const key = EXPLORER.mouseFloor
  const panelSelector = panelOf(key)
  await page.evaluate(() => document.getElementById('explorer').scrollIntoView({ block: 'start' }))
  await settled(page)
  // The facade loads its panels as it nears the screen.
  await page.waitForSelector(panelSelector, { timeout: 10000 })
  let floor = await page.evaluate(floorCentre, key)
  if (floor && !floor.onScreen) {
    await page.evaluate((y) => window.scrollBy(0, y - innerHeight / 2), floor.y)
    await settled(page)
    floor = await page.evaluate(floorCentre, key)
  }
  if (!floor?.onScreen || !floor.hits) {
    problems.push(`floor ${key}'s polygon cannot be pointed at: ${floor ? `its centre lands on ${floor.there}` : 'no polygon'}`)
    return
  }
  await page.mouse.move(floor.x - 40, floor.y, { steps: 2 })
  await page.mouse.move(floor.x, floor.y, { steps: 4 })
  const panel = await within(page, EXPLORER.panelWithinMs, surfaceShows, panelSelector, '.fxp__title', titleOf(key))
  if (!panel.shows) problems.push(`${panelSelector} does not show „${titleOf(key)}“ within ${EXPLORER.panelWithinMs} ms of the hover (${panel.state})`)

  await page.mouse.click(floor.x, floor.y)
  if (!(await dialogOpens(page, titleOf(key), 5000))) {
    problems.push(`a click on floor ${key} opens no dialog „${titleOf(key)}“ (open: ${await openNames(page)})`)
    return
  }
  await delay(300)
  await page.keyboard.press('Escape')
  try {
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 3000 })
  } catch {
    problems.push(`Escape leaves a dialog open: ${await openNames(page)}`)
  }
}

// Keyboard: Tab from the top reaches a rail; its floor's edge panel shows, and
// the rail carries the solid 2 px ring (spec §11; ruling T6a: the panel lies
// over its own rail while it is open, and the dashed lens shows the focus).
async function explorerKeyboard(page, problems) {
  let rail = null
  for (let tabs = 0; tabs < MAX_TABS && !rail; tabs += 1) {
    await page.keyboard.press('Tab')
    rail = await page.evaluate(() => (document.activeElement?.matches('.fx__cnt') ? document.activeElement.dataset.k : null))
  }
  if (!rail) {
    problems.push(`${MAX_TABS} Tabs never reached a rail (focus on „${await page.evaluate(focusedText)}“)`)
    return
  }
  const panel = await within(page, EXPLORER.panelWithinMs, surfaceShows, panelOf(rail), '.fxp__title', titleOf(rail))
  if (!panel.shows) problems.push(`the first rail, ${rail}, has the focus, but ${panelOf(rail)} does not show „${titleOf(rail)}“ (${panel.state})`)
  const focused = await page.evaluate(focusedRing)
  if (!focused.visible) problems.push(`the rail ${rail} has the focus without :focus-visible`)
  if (!focused.ring.startsWith(`${EXPLORER.ring} `)) problems.push(`the rail ${rail} shows a ${focused.ring} ring, not ${EXPLORER.ring}`)
}

// Phone: a tap on floor А-3 shows the sheet, titled „Блок А · Етаж 3“, and
// opens nothing; a second tap on it opens its plan stage.
async function explorerPhone(page, problems) {
  const key = EXPLORER.tapFloor
  await page.evaluate((k) => document.querySelector(`.fx__floor[data-k="${k}"]`).scrollIntoView({ block: 'center' }), key)
  await settled(page)
  await page.waitForNetworkIdle({ idleTime: 300, timeout: 5000 }).catch(() => {})
  let floor = await page.evaluate(floorCentre, key)
  if (!floor?.onScreen || !floor.hits) {
    problems.push(`floor ${key}'s polygon cannot be tapped: ${floor ? `its centre lands on ${floor.there}` : 'no polygon'}`)
    return
  }
  await page.touchscreen.tap(floor.x, floor.y)
  const sheet = await within(page, 1500, surfaceShows, '.sheet', '.sheet__title', titleOf(key))
  if (!sheet.shows) problems.push(`the first tap on floor ${key} shows no sheet with „${titleOf(key)}“ (${sheet.state})`)
  if ((await page.evaluate(openDialogs)).length > 0) {
    problems.push(`the first tap on floor ${key} opened ${await openNames(page)} instead of previewing it`)
    return
  }

  // The page makes room for the sheet under the facade.
  await settled(page)
  floor = await page.evaluate(floorCentre, key)
  if (!floor?.onScreen || !floor.hits) {
    problems.push(`with the sheet up, floor ${key}'s polygon cannot be tapped again: ${floor ? `its centre lands on ${floor.there}` : 'no polygon'}`)
    return
  }
  await page.touchscreen.tap(floor.x, floor.y)
  if (!(await dialogOpens(page, titleOf(key), 5000))) {
    problems.push(`a second tap on floor ${key} opens no dialog „${titleOf(key)}“ (open: ${await openNames(page)})`)
  }
}

// Deep link: the floor's plan stage, once the page has hydrated.
async function explorerDeepLink(page, problems) {
  const dialog = titleOf(EXPLORER.deepLink.floor)
  if (!(await dialogOpens(page, dialog, 10000))) {
    problems.push(`no dialog „${dialog}“ after hydration (open: ${await openNames(page)})`)
  }
  // Time for a late error to show.
  await delay(1000)
}

const EXPLORER_STEPS = [
  { name: 'desktop mouse', size: VIEWPORTS[0], path: EXPLORER.path, run: explorerMouse },
  { name: 'keyboard', size: VIEWPORTS[0], path: EXPLORER.path, run: explorerKeyboard },
  { name: 'phone', size: VIEWPORTS[1], path: EXPLORER.path, run: explorerPhone },
  { name: 'deep link', size: VIEWPORTS[0], path: EXPLORER.deepLink.path, run: explorerDeepLink },
]

// One step of the explorer's, in a fresh profile: its problems.
async function explorerStep(browser, userAgents, { size, path: pathname, run }) {
  const problems = []
  const context = await browser.createBrowserContext()
  try {
    const page = await explorerPage(context, userAgents, size, problems, pathname)
    await run(page, problems)
  } catch (error) {
    problems.push(`the step stopped: ${error.message.split('\n')[0]}`)
  } finally {
    await context.close()
  }
  return problems
}

const COLUMNS = [44, 11, 42, 10, 10]
const row = (cells) => `  ${cells.map((cell, i) => String(cell).padEnd(COLUMNS[i])).join(' ').trimEnd()}`
const clip = (value, width) => (value.length > width ? `${value.slice(0, width - 1)}…` : value)

async function main() {
  const malformed = ONLY.filter((only) => !only.startsWith('/'))
  if (malformed.length > 0) {
    console.error(`smoke: paths must start with /, got ${malformed.join(', ')} (Git Bash rewrites /paths unless MSYS_NO_PATHCONV=1)`)
    return 1
  }
  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.error('smoke: build/client/ not found. Run `npm run build` first.')
    return 1
  }
  fs.mkdirSync(SHOTS, { recursive: true })

  const server = createStaticServer()
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(DEFAULT_PORT, '127.0.0.1', resolve)
    })
  } catch (error) {
    console.error(`smoke: cannot serve on port ${DEFAULT_PORT}: ${error.code === 'EADDRINUSE' ? 'it is in use (a static server left running?)' : error.message}`)
    return 1
  }

  let browser
  const started = Date.now()
  const failures = []
  // Every visit's availability must end on live rows, which the local API
  // serves; without them the visits cannot be held to that.
  const apiProblem = await availabilityProblem()
  if (apiProblem) failures.push(`${AVAILABILITY} on the local server does not answer with Golden Residence's live rows: ${apiProblem}`)
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath(),
      headless: true,
      args: ['--no-first-run', '--no-default-browser-check'],
    })
    const version = (await browser.version()).split('/')[1]
    const userAgents = {
      desktop: (await browser.userAgent()).replace('HeadlessChrome', 'Chrome'),
      mobile: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version.split('.')[0]}.0.0.0 Mobile Safari/537.36`,
    }
    console.log(`smoke: build/client on ${ORIGIN}, Chrome ${version}, ${RUN.length} URLs at ${VIEWPORTS.map(({ label }) => label).join(' and ')}`)
    console.log(`smoke: screenshots in ${SHOTS}`)
    console.log(row(['path', 'status', 'H1 with JS off', ...VIEWPORTS.map(({ label }) => label)]))

    // A path's visits at both sizes and its load without JS run side by side:
    // each spends most of its time waiting.
    for (const entry of RUN) {
      // Numbered as in VISITS, so a run of a few paths names them as a full run does.
      const number = String(VISITS.indexOf(entry) + 1).padStart(2, '0')
      const [results, heading] = await Promise.all([
        Promise.all(VIEWPORTS.map((size) =>
          visit(browser, userAgents, entry, size, path.join(SHOTS, `${number}-${slugOf(entry.path)}-${size.slug}.png`), { liveData: !apiProblem }))),
        headingWithoutJs(browser, entry.path),
      ])
      results.forEach(({ problems }, i) => {
        for (const problem of problems) failures.push(`${entry.path} at ${VIEWPORTS[i].label}: ${problem}`)
      })
      for (const problem of heading.problems) failures.push(`${entry.path}: ${problem}`)
      const cells = results.map(({ problems }) => (problems.length === 0 ? 'ok' : `FAIL (${problems.length})`))
      console.log(row([clip(entry.path, COLUMNS[0]), results[0].statuses, heading.cell, ...cells]))
    }

    if (RUN_SCROLL_LOCK) {
      const label = `scroll lock: ${SCROLL_LOCK.path} at ${VIEWPORTS[1].label}, reduced motion, menu at y=${SCROLL_LOCK.y}`
      const problems = await scrollLock(browser, userAgents)
      for (const problem of problems) failures.push(`${label}: ${problem}`)
      console.log(`  ${label}: ${problems.length === 0 ? 'ok' : `FAIL (${problems.length})`}`)
    }

    if (RUN_FOCUS_RING) {
      for (const page of FOCUS_RING) {
        const label = `focus ring: ${page.path} at ${VIEWPORTS[0].label}, Tab to ${page.stops.map(({ text }) => `„${text}“`).join(', then ')}`
        const problems = await focusRingOn(browser, userAgents, page)
        for (const problem of problems) failures.push(`${label}: ${problem}`)
        console.log(`  ${label}: ${problems.length === 0 ? 'ok' : `FAIL (${problems.length})`}`)
      }
    }

    if (RUN_PHONE_HERO) {
      const label = `phone opening: ${PHONE_HERO.path} at ${PHONE_HERO.sizes.map(({ width, height }) => `${width}×${height}`).join(', ')}, the H1 on two lines, clear of the Golden Residence info; with text spacing, every part clear and whole, the page and the header within the screen`
      const problems = await phoneHero(browser, userAgents)
      for (const problem of problems) failures.push(`${label}: ${problem}`)
      console.log(`  ${label}: ${problems.length === 0 ? 'ok' : `FAIL (${problems.length})`}`)
    }

    if (RUN_EXPLORER) {
      for (const step of EXPLORER_STEPS) {
        const label = `explorer, ${step.name}: ${step.path} at ${step.size.label}`
        const problems = await explorerStep(browser, userAgents, step)
        for (const problem of problems) failures.push(`${label}: ${problem}`)
        console.log(`  ${label}: ${problems.length === 0 ? 'ok' : `FAIL (${problems.length})`}`)
      }
    }
  } finally {
    await browser?.close()
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }

  const seconds = Math.round((Date.now() - started) / 1000)
  if (failures.length > 0) {
    console.error(`smoke: FAILED, ${failures.length} problems (${seconds} s):`)
    for (const failure of failures) console.error(`  ${failure}`)
    return 1
  }
  const checks = [RUN_SCROLL_LOCK && 'the scroll lock', RUN_FOCUS_RING && 'the focus ring', RUN_PHONE_HERO && 'the phone opening', RUN_EXPLORER && 'the explorer'].filter(Boolean)
  console.log(`smoke: PASS, ${RUN.length} URLs at ${VIEWPORTS.length} sizes${checks.map((check) => ` and ${check}`).join('')} (${seconds} s)`)
  return 0
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error('smoke: crashed:', error)
    process.exit(1)
  },
)
