import { motion } from 'framer-motion'
import heroImage from '../../assets/images/slider01.jpg'
import { fadeInUp, staggerContainer, staggerItem, buttonExpand, floatAnimation } from '../../utils/animations'

const Hero = () => {
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects-section')
    if (projectsSection) {
      projectsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <motion.section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Luxury Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/60 to-primary-900/80"></div>
      
      {/* Premium Pattern Overlay with gold accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-gold-900/10"></div>

      {/* Hero Content */}
      <motion.div 
        className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Main Heading */}
        <motion.div variants={staggerItem}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <motion.span 
              className="block text-white"
              variants={staggerItem}
            >
              Създаваме бъдещето
            </motion.span>
            <motion.span 
              className="block bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent"
              variants={staggerItem}
            >
              на строителството
            </motion.span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={staggerItem}>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light leading-relaxed mb-4">
            Качествени проекти за съвременния живот
          </p>
          
          <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            С над 15 години опит реализираме мечтите ви за идеалния дом и работно пространство
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={staggerItem}
        >
          {/* Primary Button */}
          <motion.button
            onClick={scrollToProjects}
            className="group relative bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-8 py-4 rounded-luxury font-semibold text-lg shadow-gold-glow hover:shadow-gold-glow-lg min-w-[200px]"
            variants={buttonExpand}
            whileHover="hover"
            whileTap="tap"
          >
            <span className="relative z-10">Виж проектите в продажба</span>
            
            {/* Arrow Icon */}
            <svg 
              className="inline-block ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            className="group border-2 border-gold-500/50 hover:border-gold-500 text-white hover:bg-gold-500 hover:text-primary-900 px-8 py-4 rounded-luxury font-semibold text-lg backdrop-blur-sm min-w-[200px] transition-all duration-300"
            variants={buttonExpand}
            whileHover="hover"
            whileTap="tap"
          >
            Свържете се с нас
            <svg 
              className="inline-block ml-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-white/20"
          variants={staggerContainer}
        >
          {[
            { number: "15+", label: "Години опит" },
            { number: "200+", label: "Завършени проекта" },
            { number: "50+", label: "Доволни клиенти" },
            { number: "100%", label: "Гаранция" }
          ].map((stat, index) => (
            <motion.div key={index} className="text-center" variants={staggerItem}>
              <div className="text-3xl md:text-4xl font-bold text-gold-400 mb-2">{stat.number}</div>
              <div className="text-sm md:text-base text-platinum-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        variants={floatAnimation}
        animate="animate"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <button
          onClick={scrollToProjects}
          className="text-white/70 hover:text-white transition-colors duration-300 flex flex-col items-center"
        >
          <span className="text-sm mb-2">Разгледайте нашата работа</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div 
        className="absolute top-1/4 left-8 w-1 h-16 bg-gradient-to-b from-gold-500/50 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-8 w-1 h-16 bg-gradient-to-t from-gold-500/50 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      />
    </motion.section>
  )
}

export default Hero