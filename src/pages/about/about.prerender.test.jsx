// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import About, { handle } from '../../routes/about'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'

// The build prerenders За нас in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// M3/M4 §7.4): one H1, the founding drawn on the seam (Lineage.jsx) with the
// founding sentence as its caption, then the tradition and what the founders
// promised, the team, the figures, the values, the services, the mission and
// the call to action. Nothing in the opening is hidden, faded or moved, for
// its drawing is CSS under the motion gate (about.css). This file renders as
// the build does, in Node; the HTML is then only read. Its hydration is
// about.hydration.test.jsx's.

const PATH = '/about'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: About, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [PATH] })} />
// React separates neighbouring text nodes with an empty comment.
const prerender = () => renderToString(page()).replaceAll('<!-- -->', '')
const parse = (html) => new JSDOM(html).window.document
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
// An element's own text: its text nodes, not its children's.
const ownText = (element) => [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join('')

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('renders with no window, as the build does', () => {
  expect(typeof window).toBe('undefined')
  expect(prerender()).toContain('Кадри')
})

// Spec §7.4, §4.1: the H1 „Добре *дошли* | в КСМ Строй ООД“ hinges on the
// seam, each part in masks authored by hand (never split by script above the
// fold), „в“ bound to „КСМ“.
describe('#top, the founding drawn on the seam', () => {
  const top = () => parse(prerender()).querySelector('#top')

  it('prerenders one H1, „Добре дошли в КСМ Строй ООД“, hinged on the seam in its masks', () => {
    const doc = parse(prerender())
    const h1 = doc.querySelector('h1')

    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(textOf(h1)).toBe('Добре дошли в КСМ Строй ООД')
    expect(textOf(h1.querySelector('em'))).toBe('дошли')
    expect(h1.querySelectorAll('em')).toHaveLength(1)
    expect(textOf(h1.querySelector('.origin__l'))).toBe('Добре дошли')
    expect(textOf(h1.querySelector('.origin__r'))).toBe('в КСМ Строй ООД')
    expect(h1.querySelector('.origin__r').textContent).toContain('в\u00a0КСМ')
    for (const mask of h1.querySelectorAll('.line-mask')) expect(mask.querySelector('.split-line')).not.toBeNull()
    expect(h1.querySelectorAll('.line-mask')).toHaveLength(3)
    expect(doc.querySelector('#top h1')).toBe(h1)
    expect(doc.querySelector('#top').getAttribute('aria-labelledby')).toBe(h1.id)
  })

  // Spec §7.4: the seam comes down as one line, with the father's village
  // and trade either side of it; it opens into a lens holding „Кадри“ |
  // „Сухат“ with an italic „и“ inside, and closes again at „септември |
  // 2008“. The drawing is hidden from assistive technology: its caption
  // says it once.
  it('draws the founding: the father, the two brothers in the lens, „септември | 2008“', () => {
    const opening = top()
    const node = opening.querySelector('.node--top')
    expect([...node.children].map(textOf)).toEqual(['село Буково', 'строител зидар (дюлгерин)'])
    expect(node.getAttribute('aria-hidden')).toBe('true')

    const figure = opening.querySelector('figure.lineage')
    const drawing = figure.querySelector('.lineage__draw')
    expect(drawing.getAttribute('aria-hidden')).toBe('true')
    expect([...drawing.querySelectorAll('.lens__name')].map(textOf)).toEqual(['Кадри', 'Сухат'])
    expect(textOf(drawing.querySelector('.lens em.lens__and'))).toBe('и')
    expect(drawing.querySelectorAll('.lens__arcs svg path')).toHaveLength(2)
    expect([...drawing.querySelector('.node--bot').querySelectorAll('.node__l, .node__r')].map(textOf)).toEqual(['септември', '2008'])
    expect(opening.querySelectorAll('.stem')).toHaveLength(2)
  })

  // The contract (tests/contracts/site.jsx: /about shows „основана през месец
  // септември 2008“) and Lineage's interface: the founding sentence is the
  // figure's caption, one element whose own text holds it, as production
  // wrote it, „/дюлгерин/“ set as on Home.
  it('captions the figure with the founding sentence, in one element', () => {
    const caption = top().querySelector('figure.lineage > figcaption')

    expect(caption.children).toHaveLength(0)
    expect(ownText(caption).replace(/\s+/g, ' ')).toContain('основана през месец септември 2008')
    expect(textOf(caption)).toBe(
      'КСМ СТРОЙ ООД е основана през месец септември 2008 г. от двама братя Кадри и Сухат, синове на известен в родното им село Буково строител зидар (дюлгерин).',
    )
    expect(caption.textContent).toContain('е\u00a0основана')
    expect(caption.textContent).toContain('2008\u00a0г.')
    expect(caption.textContent).toContain('Кадри и\u00a0Сухат')
  })

  // What an entrance's first frame would write, kept out of the opening: an
  // element faded out, collapsed, moved away, clipped or hidden.
  it('starts nothing in #top hidden, faded, moved or clipped', () => {
    const opening = top()
    const styles = [opening, ...opening.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

    expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
    expect(opening.querySelectorAll('[hidden]')).toHaveLength(0)
    expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
  })
})

// Spec §7.4: the page's eight parts, in order.
it('runs #top, #traditsiya, #koi-sme-nie, #opit, #cennosti, #uslugi, #misiya, #rabota', () => {
  const doc = parse(prerender())
  const parts = [...doc.querySelector('#top').parentElement.children]

  expect(parts.map(({ id }) => id)).toEqual(['top', 'traditsiya', 'koi-sme-nie', 'opit', 'cennosti', 'uslugi', 'misiya', 'rabota'])
})

describe('#traditsiya, the tradition and what the founders promised', () => {
  const section = () => parse(prerender()).querySelector('#traditsiya')

  // Spec §7.4: the h2 ends at the seam; the founders' principles sentence
  // closes with the motto at h3 size (about.css), the triad in sentence case
  // inside it. The section keeps production's „Нашата история“ as its name.
  it('sets the h2, the founders’ sentence and the motto that closes it', () => {
    const tradition = section()
    expect(tradition.getAttribute('aria-label')).toBe('Нашата история')
    expect(textOf(tradition.querySelector('h2'))).toBe('Традиция и иновации от 2008')
    expect(textOf(tradition.querySelector('h2 em'))).toBe('Традиция')
    expect(tradition.querySelector('h2').textContent).toContain('и\u00a0иновации')
    expect(textOf(tradition.querySelector('.tradition__r .lead'))).toBe(
      'Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност, бързина и точност под мотото:',
    )
    expect(textOf(tradition.querySelector('blockquote.motto'))).toBe('„Добрата работа – реклама за майстора“')
  })

  // The client's own text (src/assets/for-us/content.txt), never published
  // before, with the spelling fixes QUESTIONS.md lists: „Поддръжка“,
  // „клиентът“, „ВиК и електродейности“, en dashes, a comma after „и др.“.
  it('lists the four promised activities, outside | inside, in the client’s words, spelling fixed', () => {
    const tradition = section()
    expect(textOf(tradition.querySelector('.deeds h3'))).toBe('Обещани дейности от учредителите')
    const deeds = [...tradition.querySelectorAll('.deed')]
    expect(deeds.map((deed) => textOf(deed.querySelector('.deed__t')))).toEqual(['Екстериор', 'Интериор', 'ВиК и електродейности', 'Ремонт в дома и офиса'])
    expect(deeds.map((deed) => deed.querySelector('.deed__d') && textOf(deed.querySelector('.deed__d')))).toEqual([
      'груб строеж, изкопи, хидроизолация, топлоизолация, дренаж – проектиране и изпълнение, вертикална планировка, покриви – изграждане, окачени фасади и всички други елементи за облика на сградата и дома.',
      'зидария, мазилки, замазки, шпакловки, облицовки – фаянс, теракот, гранитогрес, камък, гипсокартон, ламинат, паркет и др., проектирани и изпълнени по начин за създаване на уют в сградата и дома.',
      null,
      'при които свеждаме до минимум неприятните усещания на възложителя. Поддръжка на обекта максимално чист и обезопасен.',
    ])
    expect(textOf(tradition.querySelector('.deeds__close'))).toBe(
      'Всичко това го получава клиентът с висока степен на сигурност, качество, коректно отношение и внимание към детайла.',
    )
    expect(tradition.textContent).not.toMatch(/Подръжка|клиента с|В и К/)
  })

  // Spec §7.4, §4.3: the pair Екстериор (the Hotel Paradise facade) |
  // Интериор (slider03), each opening from the seam, both graded.
  it('pictures Екстериор with the Hotel Paradise facade and Интериор with slider03, graded, opening from the seam', () => {
    const photos = [...section().querySelectorAll('.deed__ph')]

    expect(photos.map((photo) => photo.getAttribute('data-wipe'))).toEqual(['l', 'r'])
    expect(photos.map((photo) => photo.querySelector('img').getAttribute('alt'))).toEqual(['Хотел Парадайс, с. Огняново', 'KSM Stroy строителни проекти'])
    expect(textOf(photos[0].querySelector('figcaption'))).toBe('Хотел Парадайс, с. Огняново')
    expect(photos.map((photo) => photo.querySelector('img').getAttribute('src'))).toEqual(['/img/work-hotel-paradise-960.webp', '/img/about-slider-3-1024.webp'])
  })
})

// Spec §7.4: a hinge „Кои сме *ние*?“ with its two leads; the team sentence,
// large, on the left; „Квалифицирани специалисти“ as a ruled list on the
// right, the client's words, spelling fixed („строителство“,
// „впоследствие“).
it('#koi-sme-nie: the hinge with its two leads, the team sentence, the specialists', () => {
  const team = parse(prerender()).querySelector('#koi-sme-nie')

  expect(textOf(team.querySelector('h2'))).toBe('Кои сме ние?')
  expect([...team.querySelectorAll('.hinge .lead')].map(textOf)).toEqual([
    'КСМ Строй ООД е строителна компания, ориентирана към качество, надеждност и устойчиви решения. Съчетаваме дългогодишен опит с модерни технологии, за да създаваме проекти, които отговарят на всички съвременни изисквания.',
    'Вашият доверен партньор в строителството! С дългогодишен опит и професионален екип, ние изграждаме жилищни, обществени и индустриални обекти с високо качество и прецизност. От идеята до завършената сграда – ние сме до вас във всяка стъпка.',
  ])
  expect(textOf(team.querySelector('.team__say'))).toBe(
    'Ние сме екип млади специалисти и майстори, дипломирани технически ръководители с богат опит в строителството и интериорните решения.',
  )
  expect(textOf(team.querySelector('.crew h3'))).toBe('Квалифицирани специалисти')
  expect([...team.querySelectorAll('.crew li')].map((item) => [textOf(item.querySelector('.crew__t')), item.querySelector('.crew__d') && textOf(item.querySelector('.crew__d'))])).toEqual([
    ['Строителни техници', null],
    ['Строители', 'кофраж, армировка и бетон, зидария, мазилка и шпакловки, вътрешни и външни облицовки и настилки, бояджийски работи и покриви'],
    ['Строители монтажници', 'сухо строителство и стоманобетон, вътрешни и външни ВиК мрежи'],
    ['Работници по строителство', 'които впоследствие повишават квалификацията си и се превръщат в основно ядро за успеха на компанията'],
  ])
})

// Spec §2, §7.4: the legacy figures at the foot of two aerial photos (slider02
// and the hotel card's), two per half, plain serif text that never counts up.
describe('#opit, the figures', () => {
  it('sets the four legacy figures as plain text, two per half', () => {
    const band = parse(prerender()).querySelector('#opit')
    const halves = [...band.querySelectorAll('dl')]

    expect(halves.map((half) => [...half.querySelectorAll('.fig')].map((fig) => [textOf(fig.querySelector('dt')), textOf(fig.querySelector('dd'))]))).toEqual([
      [['15+', 'години опит'], ['200+', 'завършени проекта']],
      [['50+', 'доволни клиенти'], ['100 %', 'качество и гаранция']],
    ])
    expect(band.querySelectorAll('dt')[3].textContent).toBe('100\u00a0%')
    // Plain text: no element in a figure, so nothing to count or roll.
    for (const dt of band.querySelectorAll('dt')) expect(dt.children).toHaveLength(0)
    expect(band.querySelectorAll('[aria-live], .roll, [data-count]')).toHaveLength(0)
  })

  it('stands them on slider02 and the hotel card’s photo, both decorative, graded and opening from the seam', () => {
    const photos = [...parse(prerender()).querySelectorAll('#opit .band__ph')]

    expect(photos.map((photo) => photo.getAttribute('data-wipe'))).toEqual(['l', 'r'])
    expect(photos.map((photo) => photo.querySelector('img').getAttribute('alt'))).toEqual(['', ''])
    expect(photos.map((photo) => photo.querySelector('img').getAttribute('src'))).toEqual(['/img/about-slider-2-2000.webp', '/img/work-hotel-paradise-3-960.webp'])
  })
})

// Spec §7.4: a hinge, then three ruled rows read across the seam, each word
// ending at the seam and its sentence after it (production's values).
it('#cennosti: the hinge, then Качество, Точност, Иновации across the seam', () => {
  const values = parse(prerender()).querySelector('#cennosti')

  expect(textOf(values.querySelector('h2'))).toBe('Какво ни прави различни')
  expect(textOf(values.querySelector('.hinge .lead'))).toBe('Три принципа, които ръководят всеки наш проект и гарантират изключителните резултати.')
  expect([...values.querySelectorAll('.ledger__row')].map((row) => [textOf(row.querySelector('h3')), textOf(row.querySelector('p'))])).toEqual([
    ['Качество', 'Използваме най-добрите материали и най-новите технологии за постигане на изключително качество във всеки проект.'],
    ['Точност', 'Спазваме стриктно договорените срокове и бюджети, осигурявайки пълна прозрачност в работния процес.'],
    ['Иновации', 'Прилагаме най-съвременните строителни технологии и методи за постигане на отлични резултати.'],
  ])
})

// Spec §7.4: the four legacy services face the five reasons. The section
// keeps production's „Нашите услуги“ as its name.
it('#uslugi: the four services against the five reasons', () => {
  const offer = parse(prerender()).querySelector('#uslugi')

  expect(offer.getAttribute('aria-label')).toBe('Нашите услуги')
  expect(textOf(offer.querySelector('h2'))).toBe('Какво предлагаме?')
  expect([...offer.querySelectorAll('.offer__list li')].map((item) => [textOf(item.querySelector('h3')), textOf(item.querySelector('p'))])).toEqual([
    ['Жилищно строителство', 'Домове, в които комфортът и качеството вървят ръка за ръка.'],
    ['Обществени и административни сгради', 'Модерни, функционални и устойчиви решения.'],
    ['Ремонти и реконструкции', 'Обновяване и модернизация на съществуващи сгради.'],
    ['Проектиране и консултации', 'Съдействие от първата идея до последния детайл.'],
  ])
  expect(textOf(offer.querySelector('.offer__r h3'))).toBe('Защо да изберете КСМ Строй ООД?')
  expect([...offer.querySelectorAll('.why li')].map(textOf)).toEqual([
    'Опитен и квалифициран екип',
    'Съвременни материали и технологии',
    'Стриктно спазване на срокове и бюджет',
    'Индивидуален подход към всеки проект',
    'Дългосрочно доверие и надеждно партньорство',
  ])
})

it('#misiya: „Мисия | и визия“ across the seam, then the two texts', () => {
  const mission = parse(prerender()).querySelector('#misiya')

  expect(textOf(mission.querySelector('h2'))).toBe('Мисия и визия')
  expect(textOf(mission.querySelector('h2 em'))).toBe('визия')
  expect([...mission.querySelectorAll('.mv__half')].map((half) => [textOf(half.querySelector('h3')), textOf(half.querySelector('p'))])).toEqual([
    ['Нашата мисия', 'Да предоставяме цялостни строителни услуги, които обединяват професионализъм, отговорност и иновации, като същевременно гарантираме удовлетворението на нашите клиенти.'],
    ['Нашата визия', 'Вярваме, че строителството не е просто изграждане на сгради, а създаване на пространства за живот, работа и бъдеще. Ето защо в КСМ Строй ООД винаги поставяме клиента и качеството на първо място.'],
  ])
})

// Spec §7.4: production's heading and lead; „Свържете се с нас“ (solid, to
// /contact) and „Разгледайте проектите“ (outline, to /blog); slider01,
// opening from the seam.
it('#rabota: production’s call to action, its two actions and slider01', () => {
  const work = parse(prerender()).querySelector('#rabota')

  expect(textOf(work.querySelector('h2'))).toBe('Готови сте да работите с нас?')
  expect(textOf(work.querySelector('.lead'))).toBe('Свържете се с нашия екип за консултация и да обсъдим как можем да реализираме вашия проект.')
  expect([...work.querySelectorAll('a')].map((a) => [textOf(a), a.getAttribute('href'), a.getAttribute('data-variant')])).toEqual([
    ['Свържете се с нас', '/contact', 'solid'],
    ['Разгледайте проектите', '/blog', 'outline'],
  ])
  const photo = work.querySelector('.cta__ph')
  expect(photo.getAttribute('data-wipe')).toBe('r')
  expect(photo.querySelector('img').getAttribute('alt')).toBe('KSM Stroy строителни проекти')
  expect(photo.querySelector('img').getAttribute('src')).toBe('/img/about-slider-1-2048.webp')
})

// Spec §4.3: every photo on the page takes the archive's one grade, and each
// waits until it nears the screen: none is in the first viewport.
it('grades every photo and loads each only as it nears the screen', () => {
  const pictures = [...parse(prerender()).querySelectorAll('main picture')]

  expect(pictures).toHaveLength(5)
  for (const picture of pictures) {
    expect(picture.classList.contains('grade')).toBe(true)
    expect(picture.querySelector('img').getAttribute('loading')).toBe('lazy')
    expect(picture.querySelector('img').hasAttribute('fetchpriority')).toBe(false)
  }
})

// Spec §4.5: a no-break space after every one-letter word in the page's copy.
it('binds every one-letter word to the next', () => {
  const main = parse(prerender()).querySelector('main')

  expect(main.textContent).not.toMatch(/(^|[\s„(])[А-Яа-яA-Za-z] /u)
})

// Ruling C5.4 (C4.10's pattern): only what the page uses at load, with the
// document it is first loaded as: both display faces, which the title and
// its italic word, the names and the „и“ set in the first viewport. No
// count is shown, so no availability.
it('preloads both display faces and nothing else', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
  }))

  expect(preloads).toEqual(DISPLAY_FONT_PRELOADS.map(({ href }) => ({ href, as: 'font' })))
})
