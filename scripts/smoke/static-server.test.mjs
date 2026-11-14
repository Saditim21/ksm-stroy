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

  it('does not run the Vercel Functions in api/: 501', async () => {
    const response = await get('/api/availability')
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
