import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Button from '../components/ui/Button'
import PageTransition from '../components/ui/PageTransition'
import useSiteAvailability from '../hooks/useSiteAvailability'
import { EASE, stagger, fadeUpChild, hoverZoom } from '../utils/motion'
import { seoData, generateStructuredData } from '../utils/seo'
// Both building renders are served from /public with 640/1024/1200 variants so
// the hero and the cards can hand the browser a srcSet (see buildingRenders.js).
import { GOLDEN_RENDER, MNOGO_RENDER, HERO_SIZES, CARD_SIZES } from '../constants/buildingRenders'
import img001 from '../assets/home/optimized/001.webp'
import img003 from '../assets/images/003.webp'
import imgPhoto4 from '../assets/home/optimized/photo-4.webp'

const services = [
  {
    image: img001,
    title: 'Жилищно Строителство',
    description: 'Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт',
  },
  {
    image: imgPhoto4,
    title: 'Ремонти и Реновация',
    description: 'Цялостни ремонти и модернизация на съществуващи сгради',
  },
  {
    image: img003,
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

// The hero render: settles in on load, then drifts (Ken Burns). The drift class is
// added only after the settle finishes so the CSS animation cannot fight the inline
// transform — and neither runs when the visitor asked for reduced motion.
function HeroImage({ reduce }) {
  const [settled, setSettled] = useState(false)
  return (
    <motion.img
      src={GOLDEN_RENDER.src}
      srcSet={GOLDEN_RENDER.srcSet}
      sizes={HERO_SIZES}
      fetchPriority="high"
      alt="Жилищна сграда Golden Residence, построена от KSM Строй в София"
      className={`absolute inset-0 h-full w-full object-cover ${!reduce && settled ? 'animate-kenburns' : ''}`}
      initial={reduce ? false : { scale: 1.06 }}
      animate={reduce ? undefined : { scale: 1 }}
      transition={{ duration: 1.6, ease: EASE }}
      onAnimationComplete={() => setSettled(true)}
    />
  )
}

function Hero({ available, reduce }) {
  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink">
      <HeroImage reduce={reduce} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 pb-16 sm:pb-20">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={stagger(0.12)}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeUpChild}>
            <DimensionLine dark label="Строителна компания · София" />
          </motion.div>

          <motion.div variants={fadeUpChild}>
            <DisplayHeading as="h1" size="hero" className="max-w-3xl text-plaster">
              Изберете своя дом <em>етаж по етаж</em>.
            </DisplayHeading>
          </motion.div>

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
                    <motion.img
                      src={project.image.src}
                      srcSet={project.image.srcSet}
                      sizes={CARD_SIZES}
                      alt={`Сграда ${name}`}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                      variants={{ rest: { scale: 1 }, hover: hoverZoom }}
                    />
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
              <img
                src={service.image}
                alt={service.title}
                loading="lazy"
                className="aspect-[4/3] rounded-2xl object-cover w-full"
              />
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
  const reduce = useReducedMotion()
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
        <Hero available={available} reduce={reduce} />
        <ProjectsDuo byProject={byProject} />
        <Services />
        <StatsBand />
        <ClosingCTA />
      </PageTransition>
    </>
  )
}

export default Home
