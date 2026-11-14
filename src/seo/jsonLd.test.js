import { expect, it } from 'vitest'
import { organizationJsonLd } from './jsonLd'

it('carries the real business data and nothing invented', () => {
  const ld = organizationJsonLd()
  const text = JSON.stringify(ld)
  expect(text).not.toContain('Строителна 123')
  expect(text).not.toContain('Кирил Стоянов')
  expect(ld.foundingDate).toBe('2008-09')
  expect(ld.address).toHaveLength(2)
  expect(ld.address.every((a) => a['@type'] === 'PostalAddress')).toBe(true)
  expect(ld.telephone).toEqual(['+359887886166', '+359885762224'])
  expect(ld).not.toHaveProperty('founder')
  expect(ld).not.toHaveProperty('geo')
  expect(ld.url).toBe('https://www.ksmstroy.com')
  expect(ld.openingHoursSpecification).toHaveLength(2)
})
