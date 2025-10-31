# Publications View Refinement - Test Plan

## Test Overview
This document outlines the testing approach for the Publications View Refinement feature (SPEC-002).

## Manual Testing Checklist

### 1. View Mode Switching
- [ ] Click on Full View icon - publications display in single column
- [ ] Click on Moderate View icon - publications display in 3-column grid
- [ ] Click on Compact View icon - publications display in 6-column grid
- [ ] View switching completes in < 200ms (feels instant)
- [ ] Active view mode is visually highlighted in ViewSwitcher
- [ ] No console errors during view switching

### 2. View Persistence (localStorage)
- [ ] Select Full View and refresh page - Full View persists
- [ ] Select Compact View and refresh page - Compact View persists
- [ ] Select Moderate View and refresh page - Moderate View persists
- [ ] Open in new tab - last selected view is active
- [ ] Clear localStorage and refresh - defaults to Moderate View

### 3. URL Parameter Support
- [ ] Visit `/gallery/publications?view=full` - Full View loads
- [ ] Visit `/gallery/publications?view=moderate` - Moderate View loads
- [ ] Visit `/gallery/publications?view=compact` - Compact View loads
- [ ] URL parameter overrides localStorage preference
- [ ] URL updates when view is changed via ViewSwitcher
- [ ] Invalid view parameter defaults to Moderate

### 4. Full View Mode
- [ ] Single column layout
- [ ] All metadata visible (authors, journal, year, volume, issue, pages, DOI)
- [ ] Complete abstract displayed (no truncation)
- [ ] All keywords/tags shown
- [ ] All action buttons present (Read, Download, Publisher, Copy Citation)
- [ ] Copy Citation button works
- [ ] Type badge displayed
- [ ] Proper spacing and readability

### 5. Moderate View Mode (Default)
- [ ] Three columns on desktop
- [ ] Two columns on tablet
- [ ] Single column on mobile
- [ ] First 3 authors shown with "et al." if more
- [ ] Abstract truncated to 3 lines
- [ ] Publication year and venue visible
- [ ] Type badge displayed
- [ ] Action buttons (Read, PDF, Publisher) present and functional

### 6. Compact View Mode
- [ ] 6 columns on desktop (xl breakpoint)
- [ ] 4 columns on large desktop
- [ ] 3 columns on tablet
- [ ] 2 columns on mobile
- [ ] Title visible (truncated if needed)
- [ ] First author + "et al." shown
- [ ] Publication year visible
- [ ] Type icon displayed
- [ ] Small icon buttons functional
- [ ] Hover reveals abstract tooltip
- [ ] Tooltip shows full author list
- [ ] Tooltip shows publication venue
- [ ] Tooltip positioned correctly (doesn't go off-screen)

### 7. Responsive Behavior
- [ ] Desktop (1920px): All view modes work correctly
- [ ] Tablet (768px): Column counts adjust appropriately
- [ ] Mobile (375px): Readable layouts in all views
- [ ] ViewSwitcher responsive (centered on mobile, right-aligned on desktop)
- [ ] Category filters wrap properly on mobile
- [ ] No horizontal scrolling at any breakpoint

### 8. Keyboard Accessibility
- [ ] Tab through ViewSwitcher buttons
- [ ] Enter/Space activates view mode change
- [ ] Focus visible on all interactive elements
- [ ] Focus ring high-contrast and clear
- [ ] Tab order logical (categories → view switcher → publications)
- [ ] No keyboard traps
- [ ] Hover tooltips accessible via focus (compact view)

### 9. Screen Reader Support
- [ ] ViewSwitcher has proper ARIA labels
- [ ] View mode change announced to screen reader
- [ ] aria-pressed states correct on view buttons
- [ ] Publication cards have semantic structure
- [ ] Links and buttons have descriptive labels

### 10. Transitions & Animations
- [ ] Grid layout transition smooth (200ms)
- [ ] Card hover effect smooth (translateY)
- [ ] No layout shift during view switch
- [ ] Scroll position maintained after view change
- [ ] Respects prefers-reduced-motion
- [ ] No flickering or janky animations

### 11. Filter Integration
- [ ] View mode persists when changing categories
- [ ] Publications filter correctly in all view modes
- [ ] Empty state displays properly
- [ ] Loading state shows appropriate skeleton for current view mode

### 12. Print Functionality
- [ ] Print automatically uses Full View
- [ ] ViewSwitcher hidden in print
- [ ] Categories hidden in print
- [ ] Page breaks avoid splitting cards
- [ ] Readable print output

### 13. No-JavaScript Fallback
- [ ] Publications display in Moderate View without JS
- [ ] ViewSwitcher not visible without JS
- [ ] Basic layout functional
- [ ] All content accessible

### 14. Cross-Browser Testing
- [ ] Chrome/Edge: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] No console errors in any browser

### 15. Performance
- [ ] View switching < 200ms
- [ ] No noticeable lag with 50+ publications
- [ ] Smooth scrolling
- [ ] No memory leaks on repeated view changes
- [ ] Lighthouse performance score maintained

## Automated Test Script

```javascript
// Test localStorage persistence
describe('Publications View Persistence', () => {
  test('saves view preference to localStorage', () => {
    // Set view mode to 'full'
    // Check localStorage contains 'full'
  });

  test('loads saved view preference on page load', () => {
    // Set localStorage to 'compact'
    // Reload page
    // Verify compact view is active
  });

  test('URL parameter overrides localStorage', () => {
    // Set localStorage to 'full'
    // Visit with ?view=compact
    // Verify compact view is active
  });
});

describe('View Mode Rendering', () => {
  test('full view displays single column', () => {
    // Switch to full view
    // Verify grid has grid-cols-1
  });

  test('moderate view displays three columns', () => {
    // Switch to moderate view
    // Verify grid has lg:grid-cols-3
  });

  test('compact view displays six columns', () => {
    // Switch to compact view
    // Verify grid has xl:grid-cols-6
  });
});
```

## Known Issues / Edge Cases
- [ ] Test with very long publication titles
- [ ] Test with publications missing abstracts
- [ ] Test with single author vs. many authors
- [ ] Test with missing DOI/PDF links
- [ ] Test rapid view switching (debouncing)
- [ ] Test with browser zoom at 200%

## Success Criteria
All checkboxes above must be checked for feature to be considered complete and ready for deployment.

## Test Date: ___________
## Tester: ___________
## Results: ___________
