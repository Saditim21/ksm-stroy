import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

// The focus ring every element gets (src/index.css; decision of 2026-11-14):
// 2 px, 2 px off the element, in the ground's text colour, ink on paper and
// paper under .on-dusk. Never currentColor, which a filled button's label
// makes the ground's own colour. Under forced colours, the system's Highlight.
// jsdom applies no CSS, so this reads the rules themselves; Button carries the
// same colours per tone (Button.test.jsx).

const css = readFileSync(join(cwd(), 'src/index.css'), 'utf8')
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// The declarations of the first rule whose selector is exactly `selector`.
const rule = (selector) => new RegExp(`(?:^|\\n)\\s*${escape(selector)}\\s*\\{([^}]*)\\}`).exec(css)?.[1]

it('is 2 px of ink, 2 px off the element, on paper', () => {
  expect(rule(':focus-visible')).toMatch(/outline:\s*2px solid theme\(colors\.ink\);/)
  expect(rule(':focus-visible')).toMatch(/outline-offset:\s*2px;/)
  expect(rule(':focus-visible')).not.toMatch(/currentColor/)
})

it('is paper on a dusk ground', () => {
  expect(rule('.on-dusk :focus-visible')).toMatch(/outline-color:\s*theme\(colors\.paper\);/)
})

it('is Highlight under forced colours, on any ground', () => {
  expect(css).toMatch(/@media \(forced-colors: active\) \{\s*:focus-visible,\s*\.on-dusk :focus-visible \{\s*outline-color: Highlight;\s*\}\s*\}/)
})
