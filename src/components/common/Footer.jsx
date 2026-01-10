import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.jpg'

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        {/* Luxury accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500"></div>
        
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-4 sm:mb-6">
                <img 
                  src={logo} 
                  alt="KSM Stroy Logo" 
                  className="h-16 sm:h-18 lg:h-20 w-16 sm:w-18 lg:w-20 object-cover rounded-full transition-all duration-300 hover:scale-105 border-2 border-gold-500/40 hover:border-gold-500/70"
                  style={{ 
                    filter: 'drop-shadow(0 3px 10px rgba(212, 175, 55, 0.5))'
                  }}
                />
              </div>
              
              <p className="text-platinum-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 lg:mb-8 max-w-xl">
                Водеща строителна компания в България с над 15 години опит. 
                Специализираме се в жилищно и комерсиално строителство, 
                предлагайки иновативни решения и високо качество на изпълнение.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mr-2 sm:mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-platinum-300 text-sm sm:text-base">
                    <p>гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38</p>
                    <p className="mt-1">гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-platinum-300 text-sm sm:text-base">+359887886166</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-platinum-300 text-sm sm:text-base">ksm_str@abv.bg</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gold-400">Бързи връзки</h4>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li>
                  <Link 
                    to="/" 
                    className="text-platinum-300 hover:text-gold-400 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Начало
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-platinum-300 hover:text-gold-400 transition-colors duration-200 text-sm sm:text-base"
                  >
                    За нас
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/projects" 
                    className="text-platinum-300 hover:text-gold-400 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Проекти
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog" 
                    className="text-platinum-300 hover:text-gold-400 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Блог и новини
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-platinum-300 hover:text-gold-400 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Контакти
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gold-400">Услуги</h4>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Жилищно строителство</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Комерсиални проекти</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Ремонти и реновации</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Архитектурно проектиране</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Консултантски услуги</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm sm:text-base">Управление на проекти</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="border-t border-gold-500/20 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">

            {/* Social Media */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mb-2 md:mb-0">
              <span className="text-platinum-400 text-xs sm:text-sm">Последвайте ни:</span>
              <div className="flex space-x-5 sm:space-x-4">
                <a
                  href="https://www.facebook.com/ksm.stroi/"
                  className="text-platinum-400 hover:text-gold-400 transition-colors duration-200 p-2 -m-2 hover:bg-white/5 rounded-full"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-6 w-6 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-platinum-400 text-xs sm:text-sm text-center md:text-right">
              © 2024 KSM Stroy. Всички права запазени.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer