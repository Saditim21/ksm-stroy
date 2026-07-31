import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AvailabilityBadge from './AvailabilityBadge'
import Button from '../ui/Button'

const Row = ({ label, children }) => (
  <div className="flex justify-between border-b border-concrete py-2 text-sm">
    <span className="text-graphite">{label}</span>
    <span className="font-medium text-ink">{children}</span>
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
          className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-y-auto rounded-t-2xl border border-concrete bg-white p-5 shadow-2xl md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[400px] md:rounded-none md:border-y-0 md:border-r-0"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-display text-3xl text-ink">{apartment.apartment}</div>
              <div className="mt-1"><AvailabilityBadge status={apartment.status} /></div>
            </div>
            <button onClick={onClose} aria-label="Затвори" className="rounded-full p-2 text-graphite hover:bg-plaster">✕</button>
          </div>
          {apartment.вид && <Row label="Вид">{apartment.вид}</Row>}
          {apartment.built && <Row label="Застроена площ">{apartment.built} м²</Row>}
          {apartment.ideal && <Row label="Идеални части">{apartment.ideal} м²</Row>}
          {apartment.total && <Row label="Обща площ">{apartment.total} м²</Row>}
          {apartment.изложение && <Row label="Изложение">{apartment.изложение}</Row>}
          {apartment.цена && <Row label="Цена">{apartment.цена}</Row>}
          <Button
            as={Link}
            to={`/contact?apartment=${encodeURIComponent(apartment.apartment)}`}
            variant="gold"
            className="mt-5 w-full"
          >
            Изпратете запитване
          </Button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
