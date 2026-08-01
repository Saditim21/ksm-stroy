#!/usr/bin/env node
// Generates the responsive variants behind src/constants/buildingRenders.js.
//
//   node scripts/generate-srcset.mjs
//
// Every entry is served from /public (not bundled) so a plain <img srcSet>
// can name it by URL. The two building renders' master files are copied
// through untouched: the explorer's polygon maps in src/data/maps/*.json are
// pinned to their exact pixel size, so the full-width candidate must stay
// byte-identical.
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
  {
    // Home's hero slide 1 (Task 3 CineSlider). The src/assets original ships
    // fixed-size with no srcset, so phones downloaded the full 2006x1202/215KB
    // frame — this generates the same 640/1024/1600 ladder as the other
    // renders. The src/assets master is left in place; nothing else imports it.
    master: 'src/assets/home/optimized/photo-4.webp',
    outDir: 'public/images/home',
    name: 'photo-4',
  },
  {
    // Home's hero slide 2. Same story as photo-4: 2452x1410/172KB shipped
    // with no srcset.
    master: 'src/assets/home/optimized/001.webp',
    outDir: 'public/images/home',
    name: '001',
  },
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
