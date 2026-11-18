import plugin from 'tailwindcss/plugin'
import { PALETTE } from './src/styles/palette.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // SplitText makes its line masks at runtime (src/motion/useReveals.js), so
  // no source names their class: keep their rule (src/styles/diptych.css).
  safelist: ['split-line-mask'],
  // Tailwind's hover: utilities only where a pointer can hover (spec §2.2), so
  // a tap never leaves a hover state behind. Hand-written CSS gates its own.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    // Tailwind's screens, plus `split`: from 901 px a section's two halves sit
    // side by side; below that they stack (spec §2.2).
    screens: {
      sm: '640px',
      md: '768px',
      split: '901px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Diptych (src/styles/palette.js, spec §2.1).
      colors: { ...PALETTE },

      // KSM Display is Cormorant Garamond, KSM Text is Manrope (spec §3.1;
      // src/styles/fonts.css), each followed by its metric-matched fallbacks.
      // src/index.css names the same stacks as --serif and --sans.
      fontFamily: {
        'display': ['"KSM Display"', '"KSM Display Fallback Georgia"', '"KSM Display Fallback Times"', '"KSM Display Fallback Noto"', 'serif'],
        'text': ['"KSM Text"', '"KSM Text Fallback Segoe"', '"KSM Text Fallback Arial"', '"KSM Text Fallback Roboto"', 'sans-serif'],
      },

      // Diptych's roles (spec §3.2).
      fontSize: {
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['13px', { lineHeight: '1.5' }],
        'label': ['13px', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'h3': ['clamp(30px, 2.6vw, 44px)', { lineHeight: '1.05' }],
        'h2': ['clamp(40px, 4.6vw, 76px)', { lineHeight: '1' }],
        'display': ['clamp(44px, 7.6vw, 120px)', { lineHeight: '0.98' }],
        'count': ['clamp(40px, 3.6vw, 60px)', { lineHeight: '0.9' }],
      },

      borderRadius: {
        'ui': '2px',
      },

      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'power3-out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },

      animation: {
        // HeroTitle's load moment (src/components/ui/HeroTitle.jsx): each line
        // rises out of its mask, --i lines times 60 ms late, held below its
        // mask until its turn. Used only as js:animate-hero-rise.
        'hero-rise': 'hero-rise 900ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i, 0) * 60ms) backwards',
      },

      keyframes: {
        'hero-rise': {
          from: { transform: 'translateY(105%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // `js:`, for CSS motion: a utility that applies only once the motion gate
    // has marked <html> (src/utils/motionGate.js; spec §5.2), so its hidden
    // starting state exists only where the motion runs. The reduced-motion
    // media query alone cannot see Save-Data.
    plugin(({ addVariant }) => addVariant('js', ':root.js &')),
  ],
}
