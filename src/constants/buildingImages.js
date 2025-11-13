// Building and floor plan images
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg'
import buildingBFloor1Image from '../assets/продажби/project 1/building-B-floor-1.jpg'
import buildingBFloor2Image from '../assets/продажби/project 1/building-B-floor-2.jpg'
import buildingBFloor3Image from '../assets/продажби/project 1/building-B-floor-3.jpg'
import buildingBFloor4Image from '../assets/продажби/project 1/building-B-floor-4.jpg'
import buildingBFloor5Image from '../assets/продажби/project 1/building-B-floor-5.jpg'
import buildingBFloor6Image from '../assets/продажби/project 1/building-B-floor-6.jpg'
import buildingBFloor7Image from '../assets/продажби/project 1/building-B-floor-7.jpg'
import buildingBFloor8Image from '../assets/продажби/project 1/building-B-floor-8.jpg'
import buildingBFloor9Image from '../assets/продажби/project 1/building-B-floor-9.jpg'
import buildingAFloor1Image from '../assets/продажби/project 1/building-A-floor-1.jpg'
import buildingAFloor2Image from '../assets/продажби/project 1/building-A-floor-2.jpg'
import buildingAFloor3Image from '../assets/продажби/project 1/building-A-floor-3.jpg'
import buildingAFloor4Image from '../assets/продажби/project 1/building-A-floor-4.jpg'
import buildingAFloor5Image from '../assets/продажби/project 1/building-A-floor-5.jpg'
import buildingAFloor6Image from '../assets/продажби/project 1/building-A-floor-6.jpg'
import buildingAFloor7Image from '../assets/продажби/project 1/building-A-floor-7.jpg'
import buildingAFloor8Image from '../assets/продажби/project 1/building-A-floor-8.jpg'
import buildingAFloor9Image from '../assets/продажби/project 1/building-A-floor-9.jpg'
import buildingAFloor0Image from '../assets/продажби/project 1/building-garages.png'
import buildingBFloor0Image from '../assets/продажби/project 1/building-garages.png'
import garageFloorImage from '../assets/продажби/project 1/garage-floor.jpg'

// Golden Residence floor images (served from /public/images/golden-residence)
const publicBase = import.meta.env.BASE_URL || '/';
const goldenResidenceMainImage = `${publicBase}images/golden-residence/building-2.png`;

// Golden Residence Block A floor images (public)
const goldenResidenceAFloor1Image = `${publicBase}images/golden-residence/building-2-blog-a-floor1.png`;
const goldenResidenceAFloor2Image = `${publicBase}images/golden-residence/building-2-blog-a-floor2.png`;
const goldenResidenceAFloor3Image = `${publicBase}images/golden-residence/building-2-blog-a-floor3.png`;
const goldenResidenceAFloor4Image = `${publicBase}images/golden-residence/building-2-blog-a-floor4.png`;
const goldenResidenceAFloor5Image = `${publicBase}images/golden-residence/building-2-blog-a-floor5.png`;
const goldenResidenceAFloor6Image = `${publicBase}images/golden-residence/building-2-blog-a-floor6.png`;
const goldenResidenceAFloor7Image = `${publicBase}images/golden-residence/building-2-blog-a-floor7.png`;
const goldenResidenceAFloor8Image = `${publicBase}images/golden-residence/building-2-blog-a-floor8.png`;

// Golden Residence Block B floor images (public)
const goldenResidenceBFloor1Image = `${publicBase}images/golden-residence/building-2-blog-b-floor1.png`;
const goldenResidenceBFloor2Image = `${publicBase}images/golden-residence/building-2-blog-b-floor2.png`;
const goldenResidenceBFloor3Image = `${publicBase}images/golden-residence/building-2-blog-b-floor3.png`;
const goldenResidenceBFloor4Image = `${publicBase}images/golden-residence/building-2-blog-b-floor4.png`;
const goldenResidenceBFloor5Image = `${publicBase}images/golden-residence/building-2-blog-b-floor5.png`;
const goldenResidenceBFloor6Image = `${publicBase}images/golden-residence/building-2-blog-b-floor6.png`;
const goldenResidenceBFloor7Image = `${publicBase}images/golden-residence/building-2-blog-b-floor7.png`;
const goldenResidenceBFloor8Image = `${publicBase}images/golden-residence/building-2-blog-b-floor8.png`;

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