import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function optimizeImages() {
  console.log('Optimizing large images...\n')

  // 1. Optimize building-2.png -> WebP (resize to 1200px width, quality 80)
  const buildingPng = path.resolve(__dirname, '../public/images/golden-residence/building-2.png')
  const buildingWebp = path.resolve(__dirname, '../public/images/golden-residence/building-2.webp')

  if (fs.existsSync(buildingPng)) {
    const originalSize = fs.statSync(buildingPng).size
    console.log(`Original building-2.png: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)

    await sharp(buildingPng)
      .resize(1200, null, { withoutEnlargement: true }) // Max 1200px width
      .webp({ quality: 80 })
      .toFile(buildingWebp)

    const newSize = fs.statSync(buildingWebp).size
    console.log(`Optimized building-2.webp: ${(newSize / 1024).toFixed(2)} KB`)
    console.log(`Savings: ${((1 - newSize / originalSize) * 100).toFixed(1)}%\n`)
  }

  // 2. Optimize logo.jpg -> smaller WebP
  const logoJpg = path.resolve(__dirname, '../src/assets/images/logo.jpg')
  const logoWebp = path.resolve(__dirname, '../src/assets/images/logo.webp')

  if (fs.existsSync(logoJpg)) {
    const originalSize = fs.statSync(logoJpg).size
    console.log(`Original logo.jpg: ${(originalSize / 1024).toFixed(2)} KB`)

    await sharp(logoJpg)
      .resize(200, 200, { fit: 'cover' }) // Logo displayed at ~80px, 200px gives 2x for retina
      .webp({ quality: 85 })
      .toFile(logoWebp)

    const newSize = fs.statSync(logoWebp).size
    console.log(`Optimized logo.webp: ${(newSize / 1024).toFixed(2)} KB`)
    console.log(`Savings: ${((1 - newSize / originalSize) * 100).toFixed(1)}%\n`)
  }

  // 3. Also optimize the building-2.png in src/assets if exists
  const srcBuildingPng = path.resolve(__dirname, '../src/assets/продажби/project 2/building-2.png')
  const srcBuildingWebp = path.resolve(__dirname, '../src/assets/продажби/project 2/building-2.webp')

  if (fs.existsSync(srcBuildingPng)) {
    const originalSize = fs.statSync(srcBuildingPng).size
    console.log(`Original src building-2.png: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)

    await sharp(srcBuildingPng)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(srcBuildingWebp)

    const newSize = fs.statSync(srcBuildingWebp).size
    console.log(`Optimized src building-2.webp: ${(newSize / 1024).toFixed(2)} KB`)
    console.log(`Savings: ${((1 - newSize / originalSize) * 100).toFixed(1)}%\n`)
  }

  console.log('Done! Now update your code to use the .webp versions.')
}

optimizeImages().catch(console.error)
