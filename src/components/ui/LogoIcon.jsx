import { motion } from 'framer-motion'

// Simplified icon version for favicons, small spaces, and social media
const LogoIcon = ({ 
  size = "32", 
  variant = "default",
  className = "",
  animate = false 
}) => {
  // Color variants
  const variants = {
    default: {
      primary: '#1a1a1a', // Deep Charcoal
      accent: '#d4af37', // Champagne Gold
      secondary: '#2c2c2c' // Warm Graphite
    },
    light: {
      primary: '#fafafa', // Platinum White
      accent: '#d4af37', // Champagne Gold
      secondary: '#e5e7eb' // Silver Mist
    },
    gold: {
      primary: '#d4af37', // Champagne Gold
      accent: '#b8941f', // Dark Gold
      secondary: '#ddb955' // Light Gold
    }
  }

  const colors = variants[variant] || variants.default

  const iconAnimation = animate ? {
    initial: { opacity: 0, rotate: -5 },
    animate: { 
      opacity: 1, 
      rotate: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  } : {}

  return (
    <motion.div 
      className={`inline-flex items-center justify-center ${className}`}
      {...iconAnimation}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        className="transition-all duration-300"
      >
        <defs>
          {/* Gold gradient */}
          <linearGradient id="iconGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={variants.gold.accent} />
          </linearGradient>
          
          {/* Premium shadow */}
          <filter id="iconShadow">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor={colors.primary} floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Geometric building representation */}
        <g transform="translate(6, 6)">
          {/* Main structure - modern geometric building */}
          <path 
            d="M2 32 L18 12 L28 20 L28 34 L2 34 Z" 
            fill={colors.primary}
            filter="url(#iconShadow)"
          />
          
          {/* Luxury accent roof */}
          <path 
            d="M2 32 L18 12 L28 20 L24 20 L18 16 L6 32 Z" 
            fill="url(#iconGoldGradient)"
          />
          
          {/* Modern windows/details */}
          <circle cx="12" cy="25" r="1.5" fill={colors.accent} opacity="0.9"/>
          <circle cx="20" cy="27" r="1.5" fill={colors.accent} opacity="0.9"/>
          
          {/* Foundation accent */}
          <rect x="2" y="32" width="26" height="2" fill={colors.accent} rx="1"/>
        </g>
        
        {/* Subtle "KS" monogram overlay */}
        <g opacity="0.15" transform="translate(16, 20)">
          <text 
            x="0" 
            y="0" 
            fontSize="8" 
            fontWeight="700" 
            fontFamily="Inter, system-ui, sans-serif"
            fill={colors.accent}
            textAnchor="middle"
          >
            KS
          </text>
        </g>
      </svg>
    </motion.div>
  )
}

export default LogoIcon