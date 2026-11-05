import { motion } from 'framer-motion'
import posterImage from '../assets/home/optimized/eu-poster.webp'
import { fadeInUp, viewportOptions } from '../utils/animations'

// Видимост по ЕС: плакат A3 на проект BG16RFPR001-1.012-1485-C01 (ПКИП 2021-2027).
const POSTER_PDF = '/eu/plakat-ksm-stroy-a3.pdf'

const facts = [
  { label: 'Общ бюджет', value: '35 320,04 евро' },
  { label: 'Безвъзмездна финансова помощ', value: '24 724,03 евро' },
  { label: 'Собствено съфинансиране', value: '10 596,01 евро' },
  { label: 'Продължителност', value: '27.01.2026 г. – 27.01.2027 г.' },
]

const EuPosterSection = () => (
  <motion.section
    className="py-10 sm:py-14 lg:py-20 bg-white"
    initial="initial"
    whileInView="animate"
    viewport={viewportOptions}
    variants={fadeInUp}
    aria-labelledby="eu-project-heading"
  >
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
      <figure className="lg:col-span-5 w-full max-w-[300px] sm:max-w-[340px] lg:max-w-none mx-auto">
        <a
          href={POSTER_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border border-primary-200 shadow-luxury-lg transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600"
        >
          <img
            src={posterImage}
            width={800}
            height={1132}
            loading="lazy"
            decoding="async"
            alt="Плакат на проект „Дигитализация на предприятията“ на КСМ СТРОЙ ООД, съфинансиран от Европейския съюз"
            className="block w-full h-auto"
          />
          <span className="sr-only">(отваря PDF в нов раздел)</span>
        </a>
        <figcaption className="mt-3 text-xs text-primary-500 text-center">Плакат във формат A3, PDF</figcaption>
      </figure>

      <div className="lg:col-span-7">
        <p className="text-sm sm:text-base text-primary-600 mb-2">Проект, съфинансиран от Европейския съюз</p>
        <h2 id="eu-project-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 mb-4">
          Дигитализация на предприятията
        </h2>
        <p className="text-sm sm:text-base text-primary-700 leading-relaxed max-w-prose mb-6 sm:mb-8">
          КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 по Програма „Конкурентоспособност и иновации в
          предприятията“ 2021-2027. Внедряваме четири свързани системи: за управление на ресурсите (ERP), за работа с
          клиенти (CRM), за бизнес анализи (BI) и за електронно обучение на служителите.
        </p>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
          {facts.map((fact) => (
            <div key={fact.label} className="border-l-2 border-gold-500 pl-3">
              <dt className="text-xs sm:text-sm text-primary-500">{fact.label}</dt>
              <dd className="text-base sm:text-lg font-semibold text-primary-900">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-3">
          <a
            href={POSTER_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-luxury bg-primary-900 text-white text-sm sm:text-base font-semibold hover:bg-primary-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            Отвори плаката
          </a>
          <a
            href={POSTER_PDF}
            download="Плакат A3 - КСМ Строй.pdf"
            className="inline-flex items-center px-5 py-2.5 rounded-luxury border border-primary-300 text-primary-900 text-sm sm:text-base font-semibold hover:border-gold-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          >
            Изтегли PDF
          </a>
        </div>

        <p className="mt-8 text-xs text-primary-500 leading-relaxed max-w-prose">
          Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и при никакви обстоятелства не може да се приема,
          че този документ отразява официалното становище на Европейския съюз и Управляващия орган.
        </p>
      </div>
    </div>
  </motion.section>
)

export default EuPosterSection
