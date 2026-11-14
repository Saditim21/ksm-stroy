import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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
// `path` is relative to the repository root.

const parse = (path) => postcss.parse(readFileSync(join(cwd(), path), 'utf8'), { from: path })

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
