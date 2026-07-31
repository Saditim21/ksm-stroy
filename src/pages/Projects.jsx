import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/common/SEO'
import PropertyCard from '../components/ui/PropertyCard'
import { properties, filters } from '../constants/properties'

const Sales = () => {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Filter properties
  const filteredProperties = selectedFilter === 'all'
    ? properties
    : selectedFilter === 'for-sale'
      ? properties.filter(property => property.status === 'За продажба')
      : selectedFilter === 'coming-soon'
        ? properties.filter(property => property.status === 'Скоро')
        : properties.filter(property => property.status === selectedFilter)

  // Every card leads to its block-selection page; the old in-page building/photo
  // modal was replaced by the /projects/<projectType> explorer flow.
  const openProject = (property) => {
    if (property.projectType) {
      navigate(`/projects/${property.projectType}`)
    }
  }

  return (
    <>
      <SEO
        title="Продажби - KSM Stroy"
        description="Открийте нашите атрактивни обекти за продажба - модерни апартаменти и жилищни сгради в престижни райони на София."
        keywords="продажби, апартаменти, имоти, новостроящи се, София"
        ogTitle="Продажби - KSM Stroy"
        ogImage={properties[0]?.images[0]}
      />

      <main className="min-h-screen bg-primary-50">


      {/* Property Filter */}
      <section
        className="py-4 sm:py-6 lg:py-10 bg-gradient-to-br from-ivory-50 to-primary-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-luxury text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation min-h-[44px] ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow scale-105'
                    : 'bg-white text-primary-700 hover:bg-gold-50 active:bg-gold-100 hover:text-gold-700 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg'
                }`}
              >
                {filter.name}
                <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                  selectedFilter === filter.id
                    ? 'bg-primary-900/20 text-primary-900'
                    : 'bg-gold-100 text-gold-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section
        className="py-8 sm:py-12 lg:py-20 bg-primary-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  onClick={() => openProject(property)}
                />
              ))}
          </div>

          {filteredProperties.length === 0 && (
            <div
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Няма обекти</h3>
              <p className="text-primary-600">В тази категория все още няма обекти за продажба.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="py-10 sm:py-12 lg:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-display-1 font-bold mb-3 sm:mb-4">
              Търсите нов дом?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-platinum-300 px-2">
              Свържете се с нас за консултация и да обсъдим наличните апартаменти и бъдещи проекти
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/contact">
                <button
                  className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-6 sm:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base hover:shadow-gold-glow-lg transition-all duration-200 touch-manipulation min-h-[48px]"
                >
                  Свържете се с нас
                </button>
              </Link>
              <Link to="/contact">
                <button
                  className="w-full sm:w-auto border-2 border-gold-500/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm touch-manipulation min-h-[48px]"
                >
                  Попитайте за цени
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  </>
  )
}

export default Sales
