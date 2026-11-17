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
})

// The opening hours derive from the site's one hours source (SITE.hours,
// M3/M4 spec §4.4), as production's block had them: the closed Sunday left
// out, the times in schema.org's hh:mm.
it('opens Monday to Friday 08:00–18:00 and Saturday 09:00–14:00', () => {
  expect(organizationJsonLd().openingHoursSpecification).toEqual([
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
  ])
})
