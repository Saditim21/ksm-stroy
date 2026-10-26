import { Link } from 'react-router-dom'

// Видимост по ЕС: проект BG16RFPR001-1.012-1485-C01 (ПКИП 2021-2027).
// Емблемата трябва да се вижда при отваряне на страницата, без превъртане.
const EuStrip = () => (
  <div className="bg-white border-b border-gray-200">
    <Link
      to="/eu-proekt"
      className="w-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-20 py-2 flex items-center gap-3 sm:gap-5"
    >
      <img
        src="/eu/eu-cofunded-bg.png"
        alt="Съфинансирано от Европейския съюз"
        className="h-8 sm:h-10 w-auto flex-shrink-0"
      />
      <img
        src="/eu/pkip.png"
        alt="Програма „Конкурентоспособност и иновации в предприятията“"
        className="h-7 sm:h-9 w-auto flex-shrink-0"
      />
      <span className="text-xs sm:text-sm text-gray-800 leading-snug">
        Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма
        „Конкурентоспособност и иновации в предприятията“ 2021-2027.{' '}
        <span className="text-[#3f81c3] underline">За проекта</span>
      </span>
    </Link>
  </div>
)

export default EuStrip
