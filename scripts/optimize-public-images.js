import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public/images/golden-residence')

async function optimizeImages() {
  console.log('Optimizing public folder images...\n')

  const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.png') && f !== 'favicon.png')

  let totalOriginal = 0
  let totalOptimized = 0

  for (const file of files) {
    const inputPath = path.join(publicDir, file)
    const outputPath = path.join(publicDir, file.replace('.png', '.webp'))

    // Skip if webp exists
    if (fs.existsSync(outputPath)) continue

    const originalSize = fs.statSync(inputPath).size
    totalOriginal += originalSize

    console.log(`Processing ${file}: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)

    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)

    const newSize = fs.statSync(outputPath).size
    totalOptimized += newSize

    console.log(`  → ${file.replace('.png', '.webp')}: ${(newSize / 1024).toFixed(0)} KB (${((1 - newSize / originalSize) * 100).toFixed(0)}% smaller)\n`)
  }

  console.log('='.repeat(50))
  console.log(`Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`)
}

optimizeImages().catch(console.error)
