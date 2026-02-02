import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../src/assets')

let totalOriginal = 0
let totalOptimized = 0
let filesProcessed = 0

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await processDirectory(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()

      // Skip if already webp or not an image
      if (ext === '.webp' || !['.png', '.jpg', '.jpeg'].includes(ext)) {
        continue
      }

      const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')

      // Skip if webp version already exists
      if (fs.existsSync(webpPath)) {
        continue
      }

      try {
        const originalSize = fs.statSync(fullPath).size

        // Skip very small files (< 10KB)
        if (originalSize < 10 * 1024) {
          continue
        }

        totalOriginal += originalSize

        await sharp(fullPath)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath)

        const newSize = fs.statSync(webpPath).size
        totalOptimized += newSize
        filesProcessed++

        const relativePath = path.relative(srcDir, fullPath)
        const savings = ((1 - newSize / originalSize) * 100).toFixed(0)
        console.log(`${relativePath}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${savings}% smaller)`)
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message)
      }
    }
  }
}

async function main() {
  console.log('Optimizing ALL images in src/assets...\n')

  await processDirectory(srcDir)

  console.log('\n' + '='.repeat(60))
  console.log(`Files processed: ${filesProcessed}`)
  console.log(`Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`)
  console.log('\nNow updating imports to use .webp files...')
}

main().catch(console.error)
