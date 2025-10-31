# Publications View Refinement Feature

## Overview
This feature provides three distinct view modes for the publications page, allowing users to choose their preferred level of detail when browsing publications.

## Implementation Date
October 28, 2025

## Components Created

### 1. ViewSwitcher Component
**Location:** `/components/publications/ViewSwitcher.tsx`

Icon-based toggle component that allows users to switch between three view modes:
- **Full View**: Single column with complete details
- **Moderate View**: Three-column grid (default)
- **Compact View**: Six-column grid with minimal details

**Features:**
- Keyboard accessible (Tab + Enter/Space)
- ARIA labels for screen readers
- Visual highlight for active view
- Smooth transitions

### 2. PublicationCard Component
**Location:** `/components/publications/PublicationCard.tsx`

Adaptive card component that renders publications in three different layouts based on the current view mode.

**View Modes:**

#### Full View (1 per row)
- Single column layout
- Complete abstract (no truncation)
- Full author list with affiliations
- All metadata: journal, year, volume, issue, pages, DOI
- All keywords/tags visible
- All action buttons: Read, Download PDF, Publisher Link, Copy Citation
- Type badge

#### Moderate View (3 per row) - DEFAULT
- Three-column grid (responsive: 2 on tablet, 1 on mobile)
- First 3 authors (+ "et al." if more)
- Abstract truncated to 3 lines
- Publication year and venue
- Type badge
- Action buttons: Read, Download PDF, Publisher Link

#### Compact View (6 per row)
- Six-column grid (responsive: 4 on desktop, 3 on tablet, 2 on mobile)
- Title (truncated if needed)
- First author + "et al."
- Publication year
- Type icon (single letter badge)
- Icon-only action buttons
- **Hover behavior**: Tooltip expands to show:
  - Abstract (5 lines max)
  - Full author list
  - Publication venue

### 3. useViewPreference Hook
**Location:** `/hooks/useViewPreference.ts`

Custom React hook that manages view mode state with persistence.

**Features:**
- Saves preference to localStorage
- Loads saved preference on mount
- URL parameter support (?view=full|moderate|compact)
- URL parameter overrides localStorage
- Updates URL when view changes (without page reload)
- SSR-safe (isClient flag to avoid hydration mismatches)

**Usage:**
```typescript
const { viewMode, updateViewMode, isClient } = useViewPreference({ urlParam: 'view' });
```

### 4. Type Definitions
**Location:** `/lib/types/publications.ts`

TypeScript types for view modes:
```typescript
export type ViewMode = 'full' | 'moderate' | 'compact';
export const DEFAULT_VIEW_MODE: ViewMode = 'moderate';
```

## Page Integration

### Updated Publications Page
**Location:** `/app/gallery/publications/page.tsx`

**Changes:**
1. Import new components and hook
2. Initialize view preference with `useViewPreference()`
3. Add ViewSwitcher to header (responsive positioning)
4. Replace inline publication cards with `<PublicationCard>` component
5. Apply dynamic grid classes based on view mode
6. Update loading skeleton to match current view

## Styling

### CSS Classes Added
**Location:** `/app/globals.css`

```css
/* Publications View Transitions */
.publications-grid {
  transition: all 200ms ease-in-out;
}

.publication-card {
  transition: all 200ms ease-in-out;
}

.publication-card:hover {
  transform: translateY(-2px);
}

/* Line Clamp Utilities */
.line-clamp-1, .line-clamp-2, .line-clamp-3 { /* ... */ }

/* Print Styles - Default to Full View */
@media print { /* ... */ }
```

## User Experience

### View Switching
- Click any of the three icons in the ViewSwitcher
- Transition completes in < 200ms (feels instant)
- Grid layout smoothly transitions to new column count
- Scroll position is maintained
- Preference is saved automatically

### Persistence
1. **localStorage**: View preference persists across sessions
2. **URL Parameters**: Share specific view with others
   - `/gallery/publications?view=full`
   - `/gallery/publications?view=moderate`
   - `/gallery/publications?view=compact`
3. **Default**: Moderate view for first-time visitors

### Responsive Behavior

| Breakpoint | Full | Moderate | Compact |
|------------|------|----------|---------|
| Mobile (<768px) | 1 col | 1 col | 2 cols |
| Tablet (768-1024px) | 1 col | 2 cols | 3 cols |
| Desktop (1024-1280px) | 1 col | 3 cols | 4 cols |
| XL Desktop (>1280px) | 1 col | 3 cols | 6 cols |

## Accessibility

### Keyboard Navigation
- Tab through ViewSwitcher buttons
- Enter or Space to activate
- All interactive elements keyboard accessible
- Logical tab order

### Screen Reader Support
- ARIA labels on all buttons
- `aria-pressed` states indicate active view
- `role="group"` on ViewSwitcher
- View changes announced

### Visual Accessibility
- High-contrast focus rings
- Clear active state indicators
- Sufficient color contrast ratios
- Respects `prefers-reduced-motion`

## Performance

### Optimizations
- View switching < 200ms (CSS transitions only)
- No re-fetching of data on view change
- Efficient re-renders (only grid and cards update)
- Lazy evaluation of truncated text

### Metrics
- Lighthouse Performance: Maintained
- First Contentful Paint: No regression
- Cumulative Layout Shift: Zero (no layout shift on view change)

## SEO Considerations

- All content visible to crawlers regardless of view
- Structured data maintained in all views
- No JavaScript requirement for basic display
- Print defaults to Full View (most SEO-friendly)

## Browser Support

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Testing

### Unit Tests
- **ViewSwitcher.test.tsx**: Component rendering and interactions
- **useViewPreference.test.ts**: Hook logic and persistence

### Manual Test Plan
See `/tests/publications-view-test.md` for comprehensive test checklist.

### Running Tests
```bash
npm run test:unit
```

## Future Enhancements

### Potential Improvements
1. **Virtual Scrolling**: For publications lists > 100 items
2. **Comparison Mode**: Select multiple publications to compare
3. **Reading List**: Save publications for later
4. **Analytics**: Track which view mode is most popular
5. **Export Options**: Bulk export citations from any view
6. **Custom Views**: Allow users to customize what's shown in each view

### Design Considerations
- Add publication thumbnails/figures
- Color coding for publication types
- Advanced filtering by view mode
- Sort options optimized per view

## Maintenance Notes

### Adding New Publication Fields
1. Update `Publication` interface in `/lib/types/content.ts`
2. Add field to appropriate view mode in `PublicationCard.tsx`
3. Update test data if needed

### Modifying View Layouts
1. Update grid classes in publications page
2. Update responsive breakpoints in `PublicationCard.tsx`
3. Update CSS in `globals.css`
4. Test all breakpoints

### Performance Monitoring
- Monitor view switching time with Performance API
- Track localStorage usage
- Watch for memory leaks on repeated view changes

## Known Issues
None at this time.

## Support
For questions or issues, contact the development team or file an issue in the repository.

---

**Specification Reference:** [SPEC-002: Publications View Refinement](/docs/SPECIFICATIONS/SPEC-002-publications-views.md)
