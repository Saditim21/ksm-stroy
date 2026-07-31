/**
 * Създава Lead в Odoo CRM от формата за запитване на сайта.
 *
 * Изпраща server-side към публичния Odoo endpoint /website/form/crm.lead,
 * така че не са нужни никакви пароли или API ключове, а адресът на Odoo
 * не попада в браузърния bundle.
 *
 * ВАЖНО: този endpoint е допълнение към EmailJS, не замяна. Ако Odoo е
 * недостъпен, формата на сайта продължава да работи и клиентът пак получава
 * имейл - виж onSubmit в src/pages/Contact.jsx.
 *
 * Ползва Web Handler signature (export default { fetch }), който Vercel
 * документира за проекти без Next.js.
 */

const ODOO_URL = (process.env.ODOO_URL || 'https://edu-ksmstroy.odoo.com').replace(/\/+$/, '')
const ODOO_TIMEOUT_MS = 8000

// Екип продажби в Odoo. Подаването на team_id е важно: website_crm решава
// дали записът е Lead или Opportunity според отметката "use_leads" на екипа.
// Без него запитването влиза направо в pipeline-а като Opportunity.
const ODOO_TEAM_ID = process.env.ODOO_TEAM_ID || '1'

// Ограниченията отговарят на валидацията в src/pages/Contact.jsx
const LIMITS = {
  name: 200,
  email: 250,
  phone: 50,
  projectType: 200,
  budget: 100,
  message: 5000
}

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })

const clean = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

function validate(payload) {
  const errors = []

  if (payload.name.length < 2) {
    errors.push('name')
  }
  if (!EMAIL_PATTERN.test(payload.email)) {
    errors.push('email')
  }
  if (payload.message.length < 10) {
    errors.push('message')
  }

  return errors
}

function buildOdooBody(payload) {
  const projectType = payload.projectType || 'Общо запитване'

  const body = new URLSearchParams()

  // Заглавие на Lead-а в pipeline-а. crm.lead.name е задължително поле.
  body.set('name', `Запитване от сайта: ${projectType} — ${payload.name}`)
  body.set('contact_name', payload.name)
  body.set('email_from', payload.email)
  body.set('description', payload.message)

  if (payload.phone) {
    body.set('phone', payload.phone)
  }

  if (ODOO_TEAM_ID) {
    body.set('team_id', ODOO_TEAM_ID)
  }

  // Полета, които не са част от crm.lead. Odoo ги събира автоматично
  // и ги добавя към Lead-а като "custom fields".
  body.set('Тип проект', projectType)
  body.set('Бюджет', payload.budget || 'Не е посочен')
  body.set('Източник', 'Форма за контакт - ksmstroy.com')
  body.set('Изпратено на', new Date().toISOString())

  return body
}

async function createOdooLead(payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ODOO_TIMEOUT_MS)

  try {
    const response = await fetch(`${ODOO_URL}/website/form/crm.lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildOdooBody(payload).toString(),
      signal: controller.signal
    })

    const text = await response.text()

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}`, detail: text.slice(0, 500) }
    }

    // Odoo винаги връща JSON: {"id": N} при успех, {"error_fields": [...]}
    // при невалидни полета, {"error": "..."} при липсващ модел, false при
    // integrity грешка.
    let result
    try {
      result = JSON.parse(text)
    } catch {
      return { ok: false, reason: 'Невалиден JSON от Odoo', detail: text.slice(0, 500) }
    }

    if (result && typeof result.id === 'number') {
      return { ok: true, id: result.id }
    }
    if (result && result.error_fields) {
      return { ok: false, reason: 'Odoo отказа полета', detail: result.error_fields }
    }
    if (result && result.error) {
      return { ok: false, reason: 'Odoo грешка', detail: result.error }
    }

    return { ok: false, reason: 'Odoo не създаде запис', detail: result }
  } finally {
    clearTimeout(timeout)
  }
}

export default {
  async fetch(request) {
    // GET е health check - позволява да се провери че endpoint-ът е
    // деплойнат и рутван правилно, без да създава Lead в Odoo.
    if (request.method === 'GET') {
      return json({ ok: true, service: 'odoo-lead', crmConfigured: Boolean(ODOO_URL) })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'GET, POST' }
      })
    }

    let raw
    try {
      raw = await request.json()
    } catch {
      return json({ ok: false, error: 'Invalid JSON body' }, 400)
    }

    if (!raw || typeof raw !== 'object') {
      return json({ ok: false, error: 'Invalid JSON body' }, 400)
    }

    // Honeypot: истинските посетители не виждат това поле. Връщаме успех,
    // за да не разбере ботът, че е отрязан.
    if (clean(raw.company, 200)) {
      return json({ ok: true, skipped: true })
    }

    const payload = {
      name: clean(raw.name, LIMITS.name),
      email: clean(raw.email, LIMITS.email),
      phone: clean(raw.phone, LIMITS.phone),
      projectType: clean(raw.projectType, LIMITS.projectType),
      budget: clean(raw.budget, LIMITS.budget),
      message: clean(raw.message, LIMITS.message)
    }

    const errors = validate(payload)
    if (errors.length > 0) {
      return json({ ok: false, error: 'Validation failed', fields: errors }, 400)
    }

    try {
      const result = await createOdooLead(payload)

      if (result.ok) {
        return json({ ok: true, id: result.id })
      }

      console.error('[odoo-lead] Odoo не създаде Lead:', result.reason, result.detail)
      return json({ ok: false, error: 'CRM unavailable' }, 502)
    } catch (error) {
      const reason = error?.name === 'AbortError'
        ? `timeout след ${ODOO_TIMEOUT_MS}ms`
        : error?.message
      console.error('[odoo-lead] Заявката към Odoo пропадна:', reason)
      return json({ ok: false, error: 'CRM unavailable' }, 502)
    }
  }
}
