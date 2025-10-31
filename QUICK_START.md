# Quick Start Guide - Visual Enhancements

## What's New

Two major visual enhancements have been added to the MQ Studio website:

1. **Watercolor Texture Overlay** - A subtle paper-like texture that enhances the watercolor aesthetic
2. **Image Gallery with Zoom** - Advanced image viewing with zoom, pan, and keyboard navigation

## Try It Out

### 1. View the Gallery Demo

```bash
npm run dev
# Visit: http://localhost:3000/gallery
```

The gallery demo page showcases:
- Multiple layout options (2, 3, 4 columns)
- Full zoom and navigation features
- Usage instructions
- Sample watercolor artwork

### 2. Test the Watercolor Texture

The texture is automatically active on all pages:
- Very subtle (3% opacity)
- Gentle breathing animation
- Doesn't interfere with content

You can see it on:
- Homepage: http://localhost:3000
- Gallery: http://localhost:3000/gallery
- Any artwork page: http://localhost:3000/artworks/[slug]

### 3. Test Artwork Zoom

Visit any artwork detail page to see the enhanced zoom:
- Click the image to open zoom view
- Scroll to zoom in/out
- Drag to pan when zoomed
- Press ESC to close

## Controls Reference

### Desktop
- **Click** image to open lightbox
- **Scroll** to zoom in/out
- **Click and drag** to pan (when zoomed)
- **Arrow keys** to navigate between images
- **+ / -** keys to zoom
- **ESC** to close

### Mobile/Touch
- **Tap** image to open lightbox
- **Pinch** to zoom in/out
- **Drag** to pan (when zoomed)
- **Swipe** or use buttons to navigate
- **Tap X** to close

## Using the Components

### Add Gallery to a Page

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
  // Add more images...
];

export default function MyGalleryPage() {
  return <ImageGallery images={images} columns={3} gap={6} />;
}
```

### Add Zoomable Image to Detail Page

```tsx
import ZoomableImage from '@/components/media/ZoomableImage';

export default function DetailPage() {
  return (
    <ZoomableImage
      src="/images/high-res-artwork.jpg"
      alt="Artwork title"
      width={800}
      height={1000}
      priority
    />
  );
}
```

### Customize the Watercolor Texture

Edit `/components/effects/WatercolorTexture.tsx`:
- Adjust opacity (line ~100)
- Change animation cycle duration (line ~85)
- Modify noise pattern weights (lines ~60-70)

## File Locations

```
/components/
  /effects/
    WatercolorTexture.tsx          # Texture overlay component
  /media/
    ImageGallery.tsx               # Multi-image gallery
    ZoomableImage.tsx              # Single image zoom
  README.md                        # Full component docs

/app/
  layout.tsx                       # ✓ WatercolorTexture integrated
  /gallery/
    page.tsx                       # Gallery demo page
  /artworks/[slug]/
    page.tsx                       # ✓ ZoomableImage integrated
```

## Documentation

- **Component Docs**: `/components/README.md`
- **Implementation Details**: `/IMPLEMENTATION_SUMMARY.md`
- **Architecture**: `/ARCHITECTURE.md`

## Common Customizations

### Change Gallery Columns

```tsx
<ImageGallery images={images} columns={4} /> // 4 columns
<ImageGallery images={images} columns={2} /> // 2 columns
```

### Adjust Gallery Spacing

```tsx
<ImageGallery images={images} gap={8} /> // More space
<ImageGallery images={images} gap={2} /> // Less space
```

### Adjust Zoom Limits

Edit the zoom calculation in `ImageGallery.tsx` or `ZoomableImage.tsx`:

```tsx
const newZoom = Math.max(1, Math.min(5, prevZoom + delta));
//                        ^          ^
//                      Min zoom   Max zoom
```

### Change Texture Opacity

Edit `WatercolorTexture.tsx`:

```tsx
style={{
  opacity: 0.03,  // Change to 0.05 for more visible, 0.01 for more subtle
  // ...
}}
```

## Troubleshooting

### Texture Not Visible
- It's very subtle (3% opacity) by design
- Check browser console for Canvas errors
- Verify it's included in `app/layout.tsx`

### Images Not Loading
- Check image paths are correct
- Verify Next.js Image optimization is working
- Check browser console for errors

### Zoom Not Working
- Verify browser supports touch events (mobile)
- Check for JavaScript errors in console
- Try disabling other browser extensions

### Performance Issues
- Check image sizes (should be optimized)
- Verify animations run at 60fps
- Test on actual devices, not just emulators

## Browser Testing

Minimum testing checklist:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Focus indicators visible
- [ ] Respects prefers-reduced-motion
- [ ] All controls are labeled

## Next Steps

1. Replace placeholder images in gallery demo with actual artwork
2. Test on actual mobile devices
3. Verify performance on slower connections
4. Get user feedback on texture subtlety
5. Adjust zoom limits if needed

## Support

For issues or questions:
1. Check `/components/README.md` for detailed docs
2. Review inline comments in component files
3. Test on `/app/gallery/page.tsx` demo page
4. Check browser console for errors

## Performance Tips

- Use appropriately sized images (not too large)
- Enable Next.js Image optimization
- Test on slower devices/connections
- Monitor animation frame rates
- Lazy load images below the fold

---

**Quick Links:**
- Gallery Demo: `/app/gallery/page.tsx`
- Component Docs: `/components/README.md`
- Implementation: `/IMPLEMENTATION_SUMMARY.md`
- Architecture: `/ARCHITECTURE.md`
