import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import Seam from './Seam'

// The seam (spec §4): 1 px of brass down the middle of its section
// (src/styles/diptych.css). Decoration only, so assistive technology never
// meets it. `draw` marks it for useReveals, which draws it down once its
// section comes into view.

test('renders the seam, hidden from assistive technology, with no inline style', () => {
  const { container } = render(<Seam />)
  const seam = container.firstElementChild
  expect(seam.tagName).toBe('SPAN')
  expect(seam).toHaveClass('seam')
  expect(seam).toHaveAttribute('aria-hidden', 'true')
  expect(seam).not.toHaveAttribute('style')
  expect(seam).not.toHaveAttribute('data-draw')
  expect(seam).toBeEmptyDOMElement()
})

test('draw adds data-draw', () => {
  const { container } = render(<Seam draw />)
  expect(container.firstElementChild).toHaveAttribute('data-draw', '')
})

test('passes a class through', () => {
  const { container } = render(<Seam className="hero__seam" />)
  expect(container.firstElementChild.className).toBe('seam hero__seam')
})

// The markup is the final state: drawn, never scaled to nothing.
test('prerenders as the drawn seam', () => {
  expect(renderToString(<Seam draw />)).toBe('<span class="seam" aria-hidden="true" data-draw=""></span>')
})
