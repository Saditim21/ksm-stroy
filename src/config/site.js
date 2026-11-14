// The company's facts, the one place the site reads them from: the header, the
// mobile menu, the footer and the page heads (spec §4, §8.1). Production copy
// (main): the footer's and the contact page's phones, email and offices; the
// hours in their short form. Frozen through and through, so no page can change
// a fact for the others.

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
  hours: ['Пн–Пт 8:00–18:00', 'Сб 9:00–14:00', 'Нд почивен ден'],
  facebook: 'https://www.facebook.com/ksm.stroi/',
})

export const PRIMARY_PHONE = SITE.phones[0]

// An office on Google Maps: a search for its address, which opens the app on a
// phone (spec §8.1: a link, never an embedded map).
export const mapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
