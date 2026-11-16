import { BUILD, GOLDEN_RESIDENCE, MNOGOFAMILNA, OTHER } from '../../components/inquiry/inquiryStore'

// Многофамилна's inquiry (M3 §6.2 #6, §8; the concept notes), which its page
// and its block pages hand the closing section:
// `<InquirySection {...MN_INQUIRY} />` (InquirySection.jsx). Its own module,
// imported by Многофамилна's routes alone, so neither its copy nor its
// options are in another page's first-load JS (M3 §10: per-project code
// only on its own routes).
//
// - `copy`: production's „Свържете се с нас“, with Golden Residence's call to
//   call or write, the email shown. A no-break space after each one-letter
//   word (spec §3.3).
// - `options`: Многофамилна first, then Golden Residence („…жк Левски Г“,
//   subject „Golden Residence“), building and the rest, the subjects Home's
//   form offers too (inquiryStore.js).
export const MN_INQUIRY = Object.freeze({
  copy: Object.freeze({
    title: (
      <>
        Свържете се с&nbsp;<em>нас</em>
      </>
    ),
    lead: <>Обадете се или изпратете запитване и&nbsp;ще се свържем с&nbsp;вас.</>,
    email: true,
  }),
  options: Object.freeze([MNOGOFAMILNA, GOLDEN_RESIDENCE, BUILD, OTHER]),
})
