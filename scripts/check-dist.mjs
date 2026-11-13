#!/usr/bin/env node
// Checks the production build in dist/ (run `npm run build` first).
//
// 1. Fails when any file in dist/ carries the branding of the agency that
//    built the Golden Residence landing (golden-residence @944bb03): its name,
//    its domain or its phone number. Parts of that site are ported into this
//    one, and none of its branding may reach ksmstroy.com.
// 2. Prints the total gzip size of the JavaScript in dist/assets, for
//    information only.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')

// "dianahomes", "Diana Homes", "893 951 010", "893951010" and their close
// spellings (any case; a space, dot, dash or non-breaking space inside).
const FORBIDDEN = [
  { label: 'dianahomes', pattern: /diana[\s._-]?homes/i },
  { label: '893 951 010', pattern: /893[\s.\- ]?951[\s.\- ]?010/ },
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

let files
try {
  if (!statSync(DIST).isDirectory()) throw new Error('not a directory')
  files = filesUnder(DIST)
} catch {
  console.error('check:dist: dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const leaks = []
for (const file of files) {
  const name = relative(DIST, file).split(sep).join('/')
  // latin1 maps every byte to one character, so text needles are found in
  // any file, text or binary, whatever its encoding around them.
  const content = readFileSync(file).toString('latin1')
  for (const { label, pattern } of FORBIDDEN) {
    if (pattern.test(name)) leaks.push(`${name}: file name matches "${label}"`)
    const match = content.match(pattern)
    if (match) leaks.push(`${name}: contains "${match[0]}" (${label})`)
  }
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
  process.exit(1)
}

console.log('check:dist: OK, no agency branding in dist/')
