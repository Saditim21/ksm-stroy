import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { HOME_INQUIRY } from '../../pages/home/inquiry'
import InquiryForm from './InquiryForm'

// The send path (sendPath.js: the form's checks, src/services/inquiry.js, and
// EmailJS behind it, with the thank-you) is a chunk of its own, out of the
// first-load JS of every page with the form (spec §10, FR5, ruling T2a): the
// form starts loading it as the visitor first steps into it, and a send
// waits for it. These cases have a file of their own (ruling PF12), so no
// other case has loaded the send path before them.

// The send path's stand-in: it counts its loads, and fails to load, as a
// chunk that never arrives, while `failing` is set.
const service = vi.hoisted(() => {
  const stub = { loads: 0, failing: false, sendInquiry: vi.fn(async () => ({ ok: true })) }
  stub.load = () => {
    stub.loads += 1
    if (stub.failing) throw new Error('Failed to fetch dynamically imported module')
    return { sendInquiry: stub.sendInquiry }
  }
  return stub
})
vi.mock('../../services/inquiry', () => service.load())

const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'
const FAILED = 'Запитването не беше изпратено. Опитайте отново или се обадете на +359 887 886 166.'

const field = (label) => screen.getByLabelText(label)
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Изпратете запитване' }))

function fill() {
  fireEvent.change(field('Име'), { target: { value: 'Иван Петров' } })
  fireEvent.change(field('Телефон'), { target: { value: '+359 888 123 456' } })
  fireEvent.change(field('Имейл'), { target: { value: 'ivan@example.bg' } })
  fireEvent.click(screen.getByRole('checkbox', { name: CONSENT }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

it('does not load the send service before the form is used', async () => {
  render(<InquiryForm page="home" options={HOME_INQUIRY.options} />)
  expect(service.loads).toBe(0)

  fireEvent.focusIn(field('Име'))
  await waitFor(() => expect(service.loads).toBe(1))

  fill()
  submit()
  await waitFor(() => expect(service.sendInquiry).toHaveBeenCalledTimes(1))
  expect(await screen.findByRole('status')).toHaveTextContent('Благодарим ви.')
  expect(service.loads).toBe(1)
})

// A load that failed (offline, or a new deploy replaced the chunk) is not
// kept: the send says it failed, as one EmailJS refused, and the next send
// loads the path again. The load that starts on focus fails quietly.
it('says an inquiry whose send path did not load was not sent, and loads it again for the next send', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  // A fresh form, whose send path's chunk (sendPath.js, what the form
  // imports) never loads, so this case neither finds a send path loaded
  // before it nor leaves one loaded.
  let attempts = 0
  vi.resetModules()
  vi.doMock('./sendPath', () => {
    attempts += 1
    throw new Error('Failed to fetch dynamically imported module')
  })
  try {
    const { default: FreshForm } = await import('./InquiryForm')
    render(<FreshForm page="home" options={HOME_INQUIRY.options} />)

    fireEvent.focusIn(field('Име'))
    await waitFor(() => expect(attempts).toBe(1))
    fill()
    submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(FAILED)
    expect(attempts).toBe(2)
    expect(document.querySelector('form')).not.toHaveAttribute('aria-busy')
    expect(field('Име')).toHaveValue('Иван Петров')
    expect(errors).toHaveBeenCalledWith('[inquiry] the send did not load:', expect.any(Error))

    submit()
    await waitFor(() => expect(attempts).toBe(3))
    expect(await screen.findByRole('alert')).toHaveTextContent(FAILED)
    expect(screen.queryByRole('status')).toBeNull()
  } finally {
    // The send path itself again, with nothing loaded through it.
    vi.doUnmock('./sendPath')
  }
})

// Ruling T2a: the checks come with the send path. A send tried before the
// path is in (a click that never focused the form, as Safari's on a button
// does not) waits for it, the form busy; then each problem is named, the
// focus on the first, and the form is no longer busy.
it('checks a send tried before the send path is in, busy until it is', async () => {
  // A fresh form, with no send path loaded.
  vi.resetModules()
  const { default: FreshForm } = await import('./InquiryForm')
  render(<FreshForm page="home" options={HOME_INQUIRY.options} />)
  const form = document.querySelector('form')

  submit()
  expect(form).toHaveAttribute('aria-busy', 'true')
  expect(screen.getByRole('button', { name: 'Изпращане...' })).toHaveAttribute('aria-disabled', 'true')

  expect(await screen.findByText('Въведете име.')).toBeInTheDocument()
  expect(form).not.toHaveAttribute('aria-busy')
  expect(field('Име')).toHaveFocus()
  expect(field('Име')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.queryByRole('alert')).toBeNull()
})

// While the send path loads, the form takes no second send.
it('sends once when the action is pressed again while the send path loads', async () => {
  vi.resetModules()
  const { default: FreshForm } = await import('./InquiryForm')
  render(<FreshForm page="home" options={HOME_INQUIRY.options} />)
  const before = service.sendInquiry.mock.calls.length

  fill()
  submit()
  fireEvent.click(screen.getByRole('button', { name: 'Изпращане...' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Благодарим ви.')
  expect(service.sendInquiry).toHaveBeenCalledTimes(before + 1)
})
