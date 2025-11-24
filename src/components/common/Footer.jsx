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
                  <span className="text-platinum-300 text-sm sm:text-base">+359885762224</span>
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
              <h4 className="text-lg font-semibold mb-6 text-gold-400">Услуги</h4>
              <ul className="space-y-4">
                <li>
                  <span className="text-platinum-300 text-sm">Жилищно строителство</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm">Комерсиални проекти</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm">Ремонти и реновации</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm">Архитектурно проектиране</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm">Консултантски услуги</span>
                </li>
                <li>
                  <span className="text-platinum-300 text-sm">Управление на проекти</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <div className="border-t border-gold-500/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            {/* Social Media */}
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-platinum-400 text-sm">Последвайте ни:</span>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/ksm.stroi/"
                  className="text-platinum-400 hover:text-gold-400 transition-colors duration-200"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a 
                  href="#" 
                  className="text-platinum-400 hover:text-gold-400 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                <a 
                  href="#" 
                  className="text-platinum-400 hover:text-gold-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.926 3.708 13.775 3.708 12.478s.49-2.448 1.297-3.323C5.872 8.28 7.023 7.79 8.32 7.79s2.448.49 3.323 1.297c.867.867 1.297 2.018 1.297 3.315s-.49 2.448-1.297 3.323C10.776 16.498 9.625 16.988 8.449 16.988z"/>
                  </svg>
                </a>
                
                <a 
                  href="#" 
                  className="text-platinum-400 hover:text-gold-400 transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-platinum-400 text-sm">
              © 2024 KSM Stroy. Всички права запазени.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer