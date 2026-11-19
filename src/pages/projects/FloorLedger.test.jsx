import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { BUILDINGS } from './buildings'
import FloorLedger from './FloorLedger'

// Golden Residence's numbers come from its API, which a cold start can hold up
// to 10 s (then the sheets, then the data built into the site). A floor opened
// before they are in says its apartments are on their way, never that the
// floor is sold out (the final review's fifth finding). The page's own tests
// (projects.test.jsx) open floors once the data is in; the store they share
// keeps it, so this renders the ledger itself, with no numbers yet.
it('says a floor’s apartments are on their way while the numbers are', async () => {
  render(
    <MemoryRouter>
      <FloorLedger buildings={BUILDINGS.map((building) => ({ building, model: null }))} />
    </MemoryRouter>,
  )
  const row = screen.getByRole('button', { name: /^Блок А, етаж 8:/ })

  await userEvent.click(row)

  const panel = document.getElementById(row.getAttribute('aria-controls'))
  expect(panel.textContent.trim()).toBe('Зареждаме апартаментите на етажа…')
})
