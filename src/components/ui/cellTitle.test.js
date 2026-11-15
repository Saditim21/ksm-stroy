import { describe, expect, it } from 'vitest'
import { cellTitle, statusText } from './cellTitle'

// What the Golden Residence page's pictures of its places say to a pointer
// (the block grids' squares, the parking cells): the status as StatusChip
// reads it (spec §7.9, ruling R1), in a title of what is known.

describe('statusText', () => {
  it('reads a known status by its label', () => {
    expect(statusText({ status: 'available' })).toBe('Свободен')
    expect(statusText({ status: 'reserved' })).toBe('Резервиран')
    expect(statusText({ status: 'sold' })).toBe('Продаден')
    expect(statusText({ status: 'blocked' })).toBe('Блокиран')
  })

  // Ruling R1: a status the rules do not know shows the owner's own text,
  // trimmed, else „Няма информация“; so does a place the sheets do not have.
  it('reads a status the rules do not know as the place’s own text, else „Няма информация“', () => {
    expect(statusText({ status: 'unknown', statusText: '  Скоро ' })).toBe('Скоро')
    expect(statusText({ status: 'unknown', statusText: ' ' })).toBe('Няма информация')
    expect(statusText({ status: 'later', statusText: 'Скоро' })).toBe('Скоро')
    expect(statusText(undefined)).toBe('Няма информация')
  })
})

describe('cellTitle', () => {
  it('joins what is known with „ · “, leaving out what is not', () => {
    expect(cellTitle('А 501', '2-стаен', '62,18 м²', 'Продаден')).toBe('А 501 · 2-стаен · 62,18 м² · Продаден')
    expect(cellTitle('Г-001', null, 'Продаден')).toBe('Г-001 · Продаден')
    expect(cellTitle('А 501', undefined, null, 'Няма информация')).toBe('А 501 · Няма информация')
  })
})
