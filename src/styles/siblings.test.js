import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { cwd } from 'node:process'
import { rulesOf } from '../test/css'

// Sibling selectors that the browser can key on (M4 Task 8, spec M3/M4 §10).
// A rule whose sibling combinator (+ or ~) follows a compound that names no
// tag, class, id or attribute (`:not(.seam) + :not(.seam)`, `* + *`, or the
// Tailwind utilities that space or divide a box's children, `> :not([hidden])
// ~ :not([hidden])`) is one Chrome cannot tie to any element: every node
// inserted anywhere then restyles its parent's whole subtree. React's
// streamed scripts land at the end of <body> once the page has painted, so
// each such rule cost every page a restyle of every element, Продажби a
// long task of its blocking time (measured: 1,183 elements, 175 ms at a 4x
// slower CPU). A rule names its siblings by a class, a tag or their place
// instead (ways.css: `:nth-child(n + 3)`).
//
// Tailwind builds every class that any module of src/ names, a test's
// strings and comments included, so this file names none of those
// utilities: its patterns put them together.

const ROOT = cwd()
function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}
const SOURCES = filesUnder(join(ROOT, 'src')).filter((file) => !/\.test\.jsx?$/.test(file))

// A selector's compounds and the combinators between them, at the top level
// (not inside :not(), :is() and the like, nor an attribute's brackets).
function compounds(selector) {
  const parts = [{ combinator: null, text: '' }]
  let depth = 0
  for (const char of selector.trim()) {
    if (char === '(' || char === '[') depth += 1
    if (char === ')' || char === ']') depth -= 1
    if (depth === 0 && /[\s>+~]/.test(char)) {
      const last = parts.at(-1)
      if (last.text === '') {
        if (char !== ' ' && char !== '\n') last.combinator = char
      } else {
        parts.push({ combinator: char === '\n' ? ' ' : char, text: '' })
      }
      continue
    }
    parts.at(-1).text += char
  }
  return parts.filter(({ text }) => text !== '')
}

// Whether a compound names a tag, a class, an id or an attribute outside a
// negation: what the browser keys a sibling's invalidation on.
function namesSomething(compound) {
  const bare = compound
    .replace(/:(?:not|is|where|has)\((?:[^()]|\([^()]*\))*\)/g, '')
    .replace(/::?[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?/g, '')
  return /^[a-z]|[.#[]/i.test(bare.replace(/^\*/, ''))
}

// Whether `selector` has a sibling combinator after a compound naming nothing.
function unkeyedSiblings(selector) {
  const parts = compounds(selector)
  return parts.some((part, i) => i > 0 && /[+~]/.test(part.combinator) && !namesSomething(parts[i - 1].text))
}

describe('unkeyedSiblings', () => {
  it.each([
    '.ways > :not(.seam) + :not(.seam)',
    '.stack > :not([hidden]) ~ :not([hidden])',
    '* + *',
    '.a > :first-child + li',
  ])('finds %s', (selector) => {
    expect(unkeyedSiblings(selector)).toBe(true)
  })

  it.each([
    '.ways > .seam + *',
    '.ways > :nth-child(n + 3)',
    '.wk__feat li + li::before',
    '.hero__title .sl__row ~ .sl__row .sl__l',
    '.ob__filter button + button',
    ':root.js .doc__text > p + p',
    '.bros__story .triad span+span:before',
    '[data-x] ~ .y',
    '[class~="a b"] + .c',
  ])('lets %s be', (selector) => {
    expect(unkeyedSiblings(selector)).toBe(false)
  })
})

it('no stylesheet of the site names a sibling after a compound that names nothing', () => {
  const found = SOURCES.filter((file) => file.endsWith('.css')).flatMap((file) => rulesOf(file)
    .filter((rule) => !rule.atRules.some((at) => at.startsWith('@keyframes')))
    .flatMap((rule) => rule.selectors.filter(unkeyedSiblings).map((selector) => `${relative(ROOT, file)}: ${selector}`)))
  expect(found).toEqual([])
})

// Tailwind writes the utilities that space or divide a box's children as
// `> :not([hidden]) ~ :not([hidden])`, and builds every class any module of
// src/ names, the dev pages' and the tests' included: none may name one.
it('no module names a Tailwind utility that spaces or divides its children', () => {
  const modules = filesUnder(join(ROOT, 'src')).filter((file) => /\.jsx?$/.test(file))
  const found = modules.flatMap((file) => {
    const text = readFileSync(file, 'utf8')
    return [...text.matchAll(/(?<![\w-])-?(?:space|divide)-[xy](?:-[\w./[\]-]+)?(?![\w-])/g)].map(([name]) => `${relative(ROOT, file)}: ${name}`)
  })
  expect(found).toEqual([])
})
