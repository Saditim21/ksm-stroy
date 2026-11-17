import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EMAIL_PATTERN as OWN_PATTERN } from './emailPattern'
import { buildLead, EMAIL_PATTERN, sendInquiry } from './inquiry'

// The inquiry the new forms send (spec §10): one lead, in exactly the six
// fields the lead proxy reads (api/odoo-lead.js), and the email through
// Contact's EmailJS template. The proxy drops a lead without a trace when its
// name is under 2 characters or its message under 10, so the lead is made
// valid here: the name trimmed, a short message topped up with its subject.
// Every build but production marks the subject „[ТЕСТ]“ (spec §14.3).

const emailjs = vi.hoisted(() => ({ send: vi.fn(), init: vi.fn() }))
vi.mock('@emailjs/browser', () => ({ default: emailjs, send: emailjs.send, init: emailjs.init }))

const fields = { name: ' Иван Петров ', email: 'ivan@example.bg', phone: '+359 888 123 456', subject: 'Golden Residence', picks: ['А 301', 'А 302'], message: '' }

describe('buildLead', () => {
  it('subjects a production lead with the option and the picks', () => {
    const { odoo } = buildLead(fields, { production: true })
    expect(Object.keys(odoo).sort()).toEqual(['budget', 'email', 'message', 'name', 'phone', 'projectType'])
    expect(odoo).toEqual({ name: 'Иван Петров', email: 'ivan@example.bg', phone: '+359 888 123 456',
      projectType: 'Golden Residence – А 301, А 302', budget: '', message: 'Запитване за: Golden Residence – А 301, А 302' })
  })

  it('tags every other build [ТЕСТ], in Odoo and in the email', () => {
    const { odoo, emailParams } = buildLead(fields, { production: false })
    expect(odoo.projectType).toBe('[ТЕСТ] Golden Residence – А 301, А 302')
    expect(emailParams.project_type).toBe('[ТЕСТ] Golden Residence – А 301, А 302')
  })

  it('keeps a message of 10 characters or more, trimmed', () =>
    expect(buildLead({ ...fields, message: '  Кога е готова сградата?  ' }, { production: true }).odoo.message).toBe('Кога е готова сградата?'))

  it('adds the subject to a message under 10 characters', () =>
    expect(buildLead({ ...fields, picks: [], message: 'Здравейте' }, { production: true }).odoo.message).toBe('Здравейте\nЗапитване за: Golden Residence'))

  it('fills the EmailJS template', () => expect(buildLead(fields, { production: true }).emailParams).toEqual({
    from_name: 'Иван Петров', from_email: 'ivan@example.bg', reply_to: 'ivan@example.bg', phone: '+359 888 123 456',
    project_type: 'Golden Residence – А 301, А 302', budget: 'Не е посочен',
    message: 'Запитване за: Golden Residence – А 301, А 302', to_email: 'ksm_str@abv.bg' }))

  // The forms check the email against the proxy's own pattern (spec §10), so
  // an address the form lets through is one the proxy accepts.
  it('checks the email by the lead proxy’s own pattern', () => {
    const proxy = readFileSync(join(cwd(), 'api/odoo-lead.js'), 'utf8')
    expect(proxy).toContain(`const EMAIL_PATTERN = ${EMAIL_PATTERN}`)
  })

  // The form checks an email before the send path has loaded (useInquiryForm.jsx
  // loads this module on its first use), so the pattern is a module of its
  // own, which this one hands on to its importers.
  it("EMAIL_PATTERN is the proxy's pattern, from emailPattern.js", () => expect(EMAIL_PATTERN).toBe(OWN_PATTERN))

  // Spec M3/M4 §7.3, §8: Контакти's construction subject sends its „Тип
  // проект“ after the subject, and its „Бюджет“ as production's range string
  // (the form shows „50 000 – 100 000 лв.“ and sends „50,000 - 100,000 лв“),
  // in the same six fields, so the CRM's values stay as they were.
  describe('the construction subject', () => {
    const build = { ...fields, subject: 'Строителство или ремонт', picks: [], message: 'Ремонт на апартамент от 80 кв.м.' }

    it('sends „Строителство или ремонт – {Тип проект}“ and the range’s production string, in exactly six fields, „[ТЕСТ] “ first', () => {
      const { odoo, emailParams } = buildLead({ ...build, kind: 'Ремонти и реновации', budget: '50,000 - 100,000 лв' }, { production: false })
      expect(Object.keys(odoo).sort()).toEqual(['budget', 'email', 'message', 'name', 'phone', 'projectType'])
      expect(odoo.projectType).toBe('[ТЕСТ] Строителство или ремонт – Ремонти и реновации')
      expect(odoo.budget).toBe('50,000 - 100,000 лв')
      expect(emailParams.project_type).toBe('[ТЕСТ] Строителство или ремонт – Ремонти и реновации')
      expect(emailParams.budget).toBe('50,000 - 100,000 лв')
    })

    it('in production, carries no mark', () => {
      const { odoo } = buildLead({ ...build, kind: 'Жилищно строителство', budget: 'Над 1,000,000 лв' }, { production: true })
      expect(odoo).toMatchObject({ projectType: 'Строителство или ремонт – Жилищно строителство', budget: 'Над 1,000,000 лв' })
    })

    it('sends the bare subject without a kind, and no budget without a range', () => {
      const { odoo, emailParams } = buildLead({ ...build, kind: '', budget: '' }, { production: true })
      expect(odoo).toMatchObject({ projectType: 'Строителство или ремонт', budget: '' })
      expect(emailParams.budget).toBe('Не е посочен')
    })

    it('tops a short message up with the subject and its kind', () => {
      expect(buildLead({ ...build, kind: 'Комерсиални проекти', budget: '', message: 'Оферта' }, { production: true }).odoo.message)
        .toBe('Оферта\nЗапитване за: Строителство или ремонт – Комерсиални проекти')
    })
  })
})

// sendInquiry: EmailJS and the CRM in parallel, as the Contact page sends
// them (tests/contracts/contact-form.test.jsx). Only EmailJS decides what the
// visitor sees: the CRM's failure goes to the console alone. Tests are no
// production build, so the subject carries „[ТЕСТ]“.
describe('sendInquiry', () => {
  const { odoo, emailParams } = buildLead(fields, { production: false })
  let fetchMock
  const crmCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/odoo-lead')

  beforeEach(() => {
    emailjs.send.mockReset()
    emailjs.send.mockResolvedValue({ status: 200, text: 'OK' })
    fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true, id: 42 }) }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts the lead to /api/odoo-lead once, as JSON with exactly the six fields', async () => {
    await expect(sendInquiry(fields)).resolves.toEqual({ ok: true })
    expect(crmCalls()).toHaveLength(1)
    const [, init] = crmCalls()[0]
    expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    expect(JSON.parse(init.body)).toEqual(odoo)
  })

  it('sends the email through Contact’s EmailJS service and template', async () => {
    await sendInquiry(fields)
    expect(emailjs.send).toHaveBeenCalledTimes(1)
    expect(emailjs.send).toHaveBeenCalledWith('service_qdte1vp', 'template_zsun0cc', emailParams, 'iDCcC1JI_k69MIid0')
  })

  it('marks no subject „[ТЕСТ]“ in a production build', async () => {
    vi.stubGlobal('IS_PRODUCTION_BUILD', true)
    await sendInquiry(fields)
    expect(JSON.parse(crmCalls()[0][1].body).projectType).toBe('Golden Residence – А 301, А 302')
    expect(emailjs.send.mock.calls[0][2].project_type).toBe('Golden Residence – А 301, А 302')
  })

  it('is sent when the CRM answers 502, and the failure goes to the console', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockImplementation(async () => ({ ok: false, status: 502, json: async () => ({ ok: false, error: 'CRM unavailable' }) }))
    await expect(sendInquiry(fields)).resolves.toEqual({ ok: true })
    expect(error).toHaveBeenCalled()
  })

  it('is sent when the CRM cannot be reached at all', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(sendInquiry(fields)).resolves.toEqual({ ok: true })
    expect(error).toHaveBeenCalled()
  })

  it('is not sent when EmailJS rejects, though the CRM accepted it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    emailjs.send.mockRejectedValue({ status: 400, text: 'The service ID is invalid' })
    await expect(sendInquiry(fields)).resolves.toEqual({ ok: false })
    expect(crmCalls()).toHaveLength(1)
  })
})
