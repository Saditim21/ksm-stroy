#!/usr/bin/env node
// Lighthouse on a phone (its default: mobile, simulated throttling), three
// runs per URL, and the median of each figure (spec §10, §12): LCP, CLS, TBT,
// the bytes requested before the LCP and the score of each category it runs,
// the performance category's alone unless --categories names others.
//
// It measures the site as Vercel serves it (spec §10). A page given as a path
// (/, /projects/golden-residence) is the build's, build/client/, which the
// script serves itself through scripts/smoke/static-server.mjs on a free port
// and stops afterwards: over HTTP/2 with TLS, as Vercel's edge serves the
// site, or over HTTP/1.1 with --h1. Over HTTP/2 the server's certificate is
// self-signed, and Chrome is told to accept it. A page given as a full URL is
// measured where it is.
//
// "Bytes before LCP" adds up the transfer size of every request the page made
// before the LCP was painted in the run's own (unthrottled) trace: what the
// page needs before its largest paint.
//
// Lighthouse is pinned at 13.6.0, so the figures stay comparable from run to
// run (spec §10). It comes through npx, and finds Chrome itself ($CHROME_PATH
// overrides). Each run's JSON report goes to $PERF_REPORTS (default:
// <os tmpdir>/ksmstroy-lighthouse).
//
// The scores come from the same runs as the figures (spec §12). Every build
// but a production-stage one (VITE_SITE_STAGE=production) carries noindex,
// which costs the SEO score its points.
//
// usage: node scripts/perf/lighthouse.mjs [--h1] [--categories=<list>] <path or url> […]
//   --h1: serve the build over HTTP/1.1 (default: HTTP/2 over TLS).
//   --categories: Lighthouse categories, comma-separated, of performance,
//   accessibility, best-practices and seo (default: performance).
//   From Git Bash, run it with MSYS_NO_PATHCONV=1, or Git Bash turns each
//   path into a Windows one („/“ into „C:/Program Files/Git/“).

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { BUILD_DIR, createStaticServer } from '../smoke/static-server.mjs'

const RUNS = 3
const KIB = 1024
const LIGHTHOUSE = 'lighthouse@13.6.0'
// Lighthouse 13's categories.
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const DEFAULT_CATEGORIES = ['performance']
const USAGE = 'usage: node scripts/perf/lighthouse.mjs [--h1] [--categories=<list>] <path or url> […]'
const REPORTS = path.resolve(process.env.PERF_REPORTS || path.join(os.tmpdir(), 'ksmstroy-lighthouse'))

// A page on the build, which the script serves (/eu-proekt), or a full URL.
const isPath = (page) => page.startsWith('/')
const isUrl = (page) => /^https?:\/\//i.test(page)

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

// The pages (paths on the build, or full URLs), the categories
// --categories=<list> names (default: performance), and whether --h1 asks
// for the HTTP/1.1 server, from the command line's arguments.
export function parseArgs(args) {
  const pages = []
  let categories = DEFAULT_CATEGORIES
  let h1 = false
  for (const arg of args) {
    if (arg === '--h1') {
      h1 = true
    } else if (arg.startsWith('--categories=')) {
      categories = arg.slice('--categories='.length).split(',').map((id) => id.trim()).filter(Boolean)
      if (categories.length === 0) throw new Error(`--categories names no category (${CATEGORIES.join(', ')})`)
      const unknown = categories.filter((id) => !CATEGORIES.includes(id))
      if (unknown.length > 0) throw new Error(`--categories: Lighthouse 13 has no ${unknown.join(', ')} category (${CATEGORIES.join(', ')})`)
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown flag ${arg}; ${USAGE}`)
    } else if (isPath(arg) || isUrl(arg)) {
      pages.push(arg)
    } else {
      const fromGitBash = /^[a-z]:[\\/]/i.test(arg) ? ' (Git Bash turned a path into a Windows one: run with MSYS_NO_PATHCONV=1)' : ''
      throw new Error(`${arg} is neither a path (/…) nor an http(s) URL${fromGitBash}; ${USAGE}`)
    }
  }
  return { pages, categories, h1 }
}

/** The URL Lighthouse opens for a page: a path on the build's server at
 * `origin`, a full URL as it is. */
export const urlOf = (page, origin) => (isPath(page) ? `${origin}${page}` : page)

// The figures of one Lighthouse report (its JSON, parsed), with the score of
// each category in `categories`, out of 100. A category the report lacks, or
// could not score (null), fails rather than be written down as a number. The
// figures come from the performance category's audits: a run without it (the
// SEO score of a production-stage build) has the scores alone.
export function metricsOf(report, categories = DEFAULT_CATEGORIES) {
  if (report.runtimeError) throw new Error(`Lighthouse: ${report.runtimeError.code}: ${report.runtimeError.message}`)
  if (report.configSettings?.formFactor !== 'mobile') {
    throw new Error(`Lighthouse ran as ${report.configSettings?.formFactor}, not mobile`)
  }
  const scores = Object.fromEntries(categories.map((id) => {
    const score = report.categories?.[id]?.score
    if (typeof score !== 'number') throw new Error(`Lighthouse: the report has no ${id} score`)
    return [id, Math.round(score * 100)]
  }))
  if (!categories.includes('performance')) return { scores }

  const { audits } = report
  const trace = audits.metrics?.details?.items?.[0]
  const network = audits['network-requests']?.details
  if (!trace?.observedLargestContentfulPaintTs || !network?.debugData?.networkStartTimeTs) {
    throw new Error('Lighthouse: the report has no observed LCP or no network timeline')
  }
  // Microseconds on the trace's clock, to milliseconds from the first request.
  const lcpAt = (trace.observedLargestContentfulPaintTs - network.debugData.networkStartTimeTs) / 1000
  return {
    lcp: audits['largest-contentful-paint'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    tbt: audits['total-blocking-time'].numericValue,
    bytesBeforeLcp: network.items
      .filter((request) => request.rendererStartTime < lcpAt)
      .reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    scores,
  }
}

const FIGURES = ['lcp', 'cls', 'tbt', 'bytesBeforeLcp']

// The median of each figure of the runs, where they measured figures, and
// of each category's score.
export function medians(runs) {
  const middle = (pick) => median(runs.map(pick))
  const figures = FIGURES.filter((figure) => runs[0][figure] !== undefined)
  return {
    ...Object.fromEntries(figures.map((figure) => [figure, middle((run) => run[figure])])),
    scores: Object.fromEntries(Object.keys(runs[0].scores).map((id) => [id, middle((run) => run.scores[id])])),
  }
}

export const summary = ({ lcp, cls, tbt, bytesBeforeLcp, scores }) => [
  ...(lcp === undefined ? [] : [
    `LCP ${(lcp / 1000).toFixed(2)} s`,
    `CLS ${cls.toFixed(3)}`,
    `TBT ${Math.round(tbt)} ms`,
    `before LCP ${(bytesBeforeLcp / KIB).toFixed(1)} KiB`,
  ]),
  ...Object.entries(scores).map(([id, score]) => `${id} ${score}`),
].join(', ')

// npx is a .cmd on Windows, which Node runs only through a shell; each
// argument is quoted for that shell.
const quote = (arg) => (process.platform === 'win32' ? `"${arg.replace(/"/g, '""')}"` : `'${arg.replace(/'/g, "'\\''")}'`)

/** Whether a run on `page` measures the build's own server over HTTP/2, whose
 * certificate is self-signed: a page given by its path, unless the run is
 * over HTTP/1.1 (`h1`). A page given by its full URL keeps Chrome's
 * certificate checks. */
export const selfSigned = (page, { h1 }) => isPath(page) && !h1

/** npx's arguments for one Lighthouse run on `url`, its JSON report to
 * `output`: Lighthouse 13.6.0, with Chrome told to accept the certificate
 * only of the build's own HTTP/2 server (`selfSigned`). */
export function lighthouseArgs(url, output, categories, { selfSigned: trusted }) {
  const chrome = ['--headless=new', '--no-first-run', '--no-default-browser-check', ...(trusted ? ['--ignore-certificate-errors'] : [])]
  return [
    '--yes', LIGHTHOUSE, url,
    '--output=json', `--output-path=${output}`,
    `--only-categories=${categories.join(',')}`,
    `--chrome-flags=${chrome.join(' ')}`,
    '--quiet',
  ]
}

function lighthouse(url, output, categories, options) {
  const args = lighthouseArgs(url, output, categories, options)
  return new Promise((resolve, reject) => {
    let stderr = ''
    const child = spawn(`npx ${args.map(quote).join(' ')}`, { shell: true, stdio: ['ignore', 'ignore', 'pipe'] })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      // On Windows, Lighthouse can exit 1 after writing its report, when it
      // cannot delete Chrome's profile; a complete report still counts.
      if (fs.existsSync(output)) resolve()
      else reject(new Error(`Lighthouse exited ${code} without a report:\n${stderr.trim().slice(-2000)}`))
    })
  })
}

// Whether anything answers at `url`, whatever its certificate. Not fetch():
// it refuses port 4190, the smoke server's, which the Fetch standard lists as
// a bad port (Chrome loads it).
function answers(url) {
  return new Promise((resolve) => {
    const options = { method: 'HEAD', timeout: 5000, rejectUnauthorized: false }
    const request = (url.startsWith('https:') ? https : http).request(url, options, (response) => {
      response.resume()
      resolve(true)
    })
    request.on('timeout', () => request.destroy())
    request.on('error', () => resolve(false))
    request.end()
  })
}

// The build, served as Vercel serves it, on a free port: its server and its
// origin.
async function serveBuild({ h1 }) {
  const server = createStaticServer({ h2: !h1 })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return { server, origin: `${h1 ? 'http' : 'https'}://127.0.0.1:${server.address().port}` }
}

async function main(args) {
  let pages
  let categories
  let h1
  try {
    ({ pages, categories, h1 } = parseArgs(args))
  } catch (error) {
    console.error(`perf: ${error.message}`)
    return 1
  }
  if (pages.length === 0) {
    console.error(USAGE)
    return 1
  }
  for (const url of pages.filter(isUrl)) {
    if (!(await answers(url))) {
      console.error(`perf: ${url} does not answer. Serve it first, or give the page's path (/…) to measure the build.`)
      return 1
    }
  }
  if (pages.some(isPath) && !fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.error(`perf: there is no build in ${BUILD_DIR} to serve. Run npm run build first.`)
    return 1
  }

  const served = pages.some(isPath) ? await serveBuild({ h1 }) : null
  try {
    fs.mkdirSync(REPORTS, { recursive: true })
    const over = served ? `; the build on ${served.origin}, over ${h1 ? 'HTTP/1.1' : 'HTTP/2'}` : ''
    console.log(`perf: ${LIGHTHOUSE}, mobile, ${RUNS} runs per URL, categories ${categories.join(', ')}${over}; reports in ${REPORTS}`)

    const rows = []
    let version
    for (const page of pages) {
      const url = urlOf(page, served?.origin)
      const slug = new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
      const runs = []
      for (let run = 1; run <= RUNS; run += 1) {
        const output = path.join(REPORTS, `${slug}-${run}.json`)
        fs.rmSync(output, { force: true })
        await lighthouse(url, output, categories, { selfSigned: selfSigned(page, { h1 }) })
        const report = JSON.parse(fs.readFileSync(output, 'utf8'))
        version = report.lighthouseVersion
        const metrics = metricsOf(report, categories)
        console.log(`  ${page} run ${run}: ${summary(metrics)}`)
        runs.push(metrics)
      }
      rows.push({ page, middle: medians(runs) })
    }

    console.log(`perf: median of ${RUNS} runs (Lighthouse ${version}):`)
    for (const { page, middle } of rows) console.log(`  ${page}: ${summary(middle)}`)
    return 0
  } finally {
    if (served) {
      served.server.closeAllConnections()
      await new Promise((resolve) => served.server.close(resolve))
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`perf: ${error.message}`)
      process.exit(1)
    },
  )
}
