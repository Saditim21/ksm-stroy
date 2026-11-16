// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { lighthouseArgs, median, medians, metricsOf, parseArgs, summary, urlOf } from './lighthouse.mjs'

// A recorded report, cut down to what metricsOf reads: Lighthouse 13.6.0 on
// / (the preview-stage build of the M2 results, run 1, served on
// 127.0.0.1:4190), with --categories=performance,accessibility,best-practices,seo.
// Its noindex costs the SEO score. The trace's clock is in microseconds; the
// requests' times are in milliseconds from the first request. Three of its
// requests: the document, the hero picture and the motion chunk.
const recorded = () => ({
  configSettings: { formFactor: 'mobile' },
  categories: {
    performance: { score: 0.82 },
    accessibility: { score: 1 },
    'best-practices': { score: 1 },
    seo: { score: 0.69 },
  },
  audits: {
    'largest-contentful-paint': { numericValue: 4626.3554 },
    'cumulative-layout-shift': { numericValue: 0 },
    'total-blocking-time': { numericValue: 0 },
    metrics: { details: { items: [{ observedLargestContentfulPaintTs: 5_239_117_229_645 }] } },
    'network-requests': {
      details: {
        debugData: { networkStartTimeTs: 5_239_116_829_079 },
        items: [
          { url: 'http://127.0.0.1:4190/', rendererStartTime: 0, transferSize: 12472 },
          { url: 'http://127.0.0.1:4190/img/gr-dusk-800.avif', rendererStartTime: 52.972, transferSize: 24725 },
          { url: 'http://127.0.0.1:4190/assets/engine-D-K32A_u.js', rendererStartTime: 175.931, transferSize: 52717 },
        ],
      },
    },
  },
})
const report = (overrides = {}) => ({ ...recorded(), ...overrides })

const ALL = ['performance', 'accessibility', 'best-practices', 'seo']

describe('metricsOf', () => {
  it('reads LCP, CLS, TBT and, by default, the performance score alone', () => {
    const metrics = metricsOf(report())
    expect(metrics).toMatchObject({ lcp: 4626.3554, cls: 0, tbt: 0 })
    expect(metrics.scores).toEqual({ performance: 82 })
  })

  it('carries the score of each category asked for, out of 100', () => {
    expect(metricsOf(report(), ALL).scores).toEqual({ performance: 82, accessibility: 100, 'best-practices': 100, seo: 69 })
    expect(metricsOf(report(), ['seo']).scores).toEqual({ seo: 69 })
  })

  // A category the run left out, or one Lighthouse could not score (its
  // score is null), is never written down as a number.
  it('throws when a category asked for is missing from the report or has no score', () => {
    const performanceOnly = report({ categories: { performance: { score: 0.82 } } })
    expect(() => metricsOf(performanceOnly, ['performance', 'seo'])).toThrow(/seo/)
    const unscored = report({ categories: { performance: { score: 0.82 }, accessibility: { score: null } } })
    expect(() => metricsOf(unscored, ['performance', 'accessibility'])).toThrow(/accessibility/)
  })

  // The figures come from the performance category's audits: a run without
  // it (the SEO score of a production-stage build) measures none.
  it('reads only the scores of a run without the performance category', () => {
    const seoOnly = { configSettings: { formFactor: 'mobile' }, categories: { seo: { score: 1 } }, audits: { 'is-crawlable': { score: 1 } } }
    expect(metricsOf(seoOnly, ['seo'])).toEqual({ scores: { seo: 100 } })
  })

  it('counts the bytes of the requests made before the LCP was painted, in the trace', () => {
    // The LCP painted 400.566 ms after the first request: all three count.
    expect(metricsOf(report()).bytesBeforeLcp).toBe(12472 + 24725 + 52717)
    // A request asked for after that does not.
    const later = recorded()
    later.audits['network-requests'].details.items.push({ url: 'http://127.0.0.1:4190/assets/surfaces.js', rendererStartTime: 401, transferSize: 5000 })
    expect(metricsOf(later).bytesBeforeLcp).toBe(12472 + 24725 + 52717)
  })

  it('throws when the run failed', () => {
    expect(() => metricsOf(report({ runtimeError: { code: 'NO_LCP', message: 'The page did not display content' } })))
      .toThrow(/NO_LCP/)
  })

  it('throws when the run was not on a phone', () => {
    expect(() => metricsOf(report({ configSettings: { formFactor: 'desktop' } }))).toThrow(/desktop/)
  })
})

describe('parseArgs', () => {
  it('takes the pages, over HTTP/2 and in the performance category unless told otherwise', () => {
    expect(parseArgs(['/', '/projects/golden-residence'])).toEqual({
      pages: ['/', '/projects/golden-residence'],
      categories: ['performance'],
      h1: false,
    })
  })

  // A full URL is measured where it is, as before.
  it('takes full URLs too, and paths and URLs together', () => {
    expect(parseArgs(['http://127.0.0.1:4190/', 'https://example.vercel.app/eu-proekt', '/404']).pages).toEqual([
      'http://127.0.0.1:4190/',
      'https://example.vercel.app/eu-proekt',
      '/404',
    ])
  })

  it('takes --h1 for the HTTP/1.1 server, anywhere among the pages', () => {
    expect(parseArgs(['/', '--h1']).h1).toBe(true)
    expect(parseArgs(['--h1', '/']).h1).toBe(true)
  })

  it('takes --categories=<list>, comma-separated, anywhere among the pages', () => {
    expect(parseArgs(['/', '--categories=performance,accessibility,best-practices,seo'])).toEqual({
      pages: ['/'],
      categories: ALL,
      h1: false,
    })
    expect(parseArgs(['--categories=seo', 'http://127.0.0.1:4190/']).categories).toEqual(['seo'])
  })

  it('refuses a category Lighthouse 13 does not have, an empty list and any other flag', () => {
    expect(() => parseArgs(['--categories=performance,pwa', '/'])).toThrow(/pwa/)
    expect(() => parseArgs(['--categories=', '/'])).toThrow(/--categories/)
    expect(() => parseArgs(['--only-categories=seo', '/'])).toThrow(/--only-categories/)
  })

  it('refuses a page that is neither a path nor an http(s) URL', () => {
    expect(() => parseArgs(['projects/golden-residence'])).toThrow(/projects\/golden-residence/)
    expect(() => parseArgs(['ftp://127.0.0.1/'])).toThrow(/ftp:/)
  })
})

it('urlOf: a path on the served build, a full URL as it is', () => {
  expect(urlOf('/projects/golden-residence/block-a', 'https://127.0.0.1:61234')).toBe('https://127.0.0.1:61234/projects/golden-residence/block-a')
  expect(urlOf('http://127.0.0.1:4190/eu-proekt', 'https://127.0.0.1:61234')).toBe('http://127.0.0.1:4190/eu-proekt')
})

// The figures stay comparable from run to run only with one Lighthouse
// (spec §10). Over HTTP/2 the build's server has a self-signed certificate,
// which Chrome is told to accept.
describe('lighthouseArgs', () => {
  const url = 'https://127.0.0.1:61234/'
  const chromeFlags = (args) => args.find((arg) => arg.startsWith('--chrome-flags='))

  it('runs Lighthouse 13.6.0, pinned, on the page, into the report, in the categories asked for', () => {
    const args = lighthouseArgs(url, 'C:/reports/home-1.json', ['performance', 'seo'], { h1: false })
    expect(args).toContain('lighthouse@13.6.0')
    expect(args).toContain(url)
    expect(args).toContain('--output-path=C:/reports/home-1.json')
    expect(args).toContain('--only-categories=performance,seo')
  })

  it('starts Chrome with --ignore-certificate-errors over HTTP/2 only', () => {
    expect(chromeFlags(lighthouseArgs(url, 'r.json', ['performance'], { h1: false }))).toContain('--ignore-certificate-errors')
    expect(chromeFlags(lighthouseArgs('http://127.0.0.1:61234/', 'r.json', ['performance'], { h1: true }))).not.toContain('--ignore-certificate-errors')
  })
})

describe('medians', () => {
  it('takes the middle of each figure and of each category’s score', () => {
    const runs = [
      { lcp: 3000, cls: 0, tbt: 40, bytesBeforeLcp: 300, scores: { performance: 90, seo: 66 } },
      { lcp: 2000, cls: 0.01, tbt: 0, bytesBeforeLcp: 320, scores: { performance: 95, seo: 66 } },
      { lcp: 2500, cls: 0.002, tbt: 10, bytesBeforeLcp: 310, scores: { performance: 92, seo: 69 } },
    ]
    expect(medians(runs)).toEqual({ lcp: 2500, cls: 0.002, tbt: 10, bytesBeforeLcp: 310, scores: { performance: 92, seo: 66 } })
  })

  it('takes the scores alone from runs that measured no figures', () => {
    expect(medians([{ scores: { seo: 100 } }, { scores: { seo: 92 } }, { scores: { seo: 100 } }])).toEqual({ scores: { seo: 100 } })
  })
})

it('summary: the figures, then each category’s score; the scores alone without figures', () => {
  expect(summary(metricsOf(report(), ALL))).toBe(
    'LCP 4.63 s, CLS 0.000, TBT 0 ms, before LCP 87.8 KiB, performance 82, accessibility 100, best-practices 100, seo 69',
  )
  expect(summary({ scores: { seo: 100 } })).toBe('seo 100')
})

it('median: the middle value', () => {
  expect(median([3, 1, 2])).toBe(2)
  expect(median([0.3, 0.1, 0.2])).toBe(0.2)
  expect(median([4, 1, 3, 2])).toBe(2.5)
})
