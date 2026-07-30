import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Contact from './Contact'

test('prefills message from ?apartment= query param', () => {
  render(
    <MemoryRouter initialEntries={['/contact?apartment=А 301']}>
      <Contact />
    </MemoryRouter>,
  )
  const textarea = screen.getByRole('textbox', { name: /съобщение/i })
  expect(textarea.value).toContain('А 301')
})
