import useExplorer from './useExplorer'

// The facade's captions, in a module of their own, so that the Многофамилна
// pages, which say them without the explorer's section, never load
// ExplorerSection.jsx (M3 ruling T6d). The build keeps the explorer's shared
// modules in one chunk whichever page imports which (scripts/client-chunks.mjs).

/** The facade's caption (Facade.jsx): what its rails count, and how to open
 * a floor, in a desktop's words and a phone's (explorer.css shows one).
 * Многофамилна's opening says it too, after its lights (MnHero.jsx). */
export function FacadeCaption() {
  return (
    <>
      Цифрите отстрани са <b>свободните апартаменти</b> на всеки етаж.{' '}
      <span className="cap-desk">Посочете етаж, кликнете, за да отворите плана му.</span>
      <span className="cap-phone">Докоснете етаж, за да видите плана му; второ докосване го отваря.</span>
    </>
  )
}

/** `children`, a sentence, then the date of the explorer's numbers where
 * they are dated (`, по данни към 01.12.2025`; nothing with live rows), and
 * a full stop. Both Многофамилна pages say what their lit facade shows this
 * way: the opening before FacadeCaption (MnHero.jsx), a block page alone
 * (MnBlockPage.jsx). */
export function Dated({ children }) {
  const { dated } = useExplorer()
  return (
    <>
      {children}
      {dated ? `, по данни към ${dated}` : ''}.
    </>
  )
}
