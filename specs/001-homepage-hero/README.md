# Homepage Hero Specification

## Overview

This specification defines the Homepage Hero component for MQ Studio - the critical first impression that embodies Moura Quayle's "living studio" concept and implements the triadic MQ Framework (THINKING/FEELING/DOING).

## Files in this Specification

- **`spec.md`** - Complete functional and design requirements with embedded acceptance checklist
- **`tests.md`** - Automated testing suite for SpecKit and Stagehand integration
- **`README.md`** - This overview and implementation guide

## Quick Reference

### Key Requirements
- **Three simultaneous content elements**: Current artwork, recent writing, today's reflection
- **MQ Framework pathways**: THINKING (teal), FEELING (pink), DOING (yellow)
- **David's marginalia**: Integrated quotes, not separate sections
- **Voice tone**: Invitational, exploratory, grateful, uncertain, connective
- **Mobile-first responsive**: Triadic elements reflow without losing identity

### Color System
```css
--moura-teal: #00A8A8;     /* Primary CTAs */
--living-pink: #E91E63;    /* Feeling elements */
--scholar-blue: #2C5985;   /* Thinking elements */
--spring-yellow: #F4B942;  /* Doing elements */
--shufa-red: #8D2305;      /* Signature moments only */
--rice-paper: #FDFCF8;     /* Background */
```

### Typography
- **Headings**: Montserrat (weight: 500)
- **Body**: Lora (weight: 400)
- **Marginalia**: Lora italic

## Implementation Workflow

### 1. Component Structure
```jsx
<HeroSection data-testid="hero-section">
  <HeroContent>
    <ThinkingElement data-testid="thinking-pathway" />
    <FeelingElement data-testid="feeling-pathway" />
    <DoingElement data-testid="doing-pathway" />
  </HeroContent>
  <ResonanceFeature data-testid="featured-resonance" />
  <Marginalia data-testid="david-marginalia" />
</HeroSection>
```

### 2. Content Requirements
Each pathway element needs:
- Distinct visual identity (color, typography)
- Functional link to appropriate section
- Content that reflects its MQ Framework domain
- Responsive behavior specification

### 3. Testing Integration
```bash
# Run SpecKit validation
npx speckit check --spec=001-homepage-hero

# Run Stagehand browser tests
npx playwright test tests/homepage-hero.test.js

# Full validation suite
npm run test:hero
```

## Acceptance Criteria

The specification includes a comprehensive ✅ **Homepage Hero Acceptance Checklist** covering:

- **Core Concept Alignment** (4 items)
- **Functional Display** (3 items)
- **Visual & Design System** (6 items)
- **Interaction & Responsiveness** (3 items)
- **David's Presence Integration** (2 items)
- **Accessibility** (3 items)

All 21 checklist items must pass before considering the component complete.

## Dependencies

### Design System
- CSS custom properties defined in `background/mq-design-system.css`
- Montserrat and Lora fonts loaded
- Watercolor paper texture asset

### Content Management
- API or CMS integration for live content updates
- Image optimization pipeline for artwork
- Audio player system for reflection snippets

### Analytics
- Event tracking for pathway selection
- Engagement metrics for resonance features
- Accessibility usage analytics

## Success Metrics

### User Engagement
- **Entry Point Distribution**: Balanced usage across THINKING/FEELING/DOING pathways
- **Time on Hero**: Average engagement time >30 seconds
- **Resonance Interaction**: >20% users explore featured connections

### Technical Performance
- **Load Time**: <2 seconds on 3G connection
- **Accessibility Score**: 100% WCAG AA compliance
- **Cross-Browser Compatibility**: 100% core functionality

### Brand Alignment
- **Voice Recognition**: User testing confirms "invitational, exploratory" tone
- **Living Studio Feel**: Qualitative feedback validates workspace vs portfolio perception
- **MQ Framework Understanding**: Users recognize triadic approach

## Implementation Notes

### Phase 1: Core Structure
- Basic three-element layout
- Static content placeholders
- Color system implementation

### Phase 2: Dynamic Content
- CMS integration for live updates
- Responsive behavior refinement
- David's marginalia system

### Phase 3: Advanced Features
- Seasonal theming
- Resonance engine
- Audio integration
- Analytics implementation

## Related Specifications

- `000-context/` - Background research and strategic foundation
- `002-design-system/` - (Future) Comprehensive design system
- `003-navigation/` - (Future) Site-wide navigation patterns
- `004-marginalia/` - (Future) David's presence integration system

## Questions & Clarifications

For implementation questions, reference:
1. **Strategic Foundation**: `specs/000-context/Summary 2025-09-08.brief.md`
2. **Biographical Context**: `specs/000-context/The Designed Life.brief.md`
3. **Technical Details**: `background/mq-design-system.css`

---

**Priority**: CRITICAL
**Complexity**: HIGH
**Dependencies**: Design system, content management, image optimization
**Timeline**: Foundational component - implement first