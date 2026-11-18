import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

// The focus ring every element gets (src/index.css; spec §11): 2 px, 3 px off
// the element, in the text colour of the ground it sits on. Dark is the
// default, so it is ivory; inside .on-light (a light plate) it is onyx. Never
// currentColor, which a filled button's label makes the ground's own colour.
// Under forced colours, the system's Highlight. jsdom applies no CSS, so this
// reads the rules themselves.

const css = readFileSync(join(cwd(), 'src/index.css'), 'utf8')
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// The declarations of the first rule whose selector is exactly `selector`.
const rule = (selector) => new RegExp(`(?:^|\\n)\\s*${escape(selector)}\\s*\\{([^}]*)\\}`).exec(css)?.[1]

it('is 2 px of ivory, 3 px off the element, on the dark grounds', () => {
  expect(rule(':focus-visible')).toMatch(/outline:\s*2px solid var\(--ivory\);/)
  expect(rule(':focus-visible')).toMatch(/outline-offset:\s*3px;/)
  expect(rule(':focus-visible')).not.toMatch(/currentColor/)
})

it('is onyx on a light ground', () => {
  expect(rule('.on-light :focus-visible')).toMatch(/outline-color:\s*var\(--onyx\);/)
})

it('is Highlight under forced colours, on any ground', () => {
  const block = /@media \(forced-colors: active\) \{\s*([^{]+)\{([^}]*)\}\s*\}/.exec(css)
  expect(block?.[1].split(',').map((selector) => selector.trim())).toEqual([
    ':focus-visible',
    '.on-light :focus-visible',
  ])
  expect(block[2]).toMatch(/outline-color:\s*Highlight;/)
})

// Spec M3/M4 §9: the legacy pages' ground went with them, and with it the
// dark region inside it (.on-dusk) that gave the ring back its ivory.
it('knows no legacy ground', () => {
  expect(css).not.toMatch(/\.on-dusk|\.legacy-ground/)
})

// Spec §2.2: the ring's 1 px radius, the one corner Diptych rounds, which the
// offset widens, on every ground, a light plate's too. The rule weighs as a
// class does (:root), as it always has, so a control whose own radius one
// class sets takes it while focused.
it('has a 1 px radius on every ground', () => {
  expect(rule(':root :focus-visible')).toMatch(/^\s*border-radius:\s*1px;\s*$/)
  expect(rule(':focus-visible')).not.toMatch(/border-radius/)
})
