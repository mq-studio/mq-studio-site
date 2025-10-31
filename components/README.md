# MQ Studio Components

This directory contains reusable React components for the MQ Studio website.

## Directory Structure

```
components/
├── content/           # Content display components
├── effects/           # Visual effects and overlays
│   └── WatercolorTexture.tsx
├── media/             # Image and media components
│   ├── ImageGallery.tsx
│   └── ZoomableImage.tsx
└── search/            # Search functionality components
```

## Effects Components

### WatercolorTexture

A subtle paper-like texture overlay that creates a watercolor paper effect across the entire site.

**Features:**
- 3% opacity for subtlety
- Organic noise pattern resembling cold-press watercolor paper
- Gentle breathing animation (8-second cycle)
- Performance optimized with requestAnimationFrame
- Does not interfere with content readability or interactions

**Usage:**
```tsx
import WatercolorTexture from '@/components/effects/WatercolorTexture';

export default function Layout({ children }) {
  return (
    <body>
      <WatercolorTexture />
      {children}
    </body>
  );
}
```

**Implementation Details:**
- Uses HTML5 Canvas to generate organic noise
- Fixed position overlay with pointer-events disabled
- Multiple noise layers for organic feel
- Warm tone to match rice paper background
- Respects prefers-reduced-motion

## Media Components

### ImageGallery

A responsive image gallery with lightbox and advanced zoom capabilities.

**Features:**
- Configurable grid layout (1-4 columns)
- Click to open lightbox modal
- Pinch and scroll to zoom (1x to 5x)
- Drag to pan when zoomed
- Keyboard navigation (arrows, escape, +/-)
- Touch-friendly mobile controls
- Smooth transitions and animations
- Accessible (ARIA labels, focus management)

**Props:**
```typescript
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;  // Default: 3
  gap?: number;              // Default: 4 (Tailwind spacing)
  className?: string;
}
```

**Usage:**
```tsx
import ImageGallery from '@/components/media/ImageGallery';

const images = [
  {
    id: '1',
    src: '/images/artwork-1.jpg',
    alt: 'Artwork description',
    title: 'Artwork Title',
    description: 'Medium and year',
  },
  // ... more images
];

<ImageGallery images={images} columns={3} gap={6} />
```

**Keyboard Controls:**
- Arrow Left/Right: Navigate between images
- +/=: Zoom in
- -/_: Zoom out
- Escape: Close lightbox

**Touch Controls:**
- Tap: Open lightbox
- Pinch: Zoom in/out
- Drag: Pan when zoomed
- Swipe: Navigate (or use buttons)

**Accessibility:**
- Full keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support

### ZoomableImage

A single image component with advanced zoom capabilities, ideal for artwork detail pages.

**Features:**
- Click to toggle lightbox view
- Pinch and scroll to zoom (1x to 5x)
- Drag to pan when zoomed
- Keyboard controls (ESC, +/-)
- Touch-friendly mobile controls
- Smooth transitions
- Hover hint on inline view

**Props:**
```typescript
interface ZoomableImageProps {
  src: string;
  alt: string;
  width?: number;    // Default: 800
  height?: number;   // Default: 1000
  className?: string;
  priority?: boolean;
}
```

**Usage:**
```tsx
import ZoomableImage from '@/components/media/ZoomableImage';

<ZoomableImage
  src={artwork.highResUrl || artwork.imageUrl}
  alt={artwork.title}
  width={800}
  height={1000}
  priority
/>
```

**Keyboard Controls:**
- +/=: Zoom in
- -/_: Zoom out
- Escape: Close lightbox

**Touch Controls:**
- Tap: Open/close lightbox
- Pinch: Zoom in/out
- Drag: Pan when zoomed

## Design System Integration

All components follow the MQ Studio design system:

### Colors
- Primary interactions: `var(--moura-teal)`
- Accents: `var(--vibrant-magenta)`
- Backgrounds: `var(--rice-paper)`, `var(--studio-cream)`
- Text: `var(--ink-black)`, `var(--charcoal-wash)`
- Borders: `var(--border)`

### Typography
- Headings/UI: Montserrat (via `font-montserrat`)
- Body text: Lora (via `font-lora`)

### Responsive Behavior
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Touch-optimized controls
- Responsive grid layouts

### Accessibility Standards
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus indicators (2px solid teal)
- ARIA labels and roles
- Semantic HTML

## Performance Considerations

### WatercolorTexture
- Canvas generated once on mount
- Animation uses requestAnimationFrame
- Respects prefers-reduced-motion
- Fixed position with GPU acceleration
- Minimal reflows/repaints

### Image Components
- Uses Next.js Image for optimization
- Lazy loading for gallery grids
- Priority loading for hero images
- Appropriate image sizing
- Smooth transitions without jank

## Browser Support

All components support:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

Touch gestures tested on:
- iOS devices (iPhone, iPad)
- Android devices
- Touch-enabled laptops

## Testing

Test all components for:
1. Keyboard navigation
2. Touch gestures
3. Screen reader compatibility
4. Responsive layouts
5. Performance (no jank, smooth animations)
6. Browser compatibility

## Future Enhancements

Potential improvements:
- [ ] Image preloading for gallery navigation
- [ ] Swipe gestures for gallery navigation
- [ ] Image comparison slider
- [ ] Fullscreen API integration
- [ ] Share functionality
- [ ] Download high-res option
- [ ] Virtual scrolling for large galleries

## Contributing

When adding new components:
1. Follow the existing structure
2. Include TypeScript types
3. Add comprehensive JSDoc comments
4. Ensure accessibility standards
5. Test on multiple devices/browsers
6. Update this README

## License

Part of the MQ Studio project. All rights reserved.
