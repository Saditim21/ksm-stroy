import { SITE } from '../config/site'

const ADDRESSES = [
  { locality: 'София', street: 'ж.к Връбница 1, блок 537А, етаж 9, ап.38' },
  { locality: 'Гоце Делчев', street: 'ул. Кирил и Методий 17, вх. Б, ет.1' },
]

// The company's structured data (spec §8.3), from the real facts in
// src/config/site.js. Production's old block carried an invented street, a
// made-up geo point and founder; none of them is here.
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
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '14:00' },
    ],
  }
}
