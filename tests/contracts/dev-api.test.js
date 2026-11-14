// @vitest-environment node
import { Buffer } from 'node:buffer'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { devApi } from '../../vite.config.js'

// devApi() in vite.config.js runs the Vercel Functions in api/ under
// `npm run dev`. api/odoo-lead.js posts a valid inquiry to Odoo, and its
// ODOO_URL defaults to the client's production CRM, whose public form endpoint
// needs no credentials. So on a dev server an inquiry reaches the function
// only when ODOO_URL is set, in the shell or in .env. Otherwise the dev server
// answers it itself, and nothing reaches the CRM.

const INQUIRY = {
  name: 'Тест Тестов',
  email: 'dev-test@example.com',
  phone: '',
  projectType: '',
  budget: '',
  message: 'Запитване от dev сървъра, не за CRM-а.',
}

let envDir
let shellOdooUrl

beforeEach(() => {
  // The project directory of each dev server below, with or without a .env.
  envDir = mkdtempSync(join(tmpdir(), 'ksm-dev-api-'))
  shellOdooUrl = process.env.ODOO_URL
  delete process.env.ODOO_URL
})

afterEach(() => {
  rmSync(envDir, { recursive: true, force: true })
  if (shellOdooUrl === undefined) delete process.env.ODOO_URL
  else process.env.ODOO_URL = shellOdooUrl
})

// A dev server with devApi() installed. Its functions are stand-ins that
// answer with what they were asked; `env` is the project's .env, if any.
function devServer({ env } = {}) {
  if (env !== undefined) writeFileSync(join(envDir, '.env'), env)
  const functions = {
    fetch: vi.fn(async (request) =>
      Response.json({ handledBy: 'function', method: request.method }, { status: request.method === 'PUT' ? 405 : 200 })),
  }
  const logged = []
  const log = (message) => logged.push(message)
  let middleware
  const server = {
    config: { mode: 'development', envDir, root: envDir, logger: { info: log, warn: log, error: log } },
    middlewares: { use: (handle) => { middleware = handle } },
    ssrLoadModule: vi.fn(async () => ({ default: functions })),
  }
  devApi().configureServer(server)

  // Sends a request through the middleware as Node's HTTP server would.
  // Resolves with the answer, or with 'next' when it is passed on.
  const send = (method, path, body) => new Promise((resolve, reject) => {
    const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))])
    Object.assign(req, { method, url: path, originalUrl: path, headers: { host: 'localhost:3000', 'content-type': 'application/json' } })
    const headers = {}
    const res = {
      statusCode: 200,
      setHeader: (name, value) => { headers[name.toLowerCase()] = value },
      end: (chunk) => resolve({ status: res.statusCode, headers, body: JSON.parse(Buffer.from(chunk).toString()) }),
    }
    middleware(req, res, (error) => (error ? reject(error) : resolve('next')))
  })

  return { send, functions, server, logged }
}

describe('an inquiry, POST /api/odoo-lead', () => {
  it('is answered by the dev server when ODOO_URL is not set, so no lead reaches the CRM', async () => {
    const { send, functions, server, logged } = devServer()

    const answer = await send('POST', '/api/odoo-lead', INQUIRY)

    expect(answer.status).toBe(200)
    expect(answer.body).toEqual({ ok: true, dev: true })
    expect(answer.headers['cache-control']).toBe('no-store')
    expect(server.ssrLoadModule).not.toHaveBeenCalled()
    expect(functions.fetch).not.toHaveBeenCalled()
    // The log says what came in and how to send it for real.
    expect(logged.join('\n')).toContain(INQUIRY.email)
    expect(logged.join('\n')).toContain('ODOO_URL')
  })

  it('reaches the function, body and all, when ODOO_URL is set in the shell', async () => {
    process.env.ODOO_URL = 'http://127.0.0.1:9'
    const { send, functions } = devServer()

    const answer = await send('POST', '/api/odoo-lead', INQUIRY)

    expect(answer.body).toEqual({ handledBy: 'function', method: 'POST' })
    expect(functions.fetch).toHaveBeenCalledTimes(1)
    expect(await functions.fetch.mock.calls[0][0].json()).toEqual(INQUIRY)
  })

  it('reaches the function when ODOO_URL is set in .env', async () => {
    const { send, functions } = devServer({ env: 'ODOO_URL=http://127.0.0.1:9\n' })

    const answer = await send('POST', '/api/odoo-lead', INQUIRY)

    expect(answer.body).toEqual({ handledBy: 'function', method: 'POST' })
    expect(functions.fetch).toHaveBeenCalledTimes(1)
  })
})

describe('every other request', () => {
  it.each([
    // The health check: it asks Odoo for its version and creates nothing.
    ['GET', '/api/odoo-lead'],
    ['PUT', '/api/odoo-lead'],
    ['GET', '/api/availability'],
    ['POST', '/api/availability'],
  ])('%s %s reaches its function', async (method, path) => {
    const { send, functions, server } = devServer()

    const answer = await send(method, path)

    expect(answer.body).toEqual({ handledBy: 'function', method })
    expect(server.ssrLoadModule).toHaveBeenCalledWith(`${path}.js`)
    expect(functions.fetch).toHaveBeenCalledTimes(1)
  })

  it("passes the function's answer on as it is", async () => {
    const { send } = devServer()

    const answer = await send('PUT', '/api/odoo-lead')

    expect(answer.status).toBe(405)
    expect(answer.headers['content-type']).toMatch(/^application\/json/)
  })

  it('outside api/ goes on to React Router', async () => {
    const { send, server } = devServer()

    expect(await send('GET', '/kontakti')).toBe('next')
    expect(server.ssrLoadModule).not.toHaveBeenCalled()
  })
})
