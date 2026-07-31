import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.webp'
import DimensionLine from '../ui/DimensionLine'

const navItems = [
  { path: '/', label: 'Начало' },
  { path: '/about', label: 'За нас' },
  { path: '/projects', label: 'Продажби' },
  { path: '/blog', label: 'Обекти' },
]

const linkClass = 'text-sm text-plaster/70 transition-colors duration-300 ease-luxe hover:text-gold-accent'

const Footer = () => {
  return (
    <footer className="bg-ink text-plaster">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <DimensionLine dark label="КСМ Строй" />
            <Link to="/" className="mb-4 flex items-center gap-3">
              <img src={logo} alt="KSM Stroy Logo" className="h-9 w-9 object-cover" />
            </Link>
            <p className="max-w-xs text-sm text-plaster/70">
              Водеща строителна компания в България с над 15 години опит.
            </p>
          </div>

          <div>
            <DimensionLine dark label="Навигация" />
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <DimensionLine dark label="Контакти" />
            <ul className="space-y-3 text-sm text-plaster/70">
              <li>гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38</li>
              <li>гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1</li>
              <li>
                <a href="tel:+359887886166" className="hover:text-gold-accent">
                  +359 887 886 166
                </a>
              </li>
              <li>
                <a href="mailto:ksm_str@abv.bg" className="hover:text-gold-accent">
                  ksm_str@abv.bg
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/ksm.stroi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-accent"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-plaster/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-plaster/50 sm:px-6 lg:px-12">
          © {new Date().getFullYear()} КСМ Строй. Всички права запазени.
        </div>
      </div>
    </footer>
  )
}

export default Footer
