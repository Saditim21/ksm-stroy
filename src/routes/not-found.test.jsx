import { afterEach, expect, it, vi } from 'vitest'

// The 404 page's head. /404 is a prerendered page that answers 200, and the
// host serves its HTML for every URL with no page of its own, so it is never
// indexed and names no page as its canonical one, in any build: a production
// build (IS_PRODUCTION_BUILD, src/seo/stage.js) included.

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

it.each([true, false])('is noindex with no canonical link (production build: %s)', async (production) => {
  vi.stubGlobal('IS_PRODUCTION_BUILD', production)
  vi.resetModules()
  const { meta } = await import('./not-found')

  const head = meta()

  expect(head).toContainEqual({ title: 'Страницата не е намерена - KSM Stroy' })
  expect(head).toContainEqual({ name: 'robots', content: 'noindex, nofollow' })
  expect(head.filter((tag) => tag.rel === 'canonical' || tag.property === 'og:url')).toEqual([])
})
