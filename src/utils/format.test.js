import { freeApartmentsLine, formatArea, plural } from './format'

test('freeApartmentsLine handles no data, zero, one and many', () => {
  expect(freeApartmentsLine(null)).toBe('Апартаменти в продажба')
  expect(freeApartmentsLine(0)).toBe('Няма свободни апартаменти')
  expect(freeApartmentsLine(1)).toBe('1 свободен апартамент')
  expect(freeApartmentsLine(2)).toBe('2 свободни апартамента')
  expect(freeApartmentsLine(5)).toBe('5 свободни апартамента')
})

test('formatArea uses the Bulgarian decimal comma', () => {
  expect(formatArea(65.68)).toBe('65,68\u00a0м²')
  expect(formatArea(null)).toBe('—')
})

test('plural picks the singular for exactly one and the plural otherwise', () => {
  expect(plural(1, 'свободен гараж', 'свободни гаража')).toBe('свободен гараж')
  expect(plural(0, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(2, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(11, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(21, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
})
