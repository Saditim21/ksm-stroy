// За нас's opening, #top, the founding drawn on the seam (spec M3/M4 §7.4; the
// concept's za-nas.html:80-103): the page's one moment. The seam is the
// family's line. It comes down from the header as one line, through the
// H1, to the father: „село Буково | строител зидар (дюлгерин)“ either side
// of it. It opens into a brass lens holding the two brothers, „Кадри“ |
// „Сухат“, with an italic „и“ inside, and closes again at „септември |
// 2008“: the company.
//
// - The H1, „Добре *дошли* | в КСМ Строй ООД“, hinges on the seam, each part
//   in a mask authored by hand (spec §4.2: never split by script above the
//   fold). At its size (about.css, ruling T5a) the name holds one line in its
//   half. The right part's two masks flow as words do, so should the half be
//   too narrow for the whole name (a reader's wider text spacing), it breaks
//   before „ООД“, never inside „КСМ Строй“ or after „в“.
// - The drawing is the founding sentence of the legacy page (About.jsx:422-423;
//   src/assets/for-us/content.txt:1) set as a figure. The sentence itself is
//   the figure's caption, one element, so a screen reader hears it once, and
//   the drawing, with the words beside the line, is hidden from it. The
//   contract reads the caption („основана през месец септември 2008“,
//   tests/contracts/site.jsx), so production's „месец“ stays; „/дюлгерин/“ is
//   set as Home sets it.
//
// The drawing is about.css's, all CSS from the first paint, once: the H1
// rises and the stem draws, the lens opens from the top down, the names
// unveil outward from the seam, the „и“ fades in and the date rises, then
// the caption. Under reduced motion it is simply there.

// One masked part of a line: its mask, and the words that rise inside it.
// about.css staggers them by their place.
function Mask({ children }) {
  return (
    <span className="line-mask">
      <span className="split-line">{children}</span>
    </span>
  )
}

export default function Lineage() {
  return (
    <section className="origin" id="top" aria-labelledby="about-h">
      <div className="origin__top">
        <span className="stem stem--top" aria-hidden="true" />
        <h1 className="origin__h1" id="about-h">
          <span className="origin__l">
            <Mask>
              Добре <em>дошли</em>
            </Mask>
          </span>{' '}
          <span className="origin__r">
            <Mask>в&nbsp;КСМ Строй</Mask> <Mask>ООД</Mask>
          </span>
        </h1>
        <p className="node node--top" aria-hidden="true">
          <span className="node__l">село Буково</span>
          <span className="node__r">строител зидар (дюлгерин)</span>
        </p>
      </div>
      <figure className="lineage">
        <div className="lineage__draw" aria-hidden="true">
          <div className="lens">
            <p className="lens__name lens__name--l">
              <span>Кадри</span>
            </p>
            <div className="lens__arcs">
              <svg viewBox="0 0 200 400" preserveAspectRatio="none" focusable="false">
                <path d="M100 0C58 52 0 118 0 200C0 282 58 348 100 400" />
                <path d="M100 0C142 52 200 118 200 200C200 282 142 348 100 400" />
              </svg>
              <em className="lens__and">и</em>
            </div>
            <p className="lens__name lens__name--r">
              <span>Сухат</span>
            </p>
          </div>
          <p className="node node--bot">
            <span className="stem stem--bot" />
            <span className="node__l">
              <Mask>септември</Mask>
            </span>
            <span className="node__r">
              <Mask>2008</Mask>
            </span>
          </p>
        </div>
        <figcaption className="lineage__cap">
          КСМ СТРОЙ ООД е&nbsp;основана през месец септември 2008&nbsp;г. от двама братя Кадри и&nbsp;Сухат, синове на известен в&nbsp;родното им село Буково строител зидар (дюлгерин).
        </figcaption>
      </figure>
    </section>
  )
}
