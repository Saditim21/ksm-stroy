// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createStaticServer } from './static-server.mjs'

// The smoke run and Lighthouse see the build through this server, so it must
// answer as Vercel does with our vercel.json: redirects first, then the file,
// and no SPA fallback, so an unknown URL is the 404 page with a 404 status.

let root
let server
let origin

const PAGES = {
  'index.html': '<h1>Начало</h1>',
  'about/index.html': '<h1>За нас</h1>',
  'projects/index.html': '<h1>Продажби</h1>',
  'projects/golden-residence/index.html': '<h1>Golden Residence</h1>',
  'projects/golden-residence/block-a/index.html': '<h1>Блок А</h1>',
  '404/index.html': '<h1>Тази страница я няма в чертежа.</h1>',
  '404.html': '<h1>Тази страница я няма в чертежа.</h1>',
  'assets/entry-abc123.js': `export const x = "${'x'.repeat(4096)}"\n`,
}

const get = (pathname, init) => fetch(`${origin}${pathname}`, { redirect: 'manual', ...init })

// A second server on the same build with a vercel.json of the test's own;
// `check` gets its `get`.
async function withConfig(config, check) {
  const custom = createStaticServer({ root, config })
  await new Promise((resolve) => custom.listen(0, '127.0.0.1', resolve))
  try {
    await check((pathname) => fetch(`http://127.0.0.1:${custom.address().port}${pathname}`, { redirect: 'manual' }))
  } finally {
    custom.closeAllConnections()
    await new Promise((resolve) => custom.close(resolve))
  }
}

beforeAll(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'ksm-static-server-'))
  for (const [name, body] of Object.entries(PAGES)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    fs.writeFileSync(path.join(root, name), body)
  }
  server = createStaticServer({ root })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
})

afterAll(async () => {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
  fs.rmSync(root, { recursive: true, force: true })
})

describe('the filesystem', () => {
  it('serves a page at its path without a trailing slash, from <path>/index.html', async () => {
    const response = await get('/about')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/^text\/html/)
    expect(await response.text()).toBe('<h1>За нас</h1>')
  })

  it('serves the home page at /', async () => {
    const response = await get('/')
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('<h1>Начало</h1>')
  })

  it('answers HEAD with the headers and no body', async () => {
    const response = await get('/about', { method: 'HEAD' })
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/^text\/html/)
    expect(await response.text()).toBe('')
  })

  // Vercel looks files up by their exact name. Windows and macOS disks do not,
  // and serving /about's page at /About would hide what a visitor gets there:
  // the 404 page.
  it('matches a name by its exact case, even on a disk that ignores case', async () => {
    for (const pathname of ['/About', '/ABOUT', '/projects/golden-residence/Block-A', '/assets/Entry-abc123.js']) {
      expect((await get(pathname)).status, pathname).toBe(404)
    }
    expect(await (await get('/About')).text()).toBe('<h1>Тази страница я няма в чертежа.</h1>')
  })

  it('never serves a file outside the build', async () => {
    fs.writeFileSync(path.join(path.dirname(root), 'outside-the-build.txt'), 'secret')
    try {
      const response = await get(`/..%2F${'outside-the-build.txt'}`)
      expect(response.status).toBe(404)
      expect(await response.text()).not.toContain('secret')
    } finally {
      fs.rmSync(path.join(path.dirname(root), 'outside-the-build.txt'))
    }
  })
})

describe('vercel.json', () => {
  it('"trailingSlash": false sends /about/ to /about with a 308, keeping the query', async () => {
    const response = await get('/about/?ref=menu')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('/about?ref=menu')
  })

  it('redirects a placeholder project to /projects with a temporary redirect', async () => {
    for (const id of ['1', '12', 'golden-residence-old']) {
      const response = await get(`/projects/${id}`)
      expect(response.status, `/projects/${id}`).toBe(307)
      expect(response.headers.get('location'), `/projects/${id}`).toBe('/projects')
    }
  })

  it('serves the two real projects and their blocks, which the redirect excludes', async () => {
    for (const pathname of ['/projects/golden-residence', '/projects/golden-residence/block-a']) {
      const response = await get(pathname)
      expect(response.status, pathname).toBe(200)
    }
  })

  // A file's own name serves the page under a URL the browser's router does
  // not know, which would leave the prerendered page dead with the live one
  // beside it.
  it('sends /index.html to / and <path>/index.html to <path> with a permanent redirect, keeping the query', async () => {
    for (const [from, to] of [
      ['/index.html', '/'],
      ['/about/index.html', '/about'],
      ['/projects/index.html', '/projects'],
      ['/projects/golden-residence/block-a/index.html', '/projects/golden-residence/block-a'],
      ['/about/index.html?ref=menu', '/about?ref=menu'],
    ]) {
      const response = await get(from)
      expect(response.status, from).toBe(308)
      expect(response.headers.get('location'), from).toBe(to)
    }
  })

  it('sends /home to / with a permanent redirect', async () => {
    const response = await get('/home')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('/')
  })

  it('has no SPA fallback: an unknown URL gets the 404 page with a 404 status', async () => {
    const response = await get('/nope')
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toMatch(/^text\/html/)
    expect(await response.text()).toBe('<h1>Тази страница я няма в чертежа.</h1>')
  })

  it('answers a missing script with a 404, not with a page', async () => {
    const response = await get('/assets/entry-missing.js')
    expect(response.status).toBe(404)
  })

  // The availability API is answered from the fixture sheets (below); the
  // other functions are not run.
  it('does not run the other Vercel Functions in api/: 501', async () => {
    const response = await get('/api/odoo-lead')
    expect(response.status).toBe(501)
    expect((await response.json()).error).toMatch(/Vercel Function/)
  })

  it('applies the "headers" rules', async () => {
    const script = await get('/assets/entry-abc123.js')
    expect(script.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    expect(script.headers.get('x-content-type-options')).toBe('nosniff')
    expect(script.headers.get('x-frame-options')).toBe('DENY')
    const page = await get('/about')
    expect(page.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate')
  })
})

// The smoke run's pages read availability (the menu's Golden Residence line),
// so the server answers /api/availability as the deploy does: through
// api/availability.js itself, over the Golden Residence sheets saved in
// scripts/smoke/fixtures/sheets/ (the concept's snapshot, 96 apartments a
// block). No sheet is read from the network.
describe('the availability API, over the fixture sheets', () => {
  it('answers GET with every Golden Residence tab read and Многофамилна missing', async () => {
    const response = await get('/api/availability')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/^application\/json/)
    const body = await response.json()
    expect(body.sources).toEqual({ BLOCK_A: 'ok', BLOCK_B: 'ok', GARAGES: 'ok', PARKING: 'ok', MNOGO_A: 'missing', MNOGO_B: 'missing' })
    const goldenResidence = body.projects['golden-residence']
    expect(goldenResidence['block-a']).toHaveLength(96)
    expect(goldenResidence['block-b']).toHaveLength(96)
    expect(goldenResidence['block-a'][0]).toMatchObject({ unit: 'А 101', floor: '1', status: 'Свободен' })
    expect(goldenResidence.garages.length).toBeGreaterThan(0)
    expect(goldenResidence.parking.length).toBeGreaterThan(0)
    expect(body.projects['mnogofamilna-sgrada']).toEqual({ 'block-a': null, 'block-b': null })
  })

  it('answers HEAD with GET’s status and no body', async () => {
    const response = await get('/api/availability', { method: 'HEAD' })
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })

  it('refuses any other method, as the function does', async () => {
    const response = await get('/api/availability', { method: 'POST' })
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET, HEAD')
  })
})

it('compresses text as the edge does', async () => {
  const response = await get('/assets/entry-abc123.js', { headers: { 'accept-encoding': 'br' } })
  expect(response.headers.get('content-encoding')).toBe('br')
  expect(await response.text()).toBe(PAGES['assets/entry-abc123.js'])
})

// path-to-regexp's :name+ is one path segment or more, its "/" between them
// included, and a destination repeats it as :name+.
it('follows a :name+ source into its destination, one segment or more, never none', async () => {
  await withConfig({ redirects: [{ source: '/old/:rest+', destination: '/new/:rest+' }] }, async (at) => {
    expect((await at('/old/a')).headers.get('location')).toBe('/new/a')
    expect((await at('/old/a/b/c?q=1')).headers.get('location')).toBe('/new/a/b/c?q=1')
    expect((await at('/old')).status).toBe(404)
  })
})

it('refuses vercel.json rules it cannot emulate, rather than ignore them', () => {
  expect(() => createStaticServer({ root, config: { redirects: [{ source: '/blog/:slug*', destination: '/blog' }] } }))
    .toThrow(/\/blog\/:slug\*/)
  // A repeated param must follow a "/", as path-to-regexp's prefix.
  expect(() => createStaticServer({ root, config: { redirects: [{ source: '/v:n+', destination: '/' }] } }))
    .toThrow(/\/v:n\+/)
  expect(() => createStaticServer({ root, config: { cleanUrls: true } })).toThrow(/cleanUrls/)
})
