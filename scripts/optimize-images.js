#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminWebp from 'imagemin-webp'

const ASSETS_DIR = 'src/assets'
const OUTPUT_DIR = 'src/assets-optimized'

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...')
  
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    
    // Optimize JPEGs and create WebP versions
    console.log('📸 Optimizing JPEG images...')
    await imagemin([`${ASSETS_DIR}/**/*.{jpg,jpeg}`], {
      destination: OUTPUT_DIR,
      plugins: [
        imageminMozjpeg({ quality: 75 }),
        imageminWebp({ quality: 75 })
      ]
    })
    
    // Optimize PNGs and create WebP versions  
    console.log('🎨 Optimizing PNG images...')
    await imagemin([`${ASSETS_DIR}/**/*.png`], {
      destination: OUTPUT_DIR,
      plugins: [
        imageminPngquant({ quality: [0.65, 0.8] }),
        imageminWebp({ quality: 75 })
      ]
    })
    
    console.log('✅ Image optimization complete!')
    console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`)
    
    // Get size comparison
    const originalSize = await getFolderSize(ASSETS_DIR)
    const optimizedSize = await getFolderSize(OUTPUT_DIR)
    const savings = originalSize - optimizedSize
    const percentage = Math.round((savings / originalSize) * 100)
    
    console.log(`📊 Original size: ${formatBytes(originalSize)}`)
    console.log(`📊 Optimized size: ${formatBytes(optimizedSize)}`)
    console.log(`💾 Saved: ${formatBytes(savings)} (${percentage}%)`)
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error)
    process.exit(1)
  }
}

async function getFolderSize(folderPath) {
  let totalSize = 0
  
  try {
    const files = await fs.readdir(folderPath, { withFileTypes: true })
    
    for (const file of files) {
      const filePath = path.join(folderPath, file.name)
      
      if (file.isDirectory()) {
        totalSize += await getFolderSize(filePath)
      } else if (file.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }
    }
  } catch (error) {
    // Folder might not exist yet
    return 0
  }
  
  return totalSize
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Run the optimization
optimizeImages()