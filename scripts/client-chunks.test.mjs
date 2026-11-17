// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { clientChunks, GROUPS, pinnedChunks } from './client-chunks.mjs'

// The browser's chunks (see client-chunks.mjs), on a small module graph built
// as React Router's client build names its modules: the client entry, the
// root route, and five pages, Home, a project page, a block page, the contact
// page, which has the inquiry form and waits for hydration but has neither a
// facade nor an explorer, and a page with none of them.

const ROUTE = '?__react-router-build-client-route'
const id = {
  client: '/repo/node_modules/@react-router/dev/dist/config/defaults/entry.client.tsx',
  domClient: '/repo/node_modules/react-dom/client.js',
  react: '/repo/node_modules/react/index.js',
  helper: '\0vite/preload-helper.js',
  rootRoute: `/repo/src/root.jsx${ROUTE}`,
  root: '/repo/src/root.jsx',
  menu: '/repo/src/shell/SiteMenu.jsx',
  button: '/repo/src/components/ui/Button.jsx',
  scroll: '/repo/src/utils/scroll.js',
  format: '/repo/src/utils/format.js',
  homeRoute: `/repo/src/pages/Home.jsx${ROUTE}`,
  home: '/repo/src/pages/Home.jsx',
  teaser: '/repo/src/pages/home/TeaserSection.jsx',
  projectRoute: `/repo/src/routes/golden-residence.jsx${ROUTE}`,
  blockRoute: `/repo/src/routes/mnogofamilna-block.jsx${ROUTE}`,
  euRoute: `/repo/src/routes/eu-proekt.jsx${ROUTE}`,
  contactRoute: `/repo/src/routes/contact.jsx${ROUTE}`,
  form: '/repo/src/components/inquiry/useInquiryForm.jsx',
  inquiry: '/repo/src/components/inquiry/InquirySection.jsx',
  counts: '/repo/src/components/ui/StatusCount.jsx',
  hydrated: '/repo/src/hooks/useHydrated.js',
  hold: '/repo/src/shell/landingHold.js',
  facade: '/repo/src/explorer/Facade.jsx',
  model: '/repo/src/explorer/model.js',
  status: '/repo/src/components/ui/status.js',
  loadSurfaces: '/repo/src/explorer/loadSurfaces.js',
  surfaces: '/repo/src/explorer/surfaces.js',
  rolling: '/repo/src/components/ui/RollingNumber.jsx',
  roll: '/repo/src/utils/rolling.js',
  digits: '/repo/src/utils/digits.js',
  dims: '/repo/src/utils/dims.js',
  stale: '/repo/src/explorer/StaleNotice.jsx',
  context: '/repo/src/explorer/ExplorerContext.jsx',
  state: '/repo/src/explorer/useExplorerState.js',
  captions: '/repo/src/explorer/captions.jsx',
  useExplorer: '/repo/src/explorer/useExplorer.js',
  section: '/repo/src/explorer/ExplorerSection.jsx',
  tabs: '/repo/src/explorer/ViewTabs.jsx',
  listLoader: '/repo/src/explorer/loadUnitList.js',
}

// Each module: what it imports statically, whether it is an entry, and what
// imports it lazily.
const GRAPH = {
  [id.client]: { entry: true, imports: [id.react, id.domClient] },
  [id.domClient]: { imports: [id.react] },
  [id.react]: { imports: [] },
  [id.helper]: { imports: [] },
  [id.rootRoute]: { entry: true, imports: [id.root] },
  [id.root]: { imports: [id.react, id.helper, id.menu, id.button, id.format] },
  [id.menu]: { imports: [id.react] },
  [id.button]: { imports: [id.react, id.scroll] },
  [id.scroll]: { imports: [] },
  [id.format]: { imports: [] },
  [id.homeRoute]: { entry: true, imports: [id.home] },
  [id.home]: { imports: [id.react, id.helper, id.button, id.teaser, id.facade, id.rolling, id.stale, id.dims, id.inquiry] },
  [id.teaser]: { imports: [id.react] },
  [id.projectRoute]: { entry: true, imports: [id.react, id.facade, id.context, id.section, id.rolling, id.dims, id.inquiry] },
  [id.blockRoute]: { entry: true, imports: [id.react, id.facade, id.context, id.captions, id.inquiry] },
  [id.euRoute]: { entry: true, imports: [id.react, id.button, id.status, id.digits, id.dims] },
  [id.contactRoute]: { entry: true, imports: [id.react, id.form, id.rolling, id.hydrated, id.hold] },
  [id.inquiry]: { imports: [id.react, id.form] },
  [id.form]: { imports: [id.react] },
  [id.hydrated]: { imports: [id.react] },
  [id.hold]: { imports: [] },
  [id.facade]: { imports: [id.react, id.model, id.status, id.loadSurfaces, id.counts] },
  [id.counts]: { imports: [id.react, id.status] },
  [id.model]: { imports: [] },
  [id.status]: { imports: [] },
  [id.loadSurfaces]: { imports: [] },
  [id.surfaces]: { imports: [id.react, id.format, id.model], dynamicImporters: [id.loadSurfaces] },
  [id.rolling]: { imports: [id.react, id.roll, id.digits] },
  [id.roll]: { imports: [] },
  [id.digits]: { imports: [] },
  [id.dims]: { imports: [] },
  [id.stale]: { imports: [id.react] },
  [id.context]: { imports: [id.react, id.state, id.model, id.loadSurfaces, id.hold] },
  [id.state]: { imports: [id.hydrated] },
  [id.captions]: { imports: [id.useExplorer] },
  [id.useExplorer]: { imports: [id.react] },
  [id.section]: { imports: [id.react, id.tabs, id.listLoader, id.stale, id.rolling, id.captions] },
  [id.tabs]: { imports: [id.react] },
  [id.listLoader]: { imports: [] },
}

const info =(graph) => (moduleId) => {
  const { entry = false, imports, dynamicImporters = [] } = graph[moduleId]
  return { isEntry: entry, importedIds: imports, dynamicImporters }
}
const pin = (graph = GRAPH, groups) => pinnedChunks(Object.keys(graph), info(graph), groups)
const without = (moduleId) => Object.fromEntries(Object.entries(GRAPH).filter(([key]) => key !== moduleId))

describe('pinnedChunks', () => {
  const pinned = pin()

  it('pins what the client entry and the root route share with another entry or a lazy import in one chunk, site', () => {
    // React (every entry), the bundler's helper (the root and Home), the
    // shell's button and what it imports (the root, Home and a page), and a
    // module the root and a lazy chunk both import.
    for (const shared of [id.react, id.helper, id.button, id.scroll, id.format]) expect(pinned.get(shared)).toBe('site')
  })

  it('leaves in its entry\'s chunk what only that entry needs, and never pins an entry', () => {
    for (const own of [id.domClient, id.root, id.menu, id.teaser]) expect(pinned.has(own)).toBe(false)
    for (const entry of [id.client, id.rootRoute, id.homeRoute, id.projectRoute, id.blockRoute, id.euRoute, id.contactRoute]) expect(pinned.has(entry)).toBe(false)
  })

  it('makes a group of what every page with its head needs, and of its riders', () => {
    // The facade's group is the inquiry form's: its pages are Home, the
    // project page, the block page and the contact page, which all need the
    // form.
    expect(pinned.get(id.form)).toBe('facade')
    // Riders, which the contact page doesn't need, with what they import: the
    // facade, the closing inquiry and the status counts.
    for (const member of [id.facade, id.model, id.loadSurfaces, id.inquiry, id.counts]) expect(pinned.get(member)).toBe('facade')
    // Riders, which Home and the project page need and the block page doesn't,
    // with what they import.
    expect(pinned.get(id.rolling)).toBe('facade')
    expect(pinned.get(id.roll)).toBe('facade')
    expect(pinned.get(id.stale)).toBe('facade')
    // The explorer's group is the hydration hook's: its pages are the project
    // page, the block page and the contact page, which all need the hook and
    // the landing hold; the explorer itself rides along.
    for (const member of [id.hydrated, id.hold]) expect(pinned.get(member)).toBe('explorer')
    for (const member of [id.context, id.state, id.captions, id.useExplorer]) expect(pinned.get(member)).toBe('explorer')
    expect(pinned.get(id.listLoader)).toBe('explorer')
  })

  it('leaves out of a group what only some of its pages need and doesn\'t ride, and what another page needs', () => {
    // The explorer's section and its tabs: the project page alone.
    expect(pinned.has(id.section)).toBe(false)
    expect(pinned.has(id.tabs)).toBe(false)
    // What the page without a facade needs too: the status module, which all
    // the facade's pages need; a module that as many pages need, but not the
    // same ones; and what a rider imports.
    expect(pinned.has(id.status)).toBe(false)
    expect(pinned.has(id.dims)).toBe(false)
    expect(pinned.has(id.digits)).toBe(false)
    // A lazy chunk's own module keeps Rollup's split.
    expect(pinned.has(id.surfaces)).toBe(false)
  })

  it('names the groups the build uses', () => {
    expect(GROUPS.map(({ name }) => name)).toEqual(['facade', 'explorer'])
  })

  it('fails without the client entry or the root route', () => {
    expect(() => pin(without(id.client))).toThrow(/no client entry or no root route/)
    expect(() => pin(without(id.rootRoute))).toThrow(/no client entry or no root route/)
  })

  it('fails when a head or a rider is gone', () => {
    expect(() => pin(GRAPH, [{ name: 'facade', head: 'src/explorer/Gone.jsx', riders: [] }])).toThrow(/Gone\.jsx is not in the client build/)
    expect(() => pin(GRAPH, [{ name: 'facade', head: 'src/explorer/Facade.jsx', riders: ['src/explorer/Gone.jsx'] }])).toThrow(/Gone\.jsx is not in the client build/)
  })

  it('fails when a rider is needed by a page that doesn\'t import the group\'s head', () => {
    expect(() => pin(GRAPH, [{ name: 'facade', head: 'src/explorer/Facade.jsx', riders: ['src/components/ui/status.js'] }])).toThrow(/status\.js cannot ride with facade/)
    // The contact page needs the number that rolls in, and has no facade.
    expect(() => pin(GRAPH, [{ name: 'facade', head: 'src/explorer/Facade.jsx', riders: ['src/components/ui/RollingNumber.jsx'] }])).toThrow(/RollingNumber\.jsx cannot ride with facade/)
  })
})

describe('the plugin', () => {
  const plugin = clientChunks()

  it('runs in the production build only, on the browser\'s build only', () => {
    expect(plugin.apply).toBe('build')
    expect(plugin.configEnvironment('ssr')).toBeUndefined()
  })

  it('gives the browser\'s build the pinned chunks, and pins nothing else', () => {
    const { output } = plugin.configEnvironment('client').build.rollupOptions
    expect(output.onlyExplicitManualChunks).toBe(true)
    const api = (graph) => ({ getModuleIds: () => Object.keys(graph)[Symbol.iterator](), getModuleInfo: info(graph) })
    const pass = api(GRAPH)
    expect(output.manualChunks(id.button, pass)).toBe('site')
    expect(output.manualChunks(id.captions, pass)).toBe('explorer')
    expect(output.manualChunks(id.section, pass)).toBeUndefined()
    // Each pass reads its own graph: in this one only the root imports the
    // button, which stays in the root's chunk.
    const rootOnly = {
      ...GRAPH,
      [id.home]: { imports: GRAPH[id.home].imports.filter((each) => each !== id.button) },
      [id.euRoute]: { entry: true, imports: GRAPH[id.euRoute].imports.filter((each) => each !== id.button) },
    }
    expect(output.manualChunks(id.button, api(rootOnly))).toBeUndefined()
    expect(output.manualChunks(id.button, pass)).toBe('site')
  })
})
