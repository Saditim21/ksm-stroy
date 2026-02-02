import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../src/assets')

async function convertAll(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await convertAll(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue

      const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
      if (fs.existsSync(webpPath)) continue

      try {
        await sharp(fullPath)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath)
        console.log(`Converted: ${path.relative(srcDir, fullPath)}`)
      } catch (err) {
        // If conversion fails, copy the original as a fallback
        console.log(`Skipped (invalid): ${path.relative(srcDir, fullPath)}`)
      }
    }
  }
}

convertAll(srcDir).then(() => console.log('\nDone!'))
