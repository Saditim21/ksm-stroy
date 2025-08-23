import { motion } from 'framer-motion'
import HeroCarousel from '../components/ui/HeroCarousel'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { seoData, generateStructuredData } from '../utils/seo'
import img001 from '../assets/images/001.jpg'
import img002 from '../assets/images/002.jpg'
import img003 from '../assets/images/003.jpg'
import covidDocument from '../assets/home/TABELA_Covid-19_EP_page-0001 (1).jpg'
import { pageVariants, pageTransition, fadeInUp, staggerContainer, staggerItem, hoverLift, viewportOptions } from '../utils/animations'

const Home = () => {
  const services = [
    {
      image: img001,
      title: "Жилищно Строителство",
      description: "Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт"
    },
    {
      image: img002,
      title: "Ремонти и Реновация", 
      description: "Цялостни ремонти и модернизация на съществуващи сгради"
    },
    {
      image: img003,
      title: "Комерсиално Строителство",
      description: "Офисни сгради, складове и индустриални обекти"
    }
  ]

  const stats = [
    { number: "15+", label: "Години опит" },
    { number: "200+", label: "Завършени проекта" },
    { number: "50+", label: "Доволни клиенти" },
    { number: "100%", label: "Качество и гаранция" }
  ]

  // Generate structured data for homepage
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
      
      <motion.main 
        className="min-h-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
      {/* Hero Section */}
      <HeroCarousel />

      {/* COVID-19 Project Document Section */}
      <motion.section 
        className="py-12 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-8" variants={staggerItem}>
            <h2 className="text-display-2 text-primary-900 mb-6">
              Проект и главна цел: „Подкрепа за малки предприятия с оборот над 500 000 лв. за преодоляване на икономическите последствия от пандемията COVID-19"
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <motion.div className="space-y-4 text-left" variants={staggerItem}>
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Номер на АДПБФП:</h3>
                  <p className="text-primary-700">BG16RFOP002-2.089-1852-C01</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Бенефициент:</h3>
                  <p className="text-primary-700">„КСМ СТРОЙ" ООД</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Обща стойност:</h3>
                  <p className="text-primary-700">50 000.00 лв., от които 50 000.00 лв. европейско и 00.00 лв. национално съфинансиране.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">Начало:</h3>
                    <p className="text-primary-700">24.03.2022г.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">Край:</h3>
                    <p className="text-primary-700">24.06.2022 г.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex justify-center lg:justify-end"
                variants={hoverLift}
                whileHover="hover"
              >
                <OptimizedImage
                  src={covidDocument}
                  alt="COVID-19 Project Document - EU and Bulgarian Operational Program"
                  className="max-w-full h-auto rounded-luxury shadow-luxury hover:shadow-luxury-lg transition-shadow duration-300"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        id="services-section" 
        className="py-16 bg-primary-50"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header className="text-center mb-12" variants={staggerItem}>
            <h2 className="text-display-1 text-primary-900 mb-4">Нашите Услуги</h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти
            </p>
          </motion.header>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
          >
            {services.map((service, index) => (
              <motion.article 
                key={index}
                className="text-center p-8 rounded-luxury-lg bg-gradient-to-br from-primary-50 to-ivory-50 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg cursor-pointer group transition-all duration-300"
                variants={hoverLift}
                initial="initial"
                whileHover="hover"
                whileInView={staggerItem.animate}
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-8 h-8 text-primary-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </motion.div>
                <h3 className="text-display-3 text-primary-900 mb-4 group-hover:text-gold-700 transition-colors duration-300">{service.title}</h3>
                <p className="text-primary-600 leading-relaxed">{service.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={fadeInUp}
        aria-labelledby="stats-heading"
      >
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header className="text-center mb-12" variants={staggerItem}>
            <h2 id="stats-heading" className="text-display-1 text-white mb-4">Защо да изберете нас?</h2>
            <p className="text-lg text-platinum-300 max-w-2xl mx-auto">
              Доказани резултати и непрекъсната традиция в строителството
            </p>
          </motion.header>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
            role="list"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 rounded-luxury border border-gold-500/20 hover:border-gold-500/40 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300"
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                role="listitem"
              >
                <motion.div 
                  className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-3"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                  aria-label={`${stat.number} ${stat.label}`}
                >
                  {stat.number}
                </motion.div>
                <p className="text-platinum-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
    </>)
}

export default Home