import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Only run image optimization in production
    process.env.NODE_ENV === 'production' && viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 1
      },
      webp: { quality: 75 }
    })
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animations'
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three'
            }
            if (id.includes('swiper') || id.includes('@emailjs') || id.includes('@vercel')) {
              return 'vendor-utils'
            }
            return 'vendor-other'
          }
        },
        // Optimize asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images'
          } else if (/woff|woff2/.test(extType)) {
            extType = 'fonts'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    // Increase chunk size limit for three.js
    chunkSizeWarningLimit: 1100,
    // Use terser for better compression in production
    minify: process.env.NODE_ENV === 'production' ? 'terser' : 'esbuild',
    target: 'es2020',
    // Optimize assets
    assetsInlineLimit: 4096,
    // Enable compression
    reportCompressedSize: false,
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
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
