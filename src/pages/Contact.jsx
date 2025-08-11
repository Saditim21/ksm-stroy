import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import SEO from '../components/common/SEO'
import { seoData } from '../utils/seo'
import { pageVariants, pageTransition, fadeInUp, buttonExpand, viewportOptions } from '../utils/animations'

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Form submitted:', data)
      setIsSubmitted(true)
      reset()
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error('Form submission error:', error)
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
      title: "Адрес",
      details: [
        "гр. София, ул. Строителна 123",
        "1000 София, България"
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
        "+359 888 123 456",
        "+359 2 123 4567"
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
        "info@ksmstroy.bg",
        "office@ksmstroy.bg"
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
        className="min-h-screen bg-primary-50 pt-8"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300 mb-2">15+</div>
                <div className="text-sm text-blue-100">Години опит</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Информация за контакт</span>
                <h2 className="text-display-1 text-primary-900 mt-2 mb-6">
                  Как можете да се свържете с нас
                </h2>
                <p className="text-primary-600 leading-relaxed">
                  Нашият екип е на ваше разположение за консултации, оферти и отговори на всички ваши въпроси.
                </p>
              </div>
              
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4 text-blue-600 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Изпратете запитване</h2>
                
                {/* Success Message */}
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Вашето съобщение е изпратено успешно! Ще се свържем с вас скоро.
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
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
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
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
                        placeholder="+359 888 123 456"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
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
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center"
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
      <section className="py-16 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Местоположение</span>
            <h2 className="text-display-1 text-primary-900 mt-2 mb-6">Нашият офис</h2>
            <p className="text-primary-600 max-w-2xl mx-auto">
              Посетете ни в нашия офис в центъра на София за лична консултация и обсъждане на вашия проект
            </p>
          </div>
          
          {/* Google Maps Embed */}
          <div className="rounded-luxury-lg overflow-hidden shadow-luxury border border-silver-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.086749715398!2d23.31591831545768!3d42.69751527916949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa8682cb317bf5%3A0x400a01269bf5e60!2sSofia%2C%20Bulgaria!5e0!3m2!1sen!2sbg!4v1642092876543!5m2!1sen!2sbg"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KSM Stroy Office Location"
              className="w-full"
            />
          </div>
          
          {/* Map Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white rounded-luxury px-6 py-4 shadow-luxury border border-silver-200">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700 font-medium">гр. София, ул. Строителна 123, 1000</span>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
    </>)
}

export default Contact