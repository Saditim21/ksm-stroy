import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Contact from '../../src/pages/Contact'

// Production contract for the contact form (main @151c060): every inquiry goes
// to EmailJS and, best effort, to /api/odoo-lead. Only EmailJS decides what the
// visitor sees. The CRM payload has no honeypot field (main @fe406af).

const emailjs = vi.hoisted(() => ({ send: vi.fn(), init: vi.fn() }))
vi.mock('@emailjs/browser', () => ({ default: emailjs, send: emailjs.send, init: emailjs.init }))

const INQUIRY = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  phone: '+359 888 123 456',
  message: 'Интересувам се от тристаен апартамент в Golden Residence.',
}

const SUCCESS = /изпратено успешно/i
const FAILURE = /грешка/i

const odooAccepts = () => ({ ok: true, status: 200, json: async () => ({ ok: true, id: 42 }) })

let fetchMock

const odooCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/odoo-lead'))

// The first real choice of a <select>, whatever its options say.
const firstChoice = (select) =>
  within(select).getAllByRole('option').map((option) => option.value).find(Boolean)

function renderContact() {
  render(
    <MemoryRouter initialEntries={['/contact']}>
      <Contact />
    </MemoryRouter>,
  )
}

// Fills the form the way a visitor does and sends it. Returns what was chosen.
async function fillAndSend() {
  const user = userEvent.setup({ delay: null })
  // "Име", but not the "Име" in "Имейл".
  await user.type(screen.getByLabelText(/име(?!йл)/i), INQUIRY.name)
  await user.type(screen.getByLabelText(/имейл/i), INQUIRY.email)
  await user.type(screen.getByLabelText(/телефон/i), INQUIRY.phone)

  const projectTypeSelect = screen.getByLabelText(/тип проект/i)
  const projectType = firstChoice(projectTypeSelect)
  await user.selectOptions(projectTypeSelect, projectType)

  const budgetSelect = screen.getByLabelText(/бюджет/i)
  const budget = firstChoice(budgetSelect)
  await user.selectOptions(budgetSelect, budget)

  await user.type(screen.getByLabelText(/съобщение/i), INQUIRY.message)
  await user.click(screen.getByRole('button', { name: /изпрати/i }))
  return { ...INQUIRY, projectType, budget }
}

beforeEach(() => {
  emailjs.send.mockReset()
  emailjs.send.mockResolvedValue({ status: 200, text: 'OK' })
  emailjs.init.mockReset()
  fetchMock = vi.fn(async () => odooAccepts())
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the inquiry sent to the CRM', () => {
  it('posts exactly name, email, phone, projectType, budget and message to /api/odoo-lead', async () => {
    renderContact()
    const sent = await fillAndSend()

    await waitFor(() => expect(odooCalls()).toHaveLength(1))
    const [url, init] = odooCalls()[0]
    expect(url).toBe('/api/odoo-lead')
    expect(init.method).toBe('POST')

    const body = JSON.parse(init.body)
    expect(Object.keys(body).sort()).toEqual(['budget', 'email', 'message', 'name', 'phone', 'projectType'])
    expect(body).toEqual({
      name: sent.name,
      email: sent.email,
      phone: sent.phone,
      projectType: sent.projectType,
      budget: sent.budget,
      message: sent.message,
    })
    expect(body).not.toHaveProperty('company')
  })

  it('sends nothing while a required field is missing', async () => {
    renderContact()
    const user = userEvent.setup({ delay: null })
    await user.type(screen.getByLabelText(/имейл/i), INQUIRY.email)
    await user.click(screen.getByRole('button', { name: /изпрати/i }))

    // Let a (wrong) submit run its course before looking.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(emailjs.send).not.toHaveBeenCalled()
    expect(odooCalls()).toHaveLength(0)
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument()
  })
})

describe('what the visitor sees', () => {
  it('shows the success message once EmailJS has sent the email, not before', async () => {
    let emailSent
    emailjs.send.mockImplementation(() => new Promise((resolve) => { emailSent = () => resolve({ status: 200, text: 'OK' }) }))

    renderContact()
    await fillAndSend()

    await waitFor(() => expect(emailjs.send).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(odooCalls()).toHaveLength(1))
    // The CRM has accepted the inquiry; the email is still on its way.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument()

    emailSent()
    expect(await screen.findByText(SUCCESS)).toBeInTheDocument()
    expect(screen.queryByText(FAILURE)).not.toBeInTheDocument()
  })

  it('still shows success when the CRM is down, because the email went out', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockImplementation(async () => ({ ok: false, status: 502, json: async () => ({ ok: false, error: 'CRM unavailable' }) }))

    renderContact()
    await fillAndSend()

    expect(await screen.findByText(SUCCESS)).toBeInTheDocument()
    expect(odooCalls()).toHaveLength(1)
    expect(screen.queryByText(FAILURE)).not.toBeInTheDocument()
  })

  it('still shows success when the CRM cannot be reached at all', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')))

    renderContact()
    await fillAndSend()

    expect(await screen.findByText(SUCCESS)).toBeInTheDocument()
  })

  it('shows an error, not success, when EmailJS fails even though the CRM accepted', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    emailjs.send.mockRejectedValue({ status: 400, text: 'The service ID is invalid' })

    renderContact()
    await fillAndSend()

    expect(await screen.findByText(FAILURE)).toBeInTheDocument()
    expect(screen.queryByText(SUCCESS)).not.toBeInTheDocument()
    expect(odooCalls()).toHaveLength(1)
  })
})

describe('the email', () => {
  // The EmailJS template on emailjs.com reads these variables by name.
  it('goes to the EmailJS template with the variables it reads', async () => {
    renderContact()
    const sent = await fillAndSend()

    await waitFor(() => expect(emailjs.send).toHaveBeenCalledTimes(1))
    const [serviceId, templateId, params, publicKey] = emailjs.send.mock.calls[0]
    expect(serviceId).toBe('service_qdte1vp')
    expect(templateId).toBe('template_zsun0cc')
    expect(publicKey).toBe('iDCcC1JI_k69MIid0')
    expect(params).toMatchObject({
      from_name: sent.name,
      from_email: sent.email,
      reply_to: sent.email,
      phone: sent.phone,
      project_type: sent.projectType,
      budget: sent.budget,
      message: sent.message,
      to_email: 'ksm_str@abv.bg',
    })
  })
})
