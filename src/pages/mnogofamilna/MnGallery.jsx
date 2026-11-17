import Spreads from '../../components/gallery/Spreads'
import mnImages from '../../data/images/mnogofamilna.json'

// „Галерия със *снимки*“, #galeriya (spec M3 §6.2 #5; the concept's
// mnogofamilna.html:133-155 and js/mnogofamilna.js:1099-1105): production's
// four photos (MnogofamilnaBlockSelection.jsx's gallery, „Галерия със
// снимки“) and the two drawings Продажби shows, as a gallery of spreads
// (src/components/gallery/Spreads.jsx), in three: Блок А with Блок Б
// (photo-3, photo-4), the front with the perspective (photo-1, photo-2),
// then the drawings, the typical floor and the garages, each whole on the
// umber, never cropped, under production's own title
// (src/pages/Projects.jsx:872 and :662, in sentence case). The photos take
// the page's night grade, each its own sky cut, and their framing from its
// stylesheet (mn.css: mn-night, mn-night--*, mn-gal--persp); they are
// decoration, the caption says what they show. The drawings' plates show
// their titles, so their spread's live caption says the two to screen
// readers only (ruling T5a): the pair is never printed twice, and the change
// is still announced.

// The garages' drawing's title, production's (Projects.jsx:662).
const GARAGES = 'Блок\u00A0А\u00A0и\u00A0Б\u00A0– надземни и\u00A0подземни гаражи'

const SPREADS = [
  {
    left: { image: mnImages['mn-block-a'], photo: 'mn-night mn-night--block-a' },
    right: { image: mnImages['mn-block-b'], photo: 'mn-night mn-night--block-b' },
    caption: 'Блок\u00A0А\u00A0и\u00A0блок\u00A0Б.',
  },
  {
    left: { image: mnImages['mn-front'], photo: 'mn-night mn-night--front' },
    right: { image: mnImages['mn-persp'], photo: 'mn-night mn-night--persp mn-gal--persp' },
    caption: 'Двата блока откъм улицата.',
  },
  {
    whole: true,
    left: { image: mnImages['mn-plan-drawing'], caption: 'Архитектурен план на етажа' },
    right: { image: mnImages['mn-garages'], caption: GARAGES },
    caption: <span className="sr-only">Архитектурен план на етажа. {GARAGES}.</span>,
  },
]

export default function MnGallery() {
  return (
    <Spreads
      id="galeriya"
      headingId="gal-h"
      heading={
        <>
          Галерия със <em>снимки</em>
        </>
      }
      lead={'Визуализации на сградата и\u00A0архитектурните\u00A0планове.'}
      label="Визуализации и планове"
      spreads={SPREADS}
    />
  )
}
