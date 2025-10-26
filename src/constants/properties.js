// Import property images
import property1Image1 from '../assets/продажби/project 1/sgrada1.jpg'
import goldenResidenceImage from '../assets/продажби/project 2/golden-residence.jpg'

// Import Многофамилна жилищна сграда photos (use existing files)
import property1Photo1 from '../assets/продажби/project 1/2_page-0001.jpg'
import property1Photo2 from '../assets/продажби/project 1/apartment-b2.jpg'
import property1Photo3 from '../assets/продажби/project 1/building-all-floors-architecture.png'
import property1Photo4 from '../assets/продажби/project 1/building-garages.png'

// Import Golden Residence photos (only existing files)
import goldenResidencePhoto1 from '../assets/продажби/project 2/photos/golden-residence-1.png'
import goldenResidencePhoto2 from '../assets/продажби/project 2/photos/golden-residence-2.png'
import goldenResidencePhoto4 from '../assets/продажби/project 2/photos/golden-residence-4.png'
import goldenResidencePhoto6 from '../assets/продажби/project 2/photos/golden-residence-6.png'
import goldenResidencePhoto7 from '../assets/продажби/project 2/photos/golden-residence-7.png'
import goldenResidencePhoto8 from '../assets/продажби/project 2/photos/golden-residence-8.png'

// Properties data for sales page
export const properties = [
  {
    id: 1,
    title: "Многофамилна жилищна сграда",
    location: "УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София",
    status: "За продажба",
    type: "Жилищна сграда",
    year: "2024",
    description: "Модерна многофамилна жилищна сграда с два блока (А и Б), гаражи и луксозни апартаменти в жк. Връбница-1. Блок А - 10 етажа, Блок Б - 9 етажа. Част от апартаментите вече са продадени.",
    images: [
      property1Image1,
      property1Photo1,
      property1Photo2,
      property1Photo3,
      property1Photo4
    ],
    features: ["Подземни гаражи", "Блок А - 10 етажа", "Блок Б - 9 етажа", "Престижен район"],
    price: "По запитване",
    apartments: "Блокове А и Б - различни етажи",
    totalFloors: "Блок А: 10 етажа, Блок Б: 9 етажа",
    buildingData: {
      blockA: {
        floors: [
          { floor: 10, status: 'sold', apartments: 2, description: 'Етаж 10 - Продаден' },
          { floor: 9, status: 'available', apartments: 2, description: 'Етаж 9 - 2 апартамента налични' },
          { floor: 8, status: 'sold', apartments: 2, description: 'Етаж 8 - Продаден' },
          { floor: 7, status: 'sold', apartments: 2, description: 'Етаж 7 - Продаден' },
          { floor: 6, status: 'sold', apartments: 2, description: 'Етаж 6 - Продаден' },
          { floor: 5, status: 'sold', apartments: 2, description: 'Етаж 5 - Продаден' },
          { floor: 4, status: 'sold', apartments: 2, description: 'Етаж 4 - Продаден' },
          { floor: 3, status: 'available', apartments: 2, description: 'Етаж 3 - 2 апартамента налични' },
          { floor: 2, status: 'available', apartments: 2, description: 'Етаж 2 - 2 апартамента налични' }
        ]
      },
      blockB: {
        floors: [
          { floor: 9, status: 'available', apartments: 2, description: 'Етаж 9 - 2 апартамента налични' },
          { floor: 8, status: 'available', apartments: 2, description: 'Етаж 8 - 2 апартамента налични' },
          { floor: 7, status: 'available', apartments: 2, description: 'Етаж 7 - 2 апартамента налични' },
          { floor: 6, status: 'available', apartments: 2, description: 'Етаж 6 - 2 апартамента налични' },
          { floor: 5, status: 'available', apartments: 2, description: 'Етаж 5 - 2 апартамента налични' },
          { floor: 4, status: 'available', apartments: 2, description: 'Етаж 4 - 2 апартамента налични' },
          { floor: 3, status: 'available', apartments: 2, description: 'Етаж 3 - 2 апартамента налични' },
          { floor: 2, status: 'available', apartments: 2, description: 'Етаж 2 - 2 апартамента налични' }
        ]
      },
      garage: {
        available: true,
        description: 'Подземни гаражи - налични места'
      }
    }
  },
  {
    id: 2,
    title: "Golden Residence",
    location: "жк ЛЕВСКИ Г | ул. Ген. Климент Бояджиев",
    status: "За продажба",
    type: "Жилищна сграда",
    year: "2025",
    description: "Модерна жилищна сграда с луксозни апартаменти в сърцето на София. Очаквайте скоро отваряне за продажба.",
    images: [
      goldenResidenceImage,
      goldenResidencePhoto1,
      goldenResidencePhoto2,
      goldenResidencePhoto4,
      goldenResidencePhoto6,
      goldenResidencePhoto7,
      goldenResidencePhoto8
    ],
    features: ["Луксозни апартаменти", "Централна локация", "Модерна архитектура"],
    price: "Скоро",
    apartments: "1-стайни до 4-стайни",
    totalFloors: "8 етажа",
    projectType: "golden-residence",
    buildingData: {
      blockA: {
        floors: [
          { 
            floor: 8, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 8 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-801', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-802', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-803', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-804', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 7, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 7 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-701', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-702', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-703', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-704', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 6, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 6 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-601', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-602', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-603', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-604', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 5, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 5 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-501', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-502', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-503', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-504', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 4, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 4 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-401', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-402', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-403', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-404', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 3, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 3 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-301', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-302', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-303', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-304', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 2, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 2 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-201', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-202', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-203', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-204', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 1, 
            status: 'coming-soon', 
            apartments: 4, 
            description: 'Етаж 1 - 4 апартамента (скоро)', 
            apartmentList: [
              { number: 'А-101', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'А-102', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'А-103', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'А-104', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          }
        ]
      },
      blockB: {
        floors: [
          { 
            floor: 8, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 8 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-801', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-802', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-803', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-804', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 7, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 7 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-701', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-702', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-703', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-704', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 6, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 6 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-601', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-602', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-603', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-604', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 5, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 5 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-501', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-502', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-503', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-504', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 4, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 4 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-401', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-402', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-403', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-404', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 3, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 3 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-301', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-302', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-303', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-304', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 2, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 2 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-201', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-202', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-203', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-204', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          },
          { 
            floor: 1, 
            status: 'coming-soon', 
            apartments: 12, 
            description: 'Етаж 1 - 12 апартамента (скоро)', 
            apartmentList: [
              { number: 'Б-101', type: '2-стаен', area: '65 кв.м', status: 'Скоро' },
              { number: 'Б-102', type: '3-стаен', area: '85 кв.м', status: 'Скоро' },
              { number: 'Б-103', type: '2-стаен', area: '70 кв.м', status: 'Скоро' },
              { number: 'Б-104', type: '3-стаен', area: '90 кв.м', status: 'Скоро' }
            ]
          }
        ]
      }
    }
  }
]

// Filter configurations
export const filters = [
  { id: 'all', name: 'Всички', count: properties.length },
  { id: 'for-sale', name: 'За продажба', count: properties.filter(p => p.status === 'За продажба').length },
  { id: 'coming-soon', name: 'Скоро', count: properties.filter(p => p.status === 'Скоро').length }
]