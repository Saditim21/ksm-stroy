// Building and floor plan images
import buildingImage from '../assets/продажби/project 1/sgrada1.webp'
import buildingBFloor1Image from '../assets/продажби/project 1/building-B-floor-1.webp'
import buildingBFloor2Image from '../assets/продажби/project 1/building-B-floor-2.webp'
import buildingBFloor3Image from '../assets/продажби/project 1/building-B-floor-3.webp'
import buildingBFloor4Image from '../assets/продажби/project 1/building-B-floor-4.webp'
import buildingBFloor5Image from '../assets/продажби/project 1/building-B-floor-5.webp'
import buildingBFloor6Image from '../assets/продажби/project 1/building-B-floor-6.webp'
import buildingBFloor7Image from '../assets/продажби/project 1/building-B-floor-7.webp'
import buildingBFloor8Image from '../assets/продажби/project 1/building-B-floor-8.webp'
import buildingBFloor9Image from '../assets/продажби/project 1/building-B-floor-9.webp'
import buildingAFloor1Image from '../assets/продажби/project 1/building-A-floor-1.webp'
import buildingAFloor2Image from '../assets/продажби/project 1/building-A-floor-2.webp'
import buildingAFloor3Image from '../assets/продажби/project 1/building-A-floor-3.webp'
import buildingAFloor4Image from '../assets/продажби/project 1/building-A-floor-4.webp'
import buildingAFloor5Image from '../assets/продажби/project 1/building-A-floor-5.webp'
import buildingAFloor6Image from '../assets/продажби/project 1/building-A-floor-6.webp'
import buildingAFloor7Image from '../assets/продажби/project 1/building-A-floor-7.webp'
import buildingAFloor8Image from '../assets/продажби/project 1/building-A-floor-8.webp'
import buildingAFloor9Image from '../assets/продажби/project 1/building-A-floor-9.webp'
import buildingAFloor0Image from '../assets/продажби/project 1/building-garages.webp'
import buildingBFloor0Image from '../assets/продажби/project 1/building-garages.webp'
import garageFloorImage from '../assets/продажби/project 1/garage-floor.webp'

// Golden Residence floor images (served from /public/images/golden-residence)
const publicBase = import.meta.env.BASE_URL || '/';
const goldenResidenceMainImage = `${publicBase}images/golden-residence/building-2.webp`;

// Golden Residence Block A floor images (public)
const goldenResidenceAFloor1Image = `${publicBase}images/golden-residence/building-2-blog-a-floor1.webp`;
const goldenResidenceAFloor2Image = `${publicBase}images/golden-residence/building-2-blog-a-floor2.webp`;
const goldenResidenceAFloor3Image = `${publicBase}images/golden-residence/building-2-blog-a-floor3.webp`;
const goldenResidenceAFloor4Image = `${publicBase}images/golden-residence/building-2-blog-a-floor4.webp`;
const goldenResidenceAFloor5Image = `${publicBase}images/golden-residence/building-2-blog-a-floor5.webp`;
const goldenResidenceAFloor6Image = `${publicBase}images/golden-residence/building-2-blog-a-floor6.webp`;
const goldenResidenceAFloor7Image = `${publicBase}images/golden-residence/building-2-blog-a-floor7.webp`;
const goldenResidenceAFloor8Image = `${publicBase}images/golden-residence/building-2-blog-a-floor8.webp`;

// Golden Residence Block B floor images (public)
const goldenResidenceBFloor1Image = `${publicBase}images/golden-residence/building-2-blog-b-floor1.webp`;
const goldenResidenceBFloor2Image = `${publicBase}images/golden-residence/building-2-blog-b-floor2.webp`;
const goldenResidenceBFloor3Image = `${publicBase}images/golden-residence/building-2-blog-b-floor3.webp`;
const goldenResidenceBFloor4Image = `${publicBase}images/golden-residence/building-2-blog-b-floor4.webp`;
const goldenResidenceBFloor5Image = `${publicBase}images/golden-residence/building-2-blog-b-floor5.webp`;
const goldenResidenceBFloor6Image = `${publicBase}images/golden-residence/building-2-blog-b-floor6.webp`;
const goldenResidenceBFloor7Image = `${publicBase}images/golden-residence/building-2-blog-b-floor7.webp`;
const goldenResidenceBFloor8Image = `${publicBase}images/golden-residence/building-2-blog-b-floor8.webp`;

// Export all building images as a single object for easy access
export const buildingImages = {
  main: buildingImage,
  blockA: {
    floor0: buildingAFloor0Image,
    floor1: buildingAFloor1Image,
    floor2: buildingAFloor2Image,
    floor3: buildingAFloor3Image,
    floor4: buildingAFloor4Image,
    floor5: buildingAFloor5Image,
    floor6: buildingAFloor6Image,
    floor7: buildingAFloor7Image,
    floor8: buildingAFloor8Image,
    floor9: buildingAFloor9Image,
  },
  blockB: {
    floor0: buildingBFloor0Image,
    floor1: buildingBFloor1Image,
    floor2: buildingBFloor2Image,
    floor3: buildingBFloor3Image,
    floor4: buildingBFloor4Image,
    floor5: buildingBFloor5Image,
    floor6: buildingBFloor6Image,
    floor7: buildingBFloor7Image,
    floor8: buildingBFloor8Image,
    floor9: buildingBFloor9Image,
  },
  garage: garageFloorImage,
  goldenResidence: {
    main: goldenResidenceMainImage,
    blockA: {
      floor1: goldenResidenceAFloor1Image,
      floor2: goldenResidenceAFloor2Image,
      floor3: goldenResidenceAFloor3Image,
      floor4: goldenResidenceAFloor4Image,
      floor5: goldenResidenceAFloor5Image,
      floor6: goldenResidenceAFloor6Image,
      floor7: goldenResidenceAFloor7Image,
      floor8: goldenResidenceAFloor8Image,
    },
    blockB: {
      floor1: goldenResidenceBFloor1Image,
      floor2: goldenResidenceBFloor2Image,
      floor3: goldenResidenceBFloor3Image,
      floor4: goldenResidenceBFloor4Image,
      floor5: goldenResidenceBFloor5Image,
      floor6: goldenResidenceBFloor6Image,
      floor7: goldenResidenceBFloor7Image,
      floor8: goldenResidenceBFloor8Image,
    }
  }
}

// Helper function to get building image based on hover state
export const getBuildingImage = (hoveredFloor) => {
  if (!hoveredFloor) return buildingImages.main
  
  const { block, floor } = hoveredFloor
  
  if (block === 'А') {
    return buildingImages.blockA[`floor${floor}`] || buildingImages.main
  } else if (block === 'Б') {
    return buildingImages.blockB[`floor${floor}`] || buildingImages.main
  }
  
  return buildingImages.main
}

// Helper function to get Golden Residence image based on block and floor
export const getGoldenResidenceImage = (block, floor) => {
  if (!block || !floor) return buildingImages.goldenResidence.main
  
  if (block === 'А' || block === 'A') {
    return buildingImages.goldenResidence.blockA[`floor${floor}`] || buildingImages.goldenResidence.main
  } else if (block === 'Б' || block === 'B') {
    return buildingImages.goldenResidence.blockB[`floor${floor}`] || buildingImages.goldenResidence.main
  }
  
  return buildingImages.goldenResidence.main
}