import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
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
    ]
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer': ['framer-motion'],
        }
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
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
