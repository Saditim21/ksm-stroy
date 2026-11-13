import {
  toApartment, toParkingUnit, normalizeUnitId, parseArea,
  summarize, distinct, sortUnits, unitButtonLabel,
} from './units'

// From golden-residence src/utils/units.test.js and status.test.js @944bb03,
// on this site's status keys: "available" where the landing says "free".

const row = {
  'Етаж': '1', 'Апартамент': 'А 101', 'Застроена': '57.46', 'Идеални': '8.22',
  'Обща': '65.68', 'Вид': '2-стаен', 'Изложение': 'Юг', 'Статус': 'Свободен',
}

describe('toApartment', () => {
  test('maps a sheet row to the unit model', () => {
    expect(toApartment(row, 'A')).toEqual({
      id: 'А101', label: 'А 101', kind: 'apartment', block: 'A', floor: 1,
      builtArea: 57.46, idealParts: 8.22, totalArea: 65.68,
      type: '2-стаен', exposure: 'Юг', status: 'available',
    })
  })

  test('skips rows without a label or a floor', () => {
    expect(toApartment({ ...row, 'Апартамент': '' }, 'A')).toBeNull()
    expect(toApartment({ ...row, 'Етаж': '' }, 'A')).toBeNull()
  })

  test('reads areas typed with a decimal comma', () => {
    expect(toApartment({ ...row, 'Обща': '65,68' }, 'A').totalArea).toBe(65.68)
  })

  test('reads the status with the production rules', () => {
    expect(toApartment({ ...row, 'Статус': 'Блокиран' }, 'A').status).toBe('blocked')
    expect(toApartment({ ...row, 'Статус': '' }, 'A').status).toBe('available')
    expect(toApartment({ ...row, 'Статус': 'Скоро' }, 'A').status).toBe('unknown')
  })
})

describe('toParkingUnit', () => {
  test('maps a garage row', () => {
    expect(toParkingUnit({
      'Номер': 'Г-001', 'Застроена': '21.07', 'Идеални': '12.94', 'Обща': '34.01', 'Тип': 'Гараж', 'Статус': 'Свободен',
    }, 'garage')).toEqual({
      id: 'Г001', label: 'Г-001', kind: 'garage', builtArea: 21.07, idealParts: 12.94, totalArea: 34.01, type: 'Гараж', status: 'available',
    })
  })

  test('fills the type and reads the plural sold status for parking', () => {
    const unit = toParkingUnit({ 'Номер': 'ПМ-02', 'Обща': '28.52', 'Статус': 'Продадени' }, 'parking')
    expect(unit).toMatchObject({ type: 'Паркомясто', status: 'sold', builtArea: null })
  })

  test('skips rows without a number', () => {
    expect(toParkingUnit({ 'Номер': ' ' }, 'garage')).toBeNull()
  })
})

describe('normalizeUnitId', () => {
  // The cases redesign v1 tested in src/utils/availability.test.js @5cecebb.
  test.each([
    ['А 101', 'А101'],
    ['А-901', 'А901'],
    ['a 101', 'А101'], // Latin a -> Cyrillic А
    ['B 202', 'Б202'], // Latin B -> Cyrillic Б (block letter intent)
    [' б 202 ', 'Б202'],
    ['А.301', 'А301'],
    ['А–301', 'А301'], // en dash
    ['Г-001', 'Г001'],
    ['Гараж А-1', 'ГАРАЖА1'],
  ])('normalizeUnitId(%j) -> %j', (input, expected) => {
    expect(normalizeUnitId(input)).toBe(expected)
  })

  test('unit ids ignore spacing, dashes and Latin lookalike letters', () => {
    expect(normalizeUnitId('A 101')).toBe(normalizeUnitId('А-101'))
    expect(normalizeUnitId('B 205')).toBe('Б205')
  })

  test('a missing id is an empty string', () => {
    expect(normalizeUnitId(undefined)).toBe('')
    expect(normalizeUnitId(null)).toBe('')
  })
})

test('parseArea accepts a decimal comma and rejects junk', () => {
  expect(parseArea('57,46')).toBe(57.46)
  expect(parseArea(' 65.68 ')).toBe(65.68)
  expect(parseArea('')).toBeNull()
  expect(parseArea('—')).toBeNull()
  expect(parseArea(undefined)).toBeNull()
})

const u = (label, floor, status, type = '2-стаен') => ({ id: label, label, kind: 'apartment', block: 'A', floor, type, exposure: 'Юг', status })

test('summarize counts the four statuses and leaves unknown out of them', () => {
  const units = ['available', 'available', 'reserved', 'sold', 'blocked', 'unknown'].map((s, i) => u(`А ${i}`, 1, s))
  expect(summarize(units)).toEqual({ total: 6, available: 2, reserved: 1, sold: 1, blocked: 1 })
})

test('distinct keeps sheet order and skips blanks', () => {
  const units = [u('А 1', 1, 'available', '3-стаен'), u('А 2', 1, 'available', ''), u('А 3', 1, 'available', '2-стаен'), u('А 4', 1, 'available', '3-стаен')]
  expect(distinct(units, 'type')).toEqual(['3-стаен', '2-стаен'])
})

test('sortUnits orders by floor, then by label with numbers in numeric order', () => {
  const units = [u('А 110', 1, 'available'), u('А 201', 2, 'available'), u('А 102', 1, 'available')]
  expect(sortUnits(units).map((x) => x.label)).toEqual(['А 102', 'А 110', 'А 201'])
})

// A button's content is presentational, so the type and area a sighted visitor
// compares at a glance must be in its name (WCAG 1.3.1).
describe('unitButtonLabel', () => {
  const unit = { label: 'А 306', type: '3-стаен', totalArea: 98.4 }

  test.each([
    ['available', 'А 306, 3-стаен, 98,40 м², Свободен'],
    ['reserved', 'А 306, 3-стаен, 98,40 м², Резервиран'],
    ['sold', 'А 306, 3-стаен, 98,40 м², Продаден'],
    ['blocked', 'А 306, 3-стаен, 98,40 м², Блокиран'],
    ['unknown', 'А 306, 3-стаен, 98,40 м², Няма информация'],
  ])('a %s unit reads "%s"', (status, expected) => {
    expect(unitButtonLabel({ ...unit, status })).toBe(expected)
  })

  test('missing parts are skipped', () => {
    expect(unitButtonLabel({ label: 'А 306', status: 'available' })).toBe('А 306, Свободен')
    expect(unitButtonLabel({ label: 'А 306', type: '', totalArea: 65.68, status: 'sold' })).toBe('А 306, 65,68 м², Продаден')
    expect(unitButtonLabel({ label: 'Г-001', type: 'Гараж', totalArea: null, status: 'available' })).toBe('Г-001, Гараж, Свободен')
  })

  test('a status outside the five keys reads as unknown', () => {
    expect(unitButtonLabel({ ...unit, status: 'скоро' })).toBe('А 306, 3-стаен, 98,40 м², Няма информация')
    expect(unitButtonLabel({ ...unit, status: 'constructor' })).toBe('А 306, 3-стаен, 98,40 м², Няма информация')
    expect(unitButtonLabel({ label: 'А 306' })).toBe('А 306, Няма информация')
  })
})
