import { useState } from 'react'
import Button from '../../components/ui/Button'
import DimensionLine from '../../components/ui/DimensionLine'
import ElevationMark from '../../components/ui/ElevationMark'
import HeroTitle from '../../components/ui/HeroTitle'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import StatusChip from '../../components/ui/StatusChip'
import StatusLegend from '../../components/ui/StatusLegend'
import VideoBand from '../../components/ui/VideoBand'
import { formatArea, plural } from '../../utils/format'
import { MD_UP } from '../../utils/motion'
import { pageMeta } from '../../seo/meta'

// Dev-only gallery of the shared primitives (src/components/ui), each on
// Diptych's two grounds, onyx and umber, for review (plan Task 7). src/routes.js routes /dev/ui only
// under the dev server; scripts/check-dist.mjs fails if any of it reaches the
// build.
//
// Sample media: the site has no AVIF/WebP ladders or film clips yet (the image
// pipeline, plan Task 8, and the film copy come later), so the picture and the
// band name files under /dev-media/, which the repo does not hold. Without
// them the picture shows its colour and the band its poster's. To see them
// whole, run the dev server with a Vite publicDir of your own that holds
// dev-media/photo-{640,1024,1600}, dev-media/hero-desktop-1920 and
// dev-media/hero-mobile-608 (.avif and .webp each) and the hero clips; never
// commit them.
const SAMPLE_IMAGE = { path: '/dev-media/photo', w: 2006, h: 1202, widths: [640, 1024, 1600], color: '#A1A6A9' }
const SAMPLE_POSTER = {
  desktop: { path: '/dev-media/hero-desktop', w: 1920, h: 760, widths: [1920], color: '#5E5C52' },
  mobile: { path: '/dev-media/hero-mobile', w: 608, h: 760, widths: [608], color: '#525050' },
}
const SAMPLE_FILM = {
  desktop: { av1: '/dev-media/hero-desktop.av1.mp4', h264: '/dev-media/hero-desktop.mp4' },
  mobile: { av1: '/dev-media/hero-mobile.av1.mp4', h264: '/dev-media/hero-mobile.mp4' },
}

// What the count steps through: the placeholder, a first number, a live
// update, a new number of digits, one digit.
const COUNTS = [null, 69, 70, 128, 1]

// A dimension line as one row of a grid whose labels line up.
const ROW = 'col-span-2 grid grid-cols-subgrid'

export const meta = () => pageMeta({
  title: 'UI primitives (dev) - KSM Stroy',
  description: 'Dev-only gallery of the shared primitives (src/components/ui) on onyx and on umber.',
  path: '/dev/ui',
})

function Specimen({ name, children }) {
  return (
    <div className="space-y-5">
      <p className="text-label text-stone">{name}</p>
      {children}
    </div>
  )
}

const GROUNDS = { onyx: 'bg-onyx text-ivory', umber: 'bg-umber text-ivory' }

function Specimens({ ground, count }) {
  const freeLabel = plural(count, 'свободен апартамент', 'свободни апартамента')
  return (
    <section aria-label={`On ${ground}`} className={GROUNDS[ground]}>
      <div className="mx-auto max-w-[1440px] space-y-16 px-5 py-16 md:px-12">
        <Specimen name="HeroTitle (as h2)">
          <HeroTitle as="h2" lines={['Създаваме пространства', 'за мечтания живот']} />
        </Specimen>

        <Specimen name="Button: outline with arrow (Link), solid (tel:), link (button); then the small sizes">
          <div className="flex flex-wrap items-center gap-4">
            <Button to="/contact" arrow>Запитване</Button>
            <Button href="tel:+359887886166" variant="solid">Обадете се</Button>
            <Button variant="link" arrow>Вижте свободните на етажа</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button to="/contact" size="sm">Запитване</Button>
            <Button href="tel:+359887886166" variant="solid" size="sm">Обадете се</Button>
          </div>
        </Specimen>

        <Specimen name="DimensionLine: unit areas, a distance, the span (draw)">
          <div className="grid max-w-md grid-cols-[max-content_1fr] gap-y-3">
            <DimensionLine label="Застроена" value={formatArea(57.46)} className={ROW} />
            <DimensionLine label="Идеални части" value={formatArea(6.12)} className={ROW} />
            <DimensionLine label="Обща" value={formatArea(63.58)} className={ROW} />
          </div>
          <DimensionLine value="500 м до метростанция" className="max-w-md" />
          <DimensionLine value="2008 – 2026" draw className="max-w-md" />
        </Specimen>

        <Specimen name="ElevationMark">
          <ul className="space-y-2 text-small">
            <li><ElevationMark floor={8} /></li>
            <li><ElevationMark floor={2} /></li>
            <li><ElevationMark floor={1} elevation={3.06} /></li>
          </ul>
          <ElevationMark floor={1} elevation={3.06} className="font-display text-h3" />
        </Specimen>

        <Specimen name="RollingNumber: the count steps with the button above; a placeholder; a small count">
          <RollingNumber value={count} label={freeLabel} className="font-display text-count" />
          <div className="flex flex-wrap items-baseline gap-10">
            <RollingNumber value={null} label="свободни апартамента" className="font-display text-h2" />
            <RollingNumber value={3} label="свободни" className="text-small" />
          </div>
        </Specimen>

        <Specimen name="StatusChip and StatusLegend">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <StatusChip status="available" />
            <StatusChip status="reserved" />
            <StatusChip status="sold" />
            <StatusChip status="blocked" />
            <StatusChip status="unknown" text="Скоро" />
            <StatusChip status="unknown" />
          </div>
          <StatusLegend />
        </Specimen>

        <Specimen name="ResponsivePicture">
          <ResponsivePicture image={SAMPLE_IMAGE} alt="Пример" sizes={`${MD_UP} 576px, 100vw`} className="max-w-xl" />
        </Specimen>

        <Specimen name="VideoBand">
          <VideoBand sources={SAMPLE_FILM} poster={SAMPLE_POSTER} alt="Golden Residence през деня" />
        </Specimen>
      </div>
    </section>
  )
}

export default function UiGallery() {
  const [step, setStep] = useState(0)
  const count = COUNTS[step % COUNTS.length]
  return (
    <div className="font-text">
      <header className="bg-onyx text-ivory">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-5 pt-12 md:px-12">
          <div className="space-y-2">
            <h1 className="font-display text-h2">UI primitives</h1>
            <p className="text-small text-stone">src/components/ui on onyx and on umber. Dev server only.</p>
          </div>
          <Button size="sm" onClick={() => setStep((n) => n + 1)}>
            Next count ({count ?? '—'})
          </Button>
        </div>
      </header>
      <Specimens ground="onyx" count={count} />
      <Specimens ground="umber" count={count} />
    </div>
  )
}
