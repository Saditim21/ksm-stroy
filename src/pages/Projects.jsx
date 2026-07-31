import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Button from '../components/ui/Button'
import PageTransition from '../components/ui/PageTransition'
import useSiteAvailability from '../hooks/useSiteAvailability'
import { hoverZoom } from '../utils/motion'
import { properties } from '../constants/properties'
// Both renders are served from /public with 640/1024/1200 variants, the same
// source Home and the explorer use (see src/constants/buildingRenders.js).
import { GOLDEN_RENDER, MNOGO_RENDER, PANEL_SIZES } from '../constants/buildingRenders'

const PANEL_IMAGES = {
  'golden-residence': GOLDEN_RENDER,
  'mnogofamilna-sgrada': MNOGO_RENDER,
}

function ProjectPanel({ property, available, reversed, onOpen }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <div className="grid lg:grid-cols-5 rounded-2xl overflow-hidden border border-concrete bg-white">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`Разгледайте ${property.title}`}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className={`relative overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-accent lg:col-span-3 ${reversed ? 'lg:order-2' : ''}`}
      >
        <motion.img
          src={PANEL_IMAGES[property.projectType]?.src}
          srcSet={PANEL_IMAGES[property.projectType]?.srcSet}
          sizes={PANEL_SIZES}
          alt={`Сграда ${property.title}`}
          loading="lazy"
          className="aspect-[16/10] lg:aspect-auto object-cover h-full w-full"
          variants={{ rest: { scale: 1 }, hover: hoverZoom }}
        />
      </motion.div>

      <div className={`p-8 lg:p-12 flex flex-col justify-center lg:col-span-2 ${reversed ? 'lg:order-1' : ''}`}>
        <h2 className="font-display text-3xl">{property.title}</h2>
        <p className="text-graphite text-sm mt-2">{property.location}</p>
        <p className="text-graphite mt-4 leading-relaxed">{property.description}</p>

        <p className="mt-6">
          <span className="text-gold-accent font-display text-4xl">
            <AnimatedNumber value={available} />
          </span>{' '}
          <span className="text-graphite text-sm">свободни апартамента</span>
        </p>

        <Button variant="dark" onClick={onOpen} className="mt-8 self-start">
          Разгледайте сградата
        </Button>
      </div>
    </div>
  )
}

const Projects = () => {
  const navigate = useNavigate()
  const { byProject } = useSiteAvailability()

  // Every panel leads to its block-selection page; the old in-page building/photo
  // modal was replaced by the /projects/<projectType> explorer flow.
  const openProject = (property) => {
    if (property.projectType) {
      navigate(`/projects/${property.projectType}`)
    }
  }

  return (
    <>
      <SEO
        title="Продажби - KSM Stroy"
        description="Открийте нашите атрактивни обекти за продажба - модерни апартаменти и жилищни сгради в престижни райони на София."
        keywords="продажби, апартаменти, имоти, новостроящи се, София"
        ogTitle="Продажби - KSM Stroy"
        ogImage={properties[0]?.images[0]}
      />

      <PageTransition as="main">
        <header className="bg-plaster pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DimensionLine label="Продажби" />
            <DisplayHeading as="h1">Изберете <em>сграда</em>.</DisplayHeading>
            <p className="text-graphite mt-5 max-w-xl">
              Два проекта в процес на продажба — наличността по етажи се обновява на живо.
            </p>
          </div>
        </header>

        <section className="bg-plaster">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 pb-24">
              {properties.map((property, index) => (
                <Reveal key={property.id} delay={index * 0.08}>
                  <ProjectPanel
                    property={property}
                    available={byProject[property.projectType]?.available ?? 0}
                    reversed={index % 2 === 1}
                    onOpen={() => openProject(property)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </>
  )
}

export default Projects
