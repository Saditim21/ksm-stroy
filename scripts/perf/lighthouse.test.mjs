// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { median, metricsOf } from './lighthouse.mjs'

// A Lighthouse 13 report, cut down to what metricsOf reads. The trace's clock
// is in microseconds; the network requests' times are in milliseconds from
// the first request.
const report = (overrides = {}) => ({
  configSettings: { formFactor: 'mobile' },
  categories: { performance: { score: 0.83 } },
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

describe('metricsOf', () => {
  it('reads LCP, CLS, TBT and the score', () => {
    expect(metricsOf(report())).toMatchObject({ lcp: 4675.2, cls: 0.012, tbt: 40, score: 83 })
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

it('median: the middle value', () => {
  expect(median([3, 1, 2])).toBe(2)
  expect(median([0.3, 0.1, 0.2])).toBe(0.2)
  expect(median([4, 1, 3, 2])).toBe(2.5)
})
