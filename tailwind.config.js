/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Luxury Enterprise
        primary: {
          900: '#1a1a1a', // Deep Charcoal
          800: '#2c2c2c', // Warm Graphite  
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#a3a3a3',
          300: '#d4d4d4',
          200: '#e5e5e5',
          100: '#f5f5f5',
          50: '#fafafa',  // Platinum White
        },
        
        // Luxury Accent Colors
        gold: {
          900: '#8b7506',
          800: '#a68914',
          700: '#b8941f',
          600: '#c7a429',
          500: '#d4af37', // Champagne Gold
          400: '#ddb955',
          300: '#e5c373',
          200: '#edcd91',
          100: '#f5d7af',
          50: '#fdf4e6',
        },
        
        // Royal Blue for Trust Elements
        royal: {
          900: '#1e3a8a', // Royal Blue
          800: '#1e40af',
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
          50: '#eff6ff',
        },
        
        // Premium Neutrals
        platinum: {
          900: '#171717',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#a3a3a3',
          300: '#d4d4d4',
          200: '#e5e5e5',
          100: '#f5f5f5',
          50: '#fafafa',
        },
        
        // Warm Accent
        copper: {
          900: '#7c2d12',
          800: '#9a3412',
          700: '#b45309', // Copper Accent
          600: '#c2410c',
          500: '#ea580c',
          400: '#f97316',
          300: '#fb923c',
          200: '#fed7aa',
          100: '#ffedd5',
          50: '#fff7ed',
        },
        
        // Silver Mist for subtle elements
        silver: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
          200: '#e5e7eb', // Silver Mist
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        
        // Warm backgrounds
        ivory: {
          50: '#f8f8f6',  // Warm Ivory
          100: '#f3f3f1',
          200: '#e8e8e4',
        }
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'display-3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      
      boxShadow: {
        'luxury': '0 2px 8px rgba(26, 26, 26, 0.08)',
        'luxury-md': '0 4px 12px rgba(26, 26, 26, 0.12)',
        'luxury-lg': '0 8px 32px rgba(26, 26, 26, 0.16)',
        'gold-glow': '0 4px 12px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 6px 20px rgba(212, 175, 55, 0.35)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        'luxury': '12px',
        'luxury-lg': '16px',
      },
      
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
}