import Spreads from '../../components/gallery/Spreads'
import grImages from '../../data/images/golden-residence.json'

// „Golden Residence отблизо“, #galeriya (spec §6.17, §8.2; extract §4.28):
// three spreads of two renders, a gallery of spreads
// (src/components/gallery/Spreads.jsx, which turns and opens them). The
// stage is a group named „Визуализации“; its renders are decoration, the
// caption says what they show. How each render is framed, its `photo`, is
// this page's stylesheet's (gr.css).

const SPREADS = [
  {
    left: { image: grImages['gr-corner'], photo: 'gal__photo--corner' },
    right: { image: grImages['gr-facade-detail'] },
    caption: <>Изчистени линии и&nbsp;фасада с&nbsp;бронзови рамки около просторните остъклени тераси.</>,
  },
  {
    left: { image: grImages['gr-end-towers'], photo: 'gal__photo--towers' },
    right: { image: grImages['gr-parking'], photo: 'gal__photo--parking' },
    caption: <>Двата блока откъм двора и&nbsp;паркинга: по осем жилищни етажа, по 12 апартамента на етаж.</>,
  },
  {
    left: { image: grImages['gr-long-facade'], photo: 'gal__photo--facade' },
    right: { image: grImages['gr-dusk'], photo: 'gal__photo--dusk' },
    caption: <>Golden Residence през деня и&nbsp;по здрач.</>,
  },
]

export default function GallerySection() {
  return (
    <Spreads
      id="galeriya"
      headingId="gal-h"
      heading={
        <>
          Golden Residence <em>отблизо</em>
        </>
      }
      lead={<>Визуализации на сградата, фасадата и&nbsp;двора.</>}
      label="Визуализации"
      spreads={SPREADS}
    />
  )
}
