// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { median, medians, metricsOf, parseArgs, summary } from './lighthouse.mjs'

// A Lighthouse 13 report, cut down to what metricsOf reads. The trace's clock
// is in microseconds; the network requests' times are in milliseconds from
// the first request. The four categories' scores are those of a recorded run
// with --categories=performance,accessibility,best-practices,seo on a
// preview-stage build, whose noindex costs the SEO score.
const report = (overrides = {}) => ({
  configSettings: { formFactor: 'mobile' },
  categories: {
    performance: { score: 0.83 },
    accessibility: { score: 0.96 },
    'best-practices': { score: 1 },
    seo: { score: 0.66 },
  },
  audits: {
    'largest-contentful-paint': { numericValue: 4675.2 },
    'cumulative-layout-shift': { numericValue: 0.012 },
    'total-blocking-time': { numericValue: 40 },
    metrics: { details: { items: [{ observedLargestContentfulPaintTs: 5_000_357_000 }] } },
    'network-requests': {
      details: {
        debugData: { networkStartTimeTs: 5_000_000_000 },
        items: [
          { url: 'http://127.0.0.1:4190/', rendererStartTime: 0, transferSize: 9443 },
          { url: 'http://127.0.0.1:4190/assets/photo-4.webp', rendererStartTime: 25.6, transferSize: 220904 },
          { url: 'http://127.0.0.1:4190/assets/engine.js', rendererStartTime: 400, transferSize: 50000 },
        ],
      },
    },
  },
  ...overrides,
})

const ALL = ['performance', 'accessibility', 'best-practices', 'seo']

describe('metricsOf', () => {
  it('reads LCP, CLS, TBT and, by default, the performance score alone', () => {
    const metrics = metricsOf(report())
    expect(metrics).toMatchObject({ lcp: 4675.2, cls: 0.012, tbt: 40 })
    expect(metrics.scores).toEqual({ performance: 83 })
  })

  it('carries the score of each category asked for, out of 100', () => {
    expect(metricsOf(report(), ALL).scores).toEqual({ performance: 83, accessibility: 96, 'best-practices': 100, seo: 66 })
    expect(metricsOf(report(), ['accessibility']).scores).toEqual({ accessibility: 96 })
  })

  // A category the run left out, or one Lighthouse could not score (its
  // score is null), is never written down as a number.
  it('throws when a category asked for is missing from the report or has no score', () => {
    const performanceOnly = report({ categories: { performance: { score: 0.83 } } })
    expect(() => metricsOf(performanceOnly, ['performance', 'seo'])).toThrow(/seo/)
    const unscored = report({ categories: { performance: { score: 0.83 }, accessibility: { score: null } } })
    expect(() => metricsOf(unscored, ['performance', 'accessibility'])).toThrow(/accessibility/)
  })

  // The figures come from the performance category's audits: a run without
  // it (the SEO score of a production-stage build) measures none.
  it('reads only the scores of a run without the performance category', () => {
    const seoOnly = { configSettings: { formFactor: 'mobile' }, categories: { seo: { score: 1 } }, audits: { 'is-crawlable': { score: 1 } } }
    expect(metricsOf(seoOnly, ['seo'])).toEqual({ scores: { seo: 100 } })
  })

  it('counts the bytes of the requests made before the LCP was painted, in the trace', () => {
    // The LCP painted 357 ms after the first request; engine.js was asked for at 400 ms.
    expect(metricsOf(report()).bytesBeforeLcp).toBe(9443 + 220904)
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
  it('takes the URLs, and the performance category unless told otherwise', () => {
    expect(parseArgs(['http://127.0.0.1:4190/', 'http://127.0.0.1:4190/eu-proekt'])).toEqual({
      urls: ['http://127.0.0.1:4190/', 'http://127.0.0.1:4190/eu-proekt'],
      categories: ['performance'],
    })
  })

  it('takes --categories=<list>, comma-separated, anywhere among the URLs', () => {
    expect(parseArgs(['http://127.0.0.1:4190/', '--categories=performance,accessibility,best-practices,seo'])).toEqual({
      urls: ['http://127.0.0.1:4190/'],
      categories: ALL,
    })
    expect(parseArgs(['--categories=seo', 'http://127.0.0.1:4190/']).categories).toEqual(['seo'])
  })

  it('refuses a category Lighthouse 13 does not have, an empty list and any other flag', () => {
    expect(() => parseArgs(['--categories=performance,pwa', 'http://127.0.0.1:4190/'])).toThrow(/pwa/)
    expect(() => parseArgs(['--categories=', 'http://127.0.0.1:4190/'])).toThrow(/--categories/)
    expect(() => parseArgs(['--only-categories=seo', 'http://127.0.0.1:4190/'])).toThrow(/--only-categories/)
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
    'LCP 4.68 s, CLS 0.012, TBT 40 ms, before LCP 224.9 KiB, performance 83, accessibility 96, best-practices 100, seo 66',
  )
  expect(summary({ scores: { seo: 100 } })).toBe('seo 100')
})

it('median: the middle value', () => {
  expect(median([3, 1, 2])).toBe(2)
  expect(median([0.3, 0.1, 0.2])).toBe(0.2)
  expect(median([4, 1, 3, 2])).toBe(2.5)
})
