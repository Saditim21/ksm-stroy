import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import config from '../../../tailwind.config.js'
import HeroTitle from './HeroTitle'

// HeroTitle (plan Task 7, spec §5.2.2 and §5.4): the page's load moment is
// CSS only. Each authored line rises once from its mask where the motion gate
// has marked <html> with `js` (Diptych spec §5.2: motion allowed, no
// Save-Data); the markup is the final state, with no JS and nothing hidden in
// it.

const LINES = ['Създаваме пространства', 'за мечтания живот']
const JOINED = 'Създаваме пространства за мечтания живот'

test('an h1 whose text is both lines joined', () => {
  render(<HeroTitle lines={LINES} />)
  const heading = screen.getByRole('heading', { level: 1, name: JOINED })
  expect(heading.textContent).toBe(JOINED)
})

// Tailwind emits @layer components before its utilities, so a caller's size
// class still wins, even one it sorts before text-display (text-count).
test('the display role is a default in the components layer, which className overrides', () => {
  render(<HeroTitle lines={LINES} className="text-count" />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveClass('hero-title', 'text-count')
  const css = readFileSync(join(cwd(), 'src/index.css'), 'utf8')
  const components = css.slice(css.indexOf('@layer components'), css.indexOf('@layer utilities'))
  expect(components).toMatch(/\.hero-title\s*{\s*@apply font-display text-display font-\[420\];\s*}/)
})

test('as="h2" renders an h2', () => {
  render(<HeroTitle as="h2" lines={LINES} />)
  expect(screen.getByRole('heading', { level: 2, name: JOINED })).toBeInTheDocument()
})

test('each line is a span.block inside an overflow-hidden mask, staggered by --i', () => {
  render(<HeroTitle lines={LINES} className="text-ivory" />)
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading).toHaveClass('text-ivory')
  const masks = [...heading.children]
  expect(masks).toHaveLength(2)
  masks.forEach((mask, i) => {
    expect(mask.tagName).toBe('SPAN')
    expect(mask).toHaveClass('block', 'overflow-hidden')
    const line = mask.firstElementChild
    expect(line.tagName).toBe('SPAN')
    expect(line).toHaveClass('block', 'js:animate-hero-rise')
    expect(line.className).not.toContain('motion-safe:')
    expect(line).toHaveTextContent(LINES[i])
    expect(line.style.getPropertyValue('--i')).toBe(String(i))
  })
})

// Tailwind's `js:` variant: a utility that applies only under the gate's
// class, which the reduced-motion media query alone cannot see (Save-Data).
test('the js variant applies under :root.js', () => {
  const variants = []
  for (const { handler } of config.plugins) handler({ addVariant: (name, definition) => variants.push([name, definition]) })
  expect(variants).toEqual([['js', ':root.js &']])
})

test('the markup is the final state: no inline opacity, nothing moved', () => {
  const { container } = render(<HeroTitle lines={LINES} />)
  container.querySelectorAll('[style]').forEach((el) => {
    expect(el.getAttribute('style')).not.toMatch(/opacity|transform/)
  })
  expect(renderToString(<HeroTitle lines={LINES} />)).not.toMatch(/opacity|transform|translate/)
})

test('hero-rise: translateY(105%) to 0 over 900 ms on the expo-out curve, 60 ms apart by --i', () => {
  const { animation, keyframes, transitionTimingFunction } = config.theme.extend
  expect(keyframes['hero-rise']).toEqual({
    from: { transform: 'translateY(105%)' },
    to: { transform: 'translateY(0)' },
  })
  expect(animation['hero-rise']).toBe(
    `hero-rise 900ms ${transitionTimingFunction['expo-out']} calc(var(--i, 0) * 60ms) backwards`,
  )
})
