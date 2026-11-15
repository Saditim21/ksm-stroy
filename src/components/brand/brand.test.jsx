import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Emblem from './Emblem.jsx'
import Wordmark from './Wordmark.jsx'
import Logo from './Logo.jsx'

describe('brand', () => {
  it.each(['horizontal', 'stacked'])('Logo %s is an accessible image', (variant) => {
    render(<Logo variant={variant} />)
    expect(screen.getByRole('img', { name: 'КСМ Строй' })).toBeTruthy()
  })

  // The shell sets the mark in brass and the wordmark in the text colour
  // (spec §6.2): markClassName goes on the mark's group alone, whose strokes
  // follow its colour.
  it('Logo gives markClassName to the mark alone', () => {
    const { container } = render(<Logo className="logo" markClassName="text-brass" />)
    const svg = container.querySelector('svg')
    const mark = svg.querySelector('g')
    expect(svg).toHaveClass('logo')
    expect(mark).toHaveClass('text-brass')
    expect(mark.querySelectorAll('path')).toHaveLength(26)
    expect(svg.querySelector(':scope > path')).not.toHaveClass('text-brass')
  })

  it('Emblem draws 26 paths with pathLength=1 in draw order', () => {
    const { container } = render(<Emblem />)
    const paths = container.querySelectorAll('path[pathLength="1"]')
    expect(paths.length).toBe(26)
    expect(paths[0].getAttribute('class')).toBe('ring')
    expect(paths[paths.length - 1].getAttribute('class')).toBe('cloud')
  })

  it('Emblem only strokes with currentColor and never fills', () => {
    const { container } = render(<Emblem />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('fill')).toBe('none')
    container.querySelectorAll('path').forEach((p) => {
      const fill = p.getAttribute('fill')
      expect(fill === null || fill === 'none' || fill === 'currentColor').toBe(true)
    })
  })

  it('Emblem carries data-draw only when draw is set', () => {
    expect(render(<Emblem />).container.querySelector('svg').hasAttribute('data-draw')).toBe(false)
    expect(render(<Emblem draw />).container.querySelector('svg').hasAttribute('data-draw')).toBe(true)
  })

  it('Wordmark is a single currentColor path', () => {
    const { container } = render(<Wordmark />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
    expect(paths[0].getAttribute('fill')).toBe('currentColor')
  })
})
