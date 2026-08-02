import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Button from '../components/ui/Button'
import PageTransition from '../components/ui/PageTransition'
import CineSlider from '../components/ui/CineSlider'
import SplitLines from '../components/ui/SplitLines'
import Marquee from '../components/ui/Marquee'
import Parallax from '../components/ui/Parallax'
import useSiteAvailability from '../hooks/useSiteAvailability'
import { EASE, stagger, fadeUpChild, hoverZoom } from '../utils/motion'
import { getIntroDelayMs } from '../utils/introGate'
import { seoData, generateStructuredData } from '../utils/seo'
// These are all served from /public with a 640/1024(/1600) srcSet so the hero
// slides, the project cards and the services grid can hand the browser a
// responsive candidate instead of one fixed-size download (see
// buildingRenders.js).
import {
  GOLDEN_RENDER,
  MNOGO_RENDER,
  HOME_SLIDE_1,
  HOME_SLIDE_2,
  HERO_SIZES,
  CARD_SIZES,
  SERVICE_SIZES,
} from '../constants/buildingRenders'
import img003 from '../assets/images/003.webp'

// The first two service photos are the same files the hero reel uses, so they
// reuse the hero's /public ladder: a phone pulls the 640w variant instead of
// the bundled desktop original (001.webp 172KB, photo-4.webp 220KB) for a card
// that is never wider than the screen. 003.webp has no ladder — it is not a
// hero slide, and nothing else on the site references it — so it stays a
// bundled import with no srcSet until someone regenerates it
// (scripts/generate-srcset.mjs).
const services = [
  {
    image: HOME_SLIDE_2, // 001.webp
    title: 'Жилищно Строителство',
    description: 'Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт',
  },
  {
    image: HOME_SLIDE_1, // photo-4.webp
    title: 'Ремонти и Реновация',
    description: 'Цялостни ремонти и модернизация на съществуващи сгради',
  },
  {
    image: { src: img003 },
    title: 'Комерсиално Строителство',
    description: 'Офисни сгради, складове и индустриални обекти',
  },
]

const stats = [
  { value: 15, suffix: '+', label: 'Години опит' },
  { value: 200, suffix: '+', label: 'Завършени проекта' },
  { value: 50, suffix: '+', label: 'Доволни клиенти' },
  { value: 100, suffix: '%', label: 'Качество и гаранция' },
]

const projectCards = [
  { id: 'golden-residence', to: '/projects/golden-residence', image: GOLDEN_RENDER, fallbackName: 'Golden Residence' },
  { id: 'mnogofamilna-sgrada', to: '/projects/mnogofamilna-sgrada', image: MNOGO_RENDER, fallbackName: 'Многофамилна сграда' },
]

// The cinematic hero reel. Photography first (what the owner actually built),
// the live-availability render last so the caption can hand off to the counter
// underneath it. sgrada1.webp is deliberately absent: its baked-in white
// margins would show as bands in a full-bleed cover hero.
//
// Deliberately no fetchpriority="high" on slide 1: CineSlider already marks
// it loading="eager", and every slide now ships a srcSet, so the remaining
// LCP cost is the lazy page chunk, not image priority or a fixed-size photo.
const HERO_SLIDES = [
  {
    src: HOME_SLIDE_1.src,
    srcSet: HOME_SLIDE_1.srcSet,
    sizes: HERO_SIZES,
    alt: 'Многофамилна жилищна сграда',
    caption: 'Луксозни жилищни комплекси',
    sub: 'Създаваме пространства за мечтания живот',
  },
  {
    src: HOME_SLIDE_2.src,
    srcSet: HOME_SLIDE_2.srcSet,
    sizes: HERO_SIZES,
    alt: 'Golden Residence',
    caption: 'Модерна архитектура',
    sub: 'Иновативни дизайнерски решения',
  },
  {
    src: GOLDEN_RENDER.src,
    srcSet: GOLDEN_RENDER.srcSet,
    sizes: HERO_SIZES, // '100vw' — the hero is full-bleed at every breakpoint.
    alt: 'Голдън Резиденс',
    caption: 'Голдън Резиденс',
    sub: 'Реална наличност — на живо',
  },
]

// The headline's gold accent is a single <em>, so it cannot go through
// SplitLines (which only splits plain strings). It gets the same grammar by
// hand instead: one overflow-hidden mask, one rise, picking up where the
// SplitLines run before it left off (3 words * 0.045s stagger).
const ACCENT_DELAY = 3 * 0.045

// The observer goes on the mask, not on the <em> inside it: the em starts
// parked at y:110%, fully outside the mask's clip, where an
// IntersectionObserver would report ratio 0 forever (same trap SplitLines
// documents).
function AccentRise({ delay = 0, children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  return (
    <span ref={ref} className="inline-block overflow-hidden align-bottom">
      <motion.em
        className="inline-block"
        initial={{ y: '110%' }}
        animate={inView ? { y: 0 } : { y: '110%' }}
        transition={{ duration: 0.65, ease: EASE, delay: delay + ACCENT_DELAY }}
      >
        {children}
      </motion.em>
    </span>
  )
}

function HeroHeadline({ delay = 0 }) {
  const reduce = useReducedMotion()
  return (
    <DisplayHeading as="h1" size="hero" className="max-w-3xl text-plaster">
      <SplitLines delay={delay}>Изберете своя дом</SplitLines>
      {/* SplitLines' animated path ends each word with a nbsp; its plain-text
          fallback does not, so the accent brings its own separator. */}
      {reduce ? (
        <>
          {' '}
          <em>етаж по етаж</em>
        </>
      ) : (
        <AccentRise delay={delay}>етаж по етаж</AccentRise>
      )}
      .
    </DisplayHeading>
  )
}

function Hero({ available }) {
  const reduce = useReducedMotion()
  // How much of the branded intro overlay is still to come, in seconds, read
  // ONCE at mount (it is a countdown — see utils/introGate.js). On a repeat
  // visit, under reduced motion, and on every client-side navigation back here
  // it is 0 and nothing below changes.
  //
  // Only the TEXT layer waits. The slider underneath starts its crossfade and
  // Ken Burns immediately: it sits behind the overlay, so by the time the
  // curtain lifts it is already a moving image rather than a still frame. The
  // headline is the opposite — it is the one gesture worth arriving for, and
  // ungated it played out and settled entirely behind the panel.
  const [introDelay] = useState(() => getIntroDelayMs() / 1000)
  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink">
      {/* Captions go top-right: the overlay's bottom-left is the headline block. */}
      <CineSlider slides={HERO_SLIDES} interval={6500} captionPosition="top-right">
        <div className="absolute inset-x-0 bottom-0 pb-16 sm:pb-20">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={stagger(0.12, introDelay)}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeUpChild}>
              <DimensionLine dark label="Строителна компания · София" />
            </motion.div>

            {/* The split-line rise IS this block's reveal, so the headline is
                the one child that skips the fadeUpChild variant — which also
                means it does not inherit the container's delayChildren and has
                to be handed the intro offset itself. */}
            <HeroHeadline delay={introDelay} />

            <motion.p variants={fadeUpChild} className="text-plaster/80 max-w-xl mt-5">
              Реална наличност на всеки апартамент — обновява се на живо от нашия отдел продажби.
            </motion.p>

            <motion.div variants={fadeUpChild} className="mt-8 flex flex-wrap items-center gap-3 text-plaster">
              <span className="relative flex h-2.5 w-2.5">
                {!reduce && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-accent opacity-60" />
                )}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-accent" />
              </span>
              <span className="font-display text-2xl">
                <AnimatedNumber value={available} /> свободни апартамента
              </span>
              <span className="text-plaster/60 text-sm">в 2 сгради в момента</span>
            </motion.div>

            <motion.div variants={fadeUpChild} className="mt-8 flex gap-4">
              <Button as={Link} to="/projects" variant="gold">Разгледайте сградите</Button>
              <Button
                as={Link}
                to="/contact"
                variant="ghost"
                className="border-plaster/40 text-plaster hover:border-plaster"
              >
                Свържете се с нас
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </CineSlider>
    </section>
  )
}

function ProjectsDuo({ byProject }) {
  return (
    <section className="bg-plaster py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DimensionLine label="Активни продажби" />
        <DisplayHeading>Две сгради, <em>реална</em> наличност.</DisplayHeading>

        <div className="grid lg:grid-cols-2 gap-6 mt-12">
          {projectCards.map((project, index) => {
            const live = byProject[project.id]
            const name = live?.name ?? project.fallbackName
            return (
              <Reveal key={project.id} delay={index * 0.08}>
                <motion.div initial="rest" whileHover="hover" whileFocus="hover">
                  <Link
                    to={project.to}
                    className="relative block overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent"
                  >
                    {/* 16/9 is deliberate: sgrada1.webp ships with ~6%/8% white
                        margins baked in, and this crop cuts them off at every width. */}
                    <Parallax strength={30}>
                      <motion.img
                        src={project.image.src}
                        srcSet={project.image.srcSet}
                        sizes={CARD_SIZES}
                        alt={`Сграда ${name}`}
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover"
                        variants={{ rest: { scale: 1 }, hover: hoverZoom }}
                      />
                    </Parallax>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <h3 className="font-display text-2xl text-plaster">{name}</h3>
                      <p className="text-plaster/80 text-sm mt-1">
                        {live?.available ?? 0} свободни от {live?.total ?? 0}
                      </p>
                      <span className="text-gold-accent text-sm font-semibold mt-4 inline-block">Разгледайте →</span>
                    </div>
                  </Link>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services-section" className="bg-plaster pb-20 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DimensionLine label="Какво правим" />
        <DisplayHeading>Строим, ремонтираме, <em>завършваме</em>.</DisplayHeading>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {services.map((service, index) => (
            <Reveal as="article" key={service.title} delay={index * 0.08}>
              {/* rounded on both layers: the wrapper clips the drifting inner
                  layer, the img keeps its own corners on the reduced-motion
                  path (where Parallax is a plain, unclipped passthrough). */}
              <Parallax strength={30} className="rounded-2xl">
                <img
                  src={service.image.src}
                  srcSet={service.image.srcSet}
                  sizes={service.image.srcSet ? SERVICE_SIZES : undefined}
                  alt={service.title}
                  loading="lazy"
                  className="aspect-[4/3] rounded-2xl object-cover w-full"
                />
              </Parallax>
              <h3 className="font-display text-xl mt-4">{service.title}</h3>
              <p className="text-graphite text-sm mt-2 leading-relaxed">{service.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="bg-ink text-plaster py-20" aria-labelledby="stats-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DimensionLine dark label="Числата" />
        <h2 id="stats-heading" className="sr-only">Числата зад KSM Строй</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-10">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="font-display text-5xl text-gold-accent">
                <AnimatedNumber value={stat.value} />{stat.suffix}
              </div>
              <p className="text-plaster/60 text-sm mt-3">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section className="bg-plaster py-24 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <DisplayHeading>Готови ли сте да видите <em>своя</em> апартамент?</DisplayHeading>
          <p className="text-graphite mt-5 max-w-xl mx-auto">
            Разгледайте свободните апартаменти или ни се обадете — отговаряме същия ден.
          </p>
          <div className="mt-8 flex justify-center">
            <Button as={Link} to="/projects" variant="dark">Към сградите</Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const Home = () => {
  const { available, byProject } = useSiteAvailability()
  const organizationStructuredData = generateStructuredData('organization')

  return (
    <>
      <SEO
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        ogTitle={seoData.home.ogTitle}
        ogImage={seoData.home.ogImage}
        structuredData={organizationStructuredData}
      />

      <PageTransition as="main" className="bg-plaster">
        <Hero available={available} />
        <ProjectsDuo byProject={byProject} />
        {/* The trailing separator is load-bearing: it gives the loop seam the
            same breathing room as every other " · " in the strip. It ends in a
            nbsp because a plain trailing space is dropped at the end of the
            copy's line box, which butts the seam right up against "Голдън".
            speed is characters/second: 60 chars at the default 40 would loop
            the whole 2900px strip in 1.5s (a strobe) — 2 gives ~90px/s. */}
        <Marquee
          text={'Голдън Резиденс · Многофамилна сграда · София · КСМ Строй · '}
          speed={2}
          className="pb-14 sm:pb-20"
        />
        <Services />
        <StatsBand />
        <ClosingCTA />
      </PageTransition>
    </>
  )
}

export default Home
