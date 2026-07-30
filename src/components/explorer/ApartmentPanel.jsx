import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AvailabilityBadge from './AvailabilityBadge'

const Row = ({ label, children }) => (
  <div className="flex justify-between border-b border-neutral-100 py-2 text-sm">
    <span className="text-neutral-500">{label}</span>
    <span className="font-medium text-neutral-900">{children}</span>
  </div>
)

export default function ApartmentPanel({ apartment, onClose }) {
  return (
    <AnimatePresence>
      {apartment && (
        <motion.aside
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-2xl md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[400px] md:rounded-none md:border-y-0 md:border-r-0"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-neutral-900">{apartment.apartment}</div>
              <div className="mt-1"><AvailabilityBadge status={apartment.status} /></div>
            </div>
            <button onClick={onClose} aria-label="Затвори" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100">✕</button>
          </div>
          {apartment.вид && <Row label="Вид">{apartment.вид}</Row>}
          {apartment.built && <Row label="Застроена площ">{apartment.built} м²</Row>}
          {apartment.ideal && <Row label="Идеални части">{apartment.ideal} м²</Row>}
          {apartment.total && <Row label="Обща площ">{apartment.total} м²</Row>}
          {apartment.изложение && <Row label="Изложение">{apartment.изложение}</Row>}
          {apartment.цена && <Row label="Цена">{apartment.цена}</Row>}
          <Link
            to={`/contact?apartment=${encodeURIComponent(apartment.apartment)}`}
            className="mt-5 block rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-3 text-center font-semibold text-primary-900 shadow-gold-glow transition hover:shadow-gold-glow-lg"
          >
            Изпратете запитване
          </Link>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
