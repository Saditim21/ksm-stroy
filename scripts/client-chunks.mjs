// The browser's chunks (M4 Task 0; spec M3/M4 §10: free bytes before adding
// them). React Router builds the client entry and each route as an entry of
// its own, and Rollup puts every module in a chunk by the set of entries and
// lazy imports that need it. That left two kinds of waste:
// - Every page loads the client entry and the root route, but Rollup cannot
//   know that: the modules they share with the pages came out as seventeen
//   chunks, each a request in every page's head, with its own import and
//   export lines.
// - The explorer's shared chunks held together only while each Многофамилна
//   page imported from ExplorerSection.jsx, whose section it never renders
//   (M3 rulings T6a, T6d): a module that some pages of a group need and the
//   others don't is a chunk of its own on each page that does.
//
// clientChunks(), a Vite plugin for the production build, pins those chunks:
// - `site`: what the client entry and the root route import, at any depth,
//   that another entry or a lazy import needs too: React, React DOM's shared
//   half, React Router, the bundler's helpers and the site's own shared
//   modules (the shell's parts, the availability store, the motion loader
//   and the like). Every page loads it, so no page loads a byte it did not
//   load before. One chunk, not the libraries apart: that split costs every
//   page a request and 631–722 B (measured in M4 Task 0), and buys only a
//   cache that the libraries' export list, which changes with what the site
//   imports, cannot keep across deploys.
// - GROUPS, the explorer's: each is one chunk on the pages that import its
//   head. It holds every module that those pages all need and no other page
//   does, and its riders: modules only some of those pages need, which go
//   along rather than be a chunk of their own on each page that needs them.
// These chunks hold the modules pinned here and nothing else, not what they
// import (onlyExplicitManualChunks); Rollup splits the rest as before. A head
// or a rider the client build no longer has fails the build, and so does a
// rider another page needs.

// The client entry (React Router's default, or the site's own), and the root
// route as React Router's client build names it.
const CLIENT_ENTRY = /[\\/]entry\.client\.[jt]sx?$/
const ROOT_ROUTE = /[\\/]src[\\/]root\.jsx\?/

// The explorer's groups, each by its head and its riders. Контакти (M4 Task
// 2) shares the inquiry form, the reveals, the landing hold and the
// hydration hook with the pages of the facade and the explorer: each group
// takes it in, so those pages keep their chunks as they were, and Контакти
// loads the facade's and the explorer's code with them, unused, rather than
// cost each of those pages a chunk more (about 600 B for the form's alone,
// measured in M4 Task 2). Продажби (M4 Task 3) shares the reveals, the status
// counts, the model and the explorer's context (its block grids' own) with
// them, but neither the form nor the facade: it takes in the facade's group
// the same way, which is headed by the motion hook so that it does. Splitting
// what Продажби shares into a chunk of its own cost every other page of the
// group about 730 B (measured in M4 Task 3: Home 1,136 B and Golden
// Residence 1,217 B more in all, against 288 B and 484 B this way).
export const GROUPS = [
  // On every page with motion: Home, both projects' pages and their block
  // pages, Контакти and Продажби. The form, the facade and what they share,
  // with riders that only some of those pages show: the form itself and the
  // closing inquiry's section (not on Продажби), the facade itself (on
  // neither), the status counts (not on Контакти), the number that rolls in
  // (not on a Многофамилна block page), the stale-data notice with its
  // stylesheet (only on Home, Golden Residence's pages, Контакти and
  // Продажби) and the explorer's context (only on the projects' pages and
  // Продажби). A page loads them unused, as a Многофамилна page did before;
  // without them, Home and Golden Residence, whose first load M4 caps, would
  // load more.
  { name: 'facade', head: 'src/motion/useMotion.js', riders: ['src/components/inquiry/useInquiryForm.jsx', 'src/components/inquiry/InquirySection.jsx', 'src/explorer/Facade.jsx', 'src/components/ui/StatusCount.jsx', 'src/components/ui/RollingNumber.jsx', 'src/explorer/StaleNotice.jsx', 'src/explorer/useExplorer.js'] },
  // On every page that waits for hydration: every page of a project, and
  // Контакти, whose prefill and landing do. The hydration hook and the
  // landing hold, with the explorer's provider, its state and the facade's
  // captions, which Контакти doesn't use, and the list's loader, which a
  // Многофамилна block page doesn't use either.
  { name: 'explorer', head: 'src/hooks/useHydrated.js', riders: ['src/explorer/ExplorerContext.jsx', 'src/explorer/captions.jsx', 'src/explorer/loadUnitList.js'] },
]

// A source file's module id, by its path from the repository.
function moduleOf(ids, file) {
  const id = ids.find((each) => each.replace(/\\/g, '/').endsWith(`/${file}`))
  if (!id) throw new Error(`client-chunks: ${file} is not in the client build; update GROUPS in scripts/client-chunks.mjs`)
  return id
}

/** Each pinned module and its chunk's name, from the module graph: `ids`,
 * and `info(id)`, the module's Rollup info (isEntry, importedIds,
 * dynamicImporters). */
export function pinnedChunks(ids, info, groups = GROUPS) {
  const entries = ids.filter((id) => info(id).isEntry)
  const always = entries.filter((id) => CLIENT_ENTRY.test(id) || ROOT_ROUTE.test(id))
  if (!always.some((id) => CLIENT_ENTRY.test(id)) || !always.some((id) => ROOT_ROUTE.test(id))) {
    throw new Error(`client-chunks: no client entry or no root route among the entries (${entries.join(', ')}); update scripts/client-chunks.mjs`)
  }

  // What a module imports statically, at any depth, itself included.
  const closures = new Map()
  const closure = (start) => {
    if (closures.has(start)) return closures.get(start)
    const seen = new Set()
    const stack = [start]
    while (stack.length > 0) {
      const id = stack.pop()
      if (seen.has(id)) continue
      seen.add(id)
      stack.push(...info(id).importedIds)
    }
    closures.set(start, seen)
    return seen
  }

  // Every page loads what the client entry and the root route import. Of
  // that, what only one entry or lazy import needs stays in its chunk.
  const everywhere = new Set(always.flatMap((id) => [...closure(id)]))
  const needs = new Map()
  for (const start of new Set([...entries, ...ids.filter((id) => info(id).dynamicImporters.length > 0)])) {
    for (const id of closure(start)) {
      if (everywhere.has(id)) needs.set(id, (needs.get(id) ?? 0) + 1)
    }
  }
  const pinned = new Map()
  for (const id of everywhere) {
    if (!info(id).isEntry && needs.get(id) > 1) pinned.set(id, 'site')
  }

  // The pages (the other entries) that import each module statically.
  const pagesOf = new Map()
  for (const page of entries.filter((id) => !always.includes(id))) {
    for (const id of closure(page)) {
      if (!pagesOf.has(id)) pagesOf.set(id, new Set())
      pagesOf.get(id).add(page)
    }
  }
  for (const { name, head, riders } of groups) {
    const own = pagesOf.get(moduleOf(ids, head))
    if (!own) throw new Error(`client-chunks: no page imports ${head}`)
    // A module of no other page, and in no chunk pinned already.
    const free = (id) => pagesOf.has(id) && !everywhere.has(id) && !info(id).isEntry && !pinned.has(id)
      && [...pagesOf.get(id)].every((page) => own.has(page))
    for (const id of ids) {
      if (free(id) && pagesOf.get(id).size === own.size) pinned.set(id, name)
    }
    for (const rider of riders) {
      const id = moduleOf(ids, rider)
      if (!free(id) && pinned.get(id) !== name) {
        throw new Error(`client-chunks: ${rider} cannot ride with ${name}: a page that doesn't import ${head} needs it, or another chunk holds it`)
      }
      for (const dependency of closure(id)) {
        if (free(dependency)) pinned.set(dependency, name)
      }
    }
  }
  return pinned
}

export function clientChunks() {
  // Rollup asks for every module's chunk in one pass, with one `api` object
  // ({ getModuleIds, getModuleInfo }) per pass: the graph is read once a pass.
  const pinnedByPass = new WeakMap()
  const manualChunks = (id, api) => {
    if (!pinnedByPass.has(api)) pinnedByPass.set(api, pinnedChunks([...api.getModuleIds()], api.getModuleInfo))
    return pinnedByPass.get(api).get(id)
  }
  return {
    name: 'ksm-client-chunks',
    apply: 'build',
    configEnvironment(name) {
      if (name !== 'client') return undefined
      return { build: { rollupOptions: { output: { manualChunks, onlyExplicitManualChunks: true } } } }
    },
  }
}
