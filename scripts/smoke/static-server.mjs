#!/usr/bin/env node
// A static server that answers for build/client/ as Vercel does with our
// vercel.json, for the smoke run (smoke.mjs), Lighthouse (scripts/perf) and
// checks by hand. Copied from the React Router spike's tools and extended to
// read vercel.json. A request goes through, in Vercel's order:
//   1. "trailingSlash": false: /about/ answers 308 to /about;
//   2. "redirects", in order: 308 when permanent (the default), else 307, or
//      the rule's statusCode;
//   3. the filesystem: the file itself, or <path>/index.html, by the exact
//      case of every name, as Vercel looks them up (a Windows or macOS disk
//      would find /About as about/);
//   4. "rewrites", in order. /api/* is a Vercel Function. /api/availability
//      runs api/availability.js itself, over the sheets saved in
//      scripts/smoke/fixtures/sheets/ (below); this server runs no other
//      function: it answers 501;
//   5. nothing matched: 404.html with a 404 status. There is no SPA fallback.
// A redirect keeps the query string. Every other answer carries the "headers"
// whose source matches the path, over Vercel's default Cache-Control for a
// static file. Text over 1 KiB is compressed, br or else gzip, as Vercel's
// edge does.
//
// A source follows path-to-regexp as Vercel compiles it (strict and case
// sensitive), in the forms vercel.json uses: literal text, :name,
// :name(pattern), (pattern), and :name+ after a "/" (one segment or more,
// repeated as :name+ in a destination). Any other form, and any vercel.json
// key that changes routing and is not emulated here, throws rather than be
// ignored.
//
// usage: node scripts/smoke/static-server.mjs [root] [port] [--latency=ms]
//   root defaults to build/client, port to 4190; --latency delays each answer.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = fileURLToPath(new URL('../..', import.meta.url))
export const BUILD_DIR = path.join(REPO, 'build', 'client')
export const DEFAULT_PORT = 4190

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
}
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg)/
// What Vercel sends for a static file that no "headers" rule covers.
const DEFAULT_CACHE_CONTROL = 'public, max-age=0, must-revalidate'
// The vercel.json keys that change routing and that this server does not emulate.
const NOT_EMULATED = ['routes', 'cleanUrls']

function readVercelConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO, 'vercel.json'), 'utf8'))
}

// The availability API over saved sheets, so a page that reads availability
// (the menu's Golden Residence line) gets the answer a deploy gives, and no
// visit reaches Google. The function answers itself, api/availability.js,
// inside this process: its six variables name `fixture:<name>` URLs, which a
// wrapped fetch reads from scripts/smoke/fixtures/sheets/<name>.csv (the
// concept's Golden Residence snapshot); Многофамилна's are blank, as on
// Vercel. Any other URL goes to the real fetch.
const AVAILABILITY = '/api/availability'
const FIXTURES = path.join(REPO, 'scripts', 'smoke', 'fixtures', 'sheets')
const FIXTURE_SCHEME = 'fixture:'
const FIXTURE_SHEETS = {
  VITE_GOOGLE_SHEET_BLOCK_A: 'fixture:gr-block-a',
  VITE_GOOGLE_SHEET_BLOCK_B: 'fixture:gr-block-b',
  VITE_GOOGLE_SHEET_GARAGES: 'fixture:gr-garages',
  VITE_GOOGLE_SHEET_PARKING: 'fixture:gr-parking',
  VITE_GOOGLE_SHEET_MNOGO_A: '',
  VITE_GOOGLE_SHEET_MNOGO_B: '',
}

// `realFetch`, except that a fixture: URL answers with its saved sheet. The
// query (the function's cache buster) is ignored.
function withFixtureSheets(realFetch) {
  const fetchSheet = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!url.startsWith(FIXTURE_SCHEME)) return realFetch(input, init)
    const name = url.slice(FIXTURE_SCHEME.length).split(/[?#]/)[0]
    if (!/^[\w-]+$/.test(name)) return new Response('Not a fixture name', { status: 400 })
    try {
      const sheet = await fs.promises.readFile(path.join(FIXTURES, `${name}.csv`), 'utf8')
      return new Response(sheet, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8' } })
    } catch {
      return new Response('No such fixture', { status: 404 })
    }
  }
  fetchSheet.readsFixtureSheets = true
  return fetchSheet
}

let availabilityFunction = null

// api/availability.js's handler, over the fixture sheets.
async function availabilityHandler() {
  Object.assign(process.env, FIXTURE_SHEETS)
  if (!globalThis.fetch.readsFixtureSheets) globalThis.fetch = withFixtureSheets(globalThis.fetch)
  availabilityFunction ??= import(pathToFileURL(path.join(REPO, 'api', 'availability.js')).href).then((module) => module.default)
  return availabilityFunction
}

// Writes an answer, its text compressed as Vercel's edge does: br, else
// gzip, over 1 KiB. HEAD gets the headers alone.
function send(req, res, status, headers, body) {
  let content = body
  const accepts = String(req.headers['accept-encoding'] || '')
  if (COMPRESSIBLE.test(headers['content-type'] ?? '') && content.length > 1024 && /\b(br|gzip)\b/.test(accepts)) {
    const br = /\bbr\b/.test(accepts)
    headers['content-encoding'] = br ? 'br' : 'gzip'
    headers.vary = 'Accept-Encoding'
    content = br
      ? zlib.brotliCompressSync(content, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
      : zlib.gzipSync(content)
  }
  headers['content-length'] = content.length
  res.writeHead(status, headers)
  res.end(req.method === 'HEAD' ? undefined : content)
}

const unsupported = (source) =>
  new Error(`static-server: the vercel.json source "${source}" uses path-to-regexp syntax this server does not emulate`)

// The index of the ")" that closes the group opening at `start`.
function groupEnd(source, start) {
  let depth = 0
  let inClass = false
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '\\') i += 1
    else if (inClass) inClass = ch !== ']'
    else if (ch === '[') inClass = true
    else if (ch === '(') depth += 1
    else if (ch === ')' && (depth -= 1) === 0) return i
  }
  throw unsupported(source)
}

// A source as a RegExp, and the name of each of its groups in order (null for
// an unnamed group, which a destination reads as $1, $2 …).
function compileSource(source) {
  const names = []
  let pattern = ''
  for (let i = 0; i < source.length;) {
    const ch = source[i]
    if (ch === ':') {
      const name = /^\w+/.exec(source.slice(i + 1))?.[0]
      if (!name) throw unsupported(source)
      const afterSlash = source[i - 1] === '/'
      i += 1 + name.length
      let group = '[^\\/#\\?]+?'
      if (source[i] === '(') {
        const end = groupEnd(source, i)
        group = source.slice(i + 1, end)
        i = end + 1
      }
      // :name+ repeats the param with the "/" before it, its prefix in
      // path-to-regexp: one segment or more.
      if (source[i] === '+') {
        if (!afterSlash) throw unsupported(source)
        group = `(?:${group})(?:\\/(?:${group}))*`
        i += 1
      }
      names.push(name)
      pattern += `(${group})`
    } else if (ch === '(') {
      const end = groupEnd(source, i)
      names.push(null)
      pattern += `(${source.slice(i + 1, end)})`
      i = end + 1
    } else if ('?*+{}'.includes(ch)) {
      throw unsupported(source)
    } else {
      pattern += ch.replace(/[.^$|[\]\\/]/, '\\$&')
      i += 1
    }
  }
  return { regex: new RegExp(`^${pattern}$`), names }
}

function compileRules(config, key) {
  return (config[key] ?? []).map((rule) => {
    if (rule.has || rule.missing) throw new Error(`static-server: "${key}" with has/missing are not emulated (${rule.source})`)
    return { ...rule, ...compileSource(rule.source) }
  })
}

// The destination of a rule that matched, with its groups filled in. A
// destination names a repeated param as the source does (:name+).
function destinationOf(rule, groups) {
  return rule.destination
    .replace(/\$(\d+)/g, (_, n) => groups[Number(n) - 1] ?? '')
    .replace(/:(\w+)\+?/g, (whole, name) => (rule.names.includes(name) ? groups[rule.names.indexOf(name)] : whole))
}

const matchOf = (rule, pathname) => rule.regex.exec(pathname)?.slice(1) ?? null

// Whether every name from root down to abs is spelled exactly as on disk.
// Vercel's lookup is case-sensitive; a Windows or macOS disk's is not, and
// statSync() would find /About as about/.
function exactCase(root, abs) {
  let dir = root
  for (const name of path.relative(root, abs).split(path.sep).filter(Boolean)) {
    if (!fs.readdirSync(dir).includes(name)) return false
    dir = path.join(dir, name)
  }
  return true
}

// The file a path names inside root: the file itself, or <path>/index.html.
function resolveFile(root, pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return null
  }
  const abs = path.join(root, decoded)
  if (abs !== root && !abs.startsWith(root + path.sep)) return null
  try {
    const stat = fs.statSync(abs)
    if (!exactCase(root, abs)) return null
    if (stat.isFile()) return abs
    const index = path.join(abs, 'index.html')
    if (stat.isDirectory() && fs.existsSync(index)) return index
  } catch {
    // not found
  }
  return null
}

export function createStaticServer({ root = BUILD_DIR, config = readVercelConfig(), latency = 0 } = {}) {
  const ROOT = path.resolve(root)
  for (const key of NOT_EMULATED) {
    if (config[key] !== undefined) throw new Error(`static-server: vercel.json "${key}" is not emulated`)
  }
  if (config.trailingSlash === true) throw new Error('static-server: vercel.json "trailingSlash": true is not emulated')
  const redirects = compileRules(config, 'redirects')
  const rewrites = compileRules(config, 'rewrites')
  const headerRules = compileRules(config, 'headers')

  function headersFor(pathname) {
    const headers = { 'cache-control': DEFAULT_CACHE_CONTROL }
    for (const rule of headerRules) {
      if (!matchOf(rule, pathname)) continue
      for (const { key, value } of rule.headers) headers[key.toLowerCase()] = value
    }
    return headers
  }

  // /api/availability, as the function answers it: its status and headers
  // over the "headers" rules', and its body.
  async function answerAvailability(req, res, pathname) {
    try {
      const handler = await availabilityHandler()
      const response = await handler.fetch(new Request(`http://localhost${AVAILABILITY}`, { method: req.method }))
      const headers = { ...headersFor(pathname), 'x-emulator-file': 'api/availability.js (fixture sheets)' }
      response.headers.forEach((value, name) => {
        headers[name] = value
      })
      send(req, res, response.status, headers, Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(`static-server: ${AVAILABILITY} failed: ${error.message}`)
    }
  }

  function answer(req, res) {
    // Concatenated, so a path starting with // stays a path.
    const { pathname, search } = new URL(`http://localhost${req.url}`)
    const redirect = (status, location) => {
      res.writeHead(status, { location: location.includes('?') ? location : `${location}${search}` })
      res.end()
    }

    const slash = config.trailingSlash === false && /^\/(.*)\/$/.exec(pathname)
    if (slash) return redirect(308, `/${slash[1]}`)
    for (const rule of redirects) {
      const groups = matchOf(rule, pathname)
      if (groups) return redirect(rule.statusCode ?? (rule.permanent === false ? 307 : 308), destinationOf(rule, groups))
    }

    let file = resolveFile(ROOT, pathname)
    let status = 200
    let note = ''
    if (!file) {
      const rule = rewrites.find((r) => matchOf(r, pathname))
      if (rule) {
        const destination = destinationOf(rule, matchOf(rule, pathname))
        if (destination === AVAILABILITY) {
          answerAvailability(req, res, pathname)
          return
        }
        if (destination.startsWith('/api/')) {
          res.writeHead(501, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: `${destination} is a Vercel Function, which this static server does not run` }))
          return
        }
        file = resolveFile(ROOT, destination.split('?')[0])
        note = ' (rewrite)'
      }
    }
    if (!file) {
      file = resolveFile(ROOT, '/404.html')
      status = 404
      note = ' (404)'
    }
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }

    const headers = {
      ...headersFor(pathname),
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'x-emulator-file': encodeURI(path.relative(ROOT, file).split(path.sep).join('/')) + note,
    }
    send(req, res, status, headers, fs.readFileSync(file))
  }

  return http.createServer((req, res) => {
    if (latency > 0) setTimeout(() => answer(req, res), latency)
    else answer(req, res)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [root = BUILD_DIR, port = DEFAULT_PORT] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
  const latency = Number(process.argv.find((arg) => arg.startsWith('--latency='))?.split('=')[1] ?? 0)
  const server = createStaticServer({ root, latency })
  server.on('error', (error) => {
    console.error(`static-server: ${error.message}`)
    process.exit(1)
  })
  server.listen(Number(port), '127.0.0.1', () => {
    console.log(`static-server: ${path.resolve(root)} on http://127.0.0.1:${port}`)
  })
}
