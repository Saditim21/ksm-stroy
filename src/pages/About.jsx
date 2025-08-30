import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { seoData } from '../utils/seo'
import img001 from '../assets/images/001.jpg'
import img002 from '../assets/images/002.jpg'
import img003 from '../assets/images/003.jpg'
import slider01 from '../assets/images/slider01.jpg'
import { pageVariants, pageTransition, fadeInUp, staggerContainer, staggerItem, hoverLift, viewportOptions } from '../utils/animations'

// Move AnimatedCounter outside the component to prevent re-renders
const AnimatedCounter = React.memo(({ end, duration = 2000, suffix = "", label }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isVisible) return
    
    // Reset animation when coming back into view
    setCount(0)
    setHasAnimated(true)
    
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration, isVisible])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      onViewportEnter={() => setIsVisible(true)}
      onViewportLeave={() => setIsVisible(false)}
      className="text-center"
    >
      <div className="text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
        {hasAnimated ? count : 0}{suffix}
      </div>
      <p className="text-gray-300 text-sm mt-2 font-medium">{label}</p>
    </motion.div>
  )
})

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const heroImages = [slider01, img001, img002, img003]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  const stats = [
    { number: 15, suffix: "+", label: "Години опит" },
    { number: 200, suffix: "+", label: "Завършени проекта" },
    { number: 50, suffix: "+", label: "Доволни клиенти" },
    { number: 100, suffix: "%", label: "Качество и гаранция" }
  ]

  const values = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Качество",
      description: "Използваме най-добрите материали и най-новите технологии за постигане на изключително качество във всеки проект.",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Точност",
      description: "Спазваме стриктно договорените срокове и бюджети, осигурявайки пълна прозрачност в работния процес.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Иновации",
      description: "Прилагаме най-съвременните строителни технологии и методи за постигане на отлични резултати.",
      gradient: "from-purple-500 to-purple-600"
    }
  ]

  const mission = {
    title: "Нашата мисия",
    content: "Да създаваме пространства, които вдъхновяват и служат на хората, използвайки най-добрите практики в строителството и архитектурата. Стремим се да бъдем партньорът, на който нашите клиенти могат винаги да разчитат."
  }

  const vision = {
    title: "Нашата визия",
    content: "Да бъдем водеща строителна компания в България, призната за своето качество, иновативност и отговорност към клиентите и обществото. Искаме да променим начина, по който се възприема строителството в страната."
  }


  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <SEO 
        title={seoData.about.title}
        description={seoData.about.description}
        keywords={seoData.about.keywords}
        ogTitle={seoData.about.ogTitle}
        ogImage={seoData.about.ogImage}
      />
      
      <main className="min-h-screen">

      {/* Hero Section with Dynamic Background */}
      <motion.section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Dynamic Background Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <OptimizedImage
                src={heroImages[currentImageIndex]}
                alt="KSM Stroy строителни проекти"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/60 to-primary-900/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.span 
              variants={staggerItem}
              className="text-gold-400 font-semibold text-lg uppercase tracking-widest mb-4 block"
            >
              За нас
            </motion.span>
            <motion.h1 
              variants={staggerItem}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              Изграждаме
              <br />
              <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Бъдещето
              </span>
            </motion.h1>
            <motion.p 
              variants={staggerItem}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              От 2008 година създаваме пространства, които вдъхновяват и служат на хората. 
              Нашата мисия е да превърнем всяка визия в реалност с непревъзходно качество.
            </motion.p>
            
            <motion.div 
              variants={staggerItem}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={`stat-${stat.label}-${stat.number}`}
                  variants={hoverLift}
                  whileHover="hover"
                  className="text-center"
                >
                  <AnimatedCounter 
                    end={stat.number} 
                    suffix={stat.suffix}
                    label={stat.label}
                    duration={2000 + index * 500}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.section>

      {/* Company Story with Parallax Effect */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-white via-ivory-50 to-primary-50 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
          >
            <motion.div 
              variants={staggerItem}
              className="order-2 lg:order-1 space-y-8"
            >
              <div>
                <motion.span 
                  variants={fadeInUp}
                  className="text-gold-600 font-semibold text-sm uppercase tracking-wide"
                >
                  Нашата история
                </motion.span>
                <motion.h2 
                  variants={fadeInUp}
                  className="text-5xl font-bold text-primary-900 mt-4 mb-6 leading-tight"
                >
                  Традиция и иновации 
                  <span className="text-gold-600">от 2008</span>
                </motion.h2>
              </div>
              
              <motion.div variants={fadeInUp} className="space-y-6">
                <p className="text-lg text-primary-700 leading-relaxed">
                  КСМ СТРОЙ ООД е основана през септември 2008 г. от двама братя Кадри и Сухат, 
                  синове на известен в родното им село Буково строител зидар.
                </p>
                
                <div className="bg-gradient-to-r from-gold-50 to-gold-100 p-6 rounded-luxury border-l-4 border-gold-500">
                  <p className="text-lg text-primary-800 font-medium italic">
                    "ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА"
                  </p>
                  <div className="mt-4 flex space-x-8">
                    <div className="text-center">
                      <div className="text-gold-600 font-bold text-sm">КОРЕКТНОСТ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gold-600 font-bold text-sm">БЪРЗИНА</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gold-600 font-bold text-sm">ТОЧНОСТ</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-primary-700 leading-relaxed">
                  Всичко това получава клиентът с висока степен на сигурност, качество, 
                  коректно отношение и внимание към детайла.
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              variants={staggerItem}
              className="order-1 lg:order-2"
            >
              <motion.div 
                className="relative group"
                variants={hoverLift}
                whileHover="hover"
              >
                <OptimizedImage 
                  src={slider01} 
                  alt="KSM Stroy - строителни проекти и офис" 
                  className="w-full h-[600px] object-cover rounded-luxury-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-gold-500/20 rounded-luxury-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury-xl shadow-xl flex items-center justify-center">
                  <span className="text-primary-900 font-bold text-lg">2008</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Values Section with Advanced Animations */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-primary-50 to-ivory-50 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашите ценности</span>
            <h2 className="text-5xl font-bold text-primary-900 mt-4 mb-6">
              Какво ни прави <span className="text-gold-600">различни</span>
            </h2>
            <p className="text-xl text-primary-600 max-w-3xl mx-auto">
              Три принципа, които ръководят всеки наш проект и гарантират изключителните резултати
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="group relative"
              >
                <motion.div 
                  className="text-center bg-white/80 backdrop-blur-sm rounded-luxury-xl p-8 shadow-luxury border border-white/50 hover:shadow-2xl transition-all duration-500 h-full relative overflow-hidden"
                  variants={hoverLift}
                  whileHover="hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-luxury-xl flex items-center justify-center mx-auto mb-6 text-white relative z-10`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {value.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-primary-900 mb-4 relative z-10 group-hover:text-gold-700 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-primary-600 leading-relaxed relative z-10">
                    {value.description}
                  </p>
                  
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gold-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Vision with Split Animation */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/20 via-transparent to-gold-900/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <span className="text-gold-400 font-semibold text-sm uppercase tracking-wide">Нашите принципи</span>
            <h2 className="text-5xl font-bold text-white mt-4">Мисия и визия</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              variants={staggerItem}
              className="group"
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-lg rounded-luxury-xl p-8 border border-white/20 hover:border-gold-400/50 transition-all duration-500 h-full"
                variants={hoverLift}
                whileHover="hover"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-gold-400 transition-colors duration-300">
                  {mission.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{mission.content}</p>
              </motion.div>
            </motion.div>
            
            <motion.div
              variants={staggerItem}
              className="group"
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-lg rounded-luxury-xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all duration-500 h-full"
                variants={hoverLift}
                whileHover="hover"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-luxury flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-indigo-400 transition-colors duration-300">
                  {vision.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{vision.content}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action with Impressive Animation */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-gold-500 via-gold-600 to-gold-700 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-900/20 to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={staggerItem}>
            <h2 className="text-6xl font-bold text-primary-900 mb-6 leading-tight">
              Готови сте да 
              <br />
              <span className="text-white">работите с нас?</span>
            </h2>
            <p className="text-2xl text-primary-800 mb-12 max-w-4xl mx-auto leading-relaxed">
              Свържете се с нашия екип за консултация и да обсъдим как можем да реализираме вашия проект
            </p>
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.button 
                className="bg-primary-900 text-gold-400 px-12 py-6 rounded-luxury-xl font-bold text-lg hover:bg-primary-800 transition-all duration-300 shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Свържете се с нас
              </motion.button>
              <motion.button 
                className="border-2 border-primary-900 text-primary-900 px-12 py-6 rounded-luxury-xl font-bold text-lg hover:bg-primary-900 hover:text-gold-400 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Разгледайте проектите
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </main>
    </motion.div>
  )
}

export default About