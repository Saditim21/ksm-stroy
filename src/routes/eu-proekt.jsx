import Button from '../components/ui/Button'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import images from '../data/images/shell.json'
import { pageMeta } from '../seo/meta'

// The page about the EU project (spec §8.10, §14.1), which the EU line on
// every page links to: the teammate's text, word for word
// (origin/vidimost-es src/pages/EuProekt.jsx), with the logos and the A3
// poster, set as a document on onyx. Spec §3.2: non-breaking spaces after
// „№“, after the one-letter words and inside the amounts. The logos sit on
// their light plate (#F7F4EE, spec §6.3): their lettering is dark.
export const meta = () => pageMeta({
  title: 'Дигитализация на предприятията | КСМ Строй',
  description:
    'КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027, съфинансирана от Европейския съюз.',
  path: '/eu-proekt',
})

export const handle = { header: 'solid' }

const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'

const BUDGET = [
  'Общ бюджет: 35\u00a0320,04\u00a0евро',
  'Безвъзмездна финансова помощ: 24\u00a0724,03\u00a0евро',
  'Собствено съфинансиране: 10\u00a0596,01\u00a0евро',
  'Продължителност: от 27.01.2026\u00a0г. до 27.01.2027\u00a0г.',
]

export default function EuProekt() {
  return (
    <article className="site-wrap font-text py-[clamp(56px,8vw,120px)] text-body text-ivory">
      <div className="max-w-[68ch]">
        <div className="inline-flex flex-wrap items-center gap-x-10 gap-y-6 bg-[#F7F4EE] px-6 py-5">
          <ResponsivePicture
            image={images['eu-cofunded-bg']}
            alt="Съфинансирано от Европейския съюз"
            sizes="(min-width: 640px) 291px, 255px"
            imgClassName="h-14 w-auto sm:h-16"
          />
          <ResponsivePicture
            image={images['eu-pkip']}
            alt="Програма „Конкурентоспособност и иновации в предприятията“"
            sizes="(min-width: 640px) 202px, 173px"
            imgClassName="h-12 w-auto sm:h-14"
          />
        </div>

        <h1 className="mt-12 font-display text-h2 font-medium">Дигитализация на предприятията</h1>

        <p className="mt-8">
          КСМ СТРОЙ ООД изпълнява проект №&nbsp;BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма
          „Конкурентоспособност и&nbsp;иновации в&nbsp;предприятията“ 2021-2027, съфинансирана от Европейския съюз чрез
          Европейския фонд за регионално развитие.
        </p>
        <p className="mt-5">
          Целта на проекта е да повиши нивото на дигитализация на КСМ СТРОЙ ООД. Внедряват се четири свързани системи:
          за управление на ресурсите (ERP), за работа с&nbsp;клиенти (CRM), за бизнес анализи (BI) и&nbsp;за електронно
          обучение на служителите. Така обектите, офертите и&nbsp;клиентските запитвания се водят на едно място,
          а&nbsp;решенията се вземат по актуални данни.
        </p>

        <ul className="nums mt-8 list-disc space-y-1.5 pl-5 marker:text-stone">
          {BUDGET.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="mt-10">
          <Button href={POSTER} download="Плакат A3 - КСМ Строй.pdf">
            Изтегли плаката (PDF)
          </Button>
        </div>

        <p className="mt-12 max-w-[60ch] text-small text-stone">
          Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и&nbsp;при никакви обстоятелства не може да се
          приема, че този документ отразява официалното становище на Европейския съюз и&nbsp;Управляващия орган.
        </p>
      </div>
    </article>
  )
}
