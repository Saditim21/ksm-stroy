import { apartmentRows, normalizeApartmentRow, normalizeSpotRow, parseCsv, spotRows, toRows } from './sheetsCore'

describe('parseCsv', () => {
  it('splits a table into rows of fields, empty fields kept', () => {
    expect(parseCsv('Номер,Тип,Статус\nГ-001,,Свободен\n,,')).toEqual([
      ['Номер', 'Тип', 'Статус'],
      ['Г-001', '', 'Свободен'],
      ['', '', ''],
    ])
  })

  it('reads quoted fields with commas, doubled quotes and line breaks', () => {
    const csv = 'Апартамент,Изложение,Бележка\r\n"А 101","Юг, Изток",\r\n"А 102",Юг,"Две тераси, ""широки""\nс изглед"\r\n'
    expect(parseCsv(csv)).toEqual([
      ['Апартамент', 'Изложение', 'Бележка'],
      ['А 101', 'Юг, Изток', ''],
      ['А 102', 'Юг', 'Две тераси, "широки"\nс изглед'],
    ])
  })

  it('ends rows at CRLF, LF or CR, and makes no row of the last line end', () => {
    expect(parseCsv('a,b\r\n1,2\n3,4\r5,6\r\n')).toEqual([['a', 'b'], ['1', '2'], ['3', '4'], ['5', '6']])
    expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']])
  })

  it('drops a leading BOM, as an exported tab may start with one', () => {
    const BOM = String.fromCharCode(0xfeff)
    expect(parseCsv(`${BOM}Етаж,Статус\n1,Свободен`)[0]).toEqual(['Етаж', 'Статус'])
  })

  it('reads nothing as no rows', () => {
    expect(parseCsv('')).toEqual([])
  })
})

describe('toRows', () => {
  it('keys every row by the header, names and values trimmed', () => {
    expect(toRows([[' Етаж', 'Апартамент ', 'Статус\r'], ['1', ' А 101 ', 'Продаден']])).toEqual([
      { Етаж: '1', Апартамент: 'А 101', Статус: 'Продаден' },
    ])
  })

  it('leaves out a row whose field count is not the header\'s', () => {
    expect(toRows([['Номер', 'Статус'], ['Г-001', 'Свободен'], ['Г-002'], ['Г-003', 'Свободен', 'extra']])).toEqual([
      { Номер: 'Г-001', Статус: 'Свободен' },
    ])
  })

  it('has no rows without a header or a body', () => {
    expect(toRows([])).toEqual([])
    expect(toRows([['Номер', 'Статус']])).toEqual([])
  })
})

describe('normalizeApartmentRow', () => {
  it("maps today's columns and passes the status through normalizeStatus", () => {
    const row = { Етаж: '3', Апартамент: 'А 301', Вид: '2-стаен', Застроена: '54.36', Идеални: '7.82', Обща: '62.18', Изложение: 'Юг', Статус: 'продадени ', Цена: '95 000 €' }
    expect(normalizeApartmentRow(row)).toEqual({
      unit: 'А 301', floor: '3', type: '2-стаен',
      area: { built: '54.36', ideal: '7.82', total: '62.18' },
      exposure: 'Юг', status: 'Продадени', price: '95 000 €',
    })
  })

  it('reads a missing column as empty, and an empty status as free', () => {
    expect(normalizeApartmentRow({ Етаж: '1', Апартамент: 'А 101' })).toEqual({
      unit: 'А 101', floor: '1', type: '',
      area: { built: '', ideal: '', total: '' },
      exposure: '', status: 'Свободен', price: '',
    })
  })

  it('keeps text the status rules do not know, as the owner wrote it', () => {
    expect(normalizeApartmentRow({ Статус: 'Скоро' }).status).toBe('Скоро')
    expect(normalizeApartmentRow({ Статус: 'Блокиран' }).status).toBe('Блокиран')
  })
})

describe('normalizeSpotRow', () => {
  it("maps today's columns of the Гаражи and Паркоместа tabs", () => {
    expect(normalizeSpotRow({ Номер: 'ПМ-02', Застроена: '17.67', Идеални: '10.85', Обща: '28.52', Тип: 'Паркомясто', Статус: 'Продадени' })).toEqual({
      number: 'ПМ-02', type: 'Паркомясто', area: { built: '17.67', ideal: '10.85', total: '28.52' }, status: 'Продадени',
    })
    expect(normalizeSpotRow({ Номер: 'Г-001' })).toEqual({
      number: 'Г-001', type: '', area: { built: '', ideal: '', total: '' }, status: 'Свободен',
    })
  })
})

describe('apartmentRows and spotRows', () => {
  it('list the units a page shows: rows with a unit, on a floor other than 0', () => {
    const csv = 'Етаж,Апартамент,Статус\n0,Гараж А-1,Свободен\n,А 001,Свободен\n2,,Свободен\n2,А-201,Резервиран\n'
    expect(apartmentRows(csv)).toEqual([expect.objectContaining({ unit: 'А-201', floor: '2', status: 'Резервиран' })])
  })

  it('refuse a body without the columns that identify a unit and its status', () => {
    expect(() => apartmentRows('Етаж,Апартамент\n1,А 101')).toThrow(/Статус/)
    expect(() => apartmentRows('Етаж,Статус\n1,Свободен')).toThrow(/Апартамент/)
    expect(() => spotRows('Тип,Статус\nГараж,Свободен')).toThrow(/Номер/)
  })

  it('refuse a tab that names no unit', () => {
    expect(() => apartmentRows('Етаж,Апартамент,Статус\n0,Гараж А-1,Свободен\n')).toThrow(/no apartment rows/)
    expect(() => spotRows('Номер,Статус\n,Свободен\n')).toThrow(/no rows/)
  })
})
