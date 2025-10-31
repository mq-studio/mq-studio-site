# SPEC-002: Publications View Refinement

**Status**: 🟡 Draft
**Created**: 2025-10-27
**Author**: Meta-Orchestrator
**Feature Type**: Enhancement

## 1. Feature Overview

### What
Provide three distinct view modes for the publications page, allowing users to choose their preferred level of detail: Fully Detailed Cards (one per row), Moderately Detailed Cards (three per row, current), and Compact Cards (minimal info with hover effects).

### Why
- Different users have different information needs and browsing patterns
- Researchers may want full abstracts visible, while others prefer quick scanning
- Mobile users benefit from compact views
- Improved information density options enhance user experience

## 2. User Stories

### Researchers/Academics
- **As** a researcher, **I want to** see full abstracts and metadata **so that** I can quickly assess relevance without clicking through
- **As** an academic, **I want to** export citation information easily **so that** I can add references to my work

### Students
- **As** a student, **I want to** quickly scan many publications **so that** I can find relevant papers for my research
- **As** a mobile user, **I want to** switch to compact view **so that** I can browse efficiently on my phone

### General Visitors
- **As** a visitor, **I want to** choose my preferred view **so that** I can browse in the way that suits me best
- **As** a returning user, **I want to** have my view preference remembered **so that** I don't have to reset it each visit

## 3. Functional Requirements

### 3.1 View Modes

#### A. Fully Detailed Cards (1 per row)
- **Layout**: Single column, full width
- **Content Displayed**:
  - Title (large, prominent)
  - Full author list with affiliations
  - Complete abstract (no truncation)
  - Publication venue, date, volume, issue, pages
  - Publication type badge
  - Keywords/tags
  - Citation count (if available)
  - Metrics (downloads, views if tracked)
- **Actions**:
  - Read Full Paper button
  - Download PDF button
  - View on Publisher Site button
  - Copy Citation button
  - Share button

#### B. Moderately Detailed Cards (3 per row) - CURRENT DEFAULT
- **Layout**: Three column grid (responsive: 2 on tablet, 1 on mobile)
- **Content Displayed**:
  - Title
  - First 3 authors (+ "et al." if more)
  - Truncated abstract (3 lines)
  - Publication year and venue
  - Publication type badge
- **Actions**:
  - Read Full Paper button
  - Download PDF button
  - View on Publisher Site link

#### C. Compact Cards (Multiple per row)
- **Layout**: Flexible grid (4-6 per row desktop, 2-3 tablet, 1-2 mobile)
- **Content Displayed**:
  - Title (truncated if needed)
  - First author + "et al."
  - Publication year
  - Publication type icon
  - One-line description/excerpt
- **Hover Behavior**:
  - Expand to show abstract in tooltip
  - Reveal full author list
  - Show publication venue
- **Actions**:
  - Small icon buttons for all actions
  - Expand icon to view as full card

### 3.2 View Switching
- **Toggle Location**: Top right of publications section
- **Toggle Type**: Icon-based selector (grid icons)
- **Persistence**: Save preference in localStorage
- **Animation**: Smooth transition between views
- **URL Parameter**: Support ?view=full|moderate|compact

### 3.3 Responsive Behavior
- **Mobile**: Automatically switch to most appropriate view
- **Tablet**: Adjust column counts
- **Desktop**: Full control over all three views
- **Print**: Default to fully detailed view

## 4. Non-Functional Requirements

### 4.1 Performance
- View switching < 200ms
- Initial load optimized for moderate view (current default)
- Lazy load images/assets in compact view
- Virtual scrolling for large publication lists (>50 items)

### 4.2 Accessibility
- Keyboard navigation between cards
- View switcher keyboard accessible
- Screen reader announces view changes
- Maintain focus position during view switch
- Hover tooltips accessible via focus

### 4.3 SEO
- All content visible to crawlers regardless of view
- Structured data maintained in all views
- No JavaScript requirement for basic display

## 5. Technical Constraints

### Current Implementation
- MDX-based publication entries
- Tailwind CSS styling
- React components for cards
- No state management library currently

### Data Structure
- Publications stored as MDX files
- Metadata in frontmatter
- Abstract in content body
- File-based, no database

## 6. Acceptance Criteria

### Core Functionality
- [ ] Three view modes implemented and functional
- [ ] View switcher UI present and working
- [ ] Preference persistence works
- [ ] All publication data accessible in each view
- [ ] Responsive breakpoints correct
- [ ] Smooth transitions between views
- [ ] No layout shift during switch

### View-Specific
- [ ] Fully detailed shows complete information
- [ ] Moderate view matches current design
- [ ] Compact view hover reveals abstract
- [ ] All action buttons functional in all views
- [ ] Mobile optimization works

### Quality
- [ ] Performance targets met
- [ ] Accessibility standards met
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] No JavaScript errors in console
- [ ] Graceful degradation without JavaScript

## 7. Meta-Orchestrator Clarification Questions

### Design Decisions
1. **Default View**: Should moderate remain default, or detect based on device?
2. **Hover Behavior**: Tooltip vs. inline expansion for compact view?
3. **Icon Design**: Custom icons or use existing icon library?
4. **Transition Style**: Fade, slide, or morph animation?
5. **Color Coding**: Different colors for publication types?

### Data Questions
1. **Metrics**: Are view/download counts available to display?
2. **Citations**: Is citation count data available?
3. **Thumbnails**: Should we show publication thumbnails/figures?
4. **Sorting**: How should publications be ordered in each view?
5. **Filtering**: Should view preference affect filter options?

### Feature Scope
1. **Search Integration**: How does search work with different views?
2. **Export Options**: Bulk export citations from compact view?
3. **Comparison Mode**: Select multiple publications to compare?
4. **Reading List**: Save publications for later?
5. **Analytics**: Track which view is most popular?

## 8. Implementation Notes

### Component Structure
```typescript
interface ViewMode = 'full' | 'moderate' | 'compact';

interface PublicationCardProps {
  publication: Publication;
  viewMode: ViewMode;
  onViewDetails?: () => void;
}

interface PublicationsGridProps {
  publications: Publication[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}
```

### State Management
```typescript
// View preference hook
const useViewPreference = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('moderate');

  useEffect(() => {
    const saved = localStorage.getItem('publicationViewMode');
    if (saved) setViewMode(saved as ViewMode);
  }, []);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('publicationViewMode', mode);
  };

  return { viewMode, updateViewMode };
};
```

### CSS Considerations
```scss
// Grid layouts for each view
.publications-grid {
  &--full {
    @apply grid grid-cols-1 gap-8;
  }

  &--moderate {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &--compact {
    @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4;
  }
}
```

## 9. Migration Strategy

### From Current Implementation
1. **Phase 1**: Refactor current cards as "moderate" view
2. **Phase 2**: Add view switcher UI (non-functional)
3. **Phase 3**: Implement fully detailed view
4. **Phase 4**: Implement compact view
5. **Phase 5**: Wire up view switching and persistence
6. **Phase 6**: Add animations and polish

### Backwards Compatibility
- Current moderate view remains unchanged
- No breaking changes to publication data structure
- Existing URLs continue to work
- SEO/meta tags unaffected

## 10. Success Metrics

- View mode usage distribution
- Time spent on publications page (increase expected)
- Click-through rate to full papers
- Mobile engagement improvement
- User feedback on preference
- Page performance metrics maintained

## 11. Mockup References

### View Switcher Icons
```
[□] Full    [⊞] Moderate    [▦] Compact
```

### Layout Visualization
```
FULL VIEW:
┌─────────────────────────────────────┐
│ Title                               │
│ Authors, Venue, Date                │
│ Full Abstract Text...               │
│ [Read] [Download] [Cite] [Share]   │
└─────────────────────────────────────┘

MODERATE VIEW (Current):
┌──────┐ ┌──────┐ ┌──────┐
│Title │ │Title │ │Title │
│Auth. │ │Auth. │ │Auth. │
│Abs.. │ │Abs.. │ │Abs.. │
│[BTN] │ │[BTN] │ │[BTN] │
└──────┘ └──────┘ └──────┘

COMPACT VIEW:
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ T │ │ T │ │ T │ │ T │
│ A │ │ A │ │ A │ │ A │
└───┘ └───┘ └───┘ └───┘
```

---

**Next Steps**: Validate requirements with design mockups, confirm data availability, then proceed to implementation planning.