#!/usr/bin/env node
// Lighthouse on a phone (its default: mobile, simulated throttling), three
// runs per URL, and the median of each figure (spec §10, §12): LCP, CLS, TBT,
// the bytes requested before the LCP and the performance score. It measures
// what answers at the URLs: serve the build first, as Vercel would, with
// `node scripts/smoke/static-server.mjs` (port 4190).
//
// "Bytes before LCP" adds up the transfer size of every request the page made
// before the LCP was painted in the run's own (unthrottled) trace: what the
// page needs before its largest paint.
//
// Lighthouse 13 comes through npx, and finds Chrome itself ($CHROME_PATH
// overrides). Each run's JSON report goes to $PERF_REPORTS (default:
// <os tmpdir>/ksmstroy-lighthouse).
//
// usage: node scripts/perf/lighthouse.mjs <url> [url …]

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const RUNS = 3
const KIB = 1024
const REPORTS = path.resolve(process.env.PERF_REPORTS || path.join(os.tmpdir(), 'ksmstroy-lighthouse'))

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

// The figures of one Lighthouse report (its JSON, parsed).
export function metricsOf(report) {
  if (report.runtimeError) throw new Error(`Lighthouse: ${report.runtimeError.code}: ${report.runtimeError.message}`)
  if (report.configSettings?.formFactor !== 'mobile') {
    throw new Error(`Lighthouse ran as ${report.configSettings?.formFactor}, not mobile`)
  }
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
    score: Math.round(report.categories.performance.score * 100),
  }
}

const describe = ({ lcp, cls, tbt, bytesBeforeLcp, score }) =>
  `LCP ${(lcp / 1000).toFixed(2)} s, CLS ${cls.toFixed(3)}, TBT ${Math.round(tbt)} ms, `
  + `before LCP ${(bytesBeforeLcp / KIB).toFixed(1)} KiB, score ${score}`

// npx is a .cmd on Windows, which Node runs only through a shell; each
// argument is quoted for that shell.
const quote = (arg) => (process.platform === 'win32' ? `"${arg.replace(/"/g, '""')}"` : `'${arg.replace(/'/g, "'\\''")}'`)

function lighthouse(url, output) {
  const args = [
    '--yes', 'lighthouse@13', url,
    '--output=json', `--output-path=${output}`,
    '--only-categories=performance',
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

async function main(urls) {
  if (urls.length === 0) {
    console.error('usage: node scripts/perf/lighthouse.mjs <url> [url …]')
    return 1
  }
  for (const url of urls) {
    if (!(await answers(url))) {
      console.error(`perf: ${url} does not answer. Serve the build first: node scripts/smoke/static-server.mjs`)
      return 1
    }
  }
  fs.mkdirSync(REPORTS, { recursive: true })
  console.log(`perf: Lighthouse 13, mobile, ${RUNS} runs per URL; reports in ${REPORTS}`)

  const rows = []
  for (const url of urls) {
    const slug = new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
    const runs = []
    for (let run = 1; run <= RUNS; run += 1) {
      const output = path.join(REPORTS, `${slug}-${run}.json`)
      fs.rmSync(output, { force: true })
      await lighthouse(url, output)
      const metrics = metricsOf(JSON.parse(fs.readFileSync(output, 'utf8')))
      console.log(`  ${url} run ${run}: ${describe(metrics)}`)
      runs.push(metrics)
    }
    const middle = Object.fromEntries(Object.keys(runs[0]).map((key) => [key, median(runs.map((r) => r[key]))]))
    rows.push({ url, middle, lighthouseVersion: JSON.parse(fs.readFileSync(path.join(REPORTS, `${slug}-1.json`), 'utf8')).lighthouseVersion })
  }

  console.log(`perf: median of ${RUNS} runs (Lighthouse ${rows[0].lighthouseVersion}):`)
  for (const { url, middle } of rows) console.log(`  ${url}: ${describe(middle)}`)
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
