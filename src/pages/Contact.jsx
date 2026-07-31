import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import PageTransition from '../components/ui/PageTransition'
import { seoData } from '../utils/seo'

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_qdte1vp'
const EMAILJS_TEMPLATE_ID = 'template_zsun0cc'
const EMAILJS_PUBLIC_KEY = 'iDCcC1JI_k69MIid0'

// Underline input recipe (see design brief) — distinctive, calm, matches the
// editorial tone of the rest of the redesign instead of the old boxed inputs.
const inputClass = (hasError) =>
  `w-full border-0 border-b bg-transparent px-0 py-3 focus:border-gold-accent focus:ring-0 text-ink placeholder:text-graphite/60 ${
    hasError ? 'border-red-400' : 'border-concrete'
  }`

const labelClass = 'block text-xs font-semibold uppercase tracking-eyebrow text-graphite mb-1'

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      projectType: '',
      budget: '',
      company: ''
    }
  })

  // Идване от explorer-а: ?apartment=... предварително попълва съобщението.
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const apartment = searchParams.get('apartment')
    if (apartment) {
      setValue('message', `Здравейте, интересувам се от апартамент ${apartment}. Моля, свържете се с мен.`)
    }
  }, [searchParams, setValue])

  // Създава Lead в Odoo CRM. Нарочно е "best effort" - ако CRM-ът е
  // недостъпен, посетителят не вижда грешка и запитването пак стига до
  // имейла през EmailJS.
  const sendToOdoo = async (data) => {
    const response = await fetch('/api/odoo-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectType: data.projectType,
        budget: data.budget,
        message: data.message,
        company: data.company
      })
    })

    if (!response.ok) {
      throw new Error(`CRM отговори с ${response.status}`)
    }

    return response.json()
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    // Send email using EmailJS
    const sendEmail = async () => {
      // Lazy load EmailJS only when needed
      const emailjs = await import('@emailjs/browser').then(module => module.default)

      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        reply_to: data.email,
        phone: data.phone || 'Не е посочен',
        project_type: data.projectType || 'Не е посочен',
        budget: data.budget || 'Не е посочен',
        message: data.message,
        to_email: 'ksm_str@abv.bg'
      }

      return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )
    }

    try {
      // Двете изпращания вървят паралелно, но само имейлът определя какво
      // вижда посетителят.
      const [emailResult, odooResult] = await Promise.allSettled([
        sendEmail(),
        sendToOdoo(data)
      ])

      if (odooResult.status === 'rejected') {
        console.error('CRM sync failed (запитването е изпратено по имейл):', odooResult.reason)
      }

      if (emailResult.status === 'rejected') {
        throw emailResult.reason
      }

      setIsSubmitted(true)
      reset()

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })

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
      title: "Адреси",
      details: [
        "гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38",
        "гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1"
      ]
    },
    {
      title: "Телефон",
      details: [
        "+359887886166",
        "+359885762224"
      ]
    },
    {
      title: "Имейл",
      details: [
        "ksm_str@abv.bg"
      ]
    },
    {
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

      <PageTransition as="main" className="bg-plaster pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DimensionLine label="Контакти" />
          <DisplayHeading as="h1">Да поговорим за <em>вашия</em> дом.</DisplayHeading>
          <p className="text-graphite mt-5 max-w-xl">
            Отговаряме в рамките на един работен ден.
          </p>

          <div className="grid lg:grid-cols-5 gap-10 mt-12">
            {/* Contact Form */}
            <Reveal className="lg:col-span-3 bg-white border border-concrete rounded-2xl p-8">
              {/* Success Message */}
              {isSubmitted && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-concrete bg-plaster p-4 text-ink">
                  <svg className="w-5 h-5 text-gold-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Вашето съобщение е изпратено успешно! Ще се свържем с вас скоро.
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot - скрито от посетителите, ботовете го попълват */}
                <input
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  {...register('company')}
                  className="absolute w-px h-px -m-px p-0 overflow-hidden border-0 opacity-0 pointer-events-none"
                  style={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)' }}
                />

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className={labelClass}>
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
                    className={inputClass(errors.name)}
                    placeholder="Вашето пълно име"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className={labelClass}>
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
                      className={inputClass(errors.email)}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
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
                      className={inputClass(errors.phone)}
                      placeholder="+359887886166"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Project Type and Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="projectType" className={labelClass}>
                      Тип проект
                    </label>
                    <select
                      id="projectType"
                      {...register('projectType')}
                      className={inputClass(false)}
                    >
                      <option value="">Изберете тип проект</option>
                      {projectTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget" className={labelClass}>
                      Бюджет
                    </label>
                    <select
                      id="budget"
                      {...register('budget')}
                      className={inputClass(false)}
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
                  <label htmlFor="message" className={labelClass}>
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
                    className={inputClass(errors.message)}
                    placeholder="Опишете подробно вашия проект, изисквания и очаквания..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                  className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                </Button>
              </form>
            </Reveal>

            {/* Contact Information — plain editorial list, no card */}
            <Reveal delay={0.1} className="lg:col-span-2 space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index}>
                  <div className="text-graphite text-xs uppercase tracking-eyebrow">{info.title}</div>
                  <div className="mt-1 space-y-1">
                    {info.details.map((detail, idx) => (
                      info.title === "Телефон" ? (
                        <a
                          key={idx}
                          href={`tel:${detail}`}
                          className="block text-ink text-lg hover:text-gold-accent transition-colors duration-200"
                        >
                          {detail}
                        </a>
                      ) : info.title === "Имейл" ? (
                        <a
                          key={idx}
                          href={`mailto:${detail}`}
                          className="block text-ink text-lg hover:text-gold-accent transition-colors duration-200"
                        >
                          {detail}
                        </a>
                      ) : info.title === "Адреси" ? (
                        // Opens the address in Google Maps — same affordance as
                        // the tel:/mailto: entries above, in a new tab.
                        <a
                          key={idx}
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-ink text-lg hover:text-gold-accent transition-colors duration-200"
                        >
                          {detail}
                        </a>
                      ) : (
                        <p key={idx} className="text-ink text-lg">{detail}</p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </PageTransition>
    </>
  )
}

export default Contact
