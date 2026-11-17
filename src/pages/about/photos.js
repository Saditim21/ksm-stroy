import aboutImages from '../../data/images/about.json'
import homeImages from '../../data/images/home.json?about'
import worksImages from '../../data/images/works.json?about'

// За нас's photos (spec M3/M4 §7.4, §4.3), production's own, each through the
// image pipeline once (scripts/images/sources.json): the legacy page's three
// slider photos in the `about` group, slider01 and slider02 from their larger
// masters (src/assets/images/optimized/); and two photos the pipeline already
// encodes, which no source gets twice: the legacy story's traditions.webp,
// byte for byte the Hotel Paradise facade Home's works list shows
// (home.json's work-hotel-paradise), and the legacy Hotel Paradise card's
// photo, Обекти's third of the hotel (works.json's work-hotel-paradise-3).
//
// Home's and Обекти's manifests come in under a query of their own
// (`?about`), as Обекти's own import of Home's does (src/pages/works/works.js):
// the build gives this page its own copy rather than a chunk shared with
// their first loads.
export const PHOTOS = {
  // Екстериор: the Hotel Paradise facade (traditions.webp).
  exterior: homeImages['work-hotel-paradise'],
  // Интериор: the glazed restaurant terrace (slider03).
  interior: aboutImages['about-slider-3'],
  // The figures' band: an aerial view (slider02) and the hotel card's photo.
  aerial: aboutImages['about-slider-2'],
  hotel: worksImages['work-hotel-paradise-3'],
  // The call to action (slider01).
  finished: aboutImages['about-slider-1'],
}
