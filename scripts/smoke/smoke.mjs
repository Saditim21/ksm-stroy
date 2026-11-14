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
//   - a same-origin request that fails or answers 400 or more;
//   - the wrong status, redirect or final URL;
//   - two copies of the site: more than one main#main, or a tree at the top
//     of <body> (or a main#main) that React does not own. That is what a
//     page shows when the host answers with HTML the client router does not
//     match to the same route: React skips the prerendered tree and renders
//     the live one beside it, with no error in the console;
//   - the EU line's „За проекта“ link not visible in the first viewport,
//     without scrolling: a box of its own inside the viewport, opacity 1 up
//     its ancestors, visibility visible. On / the poster PDF links, scrolled
//     to, must be visible too. jsdom cannot see CSS hide anything; this can.
// And a path fails when its HTML, loaded with JavaScript off, has no H1.
//
// One more check, the scroll lock: on a phone with reduced motion (so without
// Lenis), the page scrolled to y=1500, the menu opens and Esc closes it; the
// page must stay at y=1500 throughout.
//
// And the focus ring on a dark legacy ground: on / at 1440×900, Tab from the
// top of the page reaches the hero's „Свържи се с нас“, whose ring must be
// paper, the text colour of a dark ground (.on-dusk, src/index.css); the next
// Tab reaches the white availability card's „Виж проектите в продажба“, whose
// ring stays ink. jsdom cannot compute a ring's colour; Chrome can.
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
// usage: node scripts/smoke/smoke.mjs [path …] [--scroll-lock] [--focus-ring]
//   with arguments, only the paths given (a path not listed below is
//   expected to answer 200), the scroll lock only with --scroll-lock and the
//   focus ring only with --focus-ring.

import fs from 'node:fs'
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
  { path: '/projects/golden-residence/block-a?floor=3' },
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
const ARGS = process.argv.slice(2)
const FULL_RUN = ARGS.length === 0
const ONLY = ARGS.filter((arg) => arg !== '--scroll-lock' && arg !== '--focus-ring')
const RUN = FULL_RUN ? VISITS : ONLY.map((only) => VISITS.find((v) => v.path === only) ?? { path: only })
const RUN_SCROLL_LOCK = FULL_RUN || ARGS.includes('--scroll-lock')
const RUN_FOCUS_RING = FULL_RUN || ARGS.includes('--focus-ring')

// The scroll lock check: where the page is scrolled to when the menu opens.
const SCROLL_LOCK = { path: '/about', y: 1500 }

// The focus ring check: the controls Tab reaches on the page, in order, and
// the ring each must show, solid, 2 px, in its ground's text colour.
const FOCUS_RING = {
  path: '/',
  stops: [
    { text: 'Свържи се с нас', ring: 'rgb(241, 242, 239)', ground: 'the hero, a dark ground: paper' },
    { text: 'Виж проектите в продажба', ring: 'rgb(20, 32, 47)', ground: 'the white availability card: ink' },
  ],
}
const MAX_TABS = 60

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

// In the page: the links to `pathname` (with `text`, when given), each as
// whether a visitor sees it now. With `scroll`, each is first scrolled to, one
// after the other.
async function inspectLinks({ pathname, text, scroll }) {
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
    if (!scroll && scrollY !== 0) issues.push(`the page scrolled to ${scrollY}`)
    states.push({ index: states.length, issues })
  }
  return states
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
async function visit(browser, userAgents, { path: pathname, redirect, status = 200, text }, size, shot) {
  const problems = []
  // Closing the profile aborts what is still loading; that is not the page's doing.
  let closing = false
  const report = (problem) => {
    if (!closing) problems.push(problem)
  }
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
    page.on('requestfailed', (request) => {
      if (sameOrigin(request.url())) report(`request failed: ${relative(request.url())} (${request.failure()?.errorText})`)
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

      const euLinks = await page.evaluate(inspectLinks, { pathname: '/eu-proekt', text: 'За проекта', scroll: false })
      if (euLinks.length === 0) problems.push('no „За проекта“ link to /eu-proekt')
      else if (!euLinks.some(({ issues }) => issues.length === 0)) {
        problems.push(`„За проекта“ is not visible in the first viewport: ${euLinks[0].issues.join(', ')}`)
      }

      await page.screenshot({ path: shot })

      if (pathname === '/') {
        const posterLinks = await page.evaluate(inspectLinks, { pathname: POSTER_PDF, scroll: true })
        if (posterLinks.length === 0) problems.push(`no link to ${POSTER_PDF}`)
        for (const { index, issues } of posterLinks) {
          if (issues.length > 0) problems.push(`poster PDF link ${index + 1} is not visible when scrolled to: ${issues.join(', ')}`)
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
// the problem when there are none.
async function headingWithoutJs(browser, pathname) {
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    await page.setJavaScriptEnabled(false)
    await page.setViewport(VIEWPORTS[0].viewport)
    await page.goto(`${ORIGIN}${pathname}`, { waitUntil: 'load', timeout: 30000 })
    // innerText reads a <br> as the space it shows.
    const headings = await page.evaluate(() =>
      [...document.querySelectorAll('h1')]
        .map((h1) => (h1.innerText || h1.textContent).replace(/\s+/g, ' ').trim())
        .filter(Boolean))
    if (headings.length === 0) return { cell: 'FAIL: none', problems: ['its HTML has no H1 with JavaScript off'] }
    const more = headings.length > 1 ? ` (+${headings.length - 1})` : ''
    return { cell: clip(headings[0], COLUMNS[2] - 5) + more, problems: [] }
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

// In the page: the focused element's text and ring, once the ring has settled.
// A legacy control's transition-all eases the ring in over 300 ms, from its
// text colour and the initial 3 px; until then it is neither colour.
async function focusedRing() {
  const element = document.activeElement
  await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})))
  const style = getComputedStyle(element)
  return {
    text: element.textContent.replace(/\s+/g, ' ').trim(),
    visible: element.matches(':focus-visible'),
    ring: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
  }
}

// The focus ring on a dark legacy ground (FOCUS_RING): the keyboard tabs from
// the top of the page to each stop in turn, and each must show its ring. The
// hero's first slide stays 5 s; the stops are a dozen Tabs from the top.
async function focusRing(browser, userAgents) {
  const problems = []
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    page.on('pageerror', (error) => problems.push(`page error: ${String(error?.message ?? error).slice(0, 500)}`))
    await page.setViewport(VIEWPORTS[0].viewport)
    await page.setUserAgent(userAgents.desktop)
    await page.goto(`${ORIGIN}${FOCUS_RING.path}`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForFunction(() => {
      const main = document.getElementById('main')
      return Boolean(main) && Object.keys(main).some((key) => key.startsWith('__reactFiber$'))
    }, { timeout: HYDRATION_TIMEOUT_MS })

    for (const { text, ring, ground } of FOCUS_RING.stops) {
      let reached
      for (let tabs = 0; tabs < MAX_TABS && reached !== text; tabs += 1) {
        await page.keyboard.press('Tab')
        reached = await page.evaluate(focusedText)
      }
      if (reached !== text) {
        problems.push(`${MAX_TABS} Tabs never reached „${text}“ (focus on „${reached}“)`)
        break
      }
      const focused = await page.evaluate(focusedRing)
      const expected = `solid 2px ${ring}`
      if (focused.text !== text || !focused.visible) {
        problems.push(`„${text}“ lost its focus or :focus-visible (now „${focused.text}“)`)
      } else if (focused.ring !== expected) {
        problems.push(`„${text}“ shows a ${focused.ring} ring, not ${expected} (${ground})`)
      }
    }
  } catch (error) {
    problems.push(`the check stopped: ${error.message.split('\n')[0]}`)
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
          visit(browser, userAgents, entry, size, path.join(SHOTS, `${number}-${slugOf(entry.path)}-${size.slug}.png`)))),
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
      const label = `focus ring: ${FOCUS_RING.path} at ${VIEWPORTS[0].label}, Tab to ${FOCUS_RING.stops.map(({ text }) => `„${text}“`).join(', then ')}`
      const problems = await focusRing(browser, userAgents)
      for (const problem of problems) failures.push(`${label}: ${problem}`)
      console.log(`  ${label}: ${problems.length === 0 ? 'ok' : `FAIL (${problems.length})`}`)
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
  const checks = [RUN_SCROLL_LOCK && 'the scroll lock', RUN_FOCUS_RING && 'the focus ring'].filter(Boolean)
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
