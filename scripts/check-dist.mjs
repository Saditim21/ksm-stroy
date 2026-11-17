#!/usr/bin/env node
// Checks the production build in build/client/ (run `npm run build` first).
//
// 1. Fails when any file in build/client/ carries the branding of the agency
//    that built the Golden Residence landing (golden-residence @944bb03): its
//    name, its domain or its phone number. Parts of that site are ported into
//    this one, and none of its branding may reach ksmstroy.com. Before it
//    scans build/client/, it checks itself against planted files (PLANTED).
// 2. Fails when dev-only code reaches build/client/: the /dev/tracer polygon
//    tracer and the /dev/ui gallery of the shared primitives are routed only
//    under the dev server (import.meta.env.DEV in src/routes.js).
// 3. Prints the total gzip size of the JavaScript in build/client/assets, for
//    information only.
// 4. Prints, for every prerendered page (each index.html), its first-load JS:
//    every module script and modulepreload the page names, gzipped (spec §12,
//    at most 160 KiB), in KiB and in exact bytes, and the room it leaves. A
//    route is legacy when its first-load JS carries framer-motion or swiper
//    (LEGACY_LIBRARIES): over budget, it gets a WARN line, until M2 to M4
//    replace it (Ruling R2). Any other route fails when it leaves less than
//    MIN_ROOM of the budget. A route in MUST_BE_V2 has been rebuilt and fails
//    if it carries a legacy library at all, so it can never slip into a
//    WARN. A route in CAPS also fails above its own cap, a figure under the
//    budget that a ruling holds it to.
// 5. Fails when the first-load JS of any route carries GSAP, ScrollTrigger,
//    SplitText, Lenis or Flip. They load after the page (spec §5.1).
// 6. Prints the motion chunk's gzip size, failing above 60 KiB (spec §12).
// 7. Prints the Flip chunk's gzip size, failing above 10 KiB, or when Flip is
//    in more than one chunk (spec §12); until a page loads Flip, a note.
// Before it reads build/client/, it checks its first-load, library, room and
// cap verdicts against planted pages and scripts (PLANTED_PAGE,
// PLANTED_SCRIPTS).
//
// 160 kB, 60 kB and 10 kB in the spec are read as KiB, as the plan reads its
// font budget (90 kB = 92,160 B).

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
// React Router's build output: what the host serves.
const DIST = join(ROOT, 'build', 'client')

// "dianahomes", "Diana Homes", "893 951 010", "893951010" and their close
// spellings (any case; a space, dot, dash or non-breaking space inside, which
// \s matches as well once a text file is read as UTF-8).
const FORBIDDEN = [
  { label: 'dianahomes', pattern: /diana[\s._-]?homes/i },
  { label: '893 951 010', pattern: /893[\s.\-\u00a0]?951[\s.\-\u00a0]?010/ },
]

// The tracer's route path, its lazy chunk's file name and its
// "Export → clipboard" button (the arrow is one character in a text file, and
// three in a binary one); the gallery's route path, its chunk's file name and
// the folder its sample media come from.
const DEV_ONLY = [
  { label: '/dev/tracer', pattern: /\/dev\/tracer/ },
  { label: 'TracerPage', pattern: /TracerPage|Export .{1,4}clipboard/ },
  { label: '/dev/ui', pattern: /\/dev\/ui\b/ },
  { label: 'UiGallery', pattern: /UiGallery|\/dev-media\// },
]

// Text files are read as UTF-8, so a non-breaking space, two bytes there, is
// the one character the patterns expect. Any other file is read as latin1,
// one character per byte, so an ASCII needle is still found inside a binary.
const TEXT_FILE = /\.(html|js|css|json|txt|xml|svg)$/i

// Files the branding scan must catch: the agency's name and phone with
// non-breaking spaces (U+00A0, and the narrow U+202F) in UTF-8 text, and its
// domain inside a binary. A change to the patterns or to the decoding that
// would miss one of them fails the check before build/client/ is scanned.
const PLANTED = [
  { name: 'planted.html', bytes: Buffer.from('<p>Diana\u00a0Homes</p>', 'utf8') },
  { name: 'planted.js', bytes: Buffer.from('const phone = "+359\u00a0893\u00a0951\u00a0010"', 'utf8') },
  { name: 'planted.json', bytes: Buffer.from('{"phone":"893\u202f951\u202f010"}', 'utf8') },
  { name: 'planted.png', bytes: Buffer.from('\x89PNG\r\n\x1a\n\x00tEXtdianahomes.bg\x00', 'latin1') },
]

const KIB = 1024
const FIRST_LOAD_BUDGET = 160 * KIB
const MOTION_BUDGET = 60 * KIB
const FLIP_BUDGET = 10 * KIB

// The room every route without a legacy library keeps under the budget, in
// gzip bytes of first-load JS, from M4 Task 0 on (ruling M4-PF3): it fails
// with less. A shared addition is paid for by freeing bytes first (FR5).
const MIN_ROOM = 512

// The routes held under the budget to a figure of their own, in gzip bytes of
// first-load JS: Home and Golden Residence's page at their M3-end figures,
// through M4 (ruling M4-PF3; spec M3/M4 §4.4: the pieces M4 extracts must not
// grow their first load), so that M4's shared pieces are paid from Task 0's
// savings.
const CAPS = {
  '/': 158_566,
  '/projects/golden-residence': 162_528,
}

// The routes rebuilt for v2. Each must carry no legacy library in its
// first-load JS, so the budget always holds for it: a shared module that
// pulled framer-motion or swiper in would otherwise turn its FAIL into a
// WARN. M2 adds each route it rebuilds: Task 3 `/`, Task 5
// `/projects/golden-residence`, Task 7 both Golden Residence block routes; M3
// Task 4 `/projects/mnogofamilna-sgrada`, Task 6 both Многофамилна block
// routes; M4 Task 2 `/contact`, Task 3 `/projects`, Task 4 `/blog`. A route
// listed here before it is prerendered gets a note.
const MUST_BE_V2 = [
  '/',
  '/projects',
  '/projects/golden-residence',
  '/projects/golden-residence/block-a',
  '/projects/golden-residence/block-b',
  '/projects/mnogofamilna-sgrada',
  '/projects/mnogofamilna-sgrada/block-a',
  '/projects/mnogofamilna-sgrada/block-b',
  '/contact',
  '/blog',
  '/eu-proekt',
  '/404',
]

// What each legacy library leaves in minified code (spec §12): framer-motion
// the data attribute of its optimised appear animations, swiper its slide
// element's name. No v2 code writes either.
const LEGACY_LIBRARIES = [
  { label: 'framer-motion', pattern: /framerAppearId/ },
  { label: 'swiper', pattern: /swiper-slide/ },
]

// The motion chunk: src/motion/engine.js, which only an import() reaches
// (src/motion/runtime.js), with the libraries only it imports.
const MOTION_CHUNK = /^assets\/engine-[\w-]+\.js$/

// What each motion library leaves in minified code: a message or an internal
// name of its own, which no code of ours writes. The bare names cannot serve:
// our first-load code names `ScrollTrigger` as a property of the loaded engine
// (motion.ScrollTrigger.refresh()), and minified SplitText carries no
// "SplitText" at all. Each fingerprint must be found in the motion chunk, or
// the check fails: it could no longer see that library anywhere.
const MOTION_LIBRARIES = [
  // Its warning "Please gsap.registerPlugin(ScrollTrigger)".
  { label: 'ScrollTrigger', pattern: /registerPlugin\(ScrollTrigger\)/ },
  // It splits again when a web font finishes loading.
  { label: 'SplitText', pattern: /"loadingdone",\s*this\._split\b/ },
  { label: 'GSAP', pattern: /GreenSockGlobals/ },
  // The version its constructor writes on window.
  { label: 'Lenis', pattern: /lenisVersion/ },
]

// Flip (gsap/Flip), a lazy chunk of its own (src/motion/flip.js): the
// attribute it puts on the elements it tracks. No code of ours writes it.
const FLIP = { label: 'Flip', pattern: /data-flip-id/ }

// A page the first-load parser must read in full: a modulepreload, a module
// script with a src, an inline module script's static and dynamic imports.
// It must skip a classic script and a stylesheet.
const PLANTED_PAGE = {
  html: '<link rel="modulepreload" href="/assets/a.js"/><script type="module" src="/assets/b.js"></script>'
    + '<script type="module" async="">import "/assets/c.js";\nimport * as route0 from "/assets/d.js";\n'
    + 'import("/assets/e.js");</script><script>import("/assets/classic.js")</script>'
    + '<link rel="stylesheet" href="/assets/f.css"/>',
  scripts: ['/assets/a.js', '/assets/b.js', '/assets/c.js', '/assets/d.js', '/assets/e.js'],
}

// Scripts the library verdicts must catch, as minified code writes the
// fingerprints: framer-motion's (it builds its data attribute from the name)
// and Flip's.
const PLANTED_SCRIPTS = {
  framer: { name: 'assets/planted-framer.js', bytes: Buffer.from('const sa="framerAppearId",fi="data-"+en(sa);', 'utf8') },
  flip: { name: 'assets/planted-flip.js', bytes: Buffer.from('var i=t.getAttribute("data-flip-id");i||t.setAttribute("data-flip-id",i="auto-"+n++)', 'utf8') },
}

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}

function formatKiB(bytes) {
  return `${(bytes / KIB).toFixed(1)} KiB`
}

// 162682 as „162,682 B“.
const formatBytes = (bytes) => `${bytes.toLocaleString('en-US')} B`

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

const attribute = (tag, name) => new RegExp(`\\b${name}=["']([^"']+)["']`, 'i').exec(tag)?.[1]

// The JS a page loads first: every <link rel="modulepreload">, every
// <script type="module" src>, and what an inline module script imports.
function firstLoadScripts(html) {
  const urls = new Set()
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (/\brel=["']?modulepreload\b/i.test(tag)) urls.add(attribute(tag, 'href'))
  }
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\btype=["']?module\b/i.test(attrs)) continue
    const src = attribute(attrs, 'src')
    if (src) {
      urls.add(src)
      continue
    }
    for (const [, from, dynamic] of body.matchAll(/\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
      urls.add(from ?? dynamic)
    }
  }
  urls.delete(undefined)
  return [...urls]
}

const labelsIn = (patterns, content) => patterns.filter(({ pattern }) => pattern.test(content)).map(({ label }) => label)

// One script: its gzip size, and the motion and legacy libraries and Flip
// it carries.
function inspect(name, bytes) {
  const content = bytes.toString('utf8')
  return {
    name,
    gzip: gzipSync(bytes).length,
    motion: labelsIn(MOTION_LIBRARIES, content),
    legacy: labelsIn(LEGACY_LIBRARIES, content),
    flip: FLIP.pattern.test(content),
  }
}

// One route's verdict from its first-load scripts (inspect()): their gzip
// total, the legacy libraries in them, the status line and the failures.
function judgeRoute(route, scripts) {
  const failures = []
  const total = scripts.reduce((sum, script) => sum + script.gzip, 0)
  for (const script of scripts) {
    for (const label of script.motion) failures.push(`${route}: first-load ${script.name} carries ${label}`)
    if (script.flip) failures.push(`${route}: first-load ${script.name} carries ${FLIP.label}`)
  }
  const legacy = [...new Set(scripts.flatMap((script) => script.legacy))]
  const rebuilt = MUST_BE_V2.includes(route)
  const cap = CAPS[route]
  const room = FIRST_LOAD_BUDGET - total
  let status
  let warned = false
  if (rebuilt && legacy.length > 0) {
    status = 'FAIL, legacy code in a rebuilt route'
    const carriers = scripts.filter((script) => script.legacy.length > 0).map((script) => script.name)
    failures.push(`${route}: rebuilt, but its first-load JS carries ${legacy.join(' and ')} (${carriers.join(', ')})`)
  } else if (legacy.length > 0) {
    warned = room < 0
    status = `${warned ? 'WARN, over budget' : 'OK'} (legacy: ${legacy.join(', ')})`
  } else if (room < 0) {
    status = 'FAIL, over budget'
    failures.push(`${route}: first-load JS ${formatKiB(total)} gzip, over the ${formatKiB(FIRST_LOAD_BUDGET)} budget`)
  } else if (room < MIN_ROOM) {
    status = `FAIL, ${formatBytes(room)} of room, under ${formatBytes(MIN_ROOM)}`
    failures.push(`${route}: first-load JS ${formatBytes(total)} gzip leaves ${formatBytes(room)} of the budget, under the ${formatBytes(MIN_ROOM)} every route keeps`)
  } else if (cap !== undefined && total > cap) {
    status = `FAIL, ${formatBytes(total - cap)} over its cap of ${formatBytes(cap)}`
    failures.push(`${route}: first-load JS ${formatBytes(total)} gzip, over its cap of ${formatBytes(cap)}`)
  } else {
    status = `OK, ${formatBytes(room)} of room${cap === undefined ? '' : `, ${formatBytes(cap - total)} under its cap of ${formatBytes(cap)}`}`
  }
  return { total, legacy, status, warned, failures }
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

const plantedScripts = firstLoadScripts(PLANTED_PAGE.html)
if (plantedScripts.join(' ') !== PLANTED_PAGE.scripts.join(' ')) {
  console.error('check:dist: FAILED, the self-check misread the scripts of a planted page:')
  console.error(`  expected ${PLANTED_PAGE.scripts.join(' ')}`)
  console.error(`  read     ${plantedScripts.join(' ')}`)
  process.exit(1)
}

// A planted framer-motion script is legacy, a planted Flip script is Flip,
// and a rebuilt route whose first-load JS carries the planted framer-motion
// script fails. A route in no list passes with MIN_ROOM of room and fails
// with a byte less; a legacy one, as big, passes, and over the budget only
// warns. Each capped route fails one byte over its cap, which leaves at
// least MIN_ROOM, and passes at its cap. The sizes are planted first-load
// scripts, as inspect() reads a script, with no library in them, or with
// framer-motion for the legacy route.
const plantedFramer = inspect(PLANTED_SCRIPTS.framer.name, PLANTED_SCRIPTS.framer.bytes)
const plantedFlip = inspect(PLANTED_SCRIPTS.flip.name, PLANTED_SCRIPTS.flip.bytes)
const plantedRoute = judgeRoute(MUST_BE_V2[0], [plantedFramer])
const plantedOfSize = (gzip, legacy = []) => ({ name: 'assets/planted-size.js', gzip, motion: [], legacy, flip: false })
const passes = (verdict) => verdict.failures.length === 0 && verdict.status.startsWith('OK')
const fails = (verdict) => verdict.failures.length > 0 && verdict.status.startsWith('FAIL')
const ROOM_EDGE = FIRST_LOAD_BUDGET - MIN_ROOM
const PLANTED_ROUTE = '/planted'
const roomAt = judgeRoute(PLANTED_ROUTE, [plantedOfSize(ROOM_EDGE)])
const roomShort = judgeRoute(PLANTED_ROUTE, [plantedOfSize(ROOM_EDGE + 1)])
const legacyShort = judgeRoute(PLANTED_ROUTE, [plantedOfSize(ROOM_EDGE + 1, ['framer-motion'])])
const legacyOver = judgeRoute(PLANTED_ROUTE, [plantedOfSize(FIRST_LOAD_BUDGET + 1, ['framer-motion'])])
const misjudgedRoom = [
  !passes(roomAt) && `${PLANTED_ROUTE} with ${formatBytes(MIN_ROOM)} of room: ${roomAt.status}, not OK`,
  !fails(roomShort) && `${PLANTED_ROUTE} with a byte under ${formatBytes(MIN_ROOM)} of room: ${roomShort.status}, not a failure`,
  !passes(legacyShort) && `legacy ${PLANTED_ROUTE} with a byte under ${formatBytes(MIN_ROOM)} of room: ${legacyShort.status}, not OK`,
  (legacyOver.failures.length > 0 || !legacyOver.warned) && `legacy ${PLANTED_ROUTE} over the budget: ${legacyOver.status}, not a warning`,
]
const misjudgedCaps = Object.entries(CAPS).flatMap(([route, cap]) => {
  const over = judgeRoute(route, [plantedOfSize(cap + 1)])
  const at = judgeRoute(route, [plantedOfSize(cap)])
  return [
    (cap + 1 > ROOM_EDGE) && `${route}: its cap of ${formatBytes(cap)} leaves less than ${formatBytes(MIN_ROOM)} of room`,
    !fails(over) && `${route} one byte over its cap: ${over.status}, not a failure`,
    !passes(at) && `${route} at its cap: ${at.status}, not OK`,
  ]
})
const misjudged = [
  !plantedFramer.legacy.includes('framer-motion') && `${plantedFramer.name}: framer-motion not seen`,
  !plantedFlip.flip && `${plantedFlip.name}: Flip not seen`,
  !fails(plantedRoute) && `${MUST_BE_V2[0]} with ${plantedFramer.name} in its first-load JS: ${plantedRoute.status}, not a failure`,
  ...misjudgedRoom,
  ...misjudgedCaps,
].filter(Boolean)
if (misjudged.length > 0) {
  console.error('check:dist: FAILED, the self-check misjudged planted scripts:')
  for (const line of misjudged) console.error(`  ${line}`)
  process.exit(1)
}

let files
try {
  if (!statSync(DIST).isDirectory()) throw new Error('not a directory')
  files = filesUnder(DIST)
} catch {
  console.error('check:dist: build/client/ not found. Run `npm run build` first.')
  process.exit(1)
}

const nameOf = (file) => relative(DIST, file).split(sep).join('/')
const names = new Set(files.map(nameOf))

const leaks = []
const devCode = []
for (const file of files) {
  const name = nameOf(file)
  const content = decode(name, readFileSync(file))
  scan(FORBIDDEN, name, content, leaks)
  scan(DEV_ONLY, name, content, devCode)
}

// build/client/assets/*.js: the bundles directly in build/client/assets.
const scripts = files.filter((file) => {
  const parts = relative(DIST, file).split(sep)
  return parts.length === 2 && parts[0] === 'assets' && parts[1].endsWith('.js')
})
const raw = scripts.reduce((sum, file) => sum + statSync(file).size, 0)
const gzip = scripts.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0)

console.log(`check:dist: ${files.length} files in build/client/`)
console.log(`check:dist: build/client/assets/*.js: ${scripts.length} files, ${formatKiB(raw)} raw, ${formatKiB(gzip)} gzip`)

const failures = []

// Each script inspected once: most routes share most of their scripts.
const scriptInfo = new Map()
function readScript(name) {
  if (!scriptInfo.has(name)) scriptInfo.set(name, inspect(name, readFileSync(join(DIST, ...name.split('/')))))
  return scriptInfo.get(name)
}

// Every prerendered page: build/client/about/index.html is /about.
const pages = [...names]
  .filter((name) => name === 'index.html' || name.endsWith('/index.html'))
  .map((name) => ({ name, route: `/${name.slice(0, -'index.html'.length).replace(/\/$/, '')}` }))
  .sort((a, b) => a.route.localeCompare(b.route))

const rows = []
let warned = 0
for (const { name, route } of pages) {
  // Script URLs are site paths, resolved as the browser would from the page.
  const base = new URL(route === '/' ? '/' : `${route}/`, 'https://site.invalid')
  const urls = firstLoadScripts(readFileSync(join(DIST, ...name.split('/')), 'utf8'))
  if (urls.length === 0) failures.push(`${route}: no first-load JS found in ${name}; the page parser no longer reads it`)
  const loaded = []
  for (const url of urls) {
    const script = decodeURIComponent(new URL(url, base).pathname).slice(1)
    if (!names.has(script)) {
      failures.push(`${route}: ${name} loads ${url}, which is not in build/client/`)
      continue
    }
    loaded.push(readScript(script))
  }
  const verdict = judgeRoute(route, loaded)
  failures.push(...verdict.failures)
  if (verdict.warned) warned += 1
  rows.push([route, String(urls.length), formatKiB(verdict.total), formatBytes(verdict.total), verdict.status])
}

const widths = [Math.max(5, ...rows.map(([route]) => route.length)), 7, 10, 9]
const line = ([route, count, size, bytes, status]) =>
  `  ${route.padEnd(widths[0])}  ${count.padStart(widths[1])}  ${size.padStart(widths[2])}  ${bytes.padStart(widths[3])}  ${status}`
const capped = Object.entries(CAPS).map(([route, cap]) => `${route} ${formatBytes(cap)}`).join(', ')
console.log(`check:dist: first-load JS per route, gzip (budget ${formatKiB(FIRST_LOAD_BUDGET)}, ${formatBytes(FIRST_LOAD_BUDGET)}; every route keeps ${formatBytes(MIN_ROOM)} of room but a legacy one, carrying ${LEGACY_LIBRARIES.map(({ label }) => label).join(' or ')}, which only warns over budget; capped: ${capped}; rebuilt: ${MUST_BE_V2.join(', ')}):`)
console.log(line(['route', 'scripts', 'gzip', 'bytes', '']).trimEnd())
for (const row of rows) console.log(line(row))
for (const route of MUST_BE_V2) {
  if (!pages.some((page) => page.route === route)) console.log(`check:dist: note: ${route} is in MUST_BE_V2 but not prerendered yet`)
}

const motionChunks = [...names].filter((name) => MOTION_CHUNK.test(name))
if (motionChunks.length !== 1) {
  failures.push(`expected one motion chunk (assets/engine-*.js), found ${motionChunks.length}: ${motionChunks.join(', ') || 'none'}`)
} else {
  const [motion] = motionChunks
  const { gzip: size, motion: libraries } = readScript(motion)
  console.log(`check:dist: motion chunk ${motion}: ${formatKiB(size)} gzip (budget ${formatKiB(MOTION_BUDGET)})`)
  if (size > MOTION_BUDGET) failures.push(`motion chunk ${motion}: ${formatKiB(size)} gzip, over the ${formatKiB(MOTION_BUDGET)} budget`)
  for (const { label, pattern } of MOTION_LIBRARIES) {
    if (!libraries.includes(label)) failures.push(`the guard no longer sees ${label} in the motion chunk ${motion}: update its fingerprint (${pattern})`)
  }
}

// Flip: one lazy chunk of its own, wherever a page loads it.
const flipChunks = scripts.map(nameOf).filter((name) => readScript(name).flip)
if (flipChunks.length === 0) {
  console.log(`check:dist: note: no chunk carries Flip (${FLIP.pattern}) yet; no page loads Flip before Task 8`)
} else if (flipChunks.length > 1) {
  failures.push(`Flip is in ${flipChunks.length} chunks (${flipChunks.join(', ')}); it must be one lazy chunk of its own`)
} else {
  const [flip] = flipChunks
  const size = readScript(flip).gzip
  console.log(`check:dist: Flip chunk ${flip}: ${formatKiB(size)} gzip (budget ${formatKiB(FLIP_BUDGET)})`)
  if (size > FLIP_BUDGET) failures.push(`Flip chunk ${flip}: ${formatKiB(size)} gzip, over the ${formatKiB(FLIP_BUDGET)} budget`)
}

if (leaks.length > 0) {
  console.error('check:dist: FAILED, agency branding found in the build:')
  for (const leak of leaks) console.error(`  ${leak}`)
}
if (devCode.length > 0) {
  console.error('check:dist: FAILED, dev-only code found in the build:')
  for (const hit of devCode) console.error(`  ${hit}`)
}
if (failures.length > 0) {
  console.error('check:dist: FAILED, first-load JS, the motion chunk and Flip:')
  for (const failure of failures) console.error(`  ${failure}`)
}
if (leaks.length > 0 || devCode.length > 0 || failures.length > 0) process.exit(1)

console.log('check:dist: OK, no agency branding and no dev-only code in build/client/')
console.log(`check:dist: OK, no motion library or Flip in first-load JS; v2 routes with ${formatBytes(MIN_ROOM)} of room or more, capped routes within their caps, the motion chunk and Flip within budget${warned > 0 ? ` (${warned} legacy routes over budget, warned above)` : ''}`)
