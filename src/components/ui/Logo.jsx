import { motion } from 'framer-motion'

const Logo = ({ 
  width = "auto", 
  height = "40", 
  variant = "default", 
  className = "",
  animate = false 
}) => {
  // Logo variants for different contexts
  const variants = {
    // Default: Dark charcoal with gold accent
    default: {
      primary: '#1a1a1a', // Deep Charcoal
      accent: '#d4af37', // Champagne Gold
      secondary: '#2c2c2c' // Warm Graphite
    },
    // Light: For dark backgrounds
    light: {
      primary: '#fafafa', // Platinum White
      accent: '#d4af37', // Champagne Gold
      secondary: '#e5e7eb' // Silver Mist
    },
    // Gold: Premium version
    gold: {
      primary: '#d4af37', // Champagne Gold
      accent: '#b8941f', // Dark Gold
      secondary: '#ddb955' // Light Gold
    },
    // Monochrome: For special contexts
    mono: {
      primary: '#1a1a1a',
      accent: '#525252',
      secondary: '#737373'
    }
  }

  const colors = variants[variant] || variants.default

  const logoAnimation = animate ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  } : {}

  return (
    <motion.div 
      className={`inline-flex items-center ${className}`}
      {...logoAnimation}
    >
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 240 60" 
        className="transition-all duration-300"
      >
        <defs>
          {/* Gold gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={variants.gold.accent} />
          </linearGradient>
          
          {/* Building shadow */}
          <filter id="buildingShadow">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor={colors.primary} floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Building Icon - Modern geometric representation */}
        <g transform="translate(0, 8)">
          {/* Main building structure */}
          <path 
            d="M5 35 L25 15 L35 25 L35 40 L5 40 Z" 
            fill={colors.primary}
            filter="url(#buildingShadow)"
          />
          
          {/* Building accent roof */}
          <path 
            d="M5 35 L25 15 L35 25 L30 25 L25 20 L10 35 Z" 
            fill="url(#goldGradient)"
          />
          
          {/* Windows - representing precision and detail */}
          <rect x="12" y="28" width="3" height="3" fill={colors.accent} opacity="0.8"/>
          <rect x="18" y="28" width="3" height="3" fill={colors.accent} opacity="0.8"/>
          <rect x="24" y="30" width="3" height="3" fill={colors.accent} opacity="0.8"/>
          
          {/* Foundation line */}
          <line x1="5" y1="40" x2="35" y2="40" stroke={colors.accent} strokeWidth="2"/>
        </g>
        
        {/* Company Text */}
        <g transform="translate(50, 12)">
          {/* KSM */}
          <text 
            x="0" 
            y="20" 
            fontSize="24" 
            fontWeight="700" 
            fontFamily="Inter, system-ui, sans-serif"
            fill={colors.primary}
            letterSpacing="-0.02em"
          >
            KSM
          </text>
          
          {/* Stroy */}
          <text 
            x="0" 
            y="42" 
            fontSize="16" 
            fontWeight="600" 
            fontFamily="Inter, system-ui, sans-serif"
            fill={colors.accent}
            letterSpacing="0.05em"
          >
            STROY
          </text>
        </g>
        
        {/* Luxury accent line */}
        <line 
          x1="50" 
          y1="32" 
          x2="140" 
          y2="32" 
          stroke="url(#goldGradient)" 
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  )
}

export default Logo