import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Button from '../components/ui/Button'
import PageTransition from '../components/ui/PageTransition'
import { seoData } from '../utils/seo'
import slider01 from '../assets/images/slider01.webp'
import slider02 from '../assets/images/slider02.webp'
import traditions from '../assets/images/traditions.webp'
import hotelParadise from '../assets/projects/Хотел Парадайс - с.Огняново/45263613_104668413873023_2147464397956579328_n.webp'

// Same four figures the old hero-counter overlay used ("Task 5 stats-band style").
const stats = [
  { value: 15, suffix: '+', label: 'Години опит' },
  { value: 200, suffix: '+', label: 'Завършени проекта' },
  { value: 50, suffix: '+', label: 'Доволни клиенти' },
  { value: 100, suffix: '%', label: 'Качество и гаранция' },
]

// The old "Нашите ценности" icon cards (Качество / Точност / Иновации),
// text carried over verbatim — only the icon+gradient card chrome is dropped.
const values = [
  {
    title: 'Качество',
    description: 'Използваме най-добрите материали и най-новите технологии за постигане на изключително качество във всеки проект.',
  },
  {
    title: 'Точност',
    description: 'Спазваме стриктно договорените срокове и бюджети, осигурявайки пълна прозрачност в работния процес.',
  },
  {
    title: 'Иновации',
    description: 'Прилагаме най-съвременните строителни технологии и методи за постигане на отлични резултати.',
  },
]

// The old "Какво предлагаме?" service cards, text carried over verbatim.
const services = [
  {
    title: 'Жилищно строителство',
    description: 'Домове, в които комфортът и качеството вървят ръка за ръка.',
  },
  {
    title: 'Обществени и административни сгради',
    description: 'Модерни, функционални и устойчиви решения.',
  },
  {
    title: 'Ремонти и реконструкции',
    description: 'Обновяване и модернизация на съществуващи сгради.',
  },
  {
    title: 'Проектиране и консултации',
    description: 'Съдействие от първата идея до последния детайл.',
  },
]

// The old "Защо да изберете КСМ Строй ООД?" checklist, text carried over verbatim.
const reasons = [
  'Опитен и квалифициран екип',
  'Съвременни материали и технологии',
  'Стриктно спазване на срокове и бюджет',
  'Индивидуален подход към всеки проект',
  'Дългосрочно доверие и надеждно партньорство',
]

const mission = {
  title: 'Нашата мисия',
  content: 'Да предоставяме цялостни строителни услуги, които обединяват професионализъм, отговорност и иновации, като същевременно гарантираме удовлетворението на нашите клиенти.',
}

const vision = {
  title: 'Нашата визия',
  content: 'Вярваме, че строителството не е просто изграждане на сгради, а създаване на пространства за живот, работа и бъдеще. Ето защо в КСМ Строй ООД винаги поставяме клиента и качеството на първо място.',
}

// An alternating editorial row: image rounded-2xl on one side, DimensionLine +
// DisplayHeading(size="sub") + body on the other. `reversed` flips which side
// the image sits on so consecutive sections alternate.
function EditorialSection({ image, alt, eyebrow, heading, reversed = false, bg = 'bg-plaster', children }) {
  return (
    <section className={`${bg} py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal className={reversed ? 'lg:order-2' : ''}>
          <img
            src={image}
            alt={alt}
            loading="lazy"
            className="rounded-2xl aspect-[4/3] object-cover w-full"
          />
        </Reveal>
        <Reveal delay={0.08} className={reversed ? 'lg:order-1' : ''}>
          <DimensionLine label={eyebrow} />
          <DisplayHeading size="sub">{heading}</DisplayHeading>
          <div className="mt-5 text-graphite leading-relaxed space-y-4">{children}</div>
        </Reveal>
      </div>
    </section>
  )
}

const About = () => {
  return (
    <>
      <SEO
        title={seoData.about.title}
        description={seoData.about.description}
        keywords={seoData.about.keywords}
        ogTitle={seoData.about.ogTitle}
        ogImage={seoData.about.ogImage}
      />

      <PageTransition as="main" className="bg-plaster">
        {/* Opening statement */}
        <section className="bg-plaster pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DimensionLine label="За нас" />
            <DisplayHeading as="h1">Строим от <em>15 години</em>. Оставаме след това.</DisplayHeading>
            <p className="max-w-2xl text-graphite text-lg leading-relaxed mt-5">
              Вашият доверен партньор в строителството! С дългогодишен опит и професионален екип,
              ние изграждаме жилищни, обществени и индустриални обекти с високо качество и прецизност.
              От идеята до завършената сграда – ние сме до вас във всяка стъпка.
            </p>
          </div>
        </section>

        {/* История */}
        <EditorialSection
          image={traditions}
          alt="KSM Stroy - Традиция и иновации"
          eyebrow="Нашата история"
          heading={<>Традиция и иновации <em>от 2008</em></>}
        >
          <p>
            КСМ СТРОЙ ООД е основана през месец септември 2008 г. от двама братя Кадри и Сухат,
            синове на известен в родното им село Буково строител зидар /дюлгерин/.
          </p>
          <p>
            Учредителите още от самото създаване на дружеството залагат на характерните черти за
            региона като КОРЕКТНОСТ, БЪРЗИНА И ТОЧНОСТ ПОД МОТОТО:
          </p>
          <blockquote className="border-l-2 border-gold-accent pl-5 italic text-ink">
            „ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА"
          </blockquote>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold uppercase tracking-eyebrow text-gold-deep">
            <span>Коректност</span>
            <span>Бързина</span>
            <span>Точност</span>
          </div>
        </EditorialSection>

        {/* Кои сме ние */}
        <EditorialSection
          image={slider01}
          alt="KSM Stroy строителни проекти"
          eyebrow="За компанията"
          heading={<>Кои сме <em>ние</em>?</>}
          reversed
          bg="bg-white"
        >
          <p>
            КСМ Строй ООД е строителна компания, ориентирана към качество, надеждност и устойчиви
            решения. Съчетаваме дългогодишен опит с модерни технологии, за да създаваме проекти,
            които отговарят на всички съвременни изисквания.
          </p>
        </EditorialSection>

        {/* Ценности — icon grid replaced with a two-column hairline list */}
        <section className="bg-plaster py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <DimensionLine label="Нашите ценности" />
              <DisplayHeading size="sub">Какво ни прави <em>различни</em></DisplayHeading>
              <p className="text-graphite mt-5 max-w-2xl">
                Три принципа, които ръководят всеки наш проект и гарантират изключителните резултати.
              </p>
            </Reveal>
            <div className="mt-10 divide-y divide-concrete border-t border-concrete">
              {values.map((value, index) => (
                <Reveal key={value.title} delay={index * 0.06} className="grid md:grid-cols-4 gap-4 py-6">
                  <h3 className="font-display text-2xl">{value.title}</h3>
                  <p className="text-graphite md:col-span-3 leading-relaxed">{value.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Услуги */}
        <EditorialSection
          image={hotelParadise}
          alt="Хотел Парадайс - реализиран проект на KSM Stroy"
          eyebrow="Нашите услуги"
          heading={<>Какво <em>предлагаме</em>?</>}
          bg="bg-white"
        >
          <div className="divide-y divide-concrete border-t border-concrete">
            {services.map((service) => (
              <div key={service.title} className="py-4">
                <h3 className="font-display text-lg text-ink">{service.title}</h3>
                <p className="text-graphite text-sm mt-1">{service.description}</p>
              </div>
            ))}
          </div>
        </EditorialSection>

        {/* Защо да изберете нас */}
        <section className="bg-plaster py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <DimensionLine label="Предимства" />
              <DisplayHeading size="sub">Защо да изберете <em>нас</em>?</DisplayHeading>
            </Reveal>
            <div className="mt-8 divide-y divide-concrete border-t border-concrete max-w-3xl">
              {reasons.map((reason, index) => (
                <Reveal key={reason} delay={index * 0.05}>
                  <p className="text-ink text-lg py-4">{reason}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Мисия и визия */}
        <EditorialSection
          image={slider02}
          alt="KSM Stroy строителни проекти"
          eyebrow="Нашите принципи"
          heading={<>Мисия и <em>визия</em></>}
          reversed
          bg="bg-white"
        >
          <div>
            <h3 className="font-display text-xl text-ink">{mission.title}</h3>
            <p className="mt-2">{mission.content}</p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">{vision.title}</h3>
            <p className="mt-2">{vision.content}</p>
          </div>
        </EditorialSection>

        {/* Числата — Task 5 stats-band style */}
        <section className="bg-ink text-plaster py-20" aria-labelledby="about-stats-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DimensionLine dark label="Числата" />
            <h2 id="about-stats-heading" className="sr-only">Числата зад KSM Строй</h2>

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

        {/* Closing CTA */}
        <section className="bg-plaster py-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <DisplayHeading>Готови сте да <em>работите</em> с нас?</DisplayHeading>
              <p className="text-graphite mt-5 max-w-xl mx-auto">
                Свържете се с нашия екип за консултация и да обсъдим как можем да реализираме вашия проект.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button as={Link} to="/contact" variant="dark">Свържете се с нас</Button>
                <Button as={Link} to="/blog" variant="ghost">Разгледайте обектите</Button>
              </div>
            </Reveal>
          </div>
        </section>
      </PageTransition>
    </>
  )
}

export default About
