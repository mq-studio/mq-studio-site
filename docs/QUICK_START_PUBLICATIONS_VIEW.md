# Quick Start: Publications View Feature

## Testing the Feature

### 1. Start the Development Server
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev
```

### 2. Access the Publications Page
Open your browser to: **http://localhost:3100/gallery/publications**

### 3. Try the View Modes

#### Switch Between Views
Look for the view switcher in the top-right area (three icon buttons):
- **□** = Full View (single column, all details)
- **⊞** = Moderate View (3 columns, default)
- **▦** = Compact View (6 columns, minimal)

Click each icon to see the different layouts.

#### Test Persistence
1. Select "Full View"
2. Refresh the page (F5)
3. Notice: Full View is still active ✓

#### Test URL Parameters
Try these URLs:
- http://localhost:3100/gallery/publications?view=full
- http://localhost:3100/gallery/publications?view=moderate
- http://localhost:3100/gallery/publications?view=compact

Each should load the corresponding view.

#### Test Responsive Design
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Try different screen sizes:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1920px width

Notice how each view adapts its column count.

#### Test Compact View Hover
1. Switch to Compact View
2. Hover over any publication card
3. See tooltip with abstract and full details

#### Test Keyboard Navigation
1. Press Tab until ViewSwitcher is focused
2. Use Tab to move between the three buttons
3. Press Enter or Space to activate a view
4. Notice the smooth transition

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

This runs:
- ViewSwitcher component tests
- useViewPreference hook tests

### Manual Test Checklist
See comprehensive checklist at: `/tests/publications-view-test.md`

## Code Structure

### Main Components
```
/components/publications/
  ├── ViewSwitcher.tsx      # View mode toggle (3 icon buttons)
  └── PublicationCard.tsx   # Adaptive card (renders based on viewMode)

/hooks/
  └── useViewPreference.ts  # View state + localStorage + URL params

/lib/types/
  └── publications.ts       # ViewMode type definitions
```

### Key Files
- **Page:** `/app/gallery/publications/page.tsx`
- **Styles:** `/app/globals.css` (grid transitions, line-clamp utilities)
- **Spec:** `/docs/SPECIFICATIONS/SPEC-002-publications-views.md`

## Usage Example

```typescript
// In any page component
import { useViewPreference } from '@/hooks/useViewPreference';
import ViewSwitcher from '@/components/publications/ViewSwitcher';
import PublicationCard from '@/components/publications/PublicationCard';

function MyPublicationsPage() {
  const { viewMode, updateViewMode } = useViewPreference({ urlParam: 'view' });

  return (
    <div>
      {/* View Switcher */}
      <ViewSwitcher
        currentView={viewMode}
        onViewChange={updateViewMode}
      />

      {/* Publications Grid */}
      <div className={`publications-grid--${viewMode}`}>
        {publications.map(pub => (
          <PublicationCard
            key={pub.slug}
            publication={pub}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
```

## Troubleshooting

### View doesn't persist after refresh
- Check browser console for localStorage errors
- Verify localStorage is enabled in browser settings
- Clear localStorage: `localStorage.clear()` in console

### URL parameter not working
- Verify URL format: `?view=full` (not `?view=Full`)
- Valid values: `full`, `moderate`, `compact`
- Check browser console for errors

### Styles not applying
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check that Tailwind classes are compiling

### Tests failing
- Install dependencies: `npm install`
- Clear jest cache: `npm test -- --clearCache`
- Check Node version: `node --version` (should be v20+)

## Feature Highlights

### View Modes

| View | Columns (Desktop) | Use Case |
|------|-------------------|----------|
| Full | 1 | Detailed reading, research |
| Moderate | 3 | Balanced browsing (default) |
| Compact | 6 | Quick scanning, overview |

### Performance
- View switching: < 200ms ✓
- No page reload ✓
- Scroll position maintained ✓
- Zero layout shift ✓

### Accessibility
- Keyboard navigable ✓
- Screen reader friendly ✓
- ARIA labels ✓
- Focus indicators ✓

## Next Steps

1. ✅ Test all three view modes
2. ✅ Verify persistence works
3. ✅ Test responsive behavior
4. ✅ Run unit tests
5. ✅ Check accessibility
6. ⏳ Deploy to staging
7. ⏳ Final QA
8. ⏳ Deploy to production

## Documentation

- **Full Feature Docs:** `/docs/FEATURES/publications-view-refinement.md`
- **Test Plan:** `/tests/publications-view-test.md`
- **Specification:** `/docs/SPECIFICATIONS/SPEC-002-publications-views.md`
- **Implementation Summary:** `/PUBLICATIONS_VIEW_IMPLEMENTATION.md`

## Support

Questions? Check the documentation above or review the code comments in the source files.
