#!/usr/bin/env node
// Checks the production build in dist/ (run `npm run build` first).
//
// 1. Fails when any file in dist/ carries the branding of the agency that
//    built the Golden Residence landing (golden-residence @944bb03): its name,
//    its domain or its phone number. Parts of that site are ported into this
//    one, and none of its branding may reach ksmstroy.com. Before it scans
//    dist/, it checks itself against planted files (PLANTED).
// 2. Fails when dev-only code reaches dist/: the /dev/tracer polygon tracer is
//    routed only under the dev server (import.meta.env.DEV in src/App.jsx).
// 3. Prints the total gzip size of the JavaScript in dist/assets, for
//    information only.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')

// "dianahomes", "Diana Homes", "893 951 010", "893951010" and their close
// spellings (any case; a space, dot, dash or non-breaking space inside, which
// \s matches as well once a text file is read as UTF-8).
const FORBIDDEN = [
  { label: 'dianahomes', pattern: /diana[\s._-]?homes/i },
  { label: '893 951 010', pattern: /893[\s.\-\u00a0]?951[\s.\-\u00a0]?010/ },
]

// The tracer's route path, its lazy chunk's file name and its
// "Export → clipboard" button (the arrow is one character in a text file, and
// three in a binary one).
const DEV_ONLY = [
  { label: '/dev/tracer', pattern: /\/dev\/tracer/ },
  { label: 'TracerPage', pattern: /TracerPage|Export .{1,4}clipboard/ },
]

// Text files are read as UTF-8, so a non-breaking space, two bytes there, is
// the one character the patterns expect. Any other file is read as latin1,
// one character per byte, so an ASCII needle is still found inside a binary.
const TEXT_FILE = /\.(html|js|css|json|txt|xml|svg)$/i

// Files the branding scan must catch: the agency's name and phone with
// non-breaking spaces (U+00A0, and the narrow U+202F) in UTF-8 text, and its
// domain inside a binary. A change to the patterns or to the decoding that
// would miss one of them fails the check before dist/ is scanned.
const PLANTED = [
  { name: 'planted.html', bytes: Buffer.from('<p>Diana\u00a0Homes</p>', 'utf8') },
  { name: 'planted.js', bytes: Buffer.from('const phone = "+359\u00a0893\u00a0951\u00a0010"', 'utf8') },
  { name: 'planted.json', bytes: Buffer.from('{"phone":"893\u202f951\u202f010"}', 'utf8') },
  { name: 'planted.png', bytes: Buffer.from('\x89PNG\r\n\x1a\n\x00tEXtdianahomes.bg\x00', 'latin1') },
]

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

function decode(name, bytes) {
  return bytes.toString(TEXT_FILE.test(name) ? 'utf8' : 'latin1')
}

function scan(patterns, name, content, found) {
  for (const { label, pattern } of patterns) {
    if (pattern.test(name)) found.push(`${name}: file name matches "${label}"`)
    const match = content.match(pattern)
    if (match) found.push(`${name}: contains "${match[0]}" (${label})`)
  }
}

const missed = PLANTED.filter(({ name, bytes }) => {
  const found = []
  scan(FORBIDDEN, name, decode(name, bytes), found)
  return found.length === 0
})
if (missed.length > 0) {
  console.error('check:dist: FAILED, the self-check missed the agency branding in planted files:')
  for (const { name } of missed) console.error(`  ${name}`)
  process.exit(1)
}

let files
try {
  if (!statSync(DIST).isDirectory()) throw new Error('not a directory')
  files = filesUnder(DIST)
} catch {
  console.error('check:dist: dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const leaks = []
const devCode = []
for (const file of files) {
  const name = relative(DIST, file).split(sep).join('/')
  const content = decode(name, readFileSync(file))
  scan(FORBIDDEN, name, content, leaks)
  scan(DEV_ONLY, name, content, devCode)
}

// dist/assets/*.js: the bundles directly in dist/assets.
const scripts = files.filter((file) => {
  const parts = relative(DIST, file).split(sep)
  return parts.length === 2 && parts[0] === 'assets' && parts[1].endsWith('.js')
})
const raw = scripts.reduce((sum, file) => sum + statSync(file).size, 0)
const gzip = scripts.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0)

console.log(`check:dist: ${files.length} files in dist/`)
console.log(`check:dist: dist/assets/*.js: ${scripts.length} files, ${formatKiB(raw)} raw, ${formatKiB(gzip)} gzip`)

if (leaks.length > 0) {
  console.error('check:dist: FAILED, agency branding found in the build:')
  for (const leak of leaks) console.error(`  ${leak}`)
}
if (devCode.length > 0) {
  console.error('check:dist: FAILED, dev-only code found in the build:')
  for (const hit of devCode) console.error(`  ${hit}`)
}
if (leaks.length > 0 || devCode.length > 0) process.exit(1)

console.log('check:dist: OK, no agency branding and no dev-only code in dist/')
