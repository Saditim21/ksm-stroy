// The company's facts, the one place the site reads them from: the header, the
// mobile menu, the footer and the page heads (spec §4, §8.1). Production copy
// (main): the footer's and the contact page's phones, email and offices; the
// hours (below). Frozen through and through, so no page can change a fact for
// the others.

function deepFreeze(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

export const SITE = deepFreeze({
  name: 'КСМ Строй',
  legalName: 'КСМ СТРОЙ ООД',
  // The live site's origin: canonical links and Open Graph URLs point here.
  origin: 'https://www.ksmstroy.com',
  // The first number is the primary one, the header's. `tel` is the number in
  // international form, for tel: links and structured data.
  phones: [
    { label: '+359 887 886 166', tel: '+359887886166' },
    { label: '+359 885 762 224', tel: '+359885762224' },
  ],
  email: 'ksm_str@abv.bg',
  offices: [
    'гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38',
    'гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1',
  ],
  // The working hours, the one source of every form they take (M3/M4 spec §2,
  // §4.4): each line's days, short and long, its opening and closing times,
  // or `closed`, and the days it covers by their schema.org codes.
  hours: [
    { short: 'Пн–Пт', long: 'Понеделник – петък', from: '8:00', to: '18:00', days: ['Mo', 'Tu', 'We', 'Th', 'Fr'] },
    { short: 'Сб', long: 'Събота', from: '9:00', to: '14:00', days: ['Sa'] },
    { short: 'Нд', long: 'Неделя', closed: true, days: ['Su'] },
  ],
  facebook: 'https://www.facebook.com/ksm.stroi/',
})

export const PRIMARY_PHONE = SITE.phones[0]

// A line's time: its hours, or that it is closed.
const timeOf = ({ from, to, closed }) => (closed ? 'почивен ден' : `${from}–${to}`)

// The hours in their short form, a line each, as production's footer has
// them: „Пн–Пт 8:00–18:00“ (the footer, the menu, the inquiry half).
export const hoursShort = () => SITE.hours.map((line) => `${line.short} ${timeOf(line)}`)

// The hours in their long form, Контакти's (spec §7.3): each line's days,
// „Понеделник – петък“, and its time, „8:00–18:00“.
export const hoursLong = () => SITE.hours.map((line) => ({ day: line.long, time: timeOf(line) }))

// An office on Google Maps: a search for its address, which opens the app on a
// phone (spec §8.1: a link, never an embedded map).
export const mapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
