// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Production contract for api/odoo-lead.js (main @151c060): the Vercel
// function that turns a contact-form inquiry into a Lead in Odoo CRM.
//
// This file lives in tests/, never in api/: Vercel deploys every file in api/
// as a serverless function.

const ENDPOINT = 'http://localhost/api/odoo-lead'
const DEFAULT_ODOO = 'https://ksmstroy.odoo.com'

const VALID = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  phone: '+359 888 123 456',
  projectType: 'Жилищно строителство',
  budget: '100,000 - 500,000 лв',
  message: 'Интересувам се от тристаен апартамент в Golden Residence.',
}

const post = (body) =>
  new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const get = () => new Request(ENDPOINT, { method: 'GET' })

const odooAnswers = (body, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// A fetch that never answers on its own and fails the way fetch does when the
// caller's AbortController fires. `called` settles once the function has
// started the request, which is after it set its timeout.
function silentOdoo() {
  let markCalled
  const called = new Promise((resolve) => { markCalled = resolve })
  const fetch = vi.fn((url, init) => {
    markCalled()
    return new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')))
    })
  })
  return { fetch, called }
}

let fetchMock
let errorLog

// ODOO_URL and ODOO_TEAM_ID are read when the module loads, so every test
// sets the environment first and imports a fresh copy. `undefined` unsets.
async function loadHandler({ ODOO_URL, ODOO_TEAM_ID } = {}) {
  vi.stubEnv('ODOO_URL', ODOO_URL)
  vi.stubEnv('ODOO_TEAM_ID', ODOO_TEAM_ID)
  vi.resetModules()
  const { default: handler } = await import('../../api/odoo-lead.js')
  return handler
}

// The urlencoded form the function posts to Odoo.
const leadSent = (call = 0) => new URLSearchParams(fetchMock.mock.calls[call][1].body)

beforeEach(() => {
  fetchMock = vi.fn(async () => odooAnswers({ id: 42 }))
  vi.stubGlobal('fetch', fetchMock)
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('where the lead goes', () => {
  it('posts to the public website form of https://ksmstroy.odoo.com by default', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post(VALID))

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${DEFAULT_ODOO}/website/form/crm.lead`)
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('content-type')).toBe('application/x-www-form-urlencoded')
  })

  it('uses ODOO_URL when it is set, without a trailing slash', async () => {
    const handler = await loadHandler({ ODOO_URL: 'https://crm.example.test/' })
    await handler.fetch(post(VALID))

    expect(fetchMock.mock.calls[0][0]).toBe('https://crm.example.test/website/form/crm.lead')
  })

  it('files the lead under sales team 1 by default', async () => {
    const handler = await loadHandler()
    await handler.fetch(post(VALID))

    expect(leadSent().get('team_id')).toBe('1')
  })

  it('files the lead under ODOO_TEAM_ID when it is set', async () => {
    const handler = await loadHandler({ ODOO_TEAM_ID: '7' })
    await handler.fetch(post(VALID))

    expect(leadSent().get('team_id')).toBe('7')
  })
})

describe('the lead it creates', () => {
  it('carries every field of the inquiry', async () => {
    const handler = await loadHandler()
    await handler.fetch(post(VALID))

    const lead = leadSent()
    expect(lead.get('name')).toContain(VALID.name)
    expect(lead.get('name')).toContain(VALID.projectType)
    expect(lead.get('contact_name')).toBe(VALID.name)
    expect(lead.get('email_from')).toBe(VALID.email)
    expect(lead.get('phone')).toBe(VALID.phone)
    expect(lead.get('description')).toBe(VALID.message)
    expect(lead.get('Тип проект')).toBe(VALID.projectType)
    expect(lead.get('Бюджет')).toBe(VALID.budget)
    expect(lead.get('Източник')).toContain('ksmstroy.com')
  })

  it('still creates a lead when the optional fields are empty', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ ...VALID, phone: '', projectType: '', budget: '' }))

    expect(res.status).toBe(200)
    const lead = leadSent()
    expect(lead.get('name')).toContain('Общо запитване')
    expect(lead.get('Бюджет')).toBe('Не е посочен')
    expect(lead.has('phone')).toBe(false)
  })

  it('trims whitespace around the fields', async () => {
    const handler = await loadHandler()
    await handler.fetch(post({ ...VALID, name: `  ${VALID.name}  `, email: ` ${VALID.email} ` }))

    expect(leadSent().get('contact_name')).toBe(VALID.name)
    expect(leadSent().get('email_from')).toBe(VALID.email)
  })
})

describe('validation', () => {
  it.each([
    ['a name shorter than 2 characters', { name: 'И' }, ['name']],
    ['a name of whitespace only', { name: '   ' }, ['name']],
    ['an email without a domain', { email: 'ivan@' }, ['email']],
    ['an email without an @', { email: 'ivan.example.com' }, ['email']],
    ['a message shorter than 10 characters', { message: 'Здравейте' }, ['message']],
    ['a missing name, email and message', { name: undefined, email: undefined, message: undefined }, ['name', 'email', 'message']],
  ])('rejects %s with 400 and never calls Odoo', async (_, change, fields) => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ ...VALID, ...change }))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'Validation failed', fields })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts the shortest valid inquiry', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ name: 'Ив', email: 'a@b.bg', message: '1234567890' }))

    expect(res.status).toBe(200)
  })

  it('cuts oversized fields to their limits instead of rejecting the inquiry', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({
      name: 'Я'.repeat(300),
      email: VALID.email,
      phone: '9'.repeat(80),
      projectType: 'Т'.repeat(300),
      budget: 'Б'.repeat(150),
      message: 'С'.repeat(6000),
    }))

    expect(res.status).toBe(200)
    const lead = leadSent()
    expect(lead.get('contact_name')).toHaveLength(200)
    expect(lead.get('phone')).toHaveLength(50)
    expect(lead.get('Тип проект')).toHaveLength(200)
    expect(lead.get('Бюджет')).toHaveLength(100)
    expect(lead.get('description')).toHaveLength(5000)
  })

  it('ignores fields that are not strings', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ ...VALID, phone: 359888123456, budget: { min: 1 } }))

    expect(res.status).toBe(200)
    expect(leadSent().has('phone')).toBe(false)
    expect(leadSent().get('Бюджет')).toBe('Не е посочен')
  })

  it.each([
    ['a body that is not JSON', 'name=Иван'],
    ['a JSON null', 'null'],
    ['a JSON string', '"Иван Петров"'],
  ])('rejects %s with 400', async (_, body) => {
    const handler = await loadHandler()
    const res = await handler.fetch(post(body))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid JSON body' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['PUT', 'DELETE', 'PATCH'])('answers %s with 405 and names the allowed methods', async (method) => {
    const handler = await loadHandler()
    const res = await handler.fetch(new Request(ENDPOINT, { method, body: JSON.stringify(VALID) }))

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET, POST')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('no honeypot (main @fe406af)', () => {
  // A hidden "company" field used to be autofilled by browsers, and the
  // inquiry was thrown away as spam without a trace.
  it('creates the lead when a company field is filled in', async () => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ ...VALID, company: 'КСМ Строй ООД' }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, id: 42 })
  })

  it.each(['website', 'url', 'honeypot', 'fax'])('creates the lead when a "%s" field is filled in', async (field) => {
    const handler = await loadHandler()
    const res = await handler.fetch(post({ ...VALID, [field]: 'http://spam.example' }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(200)
  })
})

describe('POST outcome', () => {
  it('answers 200 with the id of the lead Odoo created', async () => {
    fetchMock.mockResolvedValueOnce(odooAnswers({ id: 1234 }))
    const handler = await loadHandler()
    const res = await handler.fetch(post(VALID))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, id: 1234 })
  })

  it.each([
    ['Odoo answers HTTP 500', () => odooAnswers('Internal Server Error', 500)],
    ['Odoo answers HTTP 404', () => odooAnswers('Not Found', 404)],
    ['Odoo refuses fields', () => odooAnswers({ error_fields: ['email_from'] })],
    ['Odoo reports an error', () => odooAnswers({ error: 'crm.lead is not available' })],
    ['Odoo answers false', () => odooAnswers('false')],
    ['Odoo answers something that is not JSON', () => odooAnswers('<html>Odoo</html>')],
  ])('answers 502 and logs it when %s', async (_, reply) => {
    fetchMock.mockImplementation(async () => reply())
    const handler = await loadHandler()
    const res = await handler.fetch(post(VALID))

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'CRM unavailable' })
    expect(errorLog).toHaveBeenCalled()
  })

  it('answers 502 and logs it when Odoo cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    const handler = await loadHandler()
    const res = await handler.fetch(post(VALID))

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'CRM unavailable' })
    expect(errorLog).toHaveBeenCalled()
  })

  it('gives up on a silent Odoo within 8 seconds with 502', async () => {
    const odoo = silentOdoo()
    vi.stubGlobal('fetch', odoo.fetch)
    const handler = await loadHandler()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const pending = handler.fetch(post(VALID))
    await odoo.called
    await vi.advanceTimersByTimeAsync(8000)
    const res = await pending

    expect(res.status).toBe(502)
    expect(errorLog).toHaveBeenCalled()
  })
})

describe('GET health check', () => {
  const versionAnswer = () => odooAnswers({ jsonrpc: '2.0', id: 1, result: { server_version: '18.0' } })

  it('answers 200 when Odoo answers, without creating a lead', async () => {
    fetchMock.mockImplementation(async () => versionAnswer())
    const handler = await loadHandler()
    const res = await handler.fetch(get())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.crm).toMatchObject({ reachable: true, version: '18.0', teamId: '1' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${DEFAULT_ODOO}/jsonrpc`)
    expect(JSON.parse(init.body).params).toMatchObject({ service: 'common', method: 'version' })
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('crm.lead'))).toBe(false)
  })

  it('is never cached, so a cached 200 cannot hide an outage', async () => {
    fetchMock.mockImplementation(async () => versionAnswer())
    const handler = await loadHandler()
    const res = await handler.fetch(get())

    expect(res.headers.get('cache-control')).toContain('no-store')
  })

  it.each([
    ['Odoo cannot be reached', () => Promise.reject(new TypeError('fetch failed'))],
    ['Odoo answers HTTP 502', async () => odooAnswers('Bad Gateway', 502)],
    ['Odoo answers without a server version', async () => odooAnswers({ jsonrpc: '2.0', id: 1, result: {} })],
  ])('answers 503 and logs it when %s', async (_, reply) => {
    fetchMock.mockImplementation(reply)
    const handler = await loadHandler()
    const res = await handler.fetch(get())

    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.crm.reachable).toBe(false)
    expect(res.headers.get('cache-control')).toContain('no-store')
    expect(errorLog).toHaveBeenCalled()
  })

  it('answers 503 within 5 seconds when Odoo stays silent', async () => {
    const odoo = silentOdoo()
    vi.stubGlobal('fetch', odoo.fetch)
    const handler = await loadHandler()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const pending = handler.fetch(get())
    await odoo.called
    await vi.advanceTimersByTimeAsync(5000)
    const res = await pending

    expect(res.status).toBe(503)
    expect(errorLog).toHaveBeenCalled()
  })

  it('checks the host in ODOO_URL', async () => {
    fetchMock.mockImplementation(async () => versionAnswer())
    const handler = await loadHandler({ ODOO_URL: 'https://crm.example.test' })
    await handler.fetch(get())

    expect(fetchMock.mock.calls[0][0]).toBe('https://crm.example.test/jsonrpc')
  })
})
