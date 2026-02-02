import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../src')

// Find all JS/JSX files and update imports from .png/.jpg to .webp
function updateImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      updateImports(fullPath)
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf-8')
      const originalContent = content

      // Replace .png and .jpg imports with .webp
      // Match import statements with image files
      content = content.replace(
        /(import\s+\w+\s+from\s+['"][^'"]+)\.(png|jpg|jpeg)(['"])/g,
        '$1.webp$3'
      )

      // Also update dynamic imports and string references to assets
      content = content.replace(
        /(from\s+['"][^'"]+)\.(png|jpg|jpeg)(['"])/g,
        '$1.webp$3'
      )

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content)
        console.log(`Updated: ${path.relative(srcDir, fullPath)}`)
      }
    }
  }
}

console.log('Updating imports from .png/.jpg to .webp...\n')
updateImports(srcDir)
console.log('\nDone!')
