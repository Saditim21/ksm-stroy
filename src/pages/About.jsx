import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { seoData } from '../utils/seo'
import img001 from '../assets/images/001.jpg'
import img002 from '../assets/images/002.jpg'
import img003 from '../assets/images/003.jpg'
import slider01 from '../assets/images/slider01.jpg'

const About = () => {
  const stats = [
    { number: "15+", label: "Години опит" },
    { number: "200+", label: "Завършени проекта" },
    { number: "50+", label: "Доволни клиенти" },
    { number: "100%", label: "Качество и гаранция" }
  ]

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Качество",
      description: "Използваме най-добрите материали и най-новите технологии за постигане на изключително качество във всеки проект."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Точност",
      description: "Спазваме стриктно договорените срокове и бюджети, осигурявайки пълна прозрачност в работния процес."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Иновации",
      description: "Прилагаме най-съвременните строителни технологии и методи за постигане на отлични резултати."
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
    <>
      <SEO 
        title={seoData.about.title}
        description={seoData.about.description}
        keywords={seoData.about.keywords}
        ogTitle={seoData.about.ogTitle}
        ogImage={seoData.about.ogImage}
      />
      
      <main className="min-h-screen pt-20">

      {/* Company Story */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашата история</span>
                <h2 className="text-display-1 text-primary-900 mt-2 mb-6">
                  Изграждаме бъдещето от 2008 година
                </h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-primary-600 mb-6 leading-relaxed">
                  КСМ СТРОЙ ООД е основана през месец септември 2008 г. от двама братя Кадри и Сухат синове на известен 
                  в родното им село Буково строител зидар /дюлгерин/.
                </p>
                
                <p className="text-lg text-primary-600 mb-6 leading-relaxed">
                  Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като 
                  <strong className="text-gold-600"> КОРЕКТНОСТ, БЪРЗИНА И ТОЧНОСТ </strong> 
                  ПОД МОТОТО <em className="text-primary-800">"ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА"</em>.
                </p>
                
                <p className="text-lg text-primary-600 leading-relaxed">
                  Всичко това го получава клиента с висока степен на сигурност, качество, коректно отношение и внимание към детайла.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <OptimizedImage 
                  src={slider01} 
                  alt="KSM Stroy офис - строителна компания в София" 
                  className="w-full h-[500px] object-cover rounded-luxury-lg shadow-luxury-lg"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-luxury-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашите услуги</span>
            <h2 className="text-display-1 text-primary-900 mt-2 mb-6">
              Обещани дейности от учредителите
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-primary-50 to-ivory-50 rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Екстериор</h3>
              <p className="text-primary-600 leading-relaxed">
                Груб строеж, изкопи, хидроизолация, топлоизолация, дренаж - проектиране и изпълнение, 
                вертикална планировка, покриви – изграждане, окачени фасади и всички други елементи за 
                облика на сградата и дома.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-ivory-50 rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-600 to-royal-700 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 000 4h8a2 2 0 000-4M8 5v0" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Интериор</h3>
              <p className="text-primary-600 leading-relaxed">
                Зидария, мазилки, замазки, шпакловки, облицовки - фаянс, теракот, гранитогрес, камък, 
                гипсокартон, ламинат, паркет и др. проектирани и изпълнени по начин за създаване на 
                уют в сградата и дома.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-primary-50 to-ivory-50 rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">ВиК и Електродейности</h3>
              <p className="text-primary-600 leading-relaxed">
                Професионална инсталация и поддръжка на водопроводни и електрически системи за вашия дом или офис.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-ivory-50 rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Ремонт в дома и офиса</h3>
              <p className="text-primary-600 leading-relaxed">
                При които свеждаме до минимум неприятните усещания на възложителя. Подръжка на обекта максимално чист и обезопасен.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашите принципи</span>
            <h2 className="text-display-1 text-primary-900 mt-2">Мисия и визия</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">{mission.title}</h3>
              <p className="text-primary-600 leading-relaxed">{mission.content}</p>
            </div>
            
            <div className="bg-white rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-600 to-royal-700 rounded-luxury flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">{vision.title}</h3>
              <p className="text-primary-600 leading-relaxed">{vision.content}</p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center bg-white rounded-luxury-lg p-8 shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mx-auto mb-6 text-primary-900 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-4 group-hover:text-gold-700 transition-colors duration-300">{value.title}</h3>
                <p className="text-primary-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашият екип</span>
            <h2 className="text-display-1 text-primary-900 mt-2 mb-6">
              Квалифицирани специалисти
            </h2>
            <p className="text-xl text-primary-600 max-w-3xl mx-auto">
              Ние сме екип млади специалисти и майстори, дипломирани технически ръководители с богат опит в строителството и интериорните решения.
            </p>
          </div>
          
          {/* Specialist Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center bg-white rounded-luxury-lg p-6 shadow-luxury border border-silver-200">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-luxury flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Строителни техници</h3>
              <p className="text-primary-600 text-sm">Дипломирани технически ръководители с богат опит</p>
            </div>
            
            <div className="text-center bg-white rounded-luxury-lg p-6 shadow-luxury border border-silver-200">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-600 to-royal-700 rounded-luxury flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Строители специалисти</h3>
              <p className="text-primary-600 text-sm">Кофраж, армировка, бетон, зидария, мазилка, облицовки, покриви</p>
            </div>
            
            <div className="text-center bg-white rounded-luxury-lg p-6 shadow-luxury border border-silver-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-luxury flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">Монтажници</h3>
              <p className="text-primary-600 text-sm">Сухо строителство, стоманобетон, ВиК мрежи</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Работници по строителство, които в последствие повишават квалификацията си и се превръщат в основно ядро за успеха на компанията.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-1 font-bold mb-4">
            Готови сте да работите с нас?
          </h2>
          <p className="text-xl text-platinum-300 mb-8 max-w-2xl mx-auto">
            Свържете се с нашия екип за консултация и да обсъдим как можем да реализираме вашия проект
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-8 py-4 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200">
              Свържете се с нас
            </button>
            <button className="border-2 border-gold-500/50 text-white px-8 py-4 rounded-luxury font-semibold hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm">
              Разгледай проектите
            </button>
          </div>
        </div>
      </section>
    </main>
    </>)
}

export default About