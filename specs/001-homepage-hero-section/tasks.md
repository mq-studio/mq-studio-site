# Tasks: Homepage Hero Section

**Branch**: `001-homepage-hero-section` | **Plan**: [plan.md](./plan.md)

## Phase 2: Implementation Tasks

### P0 - Core Foundation (Must Complete)

- [ ] **TASK-001**: Set up component directory structure
  - Create `src/components/HeroSection/` directory
  - Create component files: HeroSection.tsx, FeaturedContent.tsx, EntryPoints.tsx
  - Create HeroSection.module.css for styling
  
- [ ] **TASK-002**: Define TypeScript interfaces
  - Create `src/types/content.ts`
  - Define FeaturedContent and EntryPoint interfaces
  - Export types for use across components

- [ ] **TASK-003**: Create content fetching utilities
  - Create `src/lib/content.ts`
  - Implement getLatestContent() function
  - Implement getEntryPoints() function
  - Use static data from background directory initially

### P1 - Component Implementation

- [ ] **TASK-004**: Build FeaturedContent component
  - Display title, type badge, and preview
  - Handle both image and text previews
  - Make entire card clickable

- [ ] **TASK-005**: Build EntryPoints component
  - Create three cards for Thinking/Feeling/Doing
  - Apply distinct colors from design system
  - Add hover states and transitions

- [ ] **TASK-006**: Build main HeroSection component
  - Integrate FeaturedContent and EntryPoints
  - Implement responsive grid layout
  - Add section heading and intro text

### P2 - Styling & Responsiveness

- [ ] **TASK-007**: Apply design system styling
  - Use CSS variables for colors and typography
  - Implement mobile-first responsive design
  - Add breakpoints at 768px and 1024px

- [ ] **TASK-008**: Add loading and error states
  - Create skeleton loader for content
  - Design error fallback UI
  - Handle edge cases (no content available)

### P3 - Accessibility & Polish

- [ ] **TASK-009**: Implement accessibility features
  - Add proper ARIA labels
  - Ensure keyboard navigation works
  - Test with screen reader

- [ ] **TASK-010**: Add animations and transitions
  - Subtle fade-in for content
  - Smooth hover effects
  - Respect prefers-reduced-motion

### P4 - Testing

- [ ] **TASK-011**: Write unit tests
  - Test component rendering
  - Test data fetching functions
  - Test error handling

- [ ] **TASK-012**: Integration testing
  - Test full hero section flow
  - Test responsive behavior
  - Test accessibility compliance

## Success Criteria

- [ ] Hero section renders on homepage
- [ ] Latest content displays correctly
- [ ] All three entry points are functional
- [ ] Responsive across all device sizes
- [ ] Passes accessibility audit
- [ ] All tests passing

## Notes

- Start with static data, prepare for CMS integration
- Prioritize mobile experience
- Keep components modular for reuse