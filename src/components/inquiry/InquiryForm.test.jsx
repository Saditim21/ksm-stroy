import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../../test/gsap'
import InquiryForm from './InquiryForm'
import InquirySection from './InquirySection'
import { presetInquiry, resetInquiry } from './inquiryStore'

// The inquiry form (spec §10): name, phone, email, what the visitor asks
// about, an optional message and the consent, checked here before anything
// is sent, so the lead proxy never drops a lead without a trace. Sending is
// src/services/inquiry.js's (its own tests); here it is a stub. So is the
// glide to a section (src/utils/scroll.js's own tests), which the form asks
// for after a send.

const send = vi.hoisted(() => vi.fn())
vi.mock('../../services/inquiry', async (importOriginal) => ({ ...(await importOriginal()), sendInquiry: send }))
const glide = vi.hoisted(() => vi.fn())
vi.mock('../../utils/scroll', async (importOriginal) => ({ ...(await importOriginal()), scrollToId: glide }))
// The engine useMotionNow() hands over: none, as in jsdom, unless a case puts
// in a recording stand-in (src/test/gsap.js).
let motion = null
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => motion }))

const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'
const ERRORS = {
  name: 'Въведете име.',
  phone: 'Въведете телефон, поне 6 цифри.',
  email: 'Въведете имейл, например ime@primer.bg.',
  latin: 'Въведете имейл с латински букви, например ime@primer.bg.',
  consent: 'Отбележете съгласието, за да изпратим запитването.',
}

const field = (label) => screen.getByLabelText(label)
const submit = () => screen.getByRole('button', { name: 'Изпратете запитване' })

async function fill(user, { name = 'Иван Петров', phone = '+359 888 123 456', email = 'ivan@example.bg', consent = true } = {}) {
  if (name) await user.type(field('Име'), name)
  if (phone) await user.type(field('Телефон'), phone)
  if (email) await user.type(field('Имейл'), email)
  if (consent) await user.click(screen.getByRole('checkbox', { name: CONSENT }))
}

let user
beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ ok: true })
  glide.mockReset()
  user = userEvent.setup({ delay: null })
})
afterEach(() => {
  resetInquiry()
  vi.restoreAllMocks()
})

it('labels every field, the consent and the action', () => {
  render(<InquiryForm page="home" />)
  for (const label of ['Име', 'Телефон', 'Имейл', 'Интересувам се от', 'Съобщение']) expect(field(label)).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: CONSENT })).not.toBeChecked()
  expect(submit()).toHaveAttribute('type', 'submit')
  expect(field('Интересувам се от')).toHaveValue('golden-residence')
})

describe('checking the fields before anything is sent', () => {
  it('an empty form sends nothing, names each problem and focuses the name', async () => {
    render(<InquiryForm page="home" />)
    await user.click(submit())

    expect(send).not.toHaveBeenCalled()
    for (const message of [ERRORS.name, ERRORS.phone, ERRORS.email, ERRORS.consent]) expect(screen.getByText(message)).toBeInTheDocument()
    expect(field('Име')).toHaveFocus()
    for (const label of ['Име', 'Телефон', 'Имейл']) {
      expect(field(label)).toHaveAttribute('aria-invalid', 'true')
      expect(field(label)).toHaveAccessibleDescription(expect.stringMatching(/^Въведете /))
    }
    expect(screen.getByRole('checkbox', { name: CONSENT })).toHaveAttribute('aria-invalid', 'true')
  })

  // Review Focus 5: the proxy's pattern takes Latin letters only, so an
  // address on a Cyrillic domain would be dropped there without a trace.
  it('asks for Latin letters in an email with a Cyrillic domain', async () => {
    render(<InquiryForm page="home" />)
    await fill(user, { email: 'ivan@пример.бг' })
    await user.click(submit())
    expect(screen.getByText(ERRORS.latin)).toBeInTheDocument()
    expect(field('Имейл')).toHaveFocus()
    expect(send).not.toHaveBeenCalled()
  })

  // Chrome hands a type=email field's Cyrillic domain over as punycode
  // (ivan@пример.бг reads ivan@xn--e1afmkfd.xn--90ae), which the proxy's
  // pattern refuses as well.
  it('asks for Latin letters in an email the browser has turned into punycode', async () => {
    render(<InquiryForm page="home" />)
    await fill(user, { email: 'ivan@xn--e1afmkfd.xn--90ae' })
    await user.click(submit())
    expect(screen.getByText(ERRORS.latin)).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })

  it('asks for a whole email', async () => {
    render(<InquiryForm page="home" />)
    await fill(user, { email: 'ivan@' })
    await user.click(submit())
    expect(screen.getByText(ERRORS.email)).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })

  // The proxy drops a one-letter name: the name counts after trimming, as
  // buildLead sends it.
  it('counts the name after trimming it', async () => {
    render(<InquiryForm page="home" />)
    await fill(user, { name: ' И' })
    await user.click(submit())
    expect(screen.getByText(ERRORS.name)).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })

  // The digits count, whatever the spaces and the + around them: „+359 88“
  // has five, one more makes six.
  it('takes a phone number with spaces and +359', async () => {
    render(<InquiryForm page="home" />)
    await fill(user, { phone: '+359 88' })
    await user.click(submit())
    expect(screen.getByText(ERRORS.phone)).toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
    await user.type(field('Телефон'), '1')
    expect(screen.queryByText(ERRORS.phone)).toBeNull()
    await user.click(submit())
    expect(send).toHaveBeenCalledTimes(1)
  })
})

describe('sending', () => {
  it('sends a valid form once, with its subject and picks', async () => {
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.type(field('Съобщение'), 'Кога е готова сградата?')
    await user.click(submit())
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      name: 'Иван Петров',
      email: 'ivan@example.bg',
      phone: '+359 888 123 456',
      subject: 'Golden Residence',
      picks: [],
      message: 'Кога е готова сградата?',
    })
  })

  it('thanks the visitor in a status that takes the focus', async () => {
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.click(submit())
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Благодарим ви.')
    expect(status).toHaveTextContent('Ще се свържем с вас в работно време. За бърз отговор: +359 887 886 166.')
    expect(status).toHaveFocus()
  })

  it('says so when the inquiry was not sent, and keeps what was typed', async () => {
    send.mockResolvedValue({ ok: false })
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.click(submit())
    expect(await screen.findByText('Запитването не беше изпратено. Опитайте отново или се обадете на +359 887 886 166.')).toBeInTheDocument()
    expect(field('Име')).toHaveValue('Иван Петров')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('sends the subject of the option chosen, with the apartments picked', async () => {
    render(<InquiryForm page="golden-residence" />)
    act(() => presetInquiry({ option: 'garage', pick: 'А 301' }))
    await fill(user)
    await user.click(submit())
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Golden Residence, гараж или паркомясто', picks: ['А 301'] }))
  })

  // Ruling FR4: the apartments picked in the explorer go only with a Golden
  // Residence subject (its apartments, or its garages). Under another
  // subject their chips hide and the lead names none; the picks stay in the
  // store, so choosing Golden Residence again brings them back.
  it('sends no apartment picked under another subject, and shows none', async () => {
    render(<InquiryForm page="home" />)
    act(() => presetInquiry({ option: 'golden-residence', pick: 'А 301' }))
    expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
    // Home's Многофамилна half.
    act(() => presetInquiry({ option: 'mnogofamilna' }))
    expect(screen.queryByRole('list', { name: 'Избрани апартаменти' })).toBeNull()
    await fill(user)
    await user.click(submit())
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Многофамилна сграда, ж.к. Връбница-1', picks: [] }))
  })

  it('brings the apartments picked back with Golden Residence chosen again', async () => {
    render(<InquiryForm page="golden-residence" />)
    act(() => presetInquiry({ option: 'golden-residence', pick: 'А 301' }))
    await user.selectOptions(field('Интересувам се от'), 'other')
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    await user.selectOptions(field('Интересувам се от'), 'golden-residence')
    expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
    await fill(user)
    await user.click(submit())
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Golden Residence', picks: ['А 301'] }))
  })

  // Ruling C5.2: while the inquiry is on its way (the EmailJS chunk, the
  // round trip), the form says so: it is busy, and its action reads as the
  // legacy Contact form's does while it sends, and takes no second send.
  it('says it is sending while the inquiry is on its way, and takes no second send', async () => {
    let finish
    send.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.click(submit())

    const form = document.querySelector('form')
    expect(form).toHaveAttribute('aria-busy', 'true')
    const sending = screen.getByRole('button', { name: 'Изпращане...' })
    expect(sending).toHaveAttribute('aria-disabled', 'true')
    expect(sending).toHaveAttribute('type', 'submit')
    await user.click(sending)
    expect(send).toHaveBeenCalledTimes(1)

    await act(async () => finish({ ok: true }))
    expect(await screen.findByRole('status')).toHaveTextContent('Благодарим ви.')
    expect(form).not.toHaveAttribute('aria-busy')
  })

  it('is no longer busy once a send has failed, and can send again', async () => {
    send.mockResolvedValue({ ok: false })
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.click(submit())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(document.querySelector('form')).not.toHaveAttribute('aria-busy')
    expect(submit()).not.toHaveAttribute('aria-disabled')
    await user.click(submit())
    expect(send).toHaveBeenCalledTimes(2)
  })

  // Ruling C5.3: on a short screen the thank-you can end below the fold, a
  // whole contact half under the section's top. The glide to the inquiry
  // then goes as far as the thank-you, which has an id for it.
  it('brings a thank-you that ends below the fold into view', async () => {
    render(<InquiryForm page="home" />)
    await fill(user)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 2000, bottom: 2160, left: 0, right: 0, width: 0, height: 160, x: 0, y: 2000 })
    await user.click(submit())

    expect(await screen.findByRole('status')).toHaveAttribute('id', 'f-thanks')
    expect(glide).toHaveBeenCalledWith('zapitvane', { reveal: 'f-thanks' })
  })

  it('leaves the page where it is when the thank-you is on screen', async () => {
    render(<InquiryForm page="home" />)
    await fill(user)
    await user.click(submit())

    await screen.findByRole('status')
    expect(glide).not.toHaveBeenCalled()
  })

  // Spec §5.7 (ruling C9.5): with motion the thank-you's lines rise into
  // place, 18 px over 0.8 s, 0.08 s apart, and take off what they set; the
  // rise goes with the form.
  it('raises the thank-you into place with motion: 18 px, 0.8 s, 0.08 s apart', async () => {
    const recorder = recordingMotion()
    motion = recorder.motion
    try {
      const { unmount } = render(<InquiryForm page="home" />)
      await fill(user)
      await user.click(submit())
      const status = await screen.findByRole('status')

      expect(recorder.tweens).toHaveLength(1)
      const [rise] = recorder.tweens
      expect(rise.method).toBe('from')
      expect([...rise.targets]).toEqual([...status.children])
      expect(rise.targets.length).toBeGreaterThan(1)
      expect(rise.vars).toEqual({ opacity: 0, y: 18, duration: 0.8, ease: 'expo.out', stagger: 0.08, clearProps: 'opacity,transform' })
      expect(status).toHaveFocus()

      unmount()
      expect(rise.revert).toHaveBeenCalled()
    } finally {
      motion = null
    }
  })
})

// Ruling C5.1: the store outlives the page, so the section clears the option
// it leaves, and each page's form starts on its own subject: an option Home
// preset (Многофамилна) never files a Golden Residence inquiry. The picks
// stay, for the explorer pages hand them on.
it('clears the option when its section leaves the page, and keeps the picks', () => {
  const { unmount } = render(<InquirySection page="home" />)
  act(() => presetInquiry({ option: 'mnogofamilna', pick: 'А 301' }))
  expect(field('Интересувам се от')).toHaveValue('mnogofamilna')

  unmount()
  render(<InquirySection page="golden-residence" />)
  expect(field('Интересувам се от')).toHaveValue('golden-residence')
  expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
})

describe('presets from the page', () => {
  it('shows a picked apartment as a chip that can be removed', async () => {
    render(<InquiryForm page="golden-residence" />)
    act(() => presetInquiry({ pick: 'А 301' }))
    const chips = screen.getByRole('list', { name: 'Избрани апартаменти' })
    expect(within(chips).getByText('Апартамент А 301')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Махнете А 301' }))
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    expect(screen.queryByRole('list', { name: 'Избрани апартаменти' })).toBeNull()
  })

  it('sets the select to a preset option', () => {
    render(<InquiryForm page="home" />)
    act(() => presetInquiry({ option: 'mnogofamilna' }))
    expect(field('Интересувам се от')).toHaveValue('mnogofamilna')
  })

  it('shows the form again for a new preset after a thank-you', async () => {
    render(<InquiryForm page="golden-residence" />)
    await fill(user)
    await user.click(submit())
    await screen.findByRole('status')
    act(() => presetInquiry({ pick: 'Б 204' }))
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
    expect(screen.getByText('Апартамент Б 204')).toBeVisible()
    expect(field('Име')).toHaveValue('Иван Петров')
  })
})
