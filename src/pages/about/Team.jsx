import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import useReveals from '../../motion/useReveals'

// #koi-sme-nie, who we are (spec M3/M4 §7.4; the concept's za-nas.html:145-169):
// a hinge, production's „Кои сме *ние*?“ with its two leads (About.jsx:636-642
// and the legacy hero's introduction, :259-261); then the client's own words
// on the team (src/assets/for-us/content.txt:16-24), which the site has never
// shown: the team sentence, large, on the left, and „Квалифицирани
// специалисти“ as a ruled list on the right, each group a name and what it
// does. The spelling fixes are QUESTIONS.md's: „строителство“,
// „впоследствие“.
//
// The heading rises line by line, the copy fades up and the seams draw as
// they come into view (useReveals); the markup is the final state.

// The specialists: each group's name, and what it does.
const CREW = [
  ['Строителни техници', null],
  ['Строители', 'кофраж, армировка и\u00a0бетон, зидария, мазилка и\u00a0шпакловки, вътрешни и\u00a0външни облицовки и\u00a0настилки, бояджийски работи и\u00a0покриви'],
  ['Строители монтажници', 'сухо строителство и\u00a0стоманобетон, вътрешни и\u00a0външни ВиК мрежи'],
  ['Работници по строителство', 'които впоследствие повишават квалификацията си и\u00a0се превръщат в\u00a0основно ядро за успеха на компанията'],
]

export default function Team() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec team" id="koi-sme-nie" aria-labelledby="team-h">
      <div className="hinge">
        <h2 className="h2" id="team-h" data-split="">
          Кои сме <em>ние</em>?
        </h2>
        <div className="team__lead">
          <p className="lead" data-fade="">
            КСМ&nbsp;Строй ООД е&nbsp;строителна компания, ориентирана към качество, надеждност и&nbsp;устойчиви решения. Съчетаваме дългогодишен опит с&nbsp;модерни технологии, за да създаваме проекти, които отговарят на всички съвременни&nbsp;изисквания.
          </p>
          <p className="lead" data-fade="">
            Вашият доверен партньор в&nbsp;строителството! С&nbsp;дългогодишен опит и&nbsp;професионален екип, ние изграждаме жилищни, обществени и&nbsp;индустриални обекти с&nbsp;високо качество и&nbsp;прецизност. От идеята до завършената сграда – ние сме до вас във всяка&nbsp;стъпка.
          </p>
        </div>
        <Seam draw />
      </div>
      <div className="team__body">
        <Seam draw />
        <p className="team__say" data-fade="">
          Ние сме екип млади специалисти и&nbsp;майстори, дипломирани технически ръководители с&nbsp;богат опит в&nbsp;строителството и&nbsp;интериорните решения.
        </p>
        <div className="crew">
          <h3 className="crew__h" id="crew-h">
            Квалифицирани специалисти
          </h3>
          <ul className="crew__list" aria-labelledby="crew-h">
            {CREW.map(([name, work]) => (
              <li key={name} data-fade="">
                <span className="crew__t">{name}</span>
                {work ? <span className="crew__d">{work}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
