import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { setLenis } from '../../utils/lenis'
import { EXPO_IN_OUT } from '../../utils/motion'
import Button from './Button'

// Button (spec §6.1): Diptych's actions, the classes of src/styles/diptych.css.
// A router Link for `to`, an anchor for `href`, a <button> otherwise. Outline
// (the default) is a brass border with an ivory label; solid is an ivory fill
// with an onyx label; link is text with a brass underline. `sm` is the small
// size; `arrow` draws an arrow that assistive technology never reads.

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

test('to renders a router link, an outline action of the normal size', () => {
  inRouter(<Button to="/contact">Запитване</Button>)
  const link = screen.getByRole('link', { name: 'Запитване' })
  expect(link).toHaveAttribute('href', '/contact')
  expect(link).toHaveAttribute('data-variant', 'outline')
  expect(link).toHaveAttribute('data-size', 'md')
  expect(link).toHaveClass('btn')
  expect(link).not.toHaveClass('btn--solid', 'btn--sm', 'link')
})

test('href renders a plain anchor, for tel:, mailto: and files', () => {
  render(<Button href="/eu/plakat-ksm-stroy-a3.pdf">Отвори плаката</Button>)
  expect(screen.getByRole('link', { name: 'Отвори плаката' })).toHaveAttribute('href', '/eu/plakat-ksm-stroy-a3.pdf')
})

test('without to or href it is a button of type "button", or the type it is given', () => {
  const { rerender } = render(<Button>Покажи</Button>)
  expect(screen.getByRole('button', { name: 'Покажи' })).toHaveAttribute('type', 'button')
  rerender(<Button type="submit">Изпратете запитване</Button>)
  expect(screen.getByRole('button', { name: 'Изпратете запитване' })).toHaveAttribute('type', 'submit')
})

test('variant="solid" size="sm" is the small ivory fill', () => {
  render(<Button variant="solid" size="sm">Запитване</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'solid')
  expect(button).toHaveAttribute('data-size', 'sm')
  expect(button).toHaveClass('btn', 'btn--solid', 'btn--sm')
})

test('variant="link" is the underlined text action, with no box', () => {
  render(<Button variant="link">Изтегли PDF</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'link')
  expect(button).toHaveClass('link')
  expect(button).not.toHaveClass('btn')
})

test('an unknown variant or size falls back to the outline action of the normal size', () => {
  render(<Button variant="nope" size="xl">Запитване</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'outline')
  expect(button).toHaveAttribute('data-size', 'md')
  expect(button).toHaveClass('btn')
  expect(button).not.toHaveClass('btn--sm')
})

test('a name on Object.prototype is no variant either', () => {
  render(<Button variant="constructor">Запитване</Button>)
  expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')
})

test('arrow draws an arrow hidden from assistive technology; the name stays the text', () => {
  inRouter(<Button to="/projects/golden-residence" arrow>Изберете апартамент</Button>)
  const link = screen.getByRole('link', { name: 'Изберете апартамент' })
  const arrow = link.querySelector('svg[aria-hidden="true"]')
  expect(arrow).not.toBeNull()
  expect(arrow).toHaveClass('arr')
  expect(arrow).toHaveAttribute('focusable', 'false')
})

test('draws no arrow unless asked', () => {
  render(<Button>Покажи</Button>)
  expect(screen.getByRole('button').querySelector('svg')).toBeNull()
})

test('passes className and other props through', () => {
  render(<Button href="/eu/plakat-ksm-stroy-a3.pdf" download className="w-full">Изтегли PDF</Button>)
  const link = screen.getByRole('link', { name: 'Изтегли PDF' })
  expect(link).toHaveClass('btn', 'w-full')
  expect(link).toHaveAttribute('download')
})

// Spec §5.3: a link to a section of the same page glides there (scrollToId,
// 1.5 s through Lenis) and focuses it, instead of the router's instant jump,
// whose new location would make LenisScrollSync cut the glide short. The
// address stays as it is. glideToHash (src/utils/scroll.js) does it; it sits
// beside scrollToId, so this follows the glide to the Lenis it drives.
describe('a link to a section of the same page', () => {
  function SamePage({ onClick }) {
    const { pathname, search, hash } = useLocation()
    return (
      <>
        <output data-testid="location">{`${pathname}${search}${hash}`}</output>
        <Button href="#zapitvane" onClick={onClick}>Запитване</Button>
        <section id="zapitvane"><h2>Изпратете запитване</h2></section>
      </>
    )
  }
  const renderAt = (props) => render(<MemoryRouter initialEntries={['/']}><SamePage {...props} /></MemoryRouter>)
  let lenis
  beforeEach(() => {
    lenis = { scrollTo: vi.fn() }
    setLenis(lenis)
  })
  afterEach(() => {
    setLenis(null)
    window.history.replaceState(null, '', '/')
  })

  // jsdom lays nothing out, so the section is placed by hand: 1234 px down
  // the page, which is where the glide must come to rest (no top bar here,
  // so no scroll padding to leave).
  test('glides to the section through scrollToId, and the click’s default is prevented', () => {
    renderAt()
    const section = document.getElementById('zapitvane')
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({ top: 1234, bottom: 1634, left: 0, right: 0, width: 0, height: 400, x: 0, y: 1234 })
    expect(fireEvent.click(screen.getByRole('link', { name: 'Запитване' }))).toBe(false)
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
    expect(lenis.scrollTo).toHaveBeenCalledWith(1234, expect.objectContaining({ duration: 1.5, easing: EXPO_IN_OUT }))
  })

  // jsdom follows a fragment link a task after the click, as a browser does.
  test('leaves the location as it was: /, with no hash', async () => {
    renderAt()
    fireEvent.click(screen.getByRole('link', { name: 'Запитване' }))
    await new Promise((resolve) => { setTimeout(resolve, 0) })
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    expect(window.location.hash).toBe('')
  })

  test('focuses the section, without scrolling to it at once', () => {
    renderAt()
    const section = document.getElementById('zapitvane')
    const focus = vi.spyOn(section, 'focus')
    fireEvent.click(screen.getByRole('link', { name: 'Запитване' }))
    expect(section).toHaveAttribute('tabindex', '-1')
    expect(document.activeElement).toBe(section)
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  test('a Ctrl-click does none of this', () => {
    renderAt()
    expect(fireEvent.click(screen.getByRole('link', { name: 'Запитване' }), { ctrlKey: true })).toBe(true)
    expect(lenis.scrollTo).not.toHaveBeenCalled()
    expect(document.getElementById('zapitvane')).not.toHaveAttribute('tabindex')
    expect(document.activeElement).not.toBe(document.getElementById('zapitvane'))
  })

  // The caller's own handler runs first, and can keep the browser's jump.
  test('runs the caller’s onClick first, and glides only if it let the click be', () => {
    const order = []
    renderAt({ onClick: (event) => { order.push('caller'); event.preventDefault() } })
    fireEvent.click(screen.getByRole('link', { name: 'Запитване' }))
    expect(order).toEqual(['caller'])
    expect(lenis.scrollTo).not.toHaveBeenCalled()
  })

  // An href to a page or a file keeps the browser's own click. (Seen from
  // document, after React's handlers, and then stopped: jsdom cannot open
  // another document.)
  test('leaves any other href alone', () => {
    render(<Button href="/eu/plakat-ksm-stroy-a3.pdf">Отвори плаката</Button>)
    let prevented
    document.addEventListener('click', (event) => {
      prevented = event.defaultPrevented
      event.preventDefault()
    }, { once: true })
    fireEvent.click(screen.getByRole('link', { name: 'Отвори плаката' }))
    expect(prevented).toBe(false)
    expect(lenis.scrollTo).not.toHaveBeenCalled()
  })
})
