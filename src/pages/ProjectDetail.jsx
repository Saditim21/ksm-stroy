import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, Autoplay } from 'swiper/modules'
import { projectsData, statusConfig, categoryConfig } from '../data/projectsData'
import ThreeDModelViewer from '../components/ui/ThreeDModelViewer'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    const projectId = parseInt(id)
    const foundProject = projectsData.find(p => p.id === projectId)
    
    if (foundProject) {
      setProject(foundProject)
      // Create gallery images array - using project images multiple times for demo
      const galleryImages = [
        foundProject.image,
        '/src/assets/images/001.jpg',
        '/src/assets/images/002.jpg',
        '/src/assets/images/003.jpg',
        '/src/assets/images/slider01.jpg',
        foundProject.image, // Duplicate for more gallery items
      ]
      setProject({...foundProject, galleryImages})
    }
  }, [id])

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-primary-900 mb-2">Зареждане на проект...</h2>
          <p className="text-primary-600">Моля, изчакайте</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Общ преглед', icon: '🏢' },
    { id: 'gallery', label: 'Галерия', icon: '📸' },
    { id: '3d-model', label: '3D Модел', icon: '🎯' },
    { id: 'specifications', label: 'Спецификации', icon: '📋' }
  ]

  const specifications = [
    { label: 'Обща площ', value: project.area },
    { label: 'Година на завършване', value: project.year },
    { label: 'Клиент', value: project.client },
    { label: 'Категория', value: categoryConfig[project.category]?.label },
    { label: 'Статус', value: statusConfig[project.status]?.label },
    { label: 'Етажи', value: project.category === 'residential' ? '5-12' : project.category === 'commercial' ? '15-25' : '1-2' },
    { label: 'Апартаменти', value: project.category === 'residential' ? '45-120' : 'Н/П' },
    { label: 'Паркоместа', value: project.category === 'industrial' ? '50+' : project.category === 'commercial' ? '200+' : '1 на апартамент' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Image Section */}
      <section className="relative h-64 sm:h-80 md:h-96 lg:h-screen">
        <div className="absolute inset-0">
          <img
            src={project.image}
            alt={project.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-primary-200 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-primary-600">Зареждане на изображението...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-4xl">
            <div className="mb-2 sm:mb-4">
              <span className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${statusConfig[project.status]?.className} bg-opacity-90`}>
                {statusConfig[project.status]?.label}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
              {project.name}
            </h1>
            
            <div className="flex items-center justify-center text-sm sm:text-base lg:text-xl mb-4 sm:mb-6 lg:mb-8">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.location}
            </div>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 lg:mb-8 px-2">
              {project.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <button
                onClick={() => setActiveTab('gallery')}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-luxury font-semibold text-sm sm:text-base transition-all duration-200 shadow-gold-glow hover:shadow-gold-glow-lg"
              >
                Разгледай галерията
              </button>
              <button
                onClick={() => setActiveTab('floor-plan')}
                className="border-2 border-gold-500/50 text-white hover:bg-gold-500 hover:text-primary-900 px-8 py-3 rounded-luxury font-semibold transition-all duration-200 backdrop-blur-sm"
              >
                План на етажите
              </button>
              <button
                onClick={() => setActiveTab('3d-model')}
                className="border-2 border-gold-500/50 text-white hover:bg-gold-500 hover:text-primary-900 px-6 py-3 rounded-luxury font-semibold transition-all duration-200 backdrop-blur-sm"
              >
                3D Модел
              </button>
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/projects')}
          className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white min-h-[44px] min-w-[44px] sm:px-3 rounded-lg transition-all duration-300 touch-manipulation flex items-center justify-center"
        >
          <span className="text-xl sm:text-lg font-bold sm:mr-2">←</span>
          <span className="hidden sm:inline text-sm font-medium">Проекти</span>
        </button>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-16 sm:top-18 lg:top-20 bg-white border-b border-gray-200 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold-600 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Project Description */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Описание на проекта</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {project.description} Този проект представлява върхово постижение в съвременната архитектура, 
                    съчетавайки функционалност с естетика. Всеки детайл е внимателно обмислен, за да осигури 
                    максимален комфорт и удобство за обитателите.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ключови характеристики</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {project.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    Проектът е реализиран с най-високи стандарти за качество и устойчивост, използвайки 
                    най-новите технологии в строителството. Всички материали са тщателно подбрани за 
                    дълготрайност и екологичност.
                  </p>
                </div>
              </div>
              
              {/* Project Stats */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Основни данни</h3>
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  {specifications.slice(0, 5).map((spec, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600 font-medium">{spec.label}</span>
                      <span className="text-gray-900 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Category Badge */}
                <div className="mt-6">
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${categoryConfig[project.category]?.className}`}>
                    {categoryConfig[project.category]?.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Галерия</h2>
              
              {/* Main Gallery */}
              <div className="mb-8">
                <Swiper
                  modules={[Navigation, Pagination, Thumbs, Autoplay]}
                  spaceBetween={30}
                  navigation={true}
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  className="rounded-lg shadow-lg h-96 md:h-[500px] lg:h-[600px]"
                >
                  {project.galleryImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <img
                          src={image}
                          alt={`${project.name} - Изображение ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              
              {/* Thumbnails */}
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                breakpoints={{
                  640: { slidesPerView: 6 },
                  768: { slidesPerView: 8 },
                  1024: { slidesPerView: 10 }
                }}
                className="thumbs-swiper"
              >
                {project.galleryImages.map((image, index) => (
                  <SwiperSlide key={index} className="cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                      <img
                        src={image}
                        alt={`Миниатюра ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* 3D Model Tab */}
          {activeTab === '3d-model' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">3D Модел</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <ThreeDModelViewer project={project} className="h-[600px]" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Интерактивен 3D модел на проекта. Използвайте мишката за навигация в пространството.
                </p>
                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-gold-500 rounded-full mr-2"></span>
                    Завъртане: Ляв бутон
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Мащабиране: Колелце
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Придвижване: Десен бутон
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Технически спецификации</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* General Specs */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Общи характеристики
                  </h3>
                  <div className="space-y-4">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">{spec.label}</span>
                        <span className="text-gray-900 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Construction Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Строителни материали
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Конструкция</span>
                      <span className="text-gray-900 font-medium">Стоманобетонна</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Топлоизолация</span>
                      <span className="text-gray-900 font-medium">Минерална вата 15см</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Дограма</span>
                      <span className="text-gray-900 font-medium">PVC 6-камерна</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Покрив</span>
                      <span className="text-gray-900 font-medium">Керемиди Браас</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Фасада</span>
                      <span className="text-gray-900 font-medium">Силикатна мазилка</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Енерг. клас</span>
                      <span className="text-green-600 font-semibold">A+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Projects */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Подобни проекти</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsData
              .filter(p => p.id !== project.id && p.category === project.category)
              .slice(0, 3)
              .map(relatedProject => (
                <div key={relatedProject.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={relatedProject.image}
                      alt={relatedProject.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedProject.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{relatedProject.location}</p>
                    <button
                      onClick={() => navigate(`/projects/${relatedProject.id}`)}
                      className="text-gold-600 hover:text-gold-700 font-medium text-sm"
                    >
                      Виж детайли →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetail