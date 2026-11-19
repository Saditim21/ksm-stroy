import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { THEME_KEY } from '../utils/theme'
import ThemeSwitch from './ThemeSwitch'

// Polish spec §5: the switch before „Меню“ and in the menu. It names what it
// switches to, „Светла тема“ on the dark site and „Тъмна тема“ on the light
// one, and flips the theme at once where there is no View Transitions API
// (jsdom has none).

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
  vi.restoreAllMocks()
})

it('offers the light theme on the dark site, and switches to it', async () => {
  render(<ThemeSwitch />)
  const button = screen.getByRole('button', { name: 'Светла тема' })

  await userEvent.click(button)

  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  expect(localStorage.getItem(THEME_KEY)).toBe('light')
  expect(screen.getByRole('button', { name: 'Тъмна тема' })).toBe(button)
})

it('switches back to dark', async () => {
  render(<ThemeSwitch />)
  await userEvent.click(screen.getByRole('button', { name: 'Светла тема' }))
  await userEvent.click(screen.getByRole('button', { name: 'Тъмна тема' }))

  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  expect(localStorage.getItem(THEME_KEY)).toBe('dark')
})

it('follows a switch made elsewhere on the page (the menu’s, the header’s)', async () => {
  render(<><ThemeSwitch /><ThemeSwitch variant="menu" /></>)
  const [first] = screen.getAllByRole('button', { name: 'Светла тема' })

  await userEvent.click(first)

  expect(screen.getAllByRole('button', { name: 'Тъмна тема' })).toHaveLength(2)
})

// The prerendered page is dark; a visitor who chose light has data-theme set
// by the head script before React hydrates. The first client render must
// still match the HTML, then the label follows the page.
it('hydrates over a light page with no mismatch, then names the dark theme', async () => {
  const html = renderToString(<ThemeSwitch />)
  document.documentElement.setAttribute('data-theme', 'light')
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  const errors = []
  const logged = vi.spyOn(console, 'error')
  let root
  await act(async () => {
    root = hydrateRoot(container, <ThemeSwitch />, { onRecoverableError: (error) => errors.push(error) })
  })

  expect(errors).toEqual([])
  expect(logged.mock.calls).toEqual([])
  expect(container.querySelector('button').getAttribute('aria-label')).toBe('Тъмна тема')
  act(() => root.unmount())
  container.remove()
})
