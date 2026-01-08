# Floor Highlighter Component

Production-ready React component for interactive building floor visualization with perfect perspective alignment.

## Features

- **Perfect Perspective Alignment**: SVG polygons computed via linear interpolation maintain accurate floor boundaries
- **Interactive Highlighting**: Hover/click floors from image or side menu with synchronized states
- **Responsive Design**: Percentage-based coordinates ensure alignment across all screen sizes  
- **Accessibility**: Full keyboard navigation, ARIA attributes, screen reader support
- **Calibration Mode**: Visual tool for setting up new building images
- **Smooth Animations**: CSS transitions with gradient effects and drop shadows
- **Bulgarian Localization**: All UI text in Bulgarian for real estate applications

## Quick Start

```jsx
import FloorHighlighter from './FloorHighlighter';

function App() {
  return (
    <div>
      <FloorHighlighter />
    </div>
  );
}
```

## Component Structure

- `FloorHighlighter.tsx` - Main component with SVG overlay and interaction logic
- `useFacadeBands.ts` - Hook for generating floor polygons from facade coordinates
- `demo.tsx` - Complete demo page with instructions
- `sample-floor-polygons.json` - Example output format from calibration

## How It Works

### Polygon Generation Algorithm

1. Define building facade as quadrilateral with 4 corner points (LT, RT, RB, LB)
2. Divide vertically into N floor bands using parameter t ∈ [0,1]
3. For each floor i: t₀ = i/N, t₁ = (i+1)/N
4. Interpolate along edges: L(t) = LT×(1-t) + LB×t, R(t) = RT×(1-t) + RB×t
5. Create polygon: [L(t₀), R(t₀), R(t₁), L(t₁)]
6. Apply slab padding to prevent overlap

### Key Configuration

```typescript
// Facade corner coordinates (percentages)
const DEFAULT_FACADE = {
  LT: { x: 32.0, y: 9.0 },   // Left-top
  RT: { x: 84.0, y: 28.5 },  // Right-top  
  RB: { x: 79.5, y: 81.0 },  // Right-bottom
  LB: { x: 28.0, y: 61.0 },  // Left-bottom
};

const FLOORS = 7;
const SLAB_PADDING = { topPct: 0.6, bottomPct: 0.6 };
```

## Adapting to New Buildings

### Method 1: Calibration Mode (Recommended)

1. **Enable calibration**: Set `CALIBRATION_MODE = true`
2. **Replace image**: Update `BUILDING_IMAGE` constant
3. **Set corners**: Click 4 facade corners in order: top-left → top-right → bottom-right → bottom-left  
4. **Adjust settings**: Use sliders for floor count and padding
5. **Export**: Click "Експорт JSON" to download coordinates
6. **Update code**: Replace `DEFAULT_FACADE` with exported data
7. **Disable calibration**: Set `CALIBRATION_MODE = false`

### Method 2: Manual Coordinates

Measure facade corners directly and update `DEFAULT_FACADE` with percentage coordinates relative to image dimensions.

## Interaction Features

### Mouse/Touch
- **Hover**: Highlight floor polygon and corresponding menu item
- **Click**: Select floor to show property details panel
- **Calibration**: Click corners when calibration mode enabled

### Keyboard Navigation  
- **↑/↓**: Navigate between floors
- **Enter/Space**: Select focused floor
- **Escape**: Clear selection and focus
- **Tab**: Standard focus navigation

### Accessibility
- ARIA labels and pressed states
- Screen reader announcements  
- Keyboard-only operation support
- High contrast focus indicators

## Visual Effects

- **Highlight Fill**: `rgba(255, 209, 0, 0.28)` with animated gradient sweep
- **Stroke**: `rgba(255, 209, 0, 0.9)` at 1.5-2px width
- **Glow Effect**: Soft blur using SVG filters
- **Drop Shadow**: Subtle depth separation
- **Transitions**: Smooth 250-300ms CSS transitions

## Property Data Structure

```typescript
type PropertyData = {
  imot: string;        // Property ID
  vid: string;         // Type (Двустаен, Тристаен)
  zastroyena: string;  // Built area
  obshta: string;      // Total area  
  izlozhenie: string;  // Exposure direction
  status: string;      // Status (Свободен, Резервиран, Продаден)
};
```

## Technical Requirements

- **React**: Functional components with hooks
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety
- **No External Dependencies**: Pure CSS animations, no animation libraries

## Browser Support

- Modern browsers with SVG support
- Mobile responsive design
- Touch interaction support
- High DPI display optimization

## Performance Considerations

- Percentage coordinates prevent layout recalculations
- SVG rendering is GPU-accelerated
- Event delegation for polygon interactions
- Memoized polygon calculations via `useMemo`

## Customization

### Colors
Update CSS custom properties or Tailwind classes:
```css
--highlight-color: rgba(255, 209, 0, 0.28);
--stroke-color: rgba(255, 209, 0, 0.9);
```

### Animation Timing
Modify transition durations in component classes:
```jsx
className="transition-all duration-250"
```

### Floor Data
Replace `MOCK_PROPERTIES` with real property database integration.

## Export Format

Calibration exports this JSON structure:

```json
{
  "facade": {
    "LT": { "x": 32.0, "y": 9.0 },
    "RT": { "x": 84.0, "y": 28.5 },
    "RB": { "x": 79.5, "y": 81.0 },
    "LB": { "x": 28.0, "y": 61.0 }
  },
  "floors": 7,
  "slabPadding": { "topPct": 0.6, "bottomPct": 0.6 },
  "polygons": [
    [
      { "x": 32.02, "y": 9.31 },
      { "x": 84.02, "y": 28.81 },
      { "x": 83.27, "y": 38.94 },
      { "x": 31.27, "y": 19.44 }
    ]
    // ... more floor polygons
  ]
}
```

## React + Vite Setup

This project uses Vite for fast development and building. Available scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT License - feel free to use in commercial real estate projects.
# Deployment trigger Thu Dec 12 19:35:00 EET 2024 - Testing Vercel connection
