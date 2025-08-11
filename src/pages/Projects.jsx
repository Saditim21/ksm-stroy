import { useState } from 'react'
import ProjectCard from '../components/ui/ProjectCard'
import { projectsData, categoryConfig, statusConfig } from '../data/projectsData'

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Create filter options from data
  const categoryFilters = [
    { id: 'all', label: 'Всички категории' },
    ...Object.entries(categoryConfig).map(([key, value]) => ({
      id: key,
      label: value.label
    }))
  ]

  const statusFilters = [
    { id: 'all', label: 'Всички статуси' },
    ...Object.entries(statusConfig).map(([key, value]) => ({
      id: key,
      label: value.label
    }))
  ]

  // Filter projects based on active filters and search
  const filteredProjects = projectsData.filter(project => {
    const matchesCategory = activeFilter === 'all' || project.category === activeFilter
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesStatus && matchesSearch
  })

  const clearFilters = () => {
    setActiveFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-hero font-bold mb-6">
              Нашите проекти
            </h1>
            <p className="text-xl md:text-2xl text-platinum-300 max-w-3xl mx-auto leading-relaxed">
              Разгледайте нашето портфолио от завършени, текущи и предстоящи проекти
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-platinum-300">
              <div className="flex items-center">
                <span className="font-semibold text-2xl text-white mr-2">{projectsData.length}</span>
                Общо проекта
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-2xl text-white mr-2">
                  {projectsData.filter(p => p.status === 'completed').length}
                </span>
                Завършени
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-2xl text-white mr-2">
                  {projectsData.filter(p => p.status === 'in-progress').length}
                </span>
                В процес
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-primary-50 border-b border-gold-500/20 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Търсете проект по име, локация или описание..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border border-silver-200 rounded-luxury focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white shadow-luxury"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {categoryFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-luxury font-medium text-sm transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow'
                      : 'bg-white border border-silver-200 text-primary-700 hover:border-gold-500/30 hover:bg-ivory-50 shadow-luxury'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Status Filters & Clear */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-3 items-center">
              {statusFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-4 py-2 rounded-luxury font-medium text-sm transition-all duration-200 ${
                    statusFilter === filter.id
                      ? 'bg-gradient-to-r from-royal-600 to-royal-700 text-white shadow-luxury'
                      : 'bg-white border border-silver-200 text-primary-700 hover:border-royal-500/30 hover:bg-ivory-50 shadow-luxury'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              
              {/* Clear Filters */}
              {(activeFilter !== 'all' || statusFilter !== 'all' || searchTerm !== '') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-900 font-medium border border-silver-200 rounded-luxury hover:bg-ivory-50 hover:border-gold-500/30 transition-all duration-200 shadow-luxury"
                >
                  Изчисти филтрите
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center text-primary-600">
            Показани {filteredProjects.length} от {projectsData.length} проекта
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProjects.map(project => (
                <div key={project.id} className="transform transition-all duration-300 hover:-translate-y-2">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            // No Results State
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-primary-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-2xl font-semibold text-primary-900 mb-2">Няма намерени проекти</h3>
              <p className="text-primary-600 mb-6">Опитайте с различни филтри или ключови думи</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-6 py-3 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200"
              >
                Покажи всички проекти
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-1 font-bold mb-4">
            Готови сте да започнете своя проект?
          </h2>
          <p className="text-xl text-platinum-300 mb-8 max-w-2xl mx-auto">
            Свържете се с нас за безплатна консултация и персонализирана оферта
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-8 py-4 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200">
              Получете оферта
            </button>
            <button className="border-2 border-gold-500/50 text-white px-8 py-4 rounded-luxury font-semibold hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm">
              Свържете се с нас
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Projects