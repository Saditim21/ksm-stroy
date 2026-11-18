#!/usr/bin/env node
// Generates the widths of production's two building renders, which
// public/images keeps though no page of the site names them (spec M3/M4 §9,
// ruling T7d; src/assets.test.js lists them, KEPT): outside links may name
// either.
//
//   node scripts/generate-srcset.mjs
//
// Every entry is served from /public (not bundled), so an address can name
// it. The two building renders' master files are copied through untouched:
// the explorer's polygon maps in src/data/maps/*.json are pinned to their
// exact pixel size, so the full-width candidate must stay byte-identical.
//
// Re-runnable: it overwrites its outputs and never edits the masters.
import { mkdir, copyFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const RENDERS = [
  {
    master: 'public/images/golden-residence/building-2.webp',
    outDir: 'public/images/golden-residence',
    name: 'building-2',
  },
  {
    // The Многофамилна master still lives in src/assets (it is also the source
    // the floor-map tracing was done against); it is copied into /public here.
    master: 'src/assets/продажби/project 1/sgrada1.webp',
    outDir: 'public/images/mnogofamilna',
    name: 'sgrada1',
  },
  // Home's two legacy hero slides (photo-4 and 001) left with the legacy
  // pages (spec M3/M4 §9); Home's pictures are the image pipeline's
  // (scripts/images/build-images.mjs).
]

// Browsers never upscale a srcset candidate, so any width >= the master's is
// skipped: a 1600w entry generated from a 1200w master is dead bytes.
const WIDTHS = [640, 1024, 1600]
const QUALITY = 80

const kb = (file) => `${Math.round(statSync(file).size / 1024)} KB`

for (const render of RENDERS) {
  const masterPath = path.join(root, render.master)
  if (!existsSync(masterPath)) {
    console.error(`✗ missing master: ${render.master}`)
    process.exitCode = 1
    continue
  }

  const outDir = path.join(root, render.outDir)
  await mkdir(outDir, { recursive: true })

  const { width, height } = await sharp(masterPath).metadata()
  const fullSize = path.join(outDir, `${render.name}.webp`)
  if (path.resolve(masterPath) !== path.resolve(fullSize)) {
    await copyFile(masterPath, fullSize)
  }
  console.log(`${render.name}.webp  ${width}x${height}  ${kb(fullSize)}  (master, full-width candidate)`)

  for (const target of WIDTHS) {
    if (target >= width) {
      console.log(`${render.name}-${target}.webp  skipped — master is only ${width}px wide`)
      continue
    }
    const out = path.join(outDir, `${render.name}-${target}.webp`)
    await sharp(masterPath).resize({ width: target }).webp({ quality: QUALITY }).toFile(out)
    console.log(`${render.name}-${target}.webp  ${target}x${Math.round((height / width) * target)}  ${kb(out)}`)
  }
}
