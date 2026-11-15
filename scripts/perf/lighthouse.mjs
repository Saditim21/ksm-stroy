#!/usr/bin/env node
// Lighthouse on a phone (its default: mobile, simulated throttling), three
// runs per URL, and the median of each figure (spec §10, §12): LCP, CLS, TBT,
// the bytes requested before the LCP and the score of each category it runs,
// the performance category's alone unless --categories names others. It
// measures what answers at the URLs: serve the build first, as Vercel would,
// with `node scripts/smoke/static-server.mjs` (port 4190).
//
// "Bytes before LCP" adds up the transfer size of every request the page made
// before the LCP was painted in the run's own (unthrottled) trace: what the
// page needs before its largest paint.
//
// Lighthouse 13 comes through npx, and finds Chrome itself ($CHROME_PATH
// overrides). Each run's JSON report goes to $PERF_REPORTS (default:
// <os tmpdir>/ksmstroy-lighthouse).
//
// The scores come from the same runs as the figures (spec §12). Every build
// but a production-stage one (VITE_SITE_STAGE=production) carries noindex,
// which costs the SEO score its points.
//
// usage: node scripts/perf/lighthouse.mjs [--categories=<list>] <url> [url …]
//   --categories: Lighthouse categories, comma-separated, of performance,
//   accessibility, best-practices and seo (default: performance).

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const RUNS = 3
const KIB = 1024
// Lighthouse 13's categories.
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const DEFAULT_CATEGORIES = ['performance']
const USAGE = 'usage: node scripts/perf/lighthouse.mjs [--categories=<list>] <url> [url …]'
const REPORTS = path.resolve(process.env.PERF_REPORTS || path.join(os.tmpdir(), 'ksmstroy-lighthouse'))

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

// The URLs, and the categories --categories=<list> names (default:
// performance), from the command line's arguments.
export function parseArgs(args) {
  const urls = []
  let categories = DEFAULT_CATEGORIES
  for (const arg of args) {
    if (arg.startsWith('--categories=')) {
      categories = arg.slice('--categories='.length).split(',').map((id) => id.trim()).filter(Boolean)
      if (categories.length === 0) throw new Error(`--categories names no category (${CATEGORIES.join(', ')})`)
      const unknown = categories.filter((id) => !CATEGORIES.includes(id))
      if (unknown.length > 0) throw new Error(`--categories: Lighthouse 13 has no ${unknown.join(', ')} category (${CATEGORIES.join(', ')})`)
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown flag ${arg}; ${USAGE}`)
    } else {
      urls.push(arg)
    }
  }
  return { urls, categories }
}

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

function lighthouse(url, output, categories) {
  const args = [
    '--yes', 'lighthouse@13', url,
    '--output=json', `--output-path=${output}`,
    `--only-categories=${categories.join(',')}`,
    '--chrome-flags=--headless=new --no-first-run --no-default-browser-check',
    '--quiet',
  ]
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

// Whether anything answers at `url`. Not fetch(): it refuses port 4190, the
// smoke server's, which the Fetch standard lists as a bad port (Chrome loads it).
function answers(url) {
  return new Promise((resolve) => {
    const request = (url.startsWith('https:') ? https : http).request(url, { method: 'HEAD', timeout: 5000 }, (response) => {
      response.resume()
      resolve(true)
    })
    request.on('timeout', () => request.destroy())
    request.on('error', () => resolve(false))
    request.end()
  })
}

async function main(args) {
  let urls
  let categories
  try {
    ({ urls, categories } = parseArgs(args))
  } catch (error) {
    console.error(`perf: ${error.message}`)
    return 1
  }
  if (urls.length === 0) {
    console.error(USAGE)
    return 1
  }
  for (const url of urls) {
    if (!(await answers(url))) {
      console.error(`perf: ${url} does not answer. Serve the build first: node scripts/smoke/static-server.mjs`)
      return 1
    }
  }
  fs.mkdirSync(REPORTS, { recursive: true })
  console.log(`perf: Lighthouse 13, mobile, ${RUNS} runs per URL, categories ${categories.join(', ')}; reports in ${REPORTS}`)

  const rows = []
  let version
  for (const url of urls) {
    const slug = new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
    const runs = []
    for (let run = 1; run <= RUNS; run += 1) {
      const output = path.join(REPORTS, `${slug}-${run}.json`)
      fs.rmSync(output, { force: true })
      await lighthouse(url, output, categories)
      const report = JSON.parse(fs.readFileSync(output, 'utf8'))
      version = report.lighthouseVersion
      const metrics = metricsOf(report, categories)
      console.log(`  ${url} run ${run}: ${summary(metrics)}`)
      runs.push(metrics)
    }
    rows.push({ url, middle: medians(runs) })
  }

  console.log(`perf: median of ${RUNS} runs (Lighthouse ${version}):`)
  for (const { url, middle } of rows) console.log(`  ${url}: ${summary(middle)}`)
  return 0
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
