# Content Detail Pages

This document describes the dynamic content detail pages created for the MQ Studio website.

## Overview

Four dynamic route pages have been created, one for each content type:

1. **Publications** - `/app/publications/[slug]/page.tsx`
2. **Artworks** - `/app/artworks/[slug]/page.tsx`
3. **Musings** - `/app/musings/[slug]/page.tsx`
4. **Projects** - `/app/projects/[slug]/page.tsx`

## Features

### 1. Publications (`/publications/[slug]`)

**Features:**
- Display full publication metadata (title, authors, journal, DOI, etc.)
- Abstract rendering
- PDF download button with file size
- Multiple citation formats (APA, MLA, BibTeX) with copy functionality
- Related publications section
- Topic tags
- Accessible navigation back to studio

**Key Components:**
- Server-side rendering with metadata generation for SEO
- Responsive layout with max-width container
- Professional academic styling
- DOI links to external sources

### 2. Artworks (`/artworks/[slug]`)

**Features:**
- Large image display with zoom functionality (click to zoom in/out)
- Artwork details (medium, dimensions, location, availability)
- Availability status badges (Available, Sold, Private Collection, Exhibition)
- Price display for available works
- Artist statement
- Exhibition history timeline
- Theme tags
- Related artworks gallery

**Key Components:**
- Client-side rendering for interactive zoom
- Two-column layout (image + details) on desktop
- Image optimization with Next.js Image component
- Color-coded availability status

### 3. Musings (`/musings/[slug]`)

**Features:**
- Full markdown content rendering with custom styling
- Custom audio player (if audioUrl provided):
  - Play/pause controls
  - Timeline scrubbing
  - Time display (current/duration)
  - Analytics tracking on play
- Reading time and listening time estimates
- Category-specific color coding (Thinking/Feeling/Doing)
- David's marginalia notes (if present)
- Topic tags
- Related musings section

**Key Components:**
- Client-side rendering for audio player state
- ReactMarkdown for content rendering
- Custom markdown component styling
- Accessible audio controls

### 4. Projects (`/projects/[slug]`)

**Features:**
- Project status badge (Completed, Ongoing, Planned)
- Timeline display (start/end dates)
- Location, role, and client information
- Collaborators list
- Project gallery with captions
- Outcomes and impact section
- Related documents with download links
- External links section
- Topic tags
- Related projects

**Key Components:**
- Client-side rendering
- Multi-column layout for documents and links
- Image gallery with Next.js Image optimization
- Status color coding

## Common Features Across All Pages

### Navigation
- Consistent "Back to Studio" link in header
- Breadcrumb-style navigation
- Color-coded by content type/category

### SEO
- Dynamic metadata generation (title, description, Open Graph)
- Structured data for search engines
- Proper heading hierarchy

### Responsive Design
- Mobile-first approach
- Breakpoints at md (768px) and lg (1024px)
- Grid layouts that adapt to screen size

### Accessibility
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators (inherited from globals.css)
- Screen reader friendly

### Error Handling
- 404 redirect if content not found
- Loading states with spinners
- Graceful error messages

## Data Flow

### Content Fetching
All pages use the content service API:

```typescript
// Fetch by slug
POST /api/content
{
  "action": "getBySlug",
  "slug": "content-slug"
}

// Fetch related content
POST /api/content
{
  "action": "getRelated",
  "id": "content-id",
  "limit": 3
}
```

### API Routes
The `/app/api/content/route.ts` handles:
- `getBySlug` - Retrieve single content item by slug
- `getRelated` - Get related content based on tags/category
- `recent` - Get recent content (used on homepage)

## Styling

### Design System
All pages use the MQ Studio design tokens:

**Colors:**
- Rice Paper (`--rice-paper`) - Background
- Ink Black (`--ink-black`) - Primary text
- Moura Teal (`--moura-teal`) - Doing category
- Scholar Blue (`--scholar-blue`) - Thinking category
- Vibrant Magenta (`--vibrant-magenta`) - Feeling category
- Studio Cream (`--studio-cream`) - Muted backgrounds
- Charcoal Wash (`--charcoal-wash`) - Secondary text

**Typography:**
- Montserrat - Headings and UI elements
- Lora - Body text and content

### Layout Patterns
- Content cards with subtle borders
- Gradient backgrounds for metadata sections
- Consistent spacing and padding
- Border radius: 8px (`rounded-lg`)

## Dependencies

### New Dependencies Added
- `react-markdown@^9.0.1` - For rendering markdown content in musings
- `gray-matter@^4.0.3` - For parsing frontmatter in content files

### Installation
```bash
npm install
```

## Testing Checklist

### Publications
- [ ] Title and metadata display correctly
- [ ] PDF download works (if pdfUrl provided)
- [ ] Citation copy buttons function
- [ ] DOI links open in new tab
- [ ] Related publications load
- [ ] Responsive on mobile

### Artworks
- [ ] Image loads and displays
- [ ] Zoom functionality works (click to toggle)
- [ ] Availability status shows correct color
- [ ] Price displays for available works
- [ ] Exhibition history renders
- [ ] Related artworks display

### Musings
- [ ] Markdown content renders properly
- [ ] Audio player controls work
- [ ] Play/pause toggles correctly
- [ ] Timeline scrubbing functions
- [ ] David's marginalia shows (if present)
- [ ] Category colors display correctly

### Projects
- [ ] Status badge shows correct color
- [ ] Timeline displays properly
- [ ] Collaborators list renders
- [ ] Gallery images display
- [ ] Documents are downloadable
- [ ] External links open in new tab

### All Pages
- [ ] Back to Studio link works
- [ ] Loading states display
- [ ] 404 handling for invalid slugs
- [ ] Tags render correctly
- [ ] Related content loads
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

## Future Enhancements

### Potential Additions
1. **Share functionality** - Social media sharing buttons
2. **Print styles** - Optimized print layouts
3. **Breadcrumbs** - Full navigation path
4. **Comments/discussions** - Reader engagement
5. **Version history** - Track content updates
6. **Bookmarking** - Save favorites
7. **Export options** - Save as PDF, etc.
8. **Rich snippets** - Enhanced SEO structured data

### Performance Optimizations
1. Image lazy loading (already implemented via Next.js)
2. Content caching strategies
3. Incremental static regeneration
4. Edge caching for API routes

## Notes

- Publications page uses server-side rendering for better SEO
- Other pages use client-side rendering for interactive features
- All pages handle missing optional fields gracefully
- Content service caches content in memory for performance
- File-based content storage allows easy content management

## Support

For issues or questions, refer to:
- `/lib/content/content-service.ts` - Content fetching logic
- `/lib/types/content.ts` - Type definitions
- `/app/api/content/route.ts` - API route handlers
