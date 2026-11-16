import { BUILD, GOLDEN_RESIDENCE, MNOGOFAMILNA, OTHER } from '../../components/inquiry/inquiryStore'

// Home's inquiry (spec §8.1, §10; M3 §8), which Home hands the closing
// section: `<InquirySection page="home" {...HOME_INQUIRY} />`
// (InquirySection.jsx). Its own module, imported by Home alone, so neither
// its copy nor its options are in another page's first-load JS (M3 §10: a
// page's own code only on its own route), as Многофамилна's are not
// (src/pages/mnogofamilna/inquiry.jsx).
//
// - `copy`: production's contact page (Contact:506–509), no email shown. A
//   no-break space after each one-letter word (spec §3.3).
// - `options`: both buildings, Golden Residence first („…жк Левски Г“,
//   subject „Golden Residence“), then building and the rest, the subjects
//   Многофамилна's form offers too (inquiryStore.js).
export const HOME_INQUIRY = Object.freeze({
  copy: Object.freeze({
    title: (
      <>
        Готови сте да започнете своя <em>проект</em>?
      </>
    ),
    lead: <>Нашият екип е&nbsp;готов да ви помогне да реализирате мечтания проект с&nbsp;качество и&nbsp;професионализъм.</>,
    email: false,
  }),
  options: Object.freeze([GOLDEN_RESIDENCE, MNOGOFAMILNA, BUILD, OTHER]),
})
