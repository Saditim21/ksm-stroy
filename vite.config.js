import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          ui: ['swiper', 'react-hook-form']
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
    // Enable minification (esbuild is faster than terser)
    minify: 'esbuild',
    target: 'es2015'
  },
  server: {
    host: true,
    port: 3000
  }
})
