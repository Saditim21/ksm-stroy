import { describe, expect, it } from 'vitest'
import { STATUS, normalizeStatus, summarizeStatuses } from './propertyStatus'

// Production contract (main @7a741d5): the owner picks one of four values in
// the "Статус" column of the Google Sheets. Sold beats reserved beats blocked
// beats available; an empty cell means available; unknown text passes through.

describe('normalizeStatus', () => {
  it('maps the four sheet values to the canonical statuses', () => {
    expect(normalizeStatus('Свободен')).toBe('Свободен')
    expect(normalizeStatus('Резервиран')).toBe('Резервиран')
    expect(normalizeStatus('Продаден')).toBe('Продадени')
    expect(normalizeStatus('Блокиран')).toBe('Блокиран')
  })

  it('exposes the canonical values as STATUS', () => {
    expect(STATUS).toEqual({
      AVAILABLE: 'Свободен',
      RESERVED: 'Резервиран',
      SOLD: 'Продадени',
      BLOCKED: 'Блокиран',
    })
  })

  it('keeps the plural "Продадени" as the sold value', () => {
    expect(normalizeStatus('Продадени')).toBe('Продадени')
    expect(normalizeStatus('продадени')).toBe('Продадени')
  })

  it('treats an empty cell as available', () => {
    expect(normalizeStatus('')).toBe('Свободен')
    expect(normalizeStatus('   ')).toBe('Свободен')
    expect(normalizeStatus(null)).toBe('Свободен')
    expect(normalizeStatus(undefined)).toBe('Свободен')
  })

  it('ignores case and surrounding whitespace', () => {
    expect(normalizeStatus('  СВОБОДЕН ')).toBe('Свободен')
    expect(normalizeStatus('резервиран')).toBe('Резервиран')
    expect(normalizeStatus(' блокиран\t')).toBe('Блокиран')
    expect(normalizeStatus('ПРОДАДЕН')).toBe('Продадени')
  })

  it('accepts the English synonyms', () => {
    expect(normalizeStatus('Available')).toBe('Свободен')
    expect(normalizeStatus('free')).toBe('Свободен')
    expect(normalizeStatus('Reserved')).toBe('Резервиран')
    expect(normalizeStatus('SOLD')).toBe('Продадени')
    expect(normalizeStatus('Blocked')).toBe('Блокиран')
  })

  it('resolves a mixed value to the more restrictive status', () => {
    expect(normalizeStatus('Свободен - блокиран')).toBe('Блокиран')
    expect(normalizeStatus('Резервиран (блокиран)')).toBe('Резервиран')
    expect(normalizeStatus('Блокиран, продаден')).toBe('Продадени')
    expect(normalizeStatus('Резервиран - продаден')).toBe('Продадени')
    expect(normalizeStatus('Продаден на зелено')).toBe('Продадени')
  })

  it('passes unknown text through untouched, so nothing is silently hidden', () => {
    expect(normalizeStatus('Скоро')).toBe('Скоро')
    expect(normalizeStatus('  Скоро  ')).toBe('Скоро')
    expect(normalizeStatus('В строеж')).toBe('В строеж')
  })
})

describe('summarizeStatuses', () => {
  it('counts every status, including blocked', () => {
    expect(
      summarizeStatuses(['Свободен', '', 'Резервиран', 'Продаден', 'Продадени', 'Блокиран', 'Свободен - блокиран']),
    ).toEqual({ total: 7, available: 2, reserved: 1, sold: 2, blocked: 2 })
  })

  it('normalises raw sheet text before counting', () => {
    expect(summarizeStatuses(['sold', 'AVAILABLE', ' резервиран ', null, 'blocked'])).toEqual({
      total: 5, available: 2, reserved: 1, sold: 1, blocked: 1,
    })
  })

  it('counts unknown text in the total only', () => {
    expect(summarizeStatuses(['Скоро', 'Свободен'])).toEqual({
      total: 2, available: 1, reserved: 0, sold: 0, blocked: 0,
    })
  })

  it('returns zeros for an empty list', () => {
    expect(summarizeStatuses([])).toEqual({ total: 0, available: 0, reserved: 0, sold: 0, blocked: 0 })
  })
})
