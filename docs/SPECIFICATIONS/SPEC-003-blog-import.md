# SPEC-003: WordPress Blog Import Feature

**Status**: 🟢 Approved
**Created**: 2025-10-28
**Author**: Meta-Orchestrator
**Feature Type**: Data Migration

## 1. Feature Overview

### What
Import all 79 posts from Moura's legacy WordPress blog (mouraquayle.wordpress.com) into the new Musings section, preserving content while enhancing presentation.

### Why
- Consolidates Moura's digital presence into one "living archive"
- Preserves 8 years of intellectual journey (2009-2017)
- Provides historical context for current work
- Enriches site with substantial, quality content

## 2. WordPress Access Scenarios

### Scenario A: With Admin Access (Preferred)
**What we get:**
- Full WordPress XML export (WXR format)
- All post content, metadata, and comments
- Complete URL mapping for redirects
- Author information and relationships
- Categories and tags (limited use in source)

### Scenario B: Without Admin Access (Fallback)
**What we can still get:**
- RSS feed (last 5-10 posts in full)
- Public HTML scraping of all 79 posts
- Sitemap.xml for complete URL inventory
- Visible images and media

**What we lose without admin access:**
- Post revision history
- Unpublished drafts (if any)
- Comment metadata (commenter emails)
- Precise publication timestamps (might be approximated)
- WordPress-specific metadata

**Verdict: We can proceed successfully without admin access**, though the process requires more manual extraction.

## 3. Implementation Decisions

### URL Structure Decision
**Choice: Simplified user-friendly URLs**
- Pattern: `/musings/[slug]/`
- Example: `/musings/designed-leadership-book-launches/`
- Rationale: Cleaner URLs improve user experience; SEO is not a priority per PROJECT_PRIORITIES.md
- Legacy URLs will be documented for reference

### Legacy Content Presentation Decision
**Choice: Subtle visual differentiation with enhanced integration**

Implementation:
```typescript
// Visual indicators for legacy content
- Small "From the Archives" badge in post header
- Subtle background texture or border treatment
- Original publication date prominently displayed
- Optional context note for significantly dated content
```

Design approach:
- Use existing color system (perhaps muted tones)
- Maintain visual harmony with new content
- No aggressive "OLD CONTENT" warnings
- Focus on celebrating the archive nature

### Content Organization
```
/content/musings/
  /archive/           # Legacy posts (2009-2017)
    /2009/
      human-centred-design.mdx
      experience-design.mdx
    /2010/
      ...
    /2017/
      designed-leadership-book-launches.mdx
  /current/          # New posts (2024+)
    bridging-worlds.mdx
    on-design-thinking.mdx
```

## 4. Migration Technical Approach

### Phase 1: Content Extraction
```bash
# Option A: With admin access
- WordPress Dashboard > Tools > Export > All Content
- Download .xml file

# Option B: Without admin access
- Use web scraping script
- Parse RSS feed for recent posts
- Extract from sitemap.xml
```

### Phase 2: Content Processing Pipeline
```typescript
interface MigrationPipeline {
  1. extractContent(): WordPressPost[]
  2. downloadMedia(): MediaAsset[]
  3. convertToMDX(): MDXDocument[]
  4. addMetadata(): EnhancedMDX[]
  5. validateOutput(): ValidationReport
}
```

### Phase 3: MDX Schema for Legacy Posts
```typescript
interface LegacyMusing {
  // Standard fields
  title: string
  slug: string
  date: Date
  excerpt: string
  content: string  // MDX

  // Legacy-specific fields
  legacy: true
  originalUrl: string
  originalDate: Date
  importDate: Date
  archiveNote?: string

  // Enhanced metadata
  era: 'early' | 'middle' | 'late'  // 2009-2011 | 2012-2014 | 2016-2017
  theme: string[]  // Derived from content analysis
  relatedPublications?: string[]  // Links to formal work

  // Media tracking
  images: {
    original: string
    local: string
    caption?: string
  }[]
}
```

## 5. Media Asset Strategy

### Download Priority
1. **High Priority**: WordPress-hosted images (`/wp-content/uploads/`)
2. **Medium Priority**: PDF documents and reports
3. **Low Priority**: External images (Twitter, Gravatar)

### Storage Solution
```
/public/images/musings/archive/
  /2009/
  /2010/
  ...
  /2017/
```

## 6. Content Enhancement During Import

### Automatic Enhancements
- Add proper categories based on content analysis
- Generate accurate excerpts if missing
- Create tag taxonomy from content
- Link related posts within series
- Add reading time estimates

### Editorial Enhancements (Minimal)
- Add context notes only where essential
- Fix obviously broken links
- Update image alt text for accessibility
- Preserve original voice and style

## 7. Acceptance Criteria

### Minimum Viable Import
- [ ] All 79 posts successfully imported
- [ ] Text content fully preserved
- [ ] Images displayed correctly
- [ ] Legacy posts visually distinguished
- [ ] Original dates maintained
- [ ] Basic navigation working

### Complete Implementation
- [ ] All media assets downloaded and optimized
- [ ] Internal links updated
- [ ] Series/collections identified
- [ ] Archive section in navigation
- [ ] Search includes legacy content
- [ ] Mobile responsive design
- [ ] Accessibility standards met

## 8. Non-Functional Requirements

### Performance
- Legacy content should not impact site performance
- Lazy load images from archives
- Consider pagination for archive browsing

### Maintainability
- Clear separation of legacy vs. new content
- Documented import process for future reference
- Ability to bulk-update legacy posts if needed

## 9. Risk Mitigation

### Without Admin Access
- **Risk**: Incomplete content extraction
- **Mitigation**: Multiple extraction methods (RSS + scraping + manual)

### Image Loss
- **Risk**: External images become unavailable
- **Mitigation**: Download all accessible images immediately

### Content Dating Issues
- **Risk**: Timezone inconsistencies
- **Mitigation**: Manual review of key posts, document assumptions

## 10. Success Metrics

- All 79 posts imported and accessible
- Zero broken images for WordPress-hosted content
- Legacy content searchable alongside new content
- Clean visual integration with site design
- Positive feedback from Moura on presentation

---

**Next Steps**: Begin Phase 1 content extraction using available access method