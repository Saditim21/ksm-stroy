import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Temporarily disabled image optimization to fix Vercel deployment
    // process.env.NODE_ENV === 'production' && viteImagemin({
    //   gifsicle: { optimizationLevel: 7 },
    //   mozjpeg: { quality: 75 },
    //   pngquant: {
    //     quality: [0.65, 0.8],
    //     speed: 1
    //   },
    //   webp: { quality: 75 }
    // })
  ].filter(Boolean),
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@emailjs/browser',
      'react-hook-form'
    ],
    exclude: ['@react-three/fiber', '@react-three/drei', 'three']
  },
  build: {
    // Simplified build configuration to fix deployment issues
    target: 'es2020',
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  server: {
    host: true,
    port: 3000
  },
  esbuild: {
    // Tree-shake unused imports in dev mode  
    treeShaking: true,
    // Remove unused code in development for faster builds
    legalComments: 'none'
  }
})
