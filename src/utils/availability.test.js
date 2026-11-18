import { STATUS, statusOf, summarizeFloor } from './availability'

// Production's status rules (src/utils/propertyStatus.js, main @7a741d5):
// sold > reserved > blocked > available, an empty cell is available, and text
// the rules do not know is unknown. Redesign v1 read an empty cell as unknown
// and had no blocked status.

test('STATUS holds the five keys', () => {
  expect(STATUS).toEqual({
    AVAILABLE: 'available', RESERVED: 'reserved', SOLD: 'sold', BLOCKED: 'blocked', UNKNOWN: 'unknown',
  })
})

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
    ['Блокиран', STATUS.BLOCKED],
    ['blocked', STATUS.BLOCKED],
    ['', STATUS.AVAILABLE],        // an empty cell is available
    ['   ', STATUS.AVAILABLE],
    [undefined, STATUS.AVAILABLE],
    [null, STATUS.AVAILABLE],
    ['нещо друго', STATUS.UNKNOWN],
  ])('statusOf(%j) -> %s', (input, expected) => {
    expect(statusOf(input)).toBe(expected)
  })

  test('a mixed value resolves to the more restrictive status', () => {
    expect(statusOf('Свободен - блокиран')).toBe(STATUS.BLOCKED)
    expect(statusOf('Резервиран (блокиран)')).toBe(STATUS.RESERVED)
    expect(statusOf('Резервиран - продаден')).toBe(STATUS.SOLD)
  })
})

describe('summarizeFloor', () => {
  const apt = (status) => ({ status })
  test('green when at least one available', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Свободен')]).color).toBe(STATUS.AVAILABLE)
  })
  test('green when a status cell is empty (empty means available)', () => {
    expect(summarizeFloor([apt('Продаден'), apt('')]).color).toBe(STATUS.AVAILABLE)
  })
  test('amber when none available but some reserved', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Резервиран')]).color).toBe(STATUS.RESERVED)
    expect(summarizeFloor([apt('Блокиран'), apt('Резервиран')]).color).toBe(STATUS.RESERVED)
  })
  test('red only when ALL sold', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Продадени')]).color).toBe(STATUS.SOLD)
  })
  test('red (sold out) when every unit is sold or blocked', () => {
    expect(summarizeFloor([apt('Продаден'), apt('Блокиран')]).color).toBe(STATUS.SOLD)
    expect(summarizeFloor([apt('Блокиран'), apt('Блокиран')]).color).toBe(STATUS.SOLD)
  })
  test('gray when sold mixed with unknown', () => {
    expect(summarizeFloor([apt('Продаден'), apt('???')]).color).toBe(STATUS.UNKNOWN)
    expect(summarizeFloor([apt('Блокиран'), apt('Скоро')]).color).toBe(STATUS.UNKNOWN)
  })
  test('gray for empty floor', () => {
    expect(summarizeFloor([]).color).toBe(STATUS.UNKNOWN)
    expect(summarizeFloor().color).toBe(STATUS.UNKNOWN)
  })
  test('counts every category, blocked included, and reads Cyrillic статус key too', () => {
    const s = summarizeFloor([apt('Свободен'), apt('Резервиран'), apt('Продаден'), apt('Блокиран'), { статус: 'Свободен' }, apt('???')])
    expect(s).toEqual({ total: 6, available: 2, reserved: 1, sold: 1, blocked: 1, color: STATUS.AVAILABLE })
  })
  test('agrees with the production counts in summarizeStatuses', () => {
    // The same rows the production pages count (production's calculateStats,
    // src/services/googleSheets.js on main).
    const s = summarizeFloor(['Свободен', '', 'Резервиран', 'Продаден', 'Продадени', 'Блокиран', 'Свободен - блокиран'].map(apt))
    expect(s).toMatchObject({ total: 7, available: 2, reserved: 1, sold: 2, blocked: 2 })
  })
})
