import { SITE } from '../config/site'

const ADDRESSES = [
  { locality: 'София', street: 'ж.к Връбница 1, блок 537А, етаж 9, ап.38' },
  { locality: 'Гоце Делчев', street: 'ул. Кирил и Методий 17, вх. Б, ет.1' },
]

// A day's schema.org name, by its code in SITE.hours ('Mo', 'Sa').
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const dayName = (code) => DAYS.find((name) => name.startsWith(code))

// The company's structured data (spec §8.3), from the real facts in
// src/config/site.js. Production's old block carried an invented street, a
// made-up geo point and founder; none of them is here. The opening hours are
// the site's hours (M3/M4 spec §4.4), as production's block had them: the
// closed day left out, a line of one day by its name alone, the times hh:mm.
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['HomeAndConstructionBusiness', 'Organization'],
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin,
    logo: `${SITE.origin}/icon-512.png`,
    telephone: SITE.phones.map((p) => p.tel),
    email: SITE.email,
    foundingDate: '2008-09',
    sameAs: [SITE.facebook],
    address: ADDRESSES.map((a) => ({
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.locality,
      addressCountry: 'BG',
    })),
    openingHoursSpecification: SITE.hours.filter(({ closed }) => !closed).map(({ days, from, to }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.length > 1 ? days.map(dayName) : dayName(days[0]),
      opens: from.padStart(5, '0'),
      closes: to.padStart(5, '0'),
    })),
  }
}
