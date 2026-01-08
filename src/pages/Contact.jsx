import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser'
import SEO from '../components/common/SEO'
import { seoData } from '../utils/seo'
import { pageVariants, pageTransition, fadeInUp, buttonExpand, viewportOptions } from '../utils/animations'

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_qdte1vp'
const EMAILJS_TEMPLATE_ID = 'template_zsun0cc'
const EMAILJS_PUBLIC_KEY = 'iDCcC1JI_k69MIid0'

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      projectType: '',
      budget: ''
    }
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Send email using EmailJS
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone || 'Не е посочен',
        project_type: data.projectType || 'Не е посочен',
        budget: data.budget || 'Не е посочен',
        message: data.message,
        to_email: 'ksm_str@abv.bg'
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      setIsSubmitted(true)
      reset()

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError('Възникна грешка при изпращането. Моля, опитайте отново или се свържете директно с нас.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Адреси",
      details: [
        "гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38",
        "гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1"
      ]
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Телефон",
      details: [
        "+359885762224",
        "+359887886166"
      ]
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Имейл",
      details: [
        "ksm_str@abv.bg"
      ]
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Работно време",
      details: [
        "Понеделник - Петък: 8:00 - 18:00",
        "Събота: 9:00 - 14:00",
        "Неделя: Почивен ден"
      ]
    }
  ]

  const projectTypes = [
    "Жилищно строителство",
    "Комерсиални проекти",
    "Индустриални обекти",
    "Ремонти и реновации",
    "Архитектурно проектиране",
    "Консултантски услуги"
  ]

  const budgetRanges = [
    "До 50,000 лв",
    "50,000 - 100,000 лв", 
    "100,000 - 500,000 лв",
    "500,000 - 1,000,000 лв",
    "Над 1,000,000 лв"
  ]

  return (
    <>
      <SEO 
        title={seoData.contact.title}
        description={seoData.contact.description}
        keywords={seoData.contact.keywords}
        ogTitle={seoData.contact.ogTitle}
        ogImage={seoData.contact.ogImage}
      />
      
      <motion.main 
        className="min-h-screen pt-20"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >

        {/* Contact Form & Info */}
        <section className="py-12 sm:py-16 lg:py-20 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="mb-6 sm:mb-8">
                  <span className="text-gold-600 font-semibold text-xs sm:text-sm uppercase tracking-wide">Информация за контакт</span>
                  <h2 className="text-xl sm:text-2xl lg:text-display-1 text-primary-900 mt-2 mb-4 sm:mb-6 font-bold">
                    Как можете да се свържете с нас
                  </h2>
                  <p className="text-sm sm:text-base text-primary-600 leading-relaxed">
                    Нашият екип е на ваше разположение за консултации, оферти и отговори на всички ваши въпроси.
                  </p>
                </div>
                
                <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mr-3 sm:mr-4 text-primary-900 flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-1 sm:mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          info.title === "Телефон" ? (
                            <a
                              key={idx}
                              href={`tel:${detail}`}
                              className="block text-sm sm:text-base text-primary-600 hover:text-gold-600 mb-1 transition-colors duration-200 cursor-pointer"
                            >
                              {detail}
                            </a>
                          ) : info.title === "Имейл" ? (
                            <a
                              key={idx}
                              href={`mailto:${detail}`}
                              className="block text-sm sm:text-base text-primary-600 hover:text-gold-600 mb-1 transition-colors duration-200 cursor-pointer"
                            >
                              {detail}
                            </a>
                          ) : (
                            <p key={idx} className="text-sm sm:text-base text-primary-600 mb-1">{detail}</p>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-luxury-lg p-4 sm:p-6 lg:p-8 shadow-luxury border border-silver-200">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-6 sm:mb-8">Изпратете запитване</h2>
                
                {/* Success Message */}
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Вашето съобщение е изпратено успешно! Ще се свържем с вас скоро.
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {submitError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                      Име и фамилия *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', {
                        required: 'Моля, въведете вашето име',
                        minLength: {
                          value: 2,
                          message: 'Името трябва да е поне 2 символа'
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury ${
                        errors.name ? 'border-red-300' : 'border-silver-200'
                      }`}
                      placeholder="Вашето пълно име"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                        Имейл адрес *
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', {
                          required: 'Моля, въведете вашия имейл',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Невалиден имейл адрес'
                          }
                        })}
                        className={`w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury ${
                          errors.email ? 'border-red-300' : 'border-silver-200'
                        }`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone', {
                          pattern: {
                            value: /^[+]?[0-9\s-()]{8,}$/,
                            message: 'Невалиден телефонен номер'
                          }
                        })}
                        className={`w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury ${
                          errors.phone ? 'border-red-300' : 'border-silver-200'
                        }`}
                        placeholder="+359885762224"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Project Type and Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="projectType" className="block text-sm font-medium text-primary-700 mb-2">
                        Тип проект
                      </label>
                      <select
                        id="projectType"
                        {...register('projectType')}
                        className="w-full px-4 py-3 border border-silver-200 rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury"
                      >
                        <option value="">Изберете тип проект</option>
                        {projectTypes.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-primary-700 mb-2">
                        Бюджет
                      </label>
                      <select
                        id="budget"
                        {...register('budget')}
                        className="w-full px-4 py-3 border border-silver-200 rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury"
                      >
                        <option value="">Изберете бюджет</option>
                        {budgetRanges.map((range, index) => (
                          <option key={index} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-2">
                      Съобщение *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message', {
                        required: 'Моля, въведете съобщение',
                        minLength: {
                          value: 10,
                          message: 'Съобщението трябва да е поне 10 символа'
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 shadow-luxury ${
                        errors.message ? 'border-red-300' : 'border-silver-200'
                      }`}
                      placeholder="Опишете подробно вашия проект, изисквания и очаквания..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gold-400 disabled:to-gold-400 text-primary-900 py-4 px-6 rounded-luxury font-semibold flex items-center justify-center shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200"
                    variants={buttonExpand}
                    whileHover={!isSubmitting ? "hover" : {}}
                    whileTap={!isSubmitting ? "tap" : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Изпращане...
                      </>
                    ) : (
                      <>
                        Изпрати съобщение
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Google Maps Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-ivory-50 to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-gold-600 font-semibold text-xs sm:text-sm uppercase tracking-wide">Местоположение</span>
              <h2 className="text-xl sm:text-2xl lg:text-display-1 font-bold text-primary-900 mt-2 mb-4 sm:mb-6">Нашите офиси</h2>
              <p className="text-sm sm:text-base text-primary-600 max-w-2xl mx-auto px-2">
                Посетете ни в един от нашите офиси за лична консултация и обсъждане на вашия проект
              </p>
            </div>
            
            {/* Google Maps Embed - Връбница 1, Sofia */}
            <div className="rounded-luxury-lg overflow-hidden shadow-luxury border border-silver-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2931.4517461839307!2d23.294583315912844!3d42.71158507916295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa857a6f1a6f0d%3A0x8c4d46f3a9e8c0a0!2z0LYu0LouINCS0YDRitCx0L3QuNGG0LAtMSwg0KHQvtGE0LjRjw!5e0!3m2!1sbg!2sbg!4v1700000000000!5m2!1sbg!2sbg"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KSM Stroy Office - Връбница 1, София"
                className="w-full h-[280px] sm:h-[350px] lg:h-[400px]"
              />
            </div>
            
            {/* Map Info */}
            <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <div className="flex items-center bg-white rounded-luxury px-4 sm:px-6 py-3 sm:py-4 shadow-luxury border border-silver-200">
                <svg className="w-5 h-5 text-gold-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm sm:text-base text-primary-700 font-medium">гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38</span>
              </div>
              <div className="flex items-center bg-white rounded-luxury px-4 sm:px-6 py-3 sm:py-4 shadow-luxury border border-silver-200">
                <svg className="w-5 h-5 text-gold-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm sm:text-base text-primary-700 font-medium">гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
          {/* Gold accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-display-1 font-bold mb-3 sm:mb-4">
              Готови сте да започнете своя проект?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-platinum-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Нашият екип е готов да ви помогне да реализирате мечтания проект с качество и професионализъм
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-6 sm:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base hover:shadow-gold-glow-lg transition-all duration-200">
                Получете безплатна оферта
              </button>
              <button className="border-2 border-gold-500/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm">
                Обадете се сега
              </button>
            </div>
          </div>
        </section>
    </motion.main>
    </>)
}

export default Contact