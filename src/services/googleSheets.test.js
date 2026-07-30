import { parseCSV, transformToApartmentData } from './googleSheets'

const CSV = `Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус
1,А 101,2-стаен,57.46,8.22,65.68,Юг,Свободен
1,"А 102",3-стаен,97.74,14.00,111.74,"Юг, Изток",Продаден
2,А 201,2-стаен,54.36,7.82,62.18,Юг,Резервиран`

const CSV_WITH_PRICE = `Етаж,Апартамент,Вид,Застроена,Идеални,Обща,Изложение,Статус,Цена
1,А 101,2-стаен,57.46,8.22,65.68,Юг,Свободен,95000 €`

test('parseCSV handles quoted values containing commas', () => {
  const rows = parseCSV(CSV)
  expect(rows).toHaveLength(3)
  expect(rows[1]['Изложение']).toBe('Юг, Изток')
})

test('transformToApartmentData groups by floor and maps columns', () => {
  const data = transformToApartmentData(parseCSV(CSV))
  expect(Object.keys(data)).toEqual(['1', '2'])
  expect(data[1]).toHaveLength(2)
  expect(data[1][0]).toMatchObject({
    apartment: 'А 101', built: '57.46', ideal: '8.22', вид: '2-стаен',
    total: '65.68', изложение: 'Юг', status: 'Свободен', цена: '',
  })
})

test('Цена column passes through when present', () => {
  const data = transformToApartmentData(parseCSV(CSV_WITH_PRICE))
  expect(data[1][0].цена).toBe('95000 €')
})
