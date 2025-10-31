# SPEC-001: Musings Feature

**Status**: 🟡 Draft
**Created**: 2025-10-27
**Author**: Meta-Orchestrator
**Feature Type**: New Capability

## 1. Feature Overview

### What
A hybrid blog/vlog platform where Moura can share written thoughts, recorded video musings, or mixed-media posts about her current thinking, research insights, and professional reflections.

### Why
- Provides a more informal, dynamic way to share ideas beyond formal publications
- Engages audiences who prefer different media formats (text vs. video)
- Creates a living record of intellectual journey and thought evolution
- Builds stronger connection with academic community through regular updates

## 2. User Stories

### Primary User - Moura (Content Creator)
- **As** Moura, **I want to** quickly publish thoughts in written or video format **so that** I can share insights without the formality of academic papers
- **As** Moura, **I want to** categorize and tag my musings **so that** readers can find content relevant to their interests
- **As** Moura, **I want to** schedule posts for future publication **so that** I can maintain consistent engagement

### Secondary Users - Visitors
- **As** a researcher, **I want to** follow Moura's latest thinking **so that** I can stay current with her research direction
- **As** a student, **I want to** watch video explanations **so that** I can better understand complex concepts
- **As** a colleague, **I want to** comment on or share musings **so that** I can engage in academic discourse

## 3. Functional Requirements

### 3.1 Content Types
- **Written Posts**: Markdown-based articles with rich formatting
- **Video Posts**: Embedded video content (YouTube/Vimeo or self-hosted)
- **Mixed Media**: Combination of text, images, and video in single post
- **Audio Only**: Podcast-style audio musings (optional - needs clarification)

### 3.2 Content Management
- **CRUD Operations**: Create, Read, Update, Delete posts
- **Draft System**: Save incomplete posts for later
- **Scheduling**: Publish posts at specified future dates
- **Versioning**: Track changes to published content

### 3.3 Organization
- **Categories**: Broad groupings (e.g., Research, Teaching, Design Philosophy)
- **Tags**: Flexible keyword system for cross-cutting themes
- **Series**: Group related musings into ordered collections
- **Search**: Full-text search across all musings

### 3.4 Display Options
- **List View**: Chronological feed with excerpts
- **Grid View**: Visual cards highlighting video/image content
- **Featured**: Highlight important musings on homepage
- **RSS Feed**: Syndication for subscribers

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 2 seconds
- Video lazy loading to prevent bandwidth issues
- Optimized images (WebP with fallbacks)
- CDN integration for media delivery

### 4.2 Accessibility
- WCAG 2.1 AA compliance
- Video captions and transcripts
- Keyboard navigation support
- Screen reader optimized

### 4.3 SEO
- Semantic HTML structure
- Open Graph meta tags
- Structured data for articles/videos
- XML sitemap inclusion

### 4.4 Security
- Authentication for admin functions
- Content sanitization for XSS prevention
- Rate limiting for comments (if enabled)

## 5. Technical Constraints

### Current System
- Next.js 14 with App Router
- MDX for content management
- Tailwind CSS for styling
- Current CMS: File-based (no database)

### Integration Points
- Must work with existing navigation structure
- Consistent with current visual design language
- Leverage existing MDX processing pipeline
- Compatible with current deployment (Vercel/Netlify)

## 6. Acceptance Criteria

### Minimum Viable Feature
- [ ] Admin can create and publish written musings
- [ ] Admin can create and publish video musings (embedded)
- [ ] Visitors can browse musings in chronological order
- [ ] Visitors can filter by category
- [ ] Musings appear in site search results
- [ ] Mobile-responsive design
- [ ] Accessibility standards met

### Full Feature Set
- [ ] Draft and scheduling system functional
- [ ] Tag-based filtering works
- [ ] Series/collections implemented
- [ ] RSS feed available
- [ ] Social sharing buttons present
- [ ] Video transcripts available
- [ ] Related musings suggestions

## 7. Decisions Made

### Content Strategy ✅
1. **Frequency**: ~2 posts per month average
2. **Length**: Paragraph to 2 pages for text; ~3 minutes for video updates
3. **Video Hosting**: YouTube (free, performant, SEO benefits)
4. **Comments**: Enabled (need moderation strategy)
5. **Social Integration**: TBD - defer to Phase 2

### Technical Decisions ✅
1. **CMS Evolution**: Stay file-based (MDX)
2. **Video Storage**: YouTube embeds (no self-hosting costs)
3. **Authentication**: TBD - needs discussion
4. **Analytics**: TBD - consider in Phase 2
5. **Email Notifications**: Yes, needed (implementation TBD)

### Content Categorization Strategy
Based on existing multimedia archive analysis:
- **Musings**: Informal updates, reflections, thought pieces
- **Publications**: Formal presentations, academic talks, keynotes
- **Media/Press**: Third-party interviews, podcasts, coverage
- Existing YouTube content can be embedded in appropriate categories

### Design Considerations
1. **Visual Hierarchy**: How prominent vs. publications?
2. **Homepage Integration**: Featured musings section?
3. **Navigation**: New menu item or under existing section?
4. **Mobile Experience**: Video playback optimization?

## 8. Implementation Notes

### Recommended Approach
1. **Phase 1**: Written posts only, basic categorization
2. **Phase 2**: Add video support, enhanced filtering
3. **Phase 3**: Scheduling, series, social features

### Comments Implementation
Given the decision to enable comments:
1. **Phase 1**: Use Disqus or Utterances (GitHub-based)
2. **Moderation**: Pre-moderation for first-time commenters
3. **Spam Protection**: reCAPTCHA or similar
4. **Alternative**: Consider Giscus (GitHub Discussions-based)

### Email Subscription Implementation
1. **Service Options**:
   - Buttondown (developer-friendly, markdown support)
   - ConvertKit (creator-focused)
   - Mailchimp (if already using)
2. **Integration**: API-based subscription form
3. **Automation**: Auto-send new musings digest

### File Structure
```
/content/musings/
  /2025/
    01-15-research-methodology.mdx
    01-20-video-urban-planning.mdx
  /drafts/
  /series/
    sustainability-series.json
```

### Schema Example
```typescript
interface Musing {
  id: string;
  title: string;
  slug: string;
  date: Date;
  publishDate?: Date;
  type: 'text' | 'video' | 'mixed';
  category: string;
  tags: string[];
  series?: string;
  featured: boolean;
  excerpt: string;
  content: string; // MDX
  videoUrl?: string;
  videoDuration?: number;
  transcript?: string;
  metadata: {
    readTime?: number;
    lastModified: Date;
    author: string;
  };
}
```

## 9. Dependencies

### On Other Features
- Search functionality must be updated
- Navigation structure needs modification
- Homepage may need redesign

### External Services (Potential)
- Video hosting platform
- CDN for media delivery
- Analytics service
- Email service for notifications

## 10. Success Metrics

- Number of musings published per month
- Average engagement time per musing
- Share/citation rate
- Subscriber growth (if applicable)
- Cross-reference rate with publications

---

**Next Steps**: Review and refine requirements with Moura, then move to 🟢 Approved status before implementation.