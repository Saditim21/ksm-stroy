import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import logo from '../../assets/images/logo.webp'
import { stagger, fadeUpChild } from '../../utils/motion'

const navItems = [
  { path: '/', label: 'Начало' },
  { path: '/about', label: 'За нас' },
  { path: '/projects', label: 'Продажби' },
  { path: '/blog', label: 'Обекти' },
  { path: '/contact', label: 'Контакти' },
]

const linkUnderline =
  'relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold-accent after:transition-transform after:duration-300 hover:after:scale-x-100'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-300 ease-luxe ${
        scrolled ? 'bg-plaster/90 backdrop-blur border-b border-concrete' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="KSM Stroy Logo" className="h-9 w-9 object-cover" />
          <span className={`font-display text-lg ${scrolled ? 'text-ink' : 'text-plaster'}`}>
            КСМ Строй
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium ${linkUnderline} ${
                location.pathname === item.path ? 'after:scale-x-100' : ''
              } ${scrolled ? 'text-ink' : 'text-plaster'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Затвори менюто' : 'Отвори менюто'}
          aria-expanded={isOpen}
          className={`p-2 lg:hidden ${scrolled ? 'text-ink' : 'text-plaster'}`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <motion.div
          className="fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-8 bg-ink text-plaster lg:hidden"
          initial="initial"
          animate="animate"
          variants={reduce ? undefined : stagger(0.08)}
        >
          {navItems.map((item) => (
            <motion.div key={item.path} variants={reduce ? undefined : fadeUpChild}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`font-display text-3xl ${linkUnderline} ${
                  location.pathname === item.path ? 'after:scale-x-100' : ''
                }`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar
