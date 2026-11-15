import { bindAddress, bindOneLetterWords, freeApartmentsLine, formatArea, formatDecimal, plural } from './format'

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

// Ruling C7.4: the bare figure, two decimals with the Bulgarian comma, for
// where the м² is set apart (the unit panel's areas) or never follows (a
// кота); formatArea is it with the м².
test('formatDecimal gives the figure alone, as formatArea writes it', () => {
  expect(formatDecimal(54.36)).toBe('54,36')
  expect(formatDecimal(3.06)).toBe('3,06')
  expect(formatDecimal(43)).toBe('43,00')
  expect(formatArea(108.56)).toBe(`${formatDecimal(108.56)}\u00a0м²`)
})

test('plural picks the singular for exactly one and the plural otherwise', () => {
  expect(plural(1, 'свободен гараж', 'свободни гаража')).toBe('свободен гараж')
  expect(plural(0, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(2, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(11, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
  expect(plural(21, 'свободен гараж', 'свободни гаража')).toBe('свободни гаража')
})

// Spec §3.3: a one-letter word never ends a line.
test('bindOneLetterWords ties each one-letter word to the next', () => {
  expect(bindOneLetterWords('гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1'))
    .toBe('гр. Гоце Делчев, ул. Кирил и\u00a0Методий 17, вх. Б, ет.1')
  expect(bindOneLetterWords('в и с думи')).toBe('в\u00a0и\u00a0с\u00a0думи')
  expect(bindOneLetterWords('гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38')).toBe('гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38')
})

// Ruling C4.7: the offices in the menu and the footer never break before a
// number, nor before the one letter of an entrance, as the concept binds them
// („Връбница 1“, „блок 537А“, „етаж 9“, „Методий 17“, „вх. Б“), and a
// one-letter word never ends a line. Before a one-letter word inside the
// phrase („Кирил и Методий“) the line can still break. `~` marks a
// non-breaking space below.
test('bindAddress ties each number, and an ending letter, to the word before it', () => {
  const bound = (text) => text.replaceAll('~', '\u00a0')
  expect(bindAddress('гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38')).toBe(bound('гр. София, ж.к Връбница~1, блок~537А, етаж~9, ап.38'))
  expect(bindAddress('гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1')).toBe(bound('гр. Гоце Делчев, ул. Кирил и~Методий~17, вх.~Б, ет.1'))
  expect(bindAddress('вх. Б')).toBe(bound('вх.~Б'))
})
