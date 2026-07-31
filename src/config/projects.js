// Single place where project-specific data lives: which blocks/floors exist,
// which images back the facade and the floor plans, and how a display floor
// maps to the floor digit inside unit ids.
//
// Geometry (polygon coordinates) lives in src/data/maps/*.json — the width and
// height mirrored here are that map's coordinate space, which is also the
// intrinsic size of the base image.

import goldenBuildingMap from '../data/maps/golden-residence.building.json'
import goldenFloorMaps from '../data/maps/golden-residence.floors.json'
import mnogoBuildingMap from '../data/maps/mnogofamilna.building.json'
import mnogoFloorMaps from '../data/maps/mnogofamilna.floors.json'

// Golden Residence architecture plans (imported so Vite bundles them for production)
import archA2 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-2.webp'
import archA3 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-3.webp'
import archA4 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-4.webp'
import archA5 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-5.webp'
import archA6 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-6.webp'
import archA7 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-7.webp'
import archA8 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-8.webp'

import archB1 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-1.webp'
import archB2 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-2.webp'
import archB3 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-3.webp'
import archB4 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-4.webp'
import archB5 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-5.webp'
import archB6 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-6.webp'
import archB7 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-7.webp'
import archB8 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-8.webp'

// Многофамилна сграда: one render, one architecture plan shared by every floor
import mnogoBuildingImage from '../assets/продажби/project 1/sgrada1.webp'
import mnogoFloorPlan from '../assets/продажби/project 1/building-all-floors-architecture.webp'

// The Golden Residence render is served from /public/images/golden-residence
const publicBase = import.meta.env.BASE_URL || '/'
const goldenBuildingImage = `${publicBase}images/golden-residence/building-2.webp`

const GOLDEN_FLOORS = [1, 2, 3, 4, 5, 6, 7, 8]
// Floor key 0 holds the garages (shown separately) and there is no key 1 —
// the first residential level of Многофамилна сграда is key 2.
const MNOGO_FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10]

// Block A of Golden Residence has no floor-1 plan drawing; its layout is
// identical to floor 2, so floor 2's plan is reused. (The drawing's title block
// still reads "етаж 2" — a known cosmetic compromise.)
const goldenPlansA = { 1: archA2, 2: archA2, 3: archA3, 4: archA4, 5: archA5, 6: archA6, 7: archA7, 8: archA8 }
const goldenPlansB = { 1: archB1, 2: archB2, 3: archB3, 4: archB4, 5: archB5, 6: archB6, 7: archB7, 8: archB8 }

const mnogoPlans = Object.fromEntries(MNOGO_FLOORS.map((floor) => [floor, mnogoFloorPlan]))

export const PROJECTS = {
  'golden-residence': {
    id: 'golden-residence',
    name: 'Golden Residence',
    blocks: [
      { id: 'block-a', letter: 'А', label: 'Блок А' },
      { id: 'block-b', letter: 'Б', label: 'Блок Б' },
    ],
    floors: { 'block-a': GOLDEN_FLOORS, 'block-b': GOLDEN_FLOORS },
    // Unit ids are "А 101" … "А 812": the floor digit equals the display floor.
    unitFloor: (floor) => floor,
    building: {
      image: {
        src: goldenBuildingImage,
        width: goldenBuildingMap.imageWidth,
        height: goldenBuildingMap.imageHeight,
      },
      map: goldenBuildingMap,
    },
    floorMaps: goldenFloorMaps,
    planImages: { 'block-a': goldenPlansA, 'block-b': goldenPlansB },
    hasGarages: true,
  },
  'mnogofamilna-sgrada': {
    id: 'mnogofamilna-sgrada',
    name: 'Многофамилна сграда',
    blocks: [
      { id: 'block-a', letter: 'А', label: 'Блок А' },
      { id: 'block-b', letter: 'Б', label: 'Блок Б' },
    ],
    floors: { 'block-a': MNOGO_FLOORS, 'block-b': MNOGO_FLOORS },
    // Floor key 10 holds units А-901…А-908: the floor digit is one below the key.
    unitFloor: (floor) => floor - 1,
    building: {
      image: {
        src: mnogoBuildingImage,
        width: mnogoBuildingMap.imageWidth,
        height: mnogoBuildingMap.imageHeight,
      },
      map: mnogoBuildingMap,
    },
    floorMaps: mnogoFloorMaps,
    planImages: { 'block-a': mnogoPlans, 'block-b': mnogoPlans },
    hasGarages: false,
  },
}

export default PROJECTS
