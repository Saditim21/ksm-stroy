import { motion } from 'framer-motion'
import HeroCarousel from '../components/ui/HeroCarousel'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { seoData, generateStructuredData } from '../utils/seo'
import img001 from '../assets/home/001.jpg'
import img003 from '../assets/images/003.jpg'
import imgPhoto4 from '../assets/home/photo-4.png'
import { pageVariants, pageTransition, fadeInUp, staggerContainer, staggerItem, hoverLift, viewportOptions } from '../utils/animations'

const Home = () => {
  const services = [
    {
      image: img001,
      title: "Жилищно Строителство",
      description: "Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт"
    },
    {
      image: imgPhoto4,
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


      {/* Services Section */}
      <motion.section 
        id="services-section" 
        className="py-6 sm:py-8 lg:py-12 bg-primary-50"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.header className="text-center mb-6 sm:mb-8 lg:mb-12" variants={staggerItem}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-900 mb-2 sm:mb-4">Нашите Услуги</h2>
            <p className="text-sm sm:text-base lg:text-lg text-primary-600 max-w-2xl mx-auto px-2 sm:px-0">
              Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти
            </p>
          </motion.header>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
          >
            {services.map((service, index) => (
              <motion.article 
                key={index}
                className="text-center p-4 sm:p-6 rounded-luxury-lg bg-gradient-to-br from-white to-ivory-50 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg cursor-pointer group transition-all duration-300"
                variants={hoverLift}
                initial="initial"
                whileHover="hover"
                whileInView={staggerItem.animate}
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div 
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-primary-900 mb-2 sm:mb-3 group-hover:text-gold-700 transition-colors duration-300">{service.title}</h3>
                <p className="text-xs sm:text-sm text-primary-600 leading-relaxed">{service.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={fadeInUp}
        aria-labelledby="stats-heading"
      >
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.header className="text-center mb-6 sm:mb-8 lg:mb-12" variants={staggerItem}>
            <h2 id="stats-heading" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-4">Защо да изберете нас?</h2>
            <p className="text-sm sm:text-base lg:text-lg text-platinum-300 max-w-2xl mx-auto px-2 sm:px-0">
              Доказани резултати и непрекъсната традиция в строителството
            </p>
          </motion.header>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
            role="list"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-4 sm:p-6 rounded-luxury border border-gold-500/20 hover:border-gold-500/40 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300"
                variants={staggerItem}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                role="listitem"
              >
                <motion.div 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2 sm:mb-3"
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
                <p className="text-platinum-300 font-medium text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
    </>)
}

export default Home