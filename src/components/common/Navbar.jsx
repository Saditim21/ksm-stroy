import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/images/logo.jpg'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Начало' },
    { path: '/about', label: 'За нас' },
    { path: '/projects', label: 'Продажби' },
    { path: '/blog', label: 'Обекти' },
    { path: '/contact', label: 'Контакти' }
  ]

  return (
    <nav className="bg-primary-900/95 backdrop-blur-lg border-b border-gold-500/20 sticky top-0 z-50 shadow-luxury">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center h-16 sm:h-18 lg:h-20">

          {/* Left Section: Logo - Fixed width for balance */}
          <div className="flex items-center flex-1 justify-start">
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

          {/* Center Section: Navigation Menu (Desktop) - Absolutely centered */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0">
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

          {/* Right Section: User Actions - Fixed width for balance */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 justify-end">
            {/* Phone Number */}
            <a
              href="tel:+359887886166"
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-platinum-300 hover:text-gold-400 transition-all duration-200 group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-semibold">+359 887 886 166</span>
            </a>

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
            {/* Mobile Phone Number */}
            <a
              href="tel:+359887886166"
              className="text-platinum-300 hover:text-gold-400 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 flex items-center space-x-1"
              aria-label="Обади се на +359 887 886 166"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-platinum-300 hover:text-gold-400 focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              aria-label={isOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={isOpen}
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

        {/* Mobile menu - Animated dropdown with improved styling */}
        <div
          className={`lg:hidden fixed left-0 right-0 top-16 sm:top-[72px] bg-white shadow-2xl border-t border-gold-500/20 overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[28rem] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}
          style={{ zIndex: 9999 }}
        >
          <div className="py-3 px-2 bg-white">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block mx-2 px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-gold-100 to-gold-50 text-gold-700 border-l-4 border-gold-500 pl-5'
                    : 'text-gray-800 hover:bg-gray-100 active:bg-gray-200'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                <span className="flex items-center justify-between">
                  {item.label}
                  {location.pathname === item.path && (
                    <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </Link>
            ))}

            <div className="border-t border-gray-200 mt-3 pt-3 mx-4">
              {/* Phone number in mobile menu */}
              <a
                href="tel:+359887886166"
                className="flex items-center justify-center gap-2 py-3 text-gray-700 font-medium mb-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+359 887 886 166</span>
              </a>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 text-center px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                Свържете се с нас
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar