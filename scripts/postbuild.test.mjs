// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { writeNotFoundPage } from './postbuild.mjs'

// After `react-router build`: the host serves build/client/404.html on any URL
// with no file (vercel.json has no SPA fallback), and React Router writes the
// page of the `*` route to build/client/404/index.html.

let outDir

beforeEach(() => {
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ksm-postbuild-'))
})

afterEach(() => fs.rmSync(outDir, { recursive: true, force: true }))

describe('writeNotFoundPage', () => {
  it('copies the prerendered 404 page to 404.html', () => {
    fs.mkdirSync(path.join(outDir, '404'))
    fs.writeFileSync(path.join(outDir, '404', 'index.html'), '<h1>Тази страница я няма в чертежа.</h1>')

    writeNotFoundPage(outDir)

    expect(fs.readFileSync(path.join(outDir, '404.html'), 'utf8')).toBe('<h1>Тази страница я няма в чертежа.</h1>')
  })

  it('fails when the build has no 404 page, rather than leave the host its own', () => {
    expect(() => writeNotFoundPage(outDir)).toThrow(/404[\\/]index\.html/)
    expect(fs.existsSync(path.join(outDir, '404.html'))).toBe(false)
  })
})
