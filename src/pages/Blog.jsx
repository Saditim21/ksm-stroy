import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { seoData } from '../utils/seo'
import { pageVariants, pageTransition, fadeInUp, staggerContainer, staggerItem, hoverLift, viewportOptions } from '../utils/animations'

// Import project images
import greenLife1 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45279177_104924087180789_4294631158974513152_n (1).jpg'
import greenLife2 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45287295_104924153847449_7212060700636610560_n.jpg'
import greenLife3 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45288292_104924173847447_4815299079217086464_n.jpg'
import greenLife4 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45306470_104924097180788_3096088000648445952_n.jpg'
import greenLife5 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45306733_104924253847439_2184019800915705856_n.jpg'
import greenLife6 from '../assets/projects/Green Life - Paradise Gardens and Town House - гр.Созопол/45318511_104924170514114_470934586956709888_n.jpg'

import aivazovski1 from '../assets/projects/Айвазовски Парк - гр.Поморие/45361708_108250726848125_8745212082250579968_n.jpg'
import aivazovski2 from '../assets/projects/Айвазовски Парк - гр.Поморие/45437963_108253216847876_6728830584384126976_n.jpg'
import aivazovski3 from '../assets/projects/Айвазовски Парк - гр.Поморие/45441975_108250736848124_4910134572747849728_n.jpg'
import aivazovski4 from '../assets/projects/Айвазовски Парк - гр.Поморие/45494983_108306206842577_6278847505027301376_n.jpg'
import aivazovski5 from '../assets/projects/Айвазовски Парк - гр.Поморие/45506198_108250740181457_402422110464507904_n.jpg'

import panorama1 from '../assets/projects/Панорама Резидънс - гр.Созопол/45127824_104654687207729_8997613209858867200_n.jpg'
import panorama2 from '../assets/projects/Панорама Резидънс - гр.Созопол/45275105_104550560551475_532029530374668288_n.jpg'
import panorama3 from '../assets/projects/Панорама Резидънс - гр.Созопол/45278482_104550563884808_4221959277239074816_n.jpg'
import panorama4 from '../assets/projects/Панорама Резидънс - гр.Созопол/45292144_104654770541054_4029936473460441088_n.jpg'
import panorama5 from '../assets/projects/Панорама Резидънс - гр.Созопол/46178195_115481786125019_6963514404960731136_n.jpg'

import sanirane1 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45353069_106987780307753_3019444107387863040_n.jpg'
import sanirane2 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45359144_106987733641091_1193173908040187904_n.jpg'
import sanirane3 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45383206_106987876974410_6215534137986514944_n.jpg'
import sanirane4 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45386000_106987843641080_6327721226378674176_n.jpg'

import sunnyHill1 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45179553_103762453963619_6226139335658307584_n.jpg'
import sunnyHill2 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45182201_103762593963605_6190119227358183424_n.jpg'
import sunnyHill3 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45186809_103762510630280_4635655840064339968_n.jpg'
import sunnyHill4 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45201168_103762533963611_8986097066803462144_n.jpg'

import hotelParadise1 from '../assets/projects/Хотел Парадайс - с.Огняново/45222690_104656040540927_7174317773579878400_n (1).jpg'
import hotelParadise2 from '../assets/projects/Хотел Парадайс - с.Огняново/45261593_104656053874259_6758029915251015680_n.jpg'
import hotelParadise3 from '../assets/projects/Хотел Парадайс - с.Огняново/45263613_104668413873023_2147464397956579328_n.jpg'
import hotelParadise4 from '../assets/projects/Хотел Парадайс - с.Огняново/45296881_104668430539688_1603561696780091392_n.jpg'
import hotelParadise5 from '../assets/projects/Хотел Парадайс - с.Огняново/45333386_104668347206363_2092741858860990464_n.jpg'
import hotelParadise6 from '../assets/projects/Хотел Парадайс - с.Огняново/45355516_104668353873029_7978551726900772864_n.jpg'
import hotelParadise7 from '../assets/projects/Хотел Парадайс - с.Огняново/45359157_104656047207593_2634777009472929792_n.jpg'
import hotelParadise8 from '../assets/projects/Хотел Парадайс - с.Огняново/45408434_104668377206360_4446989566112432128_n.jpg'

// Add more Панорама Резидънс images
import panorama6 from '../assets/projects/Панорама Резидънс - гр.Созопол/45304167_104550633884801_4951936454352699392_n.jpg'
import panorama7 from '../assets/projects/Панорама Резидънс - гр.Созопол/45342267_104654690541062_2093109697040089088_n.jpg'
import panorama8 from '../assets/projects/Панорама Резидънс - гр.Созопол/45347937_104550667218131_9147245923376562176_n.jpg'
import panorama9 from '../assets/projects/Панорама Резидънс - гр.Созопол/46212183_115481806125017_8714238753796784128_n.jpg'
import panorama10 from '../assets/projects/Панорама Резидънс - гр.Созопол/46213187_115481842791680_7493008379917369344_n.jpg'
import panorama11 from '../assets/projects/Панорама Резидънс - гр.Созопол/46222719_115481802791684_1941576164141170688_n.jpg'
import panorama12 from '../assets/projects/Панорама Резидънс - гр.Созопол/46664444_120257758980755_2261096193088028672_n.jpg'
import panorama13 from '../assets/projects/Панорама Резидънс - гр.Созопол/46665853_120257765647421_2434330731149787136_n.jpg'
import panorama14 from '../assets/projects/Панорама Резидънс - гр.Созопол/46677549_120257702314094_3690774506801987584_n.jpg'
import panorama15 from '../assets/projects/Панорама Резидънс - гр.Созопол/46753132_120257768980754_1107144970071965696_n.jpg'
import panorama16 from '../assets/projects/Панорама Резидънс - гр.Созопол/47051010_120257705647427_8685682890635214848_n.jpg'
import panorama17 from '../assets/projects/Панорама Резидънс - гр.Созопол/47682915_125662661773598_6339324471370842112_n.jpg'
import panorama18 from '../assets/projects/Панорама Резидънс - гр.Созопол/48046863_125662658440265_2917276434667929600_n.jpg'
import panorama19 from '../assets/projects/Панорама Резидънс - гр.Созопол/48238118_127439658262565_8592643286139666432_n.jpg'
import panorama20 from '../assets/projects/Панорама Резидънс - гр.Созопол/48359290_128123474860850_4967265523344605184_n.jpg'
import panorama21 from '../assets/projects/Панорама Резидънс - гр.Созопол/48359770_128123468194184_3584791648992755712_n.jpg'
import panorama22 from '../assets/projects/Панорама Резидънс - гр.Созопол/48380818_128123471527517_4737859087998386176_n.jpg'
import panorama23 from '../assets/projects/Панорама Резидънс - гр.Созопол/48395137_128709964802201_5026304676371365888_n.jpg'

// Add more Айвазовски Парк images
import aivazovski6 from '../assets/projects/Айвазовски Парк - гр.Поморие/45520465_108251800181351_8799674939033518080_n.jpg'
import aivazovski7 from '../assets/projects/Айвазовски Парк - гр.Поморие/45652633_108252286847969_7426443512180113408_n.jpg'

// Add more Сънни Хил images  
import sunnyHill5 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45201199_103762967296901_6198037798432276480_n.jpg'
import sunnyHill6 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45203926_103762163963648_2142672382685347840_n.jpg'
import sunnyHill7 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45211750_103762170630314_2959178539334631424_n.jpg'
import sunnyHill8 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45213313_103762900630241_9076152326158286848_n.jpg'
import sunnyHill9 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45221851_103762147296983_7709813930972938240_n.jpg'
import sunnyHill10 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45231195_103762820630249_3550441286538362880_n.jpg'
import sunnyHill11 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45231241_103762873963577_7690319263394955264_n.jpg'
import sunnyHill12 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45284373_103762583963606_3278342051636183040_n.jpg'
import sunnyHill13 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45286439_103762953963569_4921837856118276096_n.jpg'
import sunnyHill14 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45299021_103762943963570_2704646485177270272_n.jpg'
import sunnyHill15 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45318203_103762710630260_560893308331622400_n.jpg'
import sunnyHill16 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/45374035_103762737296924_3302161076971372544_n.jpg'
import sunnyHill17 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/46102172_115482079458323_76361795513614336_n.jpg'
import sunnyHill18 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/47573864_125662795106918_5159677038843396096_n.jpg'
import sunnyHill19 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49126857_128710281468836_3494677020304998400_n.jpg'
import sunnyHill20 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49845073_136842920655572_6146534448994189312_n.jpg'
import sunnyHill21 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/49938689_136842967322234_561733068927270912_n.jpg'
import sunnyHill22 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/50454577_136842917322239_1674500529146822656_n.jpg'
import sunnyHill23 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/50932977_141282550211609_8395938834864406528_n.jpg'
import sunnyHill24 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57077613_162614501411747_1358123651756457984_n.jpg'
import sunnyHill25 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57124599_162614491411748_7529170866383355904_n.jpg'
import sunnyHill26 from '../assets/projects/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57289416_162614494745081_1080609403691859968_n.jpg'

// Add more Саниране images
import sanirane5 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45393971_106987926974405_8828595951724658688_n.jpg'
import sanirane6 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45405060_106987903641074_1166031054759264256_n.jpg'
import sanirane7 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45421927_106987946974403_4945006073649037312_n.jpg'
import sanirane8 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45421996_106987793641085_5921943865987694592_n.jpg'
import sanirane9 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45455283_106987976974400_2659848498811240448_n.jpg'
import sanirane10 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45478369_106987820307749_1447067042862596096_n.jpg'
import sanirane11 from '../assets/projects/Саниране 2017 г. - гр. Бургас/45520479_106987863641078_3977651113556967424_n.jpg'

// Add ЧИТАЛИЩЕ images
import chitalishte1 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-36-13-125.jpg'
import chitalishte2 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-36-13-253.jpg'
import chitalishte3 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-015.jpg'
import chitalishte4 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-041.jpg'
import chitalishte5 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-080.jpg'
import chitalishte6 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-129.jpg'
import chitalishte7 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-168.jpg'
import chitalishte8 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-207.jpg'
import chitalishte9 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-263.jpg'
import chitalishte10 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-329.jpg'
import chitalishte11 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-392.jpg'
import chitalishte12 from '../assets/projects/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-43-46-455.jpg'

const Projects = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const modalRef = useRef(null)

  // Project data
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

  // Filter projects
  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(project => project.status === selectedFilter)

  // Project filters
  const filters = [
    { id: 'all', name: 'Всички проекти', count: projects.length },
    { id: 'Завършен Проект', name: 'Завършени проекти', count: projects.filter(p => p.status === 'Завършен Проект').length },
    { id: 'Груб Строеж', name: 'Груб строеж', count: projects.filter(p => p.status === 'Груб Строеж').length }
  ]

  // Modal functions
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
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      )
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!selectedProject) return
    
    switch (e.key) {
      case 'Escape':
        closeModal()
        break
      case 'ArrowLeft':
        prevImage()
        break
      case 'ArrowRight':
        nextImage()
        break
      default:
        break
    }
  }

  // Add keyboard event listener when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
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
      
      <main className="min-h-screen bg-primary-50 pt-20">

      {/* Project Filter */}
      <section className="py-12 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-luxury text-sm font-medium transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow scale-105'
                    : 'bg-white text-primary-700 hover:bg-gold-50 hover:text-gold-700 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.name}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedFilter === filter.id
                    ? 'bg-primary-900/20 text-primary-900'
                    : 'bg-gold-100 text-gold-700'
                }`}>
                  {filter.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <div 
              key={selectedFilter}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
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
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Няма проекти</h3>
              <p className="text-primary-600">В тази категория все още няма проекти.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-display-1 font-bold mb-4">
              Имате идея за проект?
            </h2>
            <p className="text-xl mb-8 text-platinum-300">
              Свържете се с нас за консултация и да обсъдим как можем да реализираме вашия проект
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-8 py-4 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Свържете се с нас
              </motion.button>
              <motion.button 
                className="border-2 border-gold-500/50 text-white px-8 py-4 rounded-luxury font-semibold hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Поръчайте оферта
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            ref={modalRef}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div className="h-full flex flex-col max-h-screen">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedProject.status === 'Завършен Проект' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {selectedProject.status}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                    <p className="text-gold-400 text-sm">{selectedProject.location} • {selectedProject.year}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Image Counter */}
                  {selectedProject.images.length > 1 && (
                    <div className="px-3 py-1 bg-white/10 rounded-full text-white text-sm border border-white/20">
                      {currentImageIndex + 1} / {selectedProject.images.length}
                    </div>
                  )}
                  
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Main Image Area */}
              <div className="flex-1 relative flex items-center justify-center p-4 min-h-0" onClick={(e) => e.stopPropagation()}>
                <motion.div 
                  className="relative max-w-7xl w-full h-full flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={`${selectedProject.title} - Снимка ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </motion.div>
                
                {/* Navigation Arrows - Fixed Position */}
                {selectedProject.images.length > 1 && (
                  <>
                    <motion.button
                      onClick={prevImage}
                      className="fixed left-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 text-white border border-white/20 hover:border-gold-400 z-10"
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.svg 
                        className="w-8 h-8" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        whileHover={{ x: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </motion.svg>
                    </motion.button>
                    <motion.button
                      onClick={nextImage}
                      className="fixed right-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 text-white border border-white/20 hover:border-gold-400 z-10"
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.svg 
                        className="w-8 h-8" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </motion.button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {selectedProject.images.length > 1 && (
                <div className="bg-black/50 backdrop-blur-lg border-t border-white/10 p-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {selectedProject.images.map((image, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-gold-400 shadow-lg shadow-gold-400/20' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={image}
                            alt={`Миниатюра ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Project Details Footer - Always Visible */}
              <div className="bg-black/60 backdrop-blur-lg border-t border-white/20 p-4 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        За проекта
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm mb-3">{selectedProject.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {selectedProject.type}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4m-6 2a9 9 0 108.29-5.64" />
                          </svg>
                          {selectedProject.year}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {selectedProject.images.length} снимки
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Особености
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.features.map((feature, index) => (
                          <motion.span 
                            key={index} 
                            className="px-2 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs border border-gold-500/30 whitespace-nowrap"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  </>)
}

// Project Card Component
const ProjectCard = ({ project, index, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <article 
      className="bg-white rounded-luxury-lg overflow-hidden group cursor-pointer border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
      onClick={onClick}
    >
      {/* Project Image */}
      <div className="relative h-56 overflow-hidden">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gold-100 to-gold-200 animate-pulse flex items-center justify-center">
                <svg className="w-12 h-12 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <OptimizedImage
              src={project.images[0]}
              alt={`${project.title} - KSM Stroy проект`}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gold-700 text-sm font-medium">Проект</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
            project.status === 'Завършен Проект' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-orange-500/90 text-white'
          }`}>
            {project.status}
          </span>
        </div>

        {/* Image Count Indicator */}
        {project.images.length > 1 && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {project.images.length}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gold-600/0 group-hover:bg-gold-600/10 transition-all duration-300"></div>
      </div>

      {/* Project Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-gold-700 transition-colors duration-300 leading-tight">
          {project.title}
        </h3>

        {/* Location and Type */}
        <div className="flex items-center text-sm text-primary-500 mb-3 space-x-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{project.location}</span>
          </div>
          <span>•</span>
          <span>{project.year}</span>
        </div>

        {/* Description */}
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Project Type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-primary-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {project.type}
          </span>
        </div>

        {/* Features Preview */}
        {project.features && project.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.features.slice(0, 2).map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs">
                {feature}
              </span>
            ))}
            {project.features.length > 2 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                +{project.features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <motion.button 
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-3 px-4 rounded-luxury font-semibold flex items-center justify-center group shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Разгледай проекта</span>
          <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </motion.button>
      </div>

      {/* Bottom accent line */}
      <motion.div 
        className="h-1 bg-gradient-to-r from-gold-500 to-gold-600 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
    </article>
  )
}

export default Projects