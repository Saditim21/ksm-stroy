import { STATUS, statusOf, summarizeFloor, normalizeUnitId, matchesFilter } from './availability'

describe('statusOf', () => {
  test.each([
    ['Свободен', STATUS.AVAILABLE],
    ['свободен ', STATUS.AVAILABLE],
    ['available', STATUS.AVAILABLE],
    ['Резервиран', STATUS.RESERVED],
    ['reserved', STATUS.RESERVED],
    ['Продаден', STATUS.SOLD],
    ['Продадени', STATUS.SOLD],   // plural variant present in real data
    ['sold', STATUS.SOLD],
    ['', STATUS.UNKNOWN],
    [undefined, STATUS.UNKNOWN],
    ['нещо друго', STATUS.UNKNOWN],
  ])('statusOf(%j) -> %s', (input, expected) => {
    expect(statusOf(input)).toBe(expected)
  })
})

describe('summarizeFloor', () => {
  const apt = (status) => ({ status })
  test('green when at least one available', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Свободен')]).color).toBe(STATUS.AVAILABLE)
  })
  test('amber when none available but some reserved', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Резервиран')]).color).toBe(STATUS.RESERVED)
  })
  test('red only when ALL sold', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Продадени')]).color).toBe(STATUS.SOLD)
  })
  test('gray when sold mixed with unknown', () => {
    expect(summarizeFloor([apt('Продаден'), apt('???')]).color).toBe(STATUS.UNKNOWN)
  })
  test('gray for empty floor', () => {
    expect(summarizeFloor([]).color).toBe(STATUS.UNKNOWN)
  })
  test('counts every category and reads Cyrillic статус key too', () => {
    const s = summarizeFloor([apt('Свободен'), apt('Резервиран'), apt('Продаден'), { статус: 'Свободен' }])
    expect(s).toMatchObject({ total: 4, available: 2, reserved: 1, sold: 1 })
  })
})

describe('normalizeUnitId', () => {
  test.each([
    ['А 101', 'А101'],
    ['А-901', 'А901'],
    ['a 101', 'А101'],   // Latin a -> Cyrillic А
    ['B 202', 'Б202'],   // Latin B -> Cyrillic Б (block letter intent)
    [' б 202 ', 'Б202'],
    ['А.301', 'А301'],
  ])('normalizeUnitId(%j) -> %j', (input, expected) => {
    expect(normalizeUnitId(input)).toBe(expected)
  })
})

describe('matchesFilter', () => {
  const apt = { apartment: 'А 101', вид: '2-стаен', total: '65.68', status: 'Свободен' }
  test('no filter matches', () => expect(matchesFilter(apt, {})).toBe(true))
  test('missing apartment never matches', () => expect(matchesFilter(undefined, {})).toBe(false))
  test('onlyAvailable rejects sold', () =>
    expect(matchesFilter({ ...apt, status: 'Продаден' }, { onlyAvailable: true })).toBe(false))
  test('type filter is substring, case-insensitive', () => {
    expect(matchesFilter(apt, { type: '2-стаен' })).toBe(true)
    expect(matchesFilter(apt, { type: 'ателие' })).toBe(false)
  })
  test('area range', () => {
    expect(matchesFilter(apt, { minArea: 60, maxArea: 70 })).toBe(true)
    expect(matchesFilter(apt, { minArea: 70 })).toBe(false)
    expect(matchesFilter({ ...apt, total: '' }, { minArea: 1 })).toBe(false) // NaN never matches a bound
  })
})
