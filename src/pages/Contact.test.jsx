import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Contact from './Contact'

const send = vi.fn(async () => ({ status: 200, text: 'OK' }))
vi.mock('@emailjs/browser', () => ({ default: { send: (...args) => send(...args) } }))

test('prefills message from ?apartment= query param', () => {
  render(
    <MemoryRouter initialEntries={['/contact?apartment=А 301']}>
      <Contact />
    </MemoryRouter>,
  )
  const textarea = screen.getByRole('textbox', { name: /съобщение/i })
  expect(textarea.value).toContain('А 301')
})

// The Odoo CRM integration rewrote onSubmit; the prefilled enquiry has to keep
// reaching both destinations, not just the textarea.
test('prefilled message reaches both the EmailJS and the Odoo payloads', async () => {
  send.mockClear()
  const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ id: 1 }) }))
  vi.stubGlobal('fetch', fetchMock)

  render(
    <MemoryRouter initialEntries={['/contact?apartment=А 301']}>
      <Contact />
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByRole('textbox', { name: /име и фамилия/i }), { target: { value: 'Иван Иванов' } })
  fireEvent.change(screen.getByRole('textbox', { name: /имейл/i }), { target: { value: 'ivan@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: /изпрати съобщение/i }))

  await waitFor(() => expect(fetchMock).toHaveBeenCalled())

  const [url, init] = fetchMock.mock.calls[0]
  expect(url).toBe('/api/odoo-lead')
  expect(JSON.parse(init.body).message).toContain('А 301')
  expect(send.mock.calls[0][2].message).toContain('А 301')

  vi.unstubAllGlobals()
})
