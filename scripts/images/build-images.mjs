// Build-time image pipeline: AVIF/WebP width ladders in public/img plus one
// JSON manifest per group in src/data/images. Idempotent: existing outputs are
// skipped unless --force. Entries with kind 'copy' are pre-encoded ladders that
// are copied and measured, never re-encoded.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

sharp.cache(false) // no file handles held on Windows
const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const DEFAULT_QUALITY = { avif: 50, webp: 74 }
const FORMATS = ['avif', 'webp']

function hex(n) {
  return Math.round(n).toString(16).padStart(2, '0').toUpperCase()
}

// Average colour (a 1x1 resize), transparency flattened onto the paper token.
async function dominantColor(input) {
  const { data } = await sharp(input)
    .flatten({ background: '#F1F2EF' })
    .resize(1, 1, { kernel: 'cubic' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`
}

// A source is a file under root, or `git:<ref>:<path>` read with git show.
function readSource(src, root) {
  if (src.startsWith('git:')) {
    return execFileSync('git', ['show', src.slice(4)], { cwd: repoRoot, maxBuffer: 256 * 1024 * 1024 })
  }
  return fs.readFileSync(path.resolve(root, src))
}

function exists(file) {
  return fs.existsSync(file)
}

async function buildEncoded(entry, { root, outDir, force, log }) {
  const input = readSource(entry.src, root)
  let base = sharp(input)
  if (entry.crop) {
    const { left, top, width, height } = entry.crop
    base = base.extract({ left, top, width, height })
  }
  // Materialise the crop once so every rung resizes from the same pixels.
  const { data, info } = await base.png().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  let widths = [...new Set(entry.widths)].sort((a, b) => a - b).filter((x) => x <= w)
  if (widths.length === 0) widths = [w]
  const quality = { ...DEFAULT_QUALITY, ...entry.quality }
  for (const width of widths) {
    for (const fmt of FORMATS) {
      const out = path.join(outDir, `${entry.id}-${width}.${fmt}`)
      if (exists(out) && !force) continue
      const pipeline = sharp(data).resize({ width, withoutEnlargement: true })
      await (fmt === 'avif' ? pipeline.avif({ quality: quality.avif }) : pipeline.webp({ quality: quality.webp })).toFile(out)
      log(`wrote ${path.basename(out)}`)
    }
  }
  return { w, h, widths, color: await dominantColor(data) }
}

async function buildCopy(entry, { root, outDir, force, log }) {
  const templated = entry.src.includes('{w}')
  const widths = []
  for (const width of [...entry.widths].sort((a, b) => a - b)) {
    const stem = path.resolve(root, templated ? entry.src.replace('{w}', width) : entry.src)
    if (!FORMATS.every((fmt) => exists(`${stem}.${fmt}`))) throw new Error(`${entry.id}: missing ${stem}.{avif,webp}`)
    widths.push(width)
  }
  // A single pre-encoded file (a film poster) has no ladder: its width is measured.
  if (!templated) {
    const stem = path.resolve(root, entry.src)
    const meta = await sharp(fs.readFileSync(`${stem}.webp`)).metadata()
    widths.length = 0
    widths.push(meta.width)
  }
  const copied = []
  for (const width of widths) {
    const stem = path.resolve(root, templated ? entry.src.replace('{w}', width) : entry.src)
    for (const fmt of FORMATS) {
      const out = path.join(outDir, `${entry.id}-${width}.${fmt}`)
      copied.push(`${stem}.${fmt}`)
      if (exists(out) && !force) continue
      fs.copyFileSync(`${stem}.${fmt}`, out)
      log(`copied ${path.basename(out)}`)
    }
  }
  const largest = widths[widths.length - 1]
  const largestFile = path.resolve(root, templated ? entry.src.replace('{w}', largest) : entry.src) + '.webp'
  const meta = await sharp(fs.readFileSync(largestFile)).metadata()
  return { w: meta.width, h: meta.height, widths, color: await dominantColor(fs.readFileSync(largestFile)) }
}

export async function buildImages({
  sources,
  root = repoRoot,
  outDir = path.join(repoRoot, 'public', 'img'),
  manifestDir = path.join(repoRoot, 'src', 'data', 'images'),
  force = false,
  quiet = false,
} = {}) {
  const log = quiet ? () => {} : (m) => console.log(m)
  fs.mkdirSync(outDir, { recursive: true })
  fs.mkdirSync(manifestDir, { recursive: true })
  const groups = {}
  for (const entry of sources) {
    const ctx = { root, outDir, force, log }
    const result = entry.kind === 'copy' ? await buildCopy(entry, ctx) : await buildEncoded(entry, ctx)
    ;(groups[entry.group] ??= {})[entry.id] = { path: `/img/${entry.id}`, ...result }
  }
  for (const [group, entries] of Object.entries(groups)) {
    const sorted = Object.fromEntries(Object.keys(entries).sort().map((k) => [k, entries[k]]))
    fs.writeFileSync(path.join(manifestDir, `${group}.json`), JSON.stringify(sorted, null, 2) + '\n')
  }
  return groups
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sources = JSON.parse(fs.readFileSync(path.join(here, 'sources.json'), 'utf8'))
  const force = process.argv.includes('--force')
  const groups = await buildImages({ sources, force })
  console.log(`images: ${Object.values(groups).reduce((n, g) => n + Object.keys(g).length, 0)} entries in ${Object.keys(groups).length} groups`)
}
