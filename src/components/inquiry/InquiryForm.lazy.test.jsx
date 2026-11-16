import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import InquiryForm from './InquiryForm'

// The send path (src/services/inquiry.js, and EmailJS behind it) is a chunk
// of its own, out of the first-load JS of every page with the form (spec
// §10, FR5): the form starts loading it as the visitor first steps into it,
// and a send waits for it. These cases have a file of their own (ruling
// PF12), so no other case has loaded the send path before them.

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
  render(<InquiryForm page="home" />)
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
  // A fresh form, with a stand-in of its own that never loads, so this case
  // neither finds a send path loaded before it nor leaves one loaded.
  let attempts = 0
  vi.resetModules()
  vi.doMock('../../services/inquiry', () => {
    attempts += 1
    throw new Error('Failed to fetch dynamically imported module')
  })
  try {
    const { default: FreshForm } = await import('./InquiryForm')
    render(<FreshForm page="home" />)

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
    // The file's own stand-in again, with nothing loaded through it.
    vi.doMock('../../services/inquiry', () => service.load())
  }
})
