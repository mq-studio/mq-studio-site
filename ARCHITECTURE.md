# MQ Studio Visual Enhancements Architecture

## Component Hierarchy

```
app/layout.tsx
├── WatercolorTexture (Fixed overlay, z-index: 1)
│   └── Canvas-based organic noise texture
│       └── Gentle breathing animation
└── {children} (All page content, z-index: auto)
    ├── app/page.tsx (Homepage)
    ├── app/gallery/page.tsx (Gallery demo)
    │   └── ImageGallery Component
    │       ├── Grid of thumbnail images
    │       └── Lightbox Modal (z-index: 50)
    │           ├── Zoomable image viewer
    │           ├── Navigation controls
    │           └── Zoom controls
    └── app/artworks/[slug]/page.tsx (Artwork detail)
        └── ZoomableImage Component
            ├── Inline image preview
            └── Lightbox Modal (z-index: 50)
                ├── Zoomable image viewer
                └── Zoom controls
```

## Visual Layer Stack

```
┌─────────────────────────────────────┐
│  Lightbox Modal (z-index: 50)       │  ← Topmost: Image viewer
│  - Dark background overlay          │
│  - Zoomable image                   │
│  - Controls and UI                  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Page Content (z-index: auto)       │  ← Middle: Regular content
│  - Headers, navigation              │
│  - Text, images, galleries          │
│  - Interactive elements             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Watercolor Texture (z-index: 1)    │  ← Bottom: Subtle background
│  - Fixed position overlay           │
│  - 3% opacity                       │
│  - Pointer events disabled          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Body Background                     │  ← Base: Rice paper color
│  - var(--rice-paper) #FDFCF8        │
└─────────────────────────────────────┘
```

## Component Data Flow

### ImageGallery

```
Parent Component
    │
    ├─> images: GalleryImage[]
    ├─> columns: 1|2|3|4
    ├─> gap: number
    └─> className: string
        │
        ▼
    ImageGallery Component
        │
        ├─> State Management
        │   ├─ lightboxOpen: boolean
        │   ├─ currentIndex: number
        │   ├─ zoom: number (1-5)
        │   ├─ position: {x, y}
        │   └─ isDragging: boolean
        │
        ├─> Event Handlers
        │   ├─ Mouse: wheel, down, move, up
        │   ├─ Touch: start, move
        │   └─ Keyboard: arrows, +/-, ESC
        │
        └─> Render
            ├─ Grid (thumbnails)
            └─ Lightbox Modal
                ├─ Close button
                ├─ Navigation buttons
                ├─ Zoom controls
                ├─ Image container
                └─ Image info
```

### ZoomableImage

```
Parent Component
    │
    ├─> src: string
    ├─> alt: string
    ├─> width: number
    ├─> height: number
    └─> priority: boolean
        │
        ▼
    ZoomableImage Component
        │
        ├─> State Management
        │   ├─ isLightboxOpen: boolean
        │   ├─ zoom: number (1-5)
        │   ├─ position: {x, y}
        │   └─ isDragging: boolean
        │
        ├─> Event Handlers
        │   ├─ Mouse: wheel, down, move, up
        │   ├─ Touch: start, move
        │   └─ Keyboard: +/-, ESC
        │
        └─> Render
            ├─ Inline image (clickable)
            └─ Lightbox Modal
                ├─ Close button
                ├─ Zoom controls
                └─ Image container
```

### WatercolorTexture

```
Layout Component
    │
    ▼
WatercolorTexture Component
    │
    ├─> Canvas Setup
    │   ├─ Size: window dimensions
    │   └─ Context: 2D
    │
    ├─> Texture Generation
    │   ├─ Noise Layer 1 (40% weight)
    │   ├─ Noise Layer 2 (30% weight)
    │   └─ Noise Layer 3 (30% weight)
    │
    ├─> Animation Loop
    │   └─ requestAnimationFrame
    │       └─ Gentle scale transform
    │           └─ 8-second sine wave cycle
    │
    └─> Render
        └─ Fixed canvas overlay
            ├─ Opacity: 3%
            ├─ Mix-blend-mode: multiply
            └─ Pointer-events: none
```

## Interaction Flow

### Gallery Navigation Flow

```
User Action              Component Response               Visual Feedback
───────────────────────────────────────────────────────────────────────
Click thumbnail    →     Open lightbox                    Fade in modal
                         Set currentIndex                 Display image
                         Reset zoom to 1x                 Show controls
                         Lock body scroll

Scroll wheel       →     Adjust zoom level               Scale image
                         Update zoom state (1-5x)        Update % display
                         Adjust pan position             Smooth transform

Click/drag         →     If zoomed: pan image            Move image
                         Update position {x,y}           Cursor: grab/grabbing
                         Track drag delta

Arrow key          →     Navigate images                 Fade transition
                         Update currentIndex             New image loads
                         Reset zoom/position             Update counter

ESC key            →     Close lightbox                  Fade out modal
                         Reset all state                 Restore scroll
                         Clear zoom/position
```

### Zoom Interaction Flow

```
Input Method         Detection                    Zoom Calculation
─────────────────────────────────────────────────────────────────────
Mouse wheel          e.deltaY                     delta = ±0.2
                     → up: positive               newZoom = clamp(zoom + delta, 1, 5)
                     → down: negative

Pinch gesture        2 touches                    delta = distance change / 100
                     → distance calculation       newZoom = clamp(zoom + delta, 1, 5)
                     → delta from start

+/- keys             keyboard event               delta = ±0.3
                     → '+' or '='                 newZoom = clamp(zoom + delta, 1, 5)
                     → '-' or '_'

Zoom buttons         click event                  delta = ±0.3
                     → + button                   newZoom = clamp(zoom + delta, 1, 5)
                     → - button

Reset button         click event                  zoom = 1, position = {0, 0}
```

## Performance Optimizations

### WatercolorTexture
```
┌─────────────────────────────────────┐
│ Component Mount                      │
│  └─> Generate texture once          │ ← One-time operation
│      (Canvas pixel manipulation)     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Animation Loop                       │
│  └─> requestAnimationFrame          │ ← 60fps, GPU accelerated
│      └─> CSS transform only         │ ← No layout/paint
│          (scale 0.97-1.0)            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Window Resize                        │
│  └─> Debounced regeneration         │ ← Minimal reflows
│      (via resize event)              │
└─────────────────────────────────────┘
```

### Image Components
```
┌─────────────────────────────────────┐
│ Next.js Image Optimization           │
│  ├─> Automatic srcset                │
│  ├─> Lazy loading (gallery)         │
│  ├─> Priority loading (hero)        │
│  └─> WebP/AVIF format               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Transform Operations                 │
│  └─> CSS transforms (GPU)           │ ← No layout thrashing
│      ├─> translate(x, y)            │
│      └─> scale(zoom)                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ State Updates                        │
│  └─> Batched React updates          │ ← Minimal re-renders
│      └─> Local state only           │
└─────────────────────────────────────┘
```

## Accessibility Flow

```
Keyboard User Journey:
┌─────────────────────────────────────┐
│ 1. Tab to thumbnail                 │
│    └─> Focus ring visible           │
│        (2px solid teal)              │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 2. Press Enter/Space                │
│    └─> Open lightbox                │
│        └─> Focus trapped in modal   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 3. Use arrow keys                   │
│    └─> Navigate images              │
│        └─> Screen reader announces  │
│            "Image X of Y"            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 4. Use +/- keys                     │
│    └─> Zoom in/out                  │
│        └─> Announces zoom level     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 5. Press ESC                        │
│    └─> Close lightbox               │
│        └─> Return focus to trigger  │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile (< 640px)
├─ Gallery: 1 column
├─ Lightbox: Full screen
├─ Touch controls: Primary
└─ Zoom controls: Bottom bar

Tablet (640px - 1024px)
├─ Gallery: 2-3 columns
├─ Lightbox: Full screen with padding
├─ Touch + mouse: Both supported
└─ Zoom controls: Bottom bar

Desktop (> 1024px)
├─ Gallery: 3-4 columns
├─ Lightbox: Full screen with margins
├─ Mouse controls: Primary
├─ Keyboard shortcuts: Available
└─ Zoom controls: Bottom bar + wheel
```

## Error Handling

```
Image Loading Error
    │
    ├─> Next.js Image onError
    │   └─> Fallback to placeholder
    │       └─> Display error message
    │
Canvas Not Supported
    │
    ├─> Check for getContext('2d')
    │   └─> Graceful degradation
    │       └─> Component doesn't render
    │
Touch Events Not Supported
    │
    ├─> Feature detection
    │   └─> Fall back to mouse events
    │       └─> Disable pinch zoom
```

## Integration Points

```
Existing Codebase
    │
    ├─> app/layout.tsx
    │   └─> WatercolorTexture added
    │       └─> Renders on all pages
    │
    ├─> app/artworks/[slug]/page.tsx
    │   └─> ZoomableImage replaces
    │       └─> Simple click-to-zoom
    │
    └─> New: app/gallery/page.tsx
        └─> ImageGallery demo
            └─> Showcases component
```

## Component Communication

```
No Props Drilling:
- Components use local state
- No global state management needed
- Parent only passes configuration

Event Flow:
Parent → Props → Component → Local State → User Actions → State Updates → Re-render

Data Flow:
Images[] → Gallery → Lightbox → Display
     ↓         ↓         ↓
   Props    State    Render
```

---

This architecture provides a clear separation of concerns, optimal performance, and maintainable code structure.
