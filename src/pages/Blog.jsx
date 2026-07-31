import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { hoverZoom } from '../utils/motion'

// Import project images
import greenLife1 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45279177_104924087180789_4294631158974513152_n (1).webp'
import greenLife2 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45287295_104924153847449_7212060700636610560_n.webp'
import greenLife3 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45288292_104924173847447_4815299079217086464_n.webp'
import greenLife4 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45306470_104924097180788_3096088000648445952_n.webp'
import greenLife5 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45306733_104924253847439_2184019800915705856_n.webp'
import greenLife6 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45318511_104924170514114_470934586956709888_n.webp'

import aivazovski1 from '../assets/projects/Айвазовски Парк - гр.Поморие/45361708_108250726848125_8745212082250579968_n.webp'
import aivazovski2 from '../assets/projects/Айвазовски Парк - гр.Поморие/45437963_108253216847876_6728830584384126976_n.webp'
import aivazovski3 from '../assets/projects/Айвазовски Парк - гр.Поморие/45441975_108250736848124_4910134572747849728_n.webp'
import aivazovski4 from '../assets/projects/Айвазовски Парк - гр.Поморие/45494983_108306206842577_6278847505027301376_n.webp'
import aivazovski5 from '../assets/projects/Айвазовски Парк - гр.Поморие/45506198_108250740181457_402422110464507904_n.webp'

import panorama1 from '../assets/projects/Панорама Резидънс - гр.Созопол/45127824_104654687207729_8997613209858867200_n.webp'
import panorama2 from '../assets/projects/Панорама Резидънс - гр.Созопол/45275105_104550560551475_532029530374668288_n.webp'
import panorama3 from '../assets/projects/Панорама Резидънс - гр.Созопол/45278482_104550563884808_4221959277239074816_n.webp'
import panorama4 from '../assets/projects/Панорама Резидънс - гр.Созопол/45292144_104654770541054_4029936473460441088_n.webp'
import panorama5 from '../assets/projects/Панорама Резидънс - гр.Созопол/46178195_115481786125019_6963514404960731136_n.webp'

import sanirane1 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45353069_106987780307753_3019444107387863040_n.webp'
import sanirane2 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45359144_106987733641091_1193173908040187904_n.webp'
import sanirane3 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45383206_106987876974410_6215534137986514944_n.webp'
import sanirane4 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45386000_106987843641080_6327721226378674176_n.webp'

import sunnyHill1 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45179553_103762453963619_6226139335658307584_n.webp'
import sunnyHill2 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45182201_103762593963605_6190119227358183424_n.webp'
import sunnyHill3 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45186809_103762510630280_4635655840064339968_n.webp'
import sunnyHill4 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45201168_103762533963611_8986097066803462144_n.webp'

import hotelParadise1 from '../assets/projects/Хотел Парадайс - с.Огняново/45222690_104656040540927_7174317773579878400_n (1).webp'
import hotelParadise2 from '../assets/projects/Хотел Парадайс - с.Огняново/45261593_104656053874259_6758029915251015680_n.webp'
import hotelParadise3 from '../assets/projects/Хотел Парадайс - с.Огняново/45263613_104668413873023_2147464397956579328_n.webp'
import hotelParadise4 from '../assets/projects/Хотел Парадайс - с.Огняново/45296881_104668430539688_1603561696780091392_n.webp'
import hotelParadise5 from '../assets/projects/Хотел Парадайс - с.Огняново/45333386_104668347206363_2092741858860990464_n.webp'
import hotelParadise6 from '../assets/projects/Хотел Парадайс - с.Огняново/45355516_104668353873029_7978551726900772864_n.webp'
import hotelParadise7 from '../assets/projects/Хотел Парадайс - с.Огняново/45359157_104656047207593_2634777009472929792_n.webp'
import hotelParadise8 from '../assets/projects/Хотел Парадайс - с.Огняново/45408434_104668377206360_4446989566112432128_n.webp'

// Add more Панорама Резидънс images
import panorama6 from '../assets/projects/Панорама Резидънс - гр.Созопол/45304167_104550633884801_4951936454352699392_n.webp'
import panorama7 from '../assets/projects/Панорама Резидънс - гр.Созопол/45342267_104654690541062_2093109697040089088_n.webp'
import panorama8 from '../assets/projects/Панорама Резидънс - гр.Созопол/45347937_104550667218131_9147245923376562176_n.webp'
import panorama9 from '../assets/projects/Панорама Резидънс - гр.Созопол/46212183_115481806125017_8714238753796784128_n.webp'
import panorama10 from '../assets/projects/Панорама Резидънс - гр.Созопол/46213187_115481842791680_7493008379917369344_n.webp'
import panorama11 from '../assets/projects/Панорама Резидънс - гр.Созопол/46222719_115481802791684_1941576164141170688_n.webp'
import panorama12 from '../assets/projects/Панорама Резидънс - гр.Созопол/46664444_120257758980755_2261096193088028672_n.webp'
import panorama13 from '../assets/projects/Панорама Резидънс - гр.Созопол/46665853_120257765647421_2434330731149787136_n.webp'
import panorama14 from '../assets/projects/Панорама Резидънс - гр.Созопол/46677549_120257702314094_3690774506801987584_n.webp'
import panorama15 from '../assets/projects/Панорама Резидънс - гр.Созопол/46753132_120257768980754_1107144970071965696_n.webp'
import panorama16 from '../assets/projects/Панорама Резидънс - гр.Созопол/47051010_120257705647427_8685682890635214848_n.webp'
import panorama17 from '../assets/projects/Панорама Резидънс - гр.Созопол/47682915_125662661773598_6339324471370842112_n.webp'
import panorama18 from '../assets/projects/Панорама Резидънс - гр.Созопол/48046863_125662658440265_2917276434667929600_n.webp'
import panorama19 from '../assets/projects/Панорама Резидънс - гр.Созопол/48238118_127439658262565_8592643286139666432_n.webp'
import panorama20 from '../assets/projects/Панорама Резидънс - гр.Созопол/48359290_128123474860850_4967265523344605184_n.webp'
import panorama21 from '../assets/projects/Панорама Резидънс - гр.Созопол/48359770_128123468194184_3584791648992755712_n.webp'
import panorama22 from '../assets/projects/Панорама Резидънс - гр.Созопол/48380818_128123471527517_4737859087998386176_n.webp'
import panorama23 from '../assets/projects/Панорама Резидънс - гр.Созопол/48395137_128709964802201_5026304676371365888_n.webp'

// Add more Айвазовски Парк images
import aivazovski6 from '../assets/projects/Айвазовски Парк - гр.Поморие/45520465_108251800181351_8799674939033518080_n.webp'
import aivazovski7 from '../assets/projects/Айвазовски Парк - гр.Поморие/45652633_108252286847969_7426443512180113408_n.webp'

// Add more Сънни Хил images
import sunnyHill5 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45201199_103762967296901_6198037798432276480_n.webp'
import sunnyHill6 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45203926_103762163963648_2142672382685347840_n.webp'
import sunnyHill7 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45211750_103762170630314_2959178539334631424_n.webp'
import sunnyHill8 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45213313_103762900630241_9076152326158286848_n.webp'
import sunnyHill9 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45221851_103762147296983_7709813930972938240_n.webp'
import sunnyHill10 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45231195_103762820630249_3550441286538362880_n.webp'
import sunnyHill11 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45231241_103762873963577_7690319263394955264_n.webp'
import sunnyHill12 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45284373_103762583963606_3278342051636183040_n.webp'
import sunnyHill13 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45286439_103762953963569_4921837856118276096_n.webp'
import sunnyHill14 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45299021_103762943963570_2704646485177270272_n.webp'
import sunnyHill15 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45318203_103762710630260_560893308331622400_n.webp'
import sunnyHill16 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45374035_103762737296924_3302161076971372544_n.webp'
import sunnyHill17 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/46102172_115482079458323_76361795513614336_n.webp'
import sunnyHill18 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/47573864_125662795106918_5159677038843396096_n.webp'
import sunnyHill19 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49126857_128710281468836_3494677020304998400_n.webp'
import sunnyHill20 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49845073_136842920655572_6146534448994189312_n.webp'
import sunnyHill21 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49938689_136842967322234_561733068927270912_n.webp'
import sunnyHill22 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/50454577_136842917322239_1674500529146822656_n.webp'
import sunnyHill23 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/50932977_141282550211609_8395938834864406528_n.webp'
import sunnyHill24 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57077613_162614501411747_1358123651756457984_n.webp'
import sunnyHill25 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57124599_162614491411748_7529170866383355904_n.webp'
import sunnyHill26 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57289416_162614494745081_1080609403691859968_n.webp'

// Add more Саниране images
import sanirane5 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45393971_106987926974405_8828595951724658688_n.webp'
import sanirane6 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45405060_106987903641074_1166031054759264256_n.webp'
import sanirane7 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45421927_106987946974403_4945006073649037312_n.webp'
import sanirane8 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45421996_106987793641085_5921943865987694592_n.webp'
import sanirane9 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45455283_106987976974400_2659848498811240448_n.webp'
import sanirane10 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45478369_106987820307749_1447067042862596096_n.webp'
import sanirane11 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45520479_106987863641078_3977651113556967424_n.webp'

// Add ЧИТАЛИЩЕ images
import chitalishte1 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-36-13-125.webp'
import chitalishte2 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-36-13-253.webp'
import chitalishte3 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-015.webp'
import chitalishte4 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-041.webp'
import chitalishte5 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-080.webp'
import chitalishte6 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-129.webp'
import chitalishte7 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-168.webp'
import chitalishte8 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-207.webp'
import chitalishte9 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-263.webp'
import chitalishte10 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-329.webp'
import chitalishte11 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-392.webp'
import chitalishte12 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-455.webp'

// Project data — text carried over verbatim from the pre-redesign page.
const projects = [
  {
    id: 1,
    title: "Green Life - Paradise Gardens and Town House",
    location: "гр. Созопол",
    status: "Завършен Проект",
    type: "Жилищен комплекс",
    year: "2018",
    description: "Луксозен жилищен комплекс с градини и таунхауси в сърцето на Созопол",
    images: [greenLife1, greenLife2, greenLife3, greenLife4, greenLife5, greenLife6],
    features: ["Градини", "Таунхауси", "Паркинг", "Детска площадка"]
  },
  {
    id: 2,
    title: "Айвазовски Парк",
    location: "гр. Поморие",
    status: "Завършен Проект",
    type: "Жилищен комплекс",
    year: "2018",
    description: "Модерен жилищен комплекс в престижен район на Поморие",
    images: [aivazovski1, aivazovski2, aivazovski3, aivazovski4, aivazovski5, aivazovski6, aivazovski7],
    features: ["Морска панорама", "Балкони", "Асансьор", "Охрана"]
  },
  {
    id: 3,
    title: "Панорама Резидънс",
    location: "гр. Созопол",
    status: "Груб Строеж",
    type: "Жилищен комплекс",
    year: "2019",
    description: "Панорамен комплекс с изглед към морето в Созопол",
    images: [panorama1, panorama2, panorama3, panorama4, panorama5, panorama6, panorama7, panorama8, panorama9, panorama10, panorama11, panorama12, panorama13, panorama14, panorama15, panorama16, panorama17, panorama18, panorama19, panorama20, panorama21, panorama22, panorama23],
    features: ["Морски изглед", "Тераси", "Басейн", "Фитнес"]
  },
  {
    id: 4,
    title: "Саниране 2017",
    location: "гр. Бургас",
    status: "Завършен Проект",
    type: "Санитарно обновяване",
    year: "2017",
    description: "Санитарно обновяване на жилищна сграда в Бургас",
    images: [sanirane1, sanirane2, sanirane3, sanirane4, sanirane5, sanirane6, sanirane7, sanirane8, sanirane9, sanirane10, sanirane11],
    features: ["Топлоизолация", "Нова фасада", "Енергийна ефективност", "Модернизация"]
  },
  {
    id: 5,
    title: "Сънни Хил блок 9",
    location: "кв. Меден Рудник, гр. Бургас",
    status: "Завършен Проект",
    type: "Жилищна сграда",
    year: "2019",
    description: "Жилищна сграда в престижния район Меден Рудник",
    images: [sunnyHill1, sunnyHill2, sunnyHill3, sunnyHill4, sunnyHill5, sunnyHill6, sunnyHill7, sunnyHill8, sunnyHill9, sunnyHill10, sunnyHill11, sunnyHill12, sunnyHill13, sunnyHill14, sunnyHill15, sunnyHill16, sunnyHill17, sunnyHill18, sunnyHill19, sunnyHill20, sunnyHill21, sunnyHill22, sunnyHill23, sunnyHill24, sunnyHill25, sunnyHill26],
    features: ["Луксозни апартаменти", "Паркинг", "Зелени площи", "Сигурност"]
  },
  {
    id: 6,
    title: "Хотел Парадайс",
    location: "с. Огняново",
    status: "Завършен Проект",
    type: "Хотелски комплекс",
    year: "2018",
    description: "Хотелски комплекс с минерални басейни в Огняново",
    images: [hotelParadise1, hotelParadise2, hotelParadise3, hotelParadise4, hotelParadise5, hotelParadise6, hotelParadise7, hotelParadise8],
    features: ["Минерални басейни", "СПА център", "Ресторант", "Конферентна зала"]
  },
  {
    id: 7,
    title: 'Читалище "Асен Златаров-1924"',
    location: "с. Огняново, община Гърмен",
    status: "Завършен Проект",
    type: "Обществена сграда",
    year: "2024",
    description: "Инженеринг: проектиране, изпълнение на мерки за енергийна ефективност и последващо упражняване на авторски надзор по време на строителството",
    images: [chitalishte1, chitalishte2, chitalishte3, chitalishte4, chitalishte5, chitalishte6, chitalishte7, chitalishte8, chitalishte9, chitalishte10, chitalishte11, chitalishte12],
    features: ["Енергийна ефективност", "Топлоизолация", "Модернизация", "Авторски надзор"]
  }
]

const filters = [
  { id: 'all', name: 'Всички проекти', count: projects.length },
  { id: 'Завършен Проект', name: 'Завършени проекти', count: projects.filter(p => p.status === 'Завършен Проект').length },
  { id: 'Груб Строеж', name: 'Груб строеж', count: projects.filter(p => p.status === 'Груб Строеж').length }
]

// Editorial project card: rounded-2xl image with hoverZoom, hairline border,
// typography-led meta line — no gradients/shadow-luxury chrome.
function ProjectCard({ project, index, onClick }) {
  return (
    <Reveal delay={Math.min(index, 6) * 0.06}>
      <motion.article
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent rounded-2xl"
      >
        <div className="overflow-hidden rounded-2xl border border-concrete">
          <motion.img
            src={project.images[0]}
            alt={`${project.title} - KSM Stroy проект`}
            loading="lazy"
            className="aspect-[4/3] object-cover w-full"
            variants={{ rest: { scale: 1 }, hover: hoverZoom }}
          />
        </div>
        <h3 className="font-display text-xl mt-4">{project.title}</h3>
        <p className="text-graphite text-sm mt-1">
          {project.type} · {project.location} · {project.year}
        </p>
        <p className="text-graphite text-sm mt-2 leading-relaxed line-clamp-2">{project.description}</p>
      </motion.article>
    </Reveal>
  )
}

const Blog = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredProjects = selectedFilter === 'all'
    ? projects
    : projects.filter(project => project.status === selectedFilter)

  const openModal = (project) => {
    setSelectedProject(project)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedProject(null)
    document.body.style.overflow = 'unset'
  }

  const nextImage = () => {
    if (!selectedProject) return
    setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    if (!selectedProject) return
    setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (!selectedProject) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedProject, currentImageIndex])

  return (
    <>
      <SEO
        title="Обекти - KSM Stroy"
        description="Разгледайте нашите успешно реализирани строителни проекти - жилищни комплекси, хотелски комплекси и санирания."
        keywords="проекти, обекти, строителство, жилищни комплекси, хотелски комплекси"
        ogTitle="Обекти - KSM Stroy"
        ogImage={projects[0]?.images[0]}
      />

      <main className="bg-plaster pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DimensionLine label="Обекти" />
          <DisplayHeading as="h1">Завършени <em>обекти</em>.</DisplayHeading>
          <p className="text-graphite mt-5 max-w-xl">
            Погледнете отблизо реализираните от нас обекти — от жилищни комплекси до обществени сгради.
          </p>

          {/* Filters — plain text tabs, active state marked with a gold underline */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-concrete pb-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  selectedFilter === filter.id
                    ? 'border-gold-accent text-ink'
                    : 'border-transparent text-graphite hover:text-ink'
                }`}
              >
                {filter.name} <span className="text-xs">({filter.count})</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <div key={selectedFilter} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mt-12">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => openModal(project)}
                />
              ))}
            </div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <p className="text-graphite text-center py-16">В тази категория все още няма проекти.</p>
          )}
        </div>

        {/* Closing CTA */}
        <section className="bg-ink text-plaster mt-24 py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DisplayHeading className="text-plaster">Имате идея за <em>проект</em>?</DisplayHeading>
            <p className="text-plaster/70 mt-5 max-w-xl mx-auto">
              Свържете се с нас за консултация и да обсъдим как можем да реализираме вашия проект.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} to="/contact" variant="gold">Свържете се с нас</Button>
              <Button as={Link} to="/contact" variant="ghost" className="border-plaster/40 text-plaster hover:border-plaster">
                Поръчайте оферта
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox — restyled to tokens: ink overlay, plaster text, gold accents */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div className="h-full flex flex-col max-h-screen">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-plaster/10">
                <div>
                  <h2 className="font-display text-xl text-plaster">{selectedProject.title}</h2>
                  <p className="text-gold-accent text-sm mt-1">
                    {selectedProject.type} · {selectedProject.location} · {selectedProject.year}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {selectedProject.images.length > 1 && (
                    <span className="text-plaster/70 text-sm">
                      {currentImageIndex + 1} / {selectedProject.images.length}
                    </span>
                  )}
                  <button
                    onClick={closeModal}
                    aria-label="Затвори"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-plaster/10 hover:bg-plaster/20 text-plaster transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main image */}
              <div className="flex-1 relative flex items-center justify-center p-4 min-h-0" onClick={(e) => e.stopPropagation()}>
                <motion.img
                  key={currentImageIndex}
                  src={selectedProject.images[currentImageIndex]}
                  alt={`${selectedProject.title} - Снимка ${currentImageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />

                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Предишна снимка"
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-plaster/10 hover:bg-plaster/20 text-plaster transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Следваща снимка"
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-plaster/10 hover:bg-plaster/20 text-plaster transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {selectedProject.images.length > 1 && (
                <div className="border-t border-plaster/10 p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1">
                    {selectedProject.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-gold-accent' : 'border-plaster/20 hover:border-plaster/40'
                        }`}
                      >
                        <img src={image} alt={`Миниатюра ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description + features */}
              <div className="border-t border-plaster/10 p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-6">
                  <p className="text-plaster/80 text-sm leading-relaxed">{selectedProject.description}</p>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {selectedProject.features.map((feature) => (
                      <span key={feature} className="text-xs text-plaster/70 border border-plaster/20 rounded-full px-3 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Blog
