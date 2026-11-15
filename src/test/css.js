import { readFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { cwd } from 'node:process'
import postcss from 'postcss'

// The one way the CSS tests read a stylesheet (plan Ruling F14): postcss
// parses the file as written, before Tailwind or Vite touch it, and the tests
// ask about rules rather than match text. jsdom applies no CSS, so this is
// what a test can check.
//
// rulesOf(path) gives every rule of the file, in source order, as
//   { selector, selectors, declarations, atRules }
// - selector: the selector text as written; selectors: its comma-separated
//   parts, trimmed;
// - declarations: [{ prop, value, important }], in order;
// - atRules: the at-rules it sits in, outermost first, each as written:
//   '@layer components', '@media (max-width: 900px)', '@keyframes door-seam'.
// A keyframe of a @keyframes block is a rule too: its selector is 'from',
// 'to' or '10.7%, 35.7%'.
//
// atRulesOf(path) gives the at-rules that hold declarations of their own
// (@property, @font-face) as { name, params, declarations, atRules }.
//
// firstViewportMotionProblems(path, hero), below, checks a page's
// first-viewport motion.
//
// `path` is relative to the repository root, or absolute (a test's planted
// stylesheet).

const parse = (path) => postcss.parse(readFileSync(isAbsolute(path) ? path : join(cwd(), path), 'utf8'), { from: path })

const declarationsOf = (node) => node.nodes
  .filter((child) => child.type === 'decl')
  .map(({ prop, value, important }) => ({ prop, value, important: important === true }))

function atRulesAround(node) {
  const chain = []
  for (let parent = node.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') chain.unshift(`@${parent.name} ${parent.params}`.trim())
  }
  return chain
}

export function rulesOf(path) {
  const rules = []
  parse(path).walkRules((rule) => {
    rules.push({
      selector: rule.selector,
      selectors: rule.selectors.map((selector) => selector.trim()),
      declarations: declarationsOf(rule),
      atRules: atRulesAround(rule),
    })
  })
  return rules
}

export function atRulesOf(path) {
  const atRules = []
  parse(path).walkAtRules((atRule) => {
    if (!atRule.nodes?.some((child) => child.type === 'decl')) return
    atRules.push({ name: atRule.name, params: atRule.params, declarations: declarationsOf(atRule), atRules: atRulesAround(atRule) })
  })
  return atRules
}

// The value a rule's last declaration of `prop` sets, or undefined.
export function valueOf(rule, prop) {
  return rule?.declarations.filter((declaration) => declaration.prop === prop).at(-1)?.value
}

// The rules whose selector list includes `selector` exactly.
export function rulesFor(rules, selector) {
  return rules.filter((rule) => rule.selectors.includes(selector))
}

export const NO_PREFERENCE = '@media (prefers-reduced-motion: no-preference)'

// What keeps an element out of sight, or away from its place, until an
// animation brings it in: a starting state of the first viewport's motion.
const HIDING = {
  opacity: (value) => /^(0+\.?0*|\.0+)$/.test(value.trim()),
  visibility: (value) => value.trim() === 'hidden',
  'stroke-dashoffset': () => true,
  transform: (value) => /translateY\(|scale[XYZ3d]*\(/i.test(value),
  translate: (value) => value.trim().split(/\s+/).length > 1,
  scale: (value) => !/^(none|1)$/.test(value.trim()),
}

const classesOf = (selector) => [...selector.matchAll(/\.([\w-]+)/g)].map(([, name]) => name)

// The first viewport's motion check (spec §5.5, plan Ruling F14) for the
// stylesheet at `path`. `hero` is the selector list of the first viewport's
// blocks ('.hero, .half'); a rule is the first viewport's when a selector of
// it names one of those blocks, or an element or a modifier of one
// (.hero__title, .half--gr).
//
// The first viewport moves by CSS from first paint, only where motion is
// allowed, and stops at once where it is not:
// - every rule that declares an animation, the first viewport's or not,
//   starts with :root.js (the motion gate, src/utils/motionGate.js) in every
//   selector, and sits inside @media (prefers-reduced-motion: no-preference);
// - outside @keyframes and outside that media query, no rule of the first
//   viewport declares opacity 0, visibility hidden, a stroke-dashoffset, a
//   translateY(…) or a scale…(…). The starting states live in the keyframes,
//   held by a `both` fill, so reduced motion switched on mid-page never leaves
//   anything hidden, moved or covered.
// Returns the problems, one line each; [] when there are none.
export function firstViewportMotionProblems(path, hero) {
  const blocks = hero.split(',').map((selector) => selector.trim().replace(/^\./, ''))
  const ofBlock = (name) => blocks.some((block) => name === block || name.startsWith(`${block}__`) || name.startsWith(`${block}--`))
  const firstViewport = (rule) => rule.selectors.some((selector) => classesOf(selector).some(ofBlock))
  const problems = []
  for (const rule of rulesOf(path)) {
    const inKeyframes = rule.atRules.some((atRule) => atRule.startsWith('@keyframes'))
    const allowed = rule.atRules.includes(NO_PREFERENCE)
    const animates = rule.declarations.some(({ prop }) => prop === 'animation' || prop === 'animation-name')
    if (animates) {
      if (!rule.selectors.every((selector) => selector.startsWith(':root.js'))) problems.push(`${rule.selector}: animates outside :root.js`)
      if (!allowed) problems.push(`${rule.selector}: animates outside ${NO_PREFERENCE}`)
    }
    if (inKeyframes || allowed || !firstViewport(rule)) continue
    for (const { prop, value } of rule.declarations) {
      if (HIDING[prop]?.(value)) problems.push(`${rule.selector}: ${prop}: ${value} outside ${NO_PREFERENCE}`)
    }
  }
  return problems
}
