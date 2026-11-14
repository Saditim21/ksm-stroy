import { expect, it } from 'vitest'
import { PRIMARY_PHONE, SITE, mapsUrl } from './site'

it('holds the company facts, the primary phone first', () => {
  expect(SITE.legalName).toBe('КСМ СТРОЙ ООД')
  expect(SITE.origin).toBe('https://www.ksmstroy.com')
  expect(SITE.phones.map(({ tel }) => tel)).toEqual(['+359887886166', '+359885762224'])
  expect(PRIMARY_PHONE.label).toBe('+359 887 886 166')
  expect(SITE.email).toBe('ksm_str@abv.bg')
  expect(SITE.offices).toHaveLength(2)
  expect(SITE.hours).toEqual(['Пн–Пт 8:00–18:00', 'Сб 9:00–14:00', 'Нд почивен ден'])
})

it('is frozen all the way down', () => {
  expect(Object.isFrozen(SITE)).toBe(true)
  expect(Object.isFrozen(SITE.phones)).toBe(true)
  expect(Object.isFrozen(SITE.phones[0])).toBe(true)
  expect(Object.isFrozen(SITE.offices)).toBe(true)
  expect(() => {
    SITE.phones[0].tel = '+359000000000'
  }).toThrow(TypeError)
})

it('searches Google Maps for an office by its address', () => {
  expect(mapsUrl('гр. София, ж.к Връбница 1')).toBe(
    'https://www.google.com/maps/search/?api=1&query=%D0%B3%D1%80.%20%D0%A1%D0%BE%D1%84%D0%B8%D1%8F%2C%20%D0%B6.%D0%BA%20%D0%92%D1%80%D1%8A%D0%B1%D0%BD%D0%B8%D1%86%D0%B0%201',
  )
})
