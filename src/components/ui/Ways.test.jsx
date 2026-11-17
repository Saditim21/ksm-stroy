import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import Ways from './Ways'

// The closing pair of ways (M3/M4 spec §4.4), Home's teaser's: a <nav> named
// by its label, the seam between its halves, and each way its title in the
// serif over its line. A way goes to a page of the site (`to`), to any other
// address (`href`), or does what its `onClick` says, as a button.

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()

it('renders a nav with each way’s title and sub, as links or buttons', () => {
  const onClick = vi.fn()
  render(
    <MemoryRouter>
      <Ways
        label="Как да започнем"
        ways={[
          { title: 'Свържете се с нас', sub: '+359 887 886 166', to: '/contact' },
          { title: 'Обадете се сега', sub: <>Обадете се на&nbsp;нас</>, href: 'tel:+359887886166' },
          { title: 'Получете оферта', sub: 'Към запитването', onClick },
        ]}
      />
    </MemoryRouter>,
  )

  const nav = screen.getByRole('navigation', { name: 'Как да започнем' })
  expect(nav).toHaveClass('ways')
  // The seam between the halves, before the ways, hidden from assistive tech.
  expect(nav.firstElementChild).toHaveClass('seam')
  expect(nav.firstElementChild).toHaveAttribute('aria-hidden', 'true')

  const ways = [...nav.children].slice(1)
  expect(ways.map((way) => way.tagName)).toEqual(['A', 'A', 'BUTTON'])
  const page = within(nav).getByRole('link', { name: 'Свържете се с нас +359 887 886 166' })
  expect(page).toHaveAttribute('href', '/contact')
  expect(within(nav).getByRole('link', { name: /^Обадете се сега/ })).toHaveAttribute('href', 'tel:+359887886166')
  const button = within(nav).getByRole('button', { name: 'Получете оферта Към запитването' })
  expect(button).toHaveAttribute('type', 'button')

  // Each way: its title in the serif, then its line, a space between.
  for (const [way, title, sub] of [
    [ways[0], 'Свържете се с нас', '+359 887 886 166'],
    [ways[1], 'Обадете се сега', 'Обадете се на\u00a0нас'],
    [ways[2], 'Получете оферта', 'Към запитването'],
  ]) {
    expect([...way.children].map((part) => [part.className, part.textContent])).toEqual([['serif', title], ['small', sub]])
    expect(text(way)).toBe(`${title} ${sub}`.replace(/\s+/g, ' '))
  }

  fireEvent.click(button)
  expect(onClick).toHaveBeenCalledTimes(1)
})

// A link may do something of its own as it is followed: Контакти's way to its
// own form glides there (spec §7.3).
it('gives a link its onClick too', () => {
  const onClick = vi.fn((event) => event.preventDefault())
  render(
    <MemoryRouter>
      <Ways label="Пътища" ways={[{ title: 'Към формата', sub: 'Запитване', href: '#zapitvane', onClick }, { title: 'Обадете се', sub: 'Телефон', href: 'tel:+359887886166' }]} />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('link', { name: 'Към формата Запитване' }))
  expect(onClick).toHaveBeenCalledTimes(1)
})
