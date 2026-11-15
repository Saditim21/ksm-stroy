import posterImage from '../../assets/home/optimized/eu-poster.webp'
import Button from '../../components/ui/Button'
import Seam from '../../components/ui/Seam'

// EU visibility: the A3 poster of project BG16RFPR001-1.012-1485-C01 (ПКИП
// 2021-2027), last on Home (spec §6.13; tests/contracts/eu-visibility.test.jsx).
// Production's section (main @d356cad, src/components/EuPosterSection.jsx),
// its content unchanged, set as a split: the poster on a white plate, linking
// the PDF in a new tab; beside it the project's title, with no italic word,
// for it is the project's name, the text, the four facts, the two actions and
// the disclaimer. Non-breaking spaces after „№“ and the one-letter words, and
// inside the amounts and dates (spec §3.3).
const POSTER_PDF = '/eu/plakat-ksm-stroy-a3.pdf'

const FACTS = [
  { label: 'Общ бюджет', value: '35 320,04 евро' },
  { label: 'Безвъзмездна финансова помощ', value: '24 724,03 евро' },
  { label: 'Собствено съфинансиране', value: '10 596,01 евро' },
  { label: 'Продължителност', value: '27.01.2026 г. – 27.01.2027 г.' },
]

export default function EuPosterSection() {
  return (
    <section className="sec poster split" id="es-proekt" aria-labelledby="es-proekt-h">
      <Seam />
      <figure className="poster__figure">
        <a href={POSTER_PDF} target="_blank" rel="noopener noreferrer" className="poster__plate">
          <img
            src={posterImage}
            width={800}
            height={1132}
            loading="lazy"
            decoding="async"
            alt="Плакат на проект „Дигитализация на предприятията“ на КСМ СТРОЙ ООД, съфинансиран от Европейския съюз"
          />
          <span className="sr-only">(отваря PDF в нов раздел)</span>
        </a>
        <figcaption className="small">Плакат във формат A3, PDF</figcaption>
      </figure>

      <div className="poster__text">
        <h2 className="h2" id="es-proekt-h">
          Дигитализация на предприятията
        </h2>
        <p className="lead">Проект, съфинансиран от Европейския съюз</p>
        <p className="poster__body">
          КСМ СТРОЙ ООД изпълнява проект №&nbsp;BG16RFPR001-1.012-1485-C01 по Програма „Конкурентоспособност
          и&nbsp;иновации в&nbsp;предприятията“ 2021-2027. Внедряваме четири свързани системи: за управление на ресурсите
          (ERP), за работа с&nbsp;клиенти (CRM), за бизнес анализи (BI) и&nbsp;за електронно обучение на служителите.
        </p>
        <dl className="poster__facts">
          {FACTS.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="poster__actions">
          <Button href={POSTER_PDF} target="_blank" rel="noopener noreferrer">
            Отвори плаката
          </Button>
          <Button href={POSTER_PDF} variant="link" download="Плакат A3 - КСМ Строй.pdf">
            Изтегли PDF
          </Button>
        </div>
        <p className="small poster__note">
          Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и&nbsp;при никакви обстоятелства не може да се
          приема, че този документ отразява официалното становище на Европейския съюз и&nbsp;Управляващия орган.
        </p>
      </div>
    </section>
  )
}
