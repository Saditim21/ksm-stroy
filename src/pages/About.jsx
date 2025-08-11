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

  const team = [
    {
      name: "Инж. Кирил Стоянов",
      position: "Управляващ директор",
      experience: "15 години опит в строителството",
      image: img001,
      description: "Водещ експерт в управлението на строителни проекти с фокус върху качеството и иновациите."
    },
    {
      name: "Арх. Мария Петрова",
      position: "Главен архитект",
      experience: "12 години опит в проектирането",
      image: img002,
      description: "Специалист в съвременната архитектура и устойчивото строителство."
    },
    {
      name: "Инж. Стефан Димитров",
      position: "Технически директор",
      experience: "18 години опит в строителството",
      image: img003,
      description: "Експерт в строителните технологии и контрола на качеството."
    },
    {
      name: "Елена Георгиева",
      position: "Финансов директор",
      experience: "10 години опит във финансите",
      image: slider01,
      description: "Отговаря за финансовото планиране и бюджетирането на проектите."
    },
    {
      name: "Инж. Петър Николов",
      position: "Ръководител проекти",
      experience: "14 години опит в строителството",
      image: img001,
      description: "Координира изпълнението на проектите от началото до завършването."
    },
    {
      name: "Анна Василева",
      position: "Ръководител HR",
      experience: "8 години опит в човешките ресурси",
      image: img002,
      description: "Развива екипа и осигурява най-добрите кадри за компанията."
    }
  ]

  return (
    <>
      <SEO 
        title={seoData.about.title}
        description={seoData.about.description}
        keywords={seoData.about.keywords}
        ogTitle={seoData.about.ogTitle}
        ogImage={seoData.about.ogImage}
      />
      
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-hero font-bold mb-6">За нас</h1>
            <p className="text-xl md:text-2xl text-platinum-300 max-w-4xl mx-auto leading-relaxed">
              Повече от 15 години изграждаме доверие чрез качество, иновации и професионализъм
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base text-platinum-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Нашата история</span>
                <h2 className="text-display-1 text-primary-900 mt-2 mb-6">
                  Изграждаме бъдещето от 2009 година
                </h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-primary-600 mb-6 leading-relaxed">
                  KSM Stroy е основана през 2009 година с ясната визия да трансформира българската строителна индустрия. 
                  От скромното си начало като малка семейна фирма, днес сме един от водещите изпълнители в сектора, 
                  с портфолио от над 200 успешно реализирани проекта.
                </p>
                
                <p className="text-lg text-primary-600 mb-6 leading-relaxed">
                  Нашият растеж е резултат от постоянното стремене към съвършенство, инвестициите в най-новите технологии 
                  и изграждането на екип от изключителни професионалисти. Всеки проект третираме като възможност да надминем 
                  очакванията на клиентите си и да поставим нови стандарти в индустрията.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Днес KSM Stroy е синоним на качество, надеждност и иновации в строителството. Работим с 
                  престижни клиенти и реализираме проекти, които оформят облика на съвременна България.
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
              Експерти с доказан опит
            </h2>
            <p className="text-xl text-primary-600 max-w-3xl mx-auto">
              Нашият екип от архитекти, инженери и специалисти е сърцето на всеки успешен проект
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-luxury-lg overflow-hidden shadow-luxury border border-silver-200 hover:border-gold-500/30 hover:shadow-luxury-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{member.name}</h3>
                  <p className="text-gold-600 font-semibold mb-2">{member.position}</p>
                  <p className="text-sm text-primary-500 mb-3">{member.experience}</p>
                  <p className="text-primary-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
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