# Integrated Pathways Implementation Plan

**Decision Date**: 2025-09-24
**Status**: Approved for Phase 1 Implementation
**Approach**: Option 2 (Integrated Pathways) with Minimal Viable Complexity

## Background & Decision Rationale

### Problem Statement
The original THINKING-FEELING-DOING → Content Type mapping (Publications/Artworks/Musings) created artificial boundaries that don't reflect the interconnected nature of Professor Quayle's work. Examples of contradictions:
- FEELING mapped to Art, but Calligraphy was mapped to DOING
- Governance papers (Publications) can be deeply emotional (FEELING)
- Musings might contain rigorous analysis (THINKING)

### Decision: Integrated Pathways Architecture
**Selected Approach**: Each modality (THINKING/FEELING/DOING) shows how it appears across all content types, avoiding reductive one-to-one mapping.

**Key Principle**: Honor the complexity and interconnectedness of the work while maintaining the philosophical framework.

## Phase 1: Minimal Viable Complexity

### Core Features
1. **One Featured Item Per Pathway**: Single curated example for each modality
2. **Manual Curation**: Editorial selection rather than algorithmic
3. **Simple Content Tagging**: Basic modality assignments per content piece
4. **Preserve Color System**: Colors represent modalities, not content types

### Phase 1 Scope Limitations
- No "see more" options within pathways
- No rotation algorithms
- No complex editorial interfaces
- Manual content selection process

## Data Architecture

### Content Schema Enhancement
```typescript
interface ContentPiece {
  // Existing fields
  id: string;
  type: 'publication' | 'artwork' | 'musing';
  title: string;
  content: string;
  created_date: string;

  // New fields for Integrated Pathways
  modalities: {
    thinking?: {
      description: string;
      is_featured: boolean;
      featured_date?: string;
    };
    feeling?: {
      description: string;
      is_featured: boolean;
      featured_date?: string;
    };
    doing?: {
      description: string;
      is_featured: boolean;
      featured_date?: string;
    };
  };

  // Optional: Primary modality for default classification
  primary_modality?: 'thinking' | 'feeling' | 'doing';
}
```

### Homepage Data Requirements
```typescript
interface PathwayData {
  thinking: ContentPiece | null;
  feeling: ContentPiece | null;
  doing: ContentPiece | null;
}
```

## UI/UX Specifications

### Homepage Hero Layout
```
┌─────────────────────────────────────────────────────────┐
│                    MQ Studio Header                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "Latest work demonstrating..."                         │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ THINKING    │ │ FEELING     │ │ DOING       │       │
│  │ Scholar Blue│ │ Living Pink │ │ Moura Teal  │       │
│  │             │ │             │ │             │       │
│  │ [Featured   │ │ [Featured   │ │ [Featured   │       │
│  │  Content]   │ │  Content]   │ │  Content]   │       │
│  │             │ │             │ │             │       │
│  │ Content Type│ │ Content Type│ │ Content Type│       │
│  │ Title       │ │ Title       │ │ Title       │       │
│  │ Description │ │ Description │ │ Description │       │
│  │             │ │             │ │             │       │
│  │ [View →]    │ │ [View →]    │ │ [View →]    │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Card Structure
Each pathway card displays:
1. **Modality Label** (THINKING/FEELING/DOING)
2. **Content Type Badge** (Publication/Artwork/Musing)
3. **Content Title**
4. **Modality-Specific Description**
5. **Call-to-Action** (View/Read/Listen/Explore)
6. **Visual Element** (image for artworks, icon for others)

### Color Mapping
- **THINKING**: Scholar Blue (#2C5985) - card borders, labels, CTA buttons
- **FEELING**: Living Pink (#E91E63) - card borders, labels, CTA buttons
- **DOING**: Moura Teal (#00A8A8) - card borders, labels, CTA buttons

### Navigation Behavior
- Clicking a pathway card navigates to the individual content piece
- URL structure: `/{content-type}/{slug}` (e.g., `/publications/systems-governance`)
- Breadcrumb: Home → [Content Type] → [Title]

## Technical Implementation

### Homepage Data Fetching
```typescript
// Homepage component data fetching
async function getHomepagePathways(): Promise<PathwayData> {
  return {
    thinking: await getContentByFeaturedModality('thinking'),
    feeling: await getContentByFeaturedModality('feeling'),
    doing: await getContentByFeaturedModality('doing')
  };
}
```

### Content Management Interface
Phase 1 manual process:
1. **Content Creation**: Add new content with basic modality tags
2. **Pathway Curation**: Mark one item per modality as "featured"
3. **Description Writing**: Write modality-specific descriptions
4. **Publishing**: Deploy changes to live site

### Migration Strategy
1. **Audit Current Content**: Review existing content for modality mapping
2. **Initial Tagging**: Assign primary modalities to existing content
3. **Feature Selection**: Choose initial featured items for each pathway
4. **Description Creation**: Write pathway-specific descriptions
5. **Update Tests**: Modify existing tests for new structure
6. **Deploy Phase 1**: Launch with minimal feature set

## Test Architecture Updates

### Test ID Changes
```typescript
// Old structure
'hero-cta-thinking' → 'pathway-thinking'
'hero-cta-feeling' → 'pathway-feeling'
'hero-cta-doing' → 'pathway-doing'

// New data attributes
data-pathway="thinking"
data-content-type="publication"
data-content-id="systems-governance"
```

### Test Scenarios
1. **Pathway Display**: All three pathways show featured content
2. **Content Type Variety**: Pathways can show different content types
3. **Navigation**: Each pathway links to correct content piece
4. **Accessibility**: Proper aria-labels and keyboard navigation
5. **Responsive**: Cards stack properly on mobile

## Success Metrics

### Phase 1 Success Criteria
- [ ] Homepage displays three distinct pathway examples
- [ ] Users can navigate from pathways to content successfully
- [ ] Content can appear in multiple modality contexts
- [ ] Editorial workflow is manageable (< 30min weekly curation)
- [ ] Page performance remains acceptable (< 3s load time)

### User Experience Validation
- A/B test against current single-pathway structure
- User interviews about pathway clarity
- Analytics on pathway click-through rates
- Content engagement metrics per modality

## Future Phases (Not in Scope for Phase 1)

### Phase 2: Enhanced Discovery
- "See more" options within each pathway
- Rotation algorithms for featured content
- Editorial interface for easier curation
- Content filtering and search

### Phase 3: Advanced Features
- User preference learning
- Dynamic pathway recommendations
- Advanced content relationships
- Personalized pathway experiences

## Risk Mitigation

### Editorial Overwhelm
- **Risk**: Curation burden becomes unsustainable
- **Mitigation**: Start with monthly curation, measure time investment
- **Fallback**: Algorithmic selection based on recency + content type rotation

### Technical Complexity
- **Risk**: Implementation becomes too complex for Phase 1
- **Mitigation**: Build minimal feature set first, validate approach
- **Fallback**: Revert to simplified content-type based navigation

### User Confusion
- **Risk**: Users find pathway concept confusing
- **Mitigation**: User testing before full launch
- **Fallback**: Add explanatory text or progressive disclosure

## Implementation Timeline

**Week 1**: Data architecture updates, content schema
**Week 2**: Homepage component refactoring
**Week 3**: Test updates and content migration
**Week 4**: Editorial workflow and initial curation
**Week 5**: Testing and refinement
**Week 6**: Launch Phase 1

## Approval & Sign-off

**Approved by**: [Project Stakeholder]
**Implementation Lead**: [Developer]
**Content Curator**: [Content Manager]
**Date**: 2025-09-24

---

*This document serves as the definitive specification for Phase 1 Integrated Pathways implementation. All development work should reference this document for requirements and scope.*