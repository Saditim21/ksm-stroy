// Apartment images and floor plans
import apartmentB2Image from '../assets/продажби/project 1/apartment-b2.jpg'
import apartmentB2FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B2.png'
import apartmentB6FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B6.png'
import apartmentB7FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B7.png'
import apartmentB15FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-207-floor2.png'
import apartmentB23FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b23-floor3.png'
import apartmentB31FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b31-floor4.png'
import apartmentB47FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b47-floor6.png'
import apartmentB50FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b50-floor7.png'
import apartmentB55FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b55-floor7.png'
import apartmentB57FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b57-floor8.png'
import apartmentB59FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b59-floor8.png'
import apartmentB63FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b63-floor8.png'
import apartmentA2FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a2-floor1.png'
import apartmentA6FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a6-floor1.png'
import apartmentA58FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a58-floor8.png'
import apartmentA64FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a64-floor8.png'

// Apartment image mapping
export const apartmentImages = {
  'Б-102': apartmentB2FloorPlanImage,
  'Б-202': apartmentB2FloorPlanImage,
  'Б-106': apartmentB6FloorPlanImage,
  'Б-206': apartmentB6FloorPlanImage,
  'Б-107': apartmentB7FloorPlanImage,
  'Б-207': apartmentB15FloorPlanImage,
  'Б-307': apartmentB23FloorPlanImage,
  'Б-407': apartmentB31FloorPlanImage,
  'Б-607': apartmentB47FloorPlanImage,
  'Б-702': apartmentB50FloorPlanImage,
  'Б-707': apartmentB55FloorPlanImage,
  'Б-801': apartmentB57FloorPlanImage,
  'Б-803': apartmentB59FloorPlanImage,
  'Б-807': apartmentB63FloorPlanImage,
  'А-102': apartmentA2FloorPlanImage,
  'А-106': apartmentA6FloorPlanImage,
  'А-858': apartmentA58FloorPlanImage,
  'А-864': apartmentA64FloorPlanImage
}

// Function to get apartment image by ID
export const getApartmentImage = (apartmentId) => {
  return apartmentImages[apartmentId] || apartmentB2Image
}