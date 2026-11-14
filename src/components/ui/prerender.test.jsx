// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import Button from './Button'
import DimensionLine from './DimensionLine'
import ElevationMark from './ElevationMark'
import HeroTitle from './HeroTitle'
import ResponsivePicture from './ResponsivePicture'
import RollingNumber from './RollingNumber'
import StatusChip from './StatusChip'
import StatusLegend from './StatusLegend'
import VideoBand from './VideoBand'

// The build prerenders every page in Node, where there is no window, and that
// HTML is the final visual state (plan, global rules; spec §5.2.1): every
// primitive renders there, nothing in it starts hidden, faded or moved, and no
// film is in it before the browser decides to attach one.

const image = (path, w, h) => ({ path, w, h, widths: [640, w], color: '#9AA39B' })

const prerender = () => renderToString(
  <MemoryRouter>
    <HeroTitle lines={['Създаваме пространства', 'за мечтания живот']} />
    <Button to="/contact" arrow>Запитване</Button>
    <Button href="tel:+359887886166" variant="solid" size="sm">Обадете се</Button>
    <Button variant="link">Вижте свободните на етажа</Button>
    <DimensionLine value="2008 – 2026" draw />
    <DimensionLine value="57,46 м²" label="Застроена" />
    <ElevationMark floor={1} elevation={3.06} />
    <RollingNumber value={null} label="свободни апартамента" />
    <RollingNumber value={17} />
    <StatusChip status="unknown" text="Скоро" />
    <StatusLegend />
    <ResponsivePicture image={image('/img/x', 1600, 1000)} alt="Фасадата" sizes="100vw" priority />
    <VideoBand
      sources={{
        desktop: { av1: '/film/hero-desktop.av1.mp4', h264: '/film/hero-desktop.mp4' },
        mobile: { av1: '/film/hero-mobile.av1.mp4', h264: '/film/hero-mobile.mp4' },
      }}
      poster={{ desktop: image('/img/hero-desktop', 1920, 760), mobile: image('/img/hero-mobile', 760, 950) }}
      alt="Golden Residence през деня"
      priority
    />
  </MemoryRouter>,
)

test('every primitive prerenders with no window', () => {
  expect(typeof window).toBe('undefined')
  // React separates neighbouring text nodes with an empty comment.
  const html = prerender().replaceAll('<!-- -->', '')
  for (const text of ['Създаваме пространства', 'Запитване', 'етаж 1', 'кота +3,06', 'Скоро', 'Блокиран', '2008 – 2026', '—']) {
    expect(html).toContain(text)
  }
})

test('nothing in the prerendered HTML starts hidden, faded or moved', () => {
  const html = prerender()
  const styles = [...html.matchAll(/\sstyle="([^"]*)"/g)].map(([, style]) => style)
  expect(styles.filter((style) => /opacity|transform|translate|scale|visibility|clip/.test(style))).toEqual([])
  expect(html).not.toMatch(/\bopacity-0\b|\binvisible\b/)
})

test('the prerendered band is its poster: no film, no control', () => {
  const html = prerender()
  expect(html).not.toMatch(/<video/)
  expect(html).not.toMatch(/Пауза|Пусни/)
  expect(html).toMatch(/<img[^>]*alt="Golden Residence през деня"/)
})

test('a count prerenders as its number: digits placed by CSS, the value for screen readers', () => {
  const html = prerender()
  expect(html).toMatch(/<span class="sr-only">17<\/span>/)
  expect(html).toMatch(/style="--d:1"/)
  expect(html).toMatch(/style="--d:7"/)
})
