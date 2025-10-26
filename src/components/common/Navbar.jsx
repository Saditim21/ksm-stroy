import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/images/logo.jpg'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState('BG')
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Начало' },
    { path: '/about', label: 'За нас' },
    { path: '/projects', label: 'Продажби' },
    { path: '/blog', label: 'Обекти' },
    { path: '/contact', label: 'Контакти' }
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'BG' ? 'EN' : 'BG')
  }

  return (
    <nav className="bg-primary-900/95 backdrop-blur-lg border-b border-gold-500/20 sticky top-0 z-50 shadow-luxury">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-20">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
          
          {/* Left Section: Logo - Properly positioned to the left */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src={logo} 
                alt="KSM Stroy Logo" 
                className="h-12 sm:h-14 lg:h-16 w-12 sm:w-14 lg:w-16 object-cover rounded-full transition-all duration-300 hover:scale-105 border-2 border-gold-500/30 hover:border-gold-500/60"
                style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3))'
                }}
              />
            </Link>
          </div>

          {/* Center Section: Navigation Menu (Desktop) - Centered in remaining space */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative group ${
                    location.pathname === item.path
                      ? 'text-gold-400'
                      : 'text-platinum-300 hover:text-gold-400'
                  }`}
                >
                  {item.label}
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"></span>
                  )}
                  {/* Hover indicator */}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400/0 via-gold-400/50 to-gold-400/0 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: User Actions - Properly positioned to the right */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-platinum-300 hover:text-gold-400 transition-all duration-200 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-semibold">{language}</span>
              <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gold-500/20"></div>

            {/* Contact Button */}
            <Link
              to="/contact"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-6 py-2.5 rounded-luxury text-sm font-semibold transition-all duration-200 shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105 transform"
            >
              Свържете се с нас
            </Link>

          </div>

          {/* Mobile Menu Button - Right side on mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="text-platinum-300 hover:text-gold-400 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            >
              <span className="text-sm font-semibold">{language}</span>
            </button>
            
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-platinum-300 hover:text-gold-400 focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - Simple dropdown */}
        {isOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-base font-medium border-l-4 ${
                    location.pathname === item.path
                      ? 'bg-gold-50 text-gold-700 border-gold-500'
                      : 'text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block mx-4 mb-2 bg-gold-500 hover:bg-gold-600 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Свържете се с нас
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar