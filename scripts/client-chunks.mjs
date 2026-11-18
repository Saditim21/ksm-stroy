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
// - GROUPS, the explorer's: each is one chunk on its pages, which it names,
//   and which all import its head. It holds every module that those pages
//   all need and no other page does, and its riders: modules only some of
//   those pages need, which go along rather than be a chunk of their own on
//   each page that needs them.
// These chunks hold the modules pinned here and nothing else, not what they
// import (onlyExplicitManualChunks); Rollup splits the rest as before. A head,
// a rider or a page the client build no longer has fails the build, and so
// do a rider another page needs, a page of a group that no longer imports its
// head, and a page that imports a group's head without being one of its
// pages: a page joins a group, and loads its chunk and stylesheet with every
// rider, only where GROUPS says so. A head shared that widely (the motion
// hook is every page's with the system's reveals) never takes a page in
// unasked.

// The client entry (React Router's default, or the site's own), and the root
// route as React Router's client build names it.
const CLIENT_ENTRY = /[\\/]entry\.client\.[jt]sx?$/
const ROOT_ROUTE = /[\\/]src[\\/]root\.jsx\?/

// The explorer's groups, each by its head, its pages (their route modules)
// and its riders. Контакти (M4 Task 2) shares the inquiry form, the reveals,
// the landing hold and the hydration hook with the pages of the facade and
// the explorer: each group takes it in, so those pages keep their chunks as
// they were, and Контакти loads the facade's and the explorer's code with
// them, unused, rather than cost each of those pages a chunk more (about
// 600 B for the form's alone, measured in M4 Task 2). Продажби (M4 Task 3)
// shares the reveals, the status counts, the model and the explorer's
// context (its block grids' own) with them, but neither the form nor the
// facade: it takes in the facade's group the same way, which is headed by
// the motion hook so that it does. Splitting what Продажби shares into a
// chunk of its own cost every other page of the group about 730 B, the two
// chunks against the one (measured in M4 Task 3; this way Home's first load
// grew 164 B and Golden Residence's 477 B). Обекти (M4 Task 4) shares only
// the reveals and the preload helpers with them, and the facade's pages
// have nothing else in common that it lacks (its module graph, read in M4
// Task 4: the motion hook, the reveals and the two preload helpers), so no
// head is theirs alone: it takes in the facade's group the same way. So
// does За нас (M4 Task 5), which shares the same four and nothing more.
// The EU page and the 404 page (M4 Task 6) join no group, and must import
// none of the four: each would leave the facade's chunk for one of its own
// on every page of the group. The 404's motion is all CSS (it is all first
// viewport); the EU page's is CSS too, its budget's moment marked by an
// IntersectionObserver, and its poster is still (M4 ruling T6d: as one of
// the facade's pages, for the reveals on its poster alone, it loaded the
// facade's chunk and stylesheet unused, 10,400 B of script and about
// 6.4 KB of render-blocking CSS, gzip).
// Those heads are other pages' too: the motion hook is every page's with
// the system's reveals (useReveals, useWipes), and the hydration hook every
// page's whose view waits for hydration. Such a page fails the build until
// GROUPS says what it loads, rather than load a group's chunk and
// stylesheet unused (the facade's: 10,368 B of script and 6,428 B of
// render-blocking CSS, gzip, in M4 Task 3). Then list it among the group's
// pages, or give the group a head that page doesn't import.
export const GROUPS = [
  // Its pages, which all have motion: Home, both projects' pages and their
  // block pages, Контакти, Продажби, Обекти and За нас. The form, the
  // facade and what they share, with riders that only some of those pages
  // show: the form itself and the closing inquiry's section (not on
  // Продажби, Обекти or За нас), the facade itself (on none of the four),
  // the status counts (not on Контакти, Обекти or За нас), the number that
  // rolls in (not on a Многофамилна block page, Обекти or За нас), the
  // stale-data notice with its stylesheet (only on Home, Golden Residence's
  // pages, Контакти and Продажби) and the explorer's context (only on the
  // projects' pages and Продажби). A page loads them unused, as a
  // Многофамилна page did before; without them, Home and Golden Residence,
  // whose first load M4 caps, would load more.
  {
    name: 'facade',
    head: 'src/motion/useMotion.js',
    pages: ['src/pages/Home.jsx', 'src/routes/golden-residence.jsx', 'src/routes/golden-residence-block.jsx', 'src/routes/mnogofamilna.jsx', 'src/routes/mnogofamilna-block.jsx', 'src/routes/contact.jsx', 'src/routes/projects.jsx', 'src/routes/blog.jsx', 'src/routes/about.jsx'],
    riders: ['src/components/inquiry/useInquiryForm.jsx', 'src/components/inquiry/InquirySection.jsx', 'src/explorer/Facade.jsx', 'src/components/ui/StatusCount.jsx', 'src/components/ui/RollingNumber.jsx', 'src/explorer/StaleNotice.jsx', 'src/explorer/useExplorer.js'],
  },
  // Its pages, which all wait for hydration: every page of a project, and
  // Контакти, whose prefill and landing do. The hydration hook and the
  // landing hold, with the explorer's provider, its state and the facade's
  // captions, which Контакти doesn't use, and the list's loader, which a
  // Многофамилна block page doesn't use either.
  {
    name: 'explorer',
    head: 'src/hooks/useHydrated.js',
    pages: ['src/routes/golden-residence.jsx', 'src/routes/golden-residence-block.jsx', 'src/routes/mnogofamilna.jsx', 'src/routes/mnogofamilna-block.jsx', 'src/routes/contact.jsx'],
    riders: ['src/explorer/ExplorerContext.jsx', 'src/explorer/captions.jsx', 'src/explorer/loadUnitList.js'],
  },
]

// Copies (M4 Tasks 2–6), the one other way a page keeps what it shares out
// of the shared chunks. A page that needs a little of a module other pages
// share, where sharing it would split it out of their chunks into a chunk
// of its own or grow a first load that M4 caps (Home's), imports it under a
// query of its own, its page's name: `home.json?contact`. Vite takes
// `module?query` for a module of its own, so the build gives that page its
// own copy of what it reads, and the module stays in the other pages'
// chunks as it was (ruling M4-PF3). The copy's bytes are that page's alone.
// COPIES lists each one: its importer, the module, and the query, which
// names the importer's page (its folder under src/pages/, or its route
// module under src/routes/). scripts/client-chunks.test.mjs fails on a query
// import COPIES does not list, on one it lists that has gone, and on a query
// that names another page. Each importer says why at its import.
export const COPIES = [
  // Контакти (Task 2): the service stills under the construction subject,
  // and Многофамилна's dated apartments, which its prefill checks.
  { by: 'src/pages/contact/ContactInquiry.jsx', module: 'src/data/images/home.json', query: 'contact' },
  { by: 'src/pages/contact/ContactInquiry.jsx', module: 'src/data/mnogofamilna/snapshot.js', query: 'contact' },
  // The closing ways of Контакти, Продажби and Обекти (Tasks 2–4), which
  // would otherwise share a chunk with Home's teaser and add 220–260 B to
  // Home's first load.
  { by: 'src/routes/contact.jsx', module: 'src/components/ui/Ways.jsx', query: 'contact' },
  { by: 'src/routes/projects.jsx', module: 'src/components/ui/Ways.jsx', query: 'projects' },
  { by: 'src/routes/blog.jsx', module: 'src/components/ui/Ways.jsx', query: 'blog' },
  // Обекти's works (Task 4), which reuse Home's six photos (ruling M4-PF5).
  { by: 'src/pages/works/works.js', module: 'src/data/images/home.json', query: 'works' },
  // За нас's photos (Task 5), two of them Home's and Обекти's.
  { by: 'src/pages/about/photos.js', module: 'src/data/images/home.json', query: 'about' },
  { by: 'src/pages/about/photos.js', module: 'src/data/images/works.json', query: 'about' },
]
// The 404 page (Task 6) and the EU page (ruling T6d) copy by hand instead:
// neither may import a module the facade group's chunk holds, so each
// states the few values it needs itself, and a test holds each to its
// source: the display face's preload, on both pages (src/routes/not-found.jsx
// and src/routes/eu-proekt.jsx, as src/utils/documentPreloads.js and
// fontLinks.js give it; their prerender tests), and plan А's drawing and
// block А's outlines (src/pages/notfound/LostPlan.jsx, as Golden Residence's
// floors map gives them). scripts/client-chunks.test.mjs fails on a file
// here that imports the facade chunk's shared modules (the motion hook, the
// hydration hook, the preload helpers), which would leave that chunk for
// one of their own on every page of the group, the build none the wiser.
export const HAND_COPIES = ['src/routes/not-found.jsx', 'src/pages/notfound/LostPlan.jsx', 'src/routes/eu-proekt.jsx']

// A source file's module id, by its path from the repository.
function moduleOf(ids, file) {
  const id = ids.find((each) => each.replace(/\\/g, '/').endsWith(`/${file}`))
  if (!id) throw new Error(`client-chunks: ${file} is not in the client build; update GROUPS in scripts/client-chunks.mjs`)
  return id
}

// A page's route module, by the file React Router's client build names with
// a query: whether it is `file` (a path from the repository), and the path
// from the repository to show.
const pathOf = (id) => id.replace(/\\/g, '/').replace(/\?.*$/, '')
const isPage = (id, file) => pathOf(id).endsWith(`/${file}`)
const shown = (id) => pathOf(id).slice(pathOf(id).lastIndexOf('/src/') + 1)

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
  for (const { name, head, pages = [], riders } of groups) {
    const own = pagesOf.get(moduleOf(ids, head))
    if (!own) throw new Error(`client-chunks: no page imports ${head}`)
    // Its pages are those GROUPS names: each imports the head, and no other
    // page does.
    for (const page of own) {
      if (!pages.some((file) => isPage(page, file))) {
        throw new Error(`client-chunks: ${shown(page)} imports ${head}, the head of ${name}, but is not one of its pages (as one, it would load ${name}'s chunk and stylesheet, every rider included); revise GROUPS in scripts/client-chunks.mjs: list it among ${name}'s pages, or give ${name} a head it doesn't import`)
      }
    }
    for (const file of pages) {
      if ([...own].some((page) => isPage(page, file))) continue
      const built = entries.some((entry) => isPage(entry, file))
      throw new Error(`client-chunks: ${file}, one of ${name}'s pages, ${built ? `doesn't import its head ${head}` : 'is not in the client build'}; revise GROUPS in scripts/client-chunks.mjs`)
    }
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
