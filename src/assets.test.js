import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

// The public images and the site's references to them (spec M3/M4 §9, the M4
// plan's Review Focus 5): the legacy removal deletes no image a page uses,
// and leaves none that only the legacy pages used.
//
// A page names a public image as a site path under /images/, /img/ or /og/:
// - written out in a module or a stylesheet, after a quote, a backtick or a
//   parenthesis: a file ('/og/ksm-stroy-1200x630.jpg'), or the stem of the
//   image pipeline's AVIF and WebP pair ('/img/plan-a-1200', the 404's
//   drawing);
// - in an image manifest (src/data/images/*.json, scripts/images/
//   build-images.mjs): each rung of an entry's ladder, `${path}-${w}.avif`
//   and `.webp` (src/components/ui/ResponsivePicture.jsx), and its share
//   image, `og` (src/seo/meta.js).
// Tests are left out: they name files a page never asks for. The two
// building renders that no page names are KEPT, below, by name.

// Kept though no page names them (spec M3/M4 §9, ruling T7d): production's
// building renders with their widths, Golden Residence's building-2 and
// Многофамилна's sgrada1, which outside links may name
// (scripts/generate-srcset.mjs makes the widths).
const KEPT = ['/images/golden-residence/building-2', '/images/mnogofamilna/sgrada1']
  .flatMap((stem) => ['', '-640', '-1024'].map((width) => `${stem}${width}.webp`))

const ROOT = cwd()
const PUBLIC = join(ROOT, 'public')

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}
const sitePathOf = (file) => `/${relative(PUBLIC, file).split(sep).join('/')}`

const SITE_PATH = /(?<=['"`(])\/(?:images|img|og)\/[\w./-]+(?=['"`)])/g
const IMAGE = /\.(?:avif|webp|png|jpe?g|svg|gif)$/i

// Every site path a module or a stylesheet of src/ writes out, with the files
// that name it.
function writtenOut() {
  const named = new Map()
  const modules = filesUnder(join(ROOT, 'src')).filter((file) => /\.(?:jsx?|css)$/.test(file) && !/\.test\.jsx?$/.test(file))
  for (const file of modules) {
    for (const [path] of readFileSync(file, 'utf8').matchAll(SITE_PATH)) {
      named.set(path, [...(named.get(path) ?? []), relative(ROOT, file)])
    }
  }
  return named
}

// The files a written-out path stands for: itself, or a pipeline stem's pair.
const filesOf = (path) => (IMAGE.test(path) ? [path] : [`${path}.avif`, `${path}.webp`])

// Every file the image manifests name, with the entry that names it.
function inManifests() {
  const named = new Map()
  const dir = join(ROOT, 'src', 'data', 'images')
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.json'))) {
    const manifest = JSON.parse(readFileSync(join(dir, name), 'utf8'))
    for (const [id, entry] of Object.entries(manifest)) {
      const files = entry.widths.flatMap((w) => [`${entry.path}-${w}.avif`, `${entry.path}-${w}.webp`])
      if (entry.og) files.push(entry.og)
      for (const file of files) named.set(file, `${name}: ${id}`)
    }
  }
  return named
}

const missing = (named) => [...named].filter(([file]) => !existsSync(join(PUBLIC, file))).map(([file, by]) => `${file} (${by})`)

describe('every public image a page names', () => {
  it('is in public/, as a module or a stylesheet writes it out', () => {
    const named = writtenOut()
    expect(named.size).toBeGreaterThan(0)
    const files = new Map([...named].flatMap(([path, by]) => filesOf(path).map((file) => [file, by.join(', ')])))
    expect(missing(files)).toEqual([])
  })

  it('is in public/, as an image manifest names it', () => {
    const named = inManifests()
    expect(named.size).toBeGreaterThan(0)
    expect(missing(named)).toEqual([])
  })

})

it('keeps the building renders spec §9 keeps, which no page names', () => {
  expect(KEPT).toHaveLength(6)
  expect(missing(new Map(KEPT.map((file) => [file, 'kept'])))).toEqual([])
  const named = new Set([...[...writtenOut().keys()].flatMap(filesOf), ...inManifests().keys()])
  expect(KEPT.filter((file) => named.has(file))).toEqual([])
})

// The other way: each image in public/images, public/img and public/og is
// one a page names, or one KEPT, so none is left that only the legacy pages
// used (the floor hover renders, building-2.png and golden-residence.jpg
// went with them), and none that a pipeline entry no longer makes.
it('leaves no public image that no page names', () => {
  const named = new Set([
    ...[...writtenOut().keys()].flatMap(filesOf),
    ...inManifests().keys(),
    ...KEPT,
  ])
  const images = ['images', 'img', 'og'].flatMap((dir) => filesUnder(join(PUBLIC, dir))).map(sitePathOf)
  expect(images.length).toBeGreaterThan(0)
  expect(images.filter((file) => !named.has(file))).toEqual([])
})
