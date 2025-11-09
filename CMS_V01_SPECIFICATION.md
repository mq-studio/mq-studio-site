# MQ Studio CMS: V01 Final Specification

**Version:** V01 (Launch Ready)
**Date:** 2025-11-09
**Status:** Complete & Ready for Development
**Audience:** All stakeholders

---

## Executive Summary

This document consolidates all design specifications for the MQ Studio CMS V01 release. The CMS enables Moura Quayle to manage all website content through an intuitive, non-technical interface without requiring Markdown knowledge or technical skills.

**Key Goals:**
1. Enable daily content creation and publishing in < 10 minutes
2. Support all 4 content types: Musings, Artworks, Publications, Projects
3. Provide safe, user-friendly content management
4. Maintain excellent site performance (no regression from current metrics)
5. Create audit trail of all changes via Git

**Key Constraints:**
- Desktop-first design (optional iPad support)
- File-based content (no database)
- Vercel deployment (serverless)
- Single user (Moura) for V01
- No external CMS dependency
- ~9 week development timeline

---

## Product Overview

### What is the MQ Studio CMS?

A web-based content management system that allows Moura to:
- Create, edit, publish, and delete content across 4 content types
- Upload and manage media files (images, audio, video, PDFs)
- Organize content with tags and categories
- Preview content before publishing
- Manage site settings and navigation
- All without writing code or Markdown

### User

**Primary User:** Moura Quayle (non-technical content creator)
- Uses 1-2 hours daily to create content
- Posts 1-3 items per week on average
- Needs quick feedback and confirmation
- Values safety (no accidental data loss)
- Prefers visual, intuitive interface

**Secondary User:** David Fushey (limited role, V02)
- Can add notes to Moura's content
- Cannot edit or publish
- Reads published content

### Content Managed

```
1. Musings (Blog posts reflecting on thinking, feeling, doing)
   - Most frequent (2-3 per week)
   - Can include text, images, audio, video
   - Categorized: Thinking (blue), Feeling (magenta), Doing (teal)
   - Can be featured, tagged, archived

2. Artworks (Gallery of visual work)
   - Less frequent (1-2 per week)
   - High-resolution images
   - Metadata: medium, dimensions, year, description
   - Process images/WIP photos optional
   - Can be featured

3. Publications (Academic/professional outputs)
   - Regular additions (1-2 per month)
   - PDF uploads
   - Metadata: authors, journal, year, abstract, DOI
   - Can be featured

4. Projects (Collaborative initiatives)
   - Occasional (1-2 per quarter)
   - Metadata: collaborators, status, description
   - Can be featured
```

---

## Functional Requirements

### FR1: Authentication & Access Control

#### FR1.1: User Login
- **Description:** Moura logs in with email/password
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Login page accessible at /studio/login
  - Email field accepts email addresses
  - Password field masks input
  - Submit button sends credentials securely (HTTPS POST)
  - Success redirects to dashboard
  - Failure shows clear error message
  - Failed attempts logged (not credentials)
  - Max 5 login attempts per 5 minutes

#### FR1.2: Session Management
- **Description:** Maintain user session across pages
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Session persists for 24 hours
  - Session auto-extends with activity
  - Timeout after 30 minutes inactivity
  - Session expires on logout
  - Session stored in secure httpOnly cookie
  - No JavaScript access to session token

#### FR1.3: Protected Routes
- **Description:** Prevent unauthorized access to CMS
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - All /studio/* routes require authentication
  - Unauthenticated users redirected to login
  - Session validated on each page load
  - Expired session shows re-login prompt
  - State preserved across re-login

### FR2: Dashboard

#### FR2.1: Dashboard Overview
- **Description:** Central entry point showing site status
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Displays after login
  - Shows welcome message
  - Shows week statistics (posts, visitors)
  - Lists drafts (2-3 recent)
  - Shows content summary (counts by type)
  - Displays recent activity (last 5 actions)
  - Has quick create buttons for all content types
  - Responsive on mobile/tablet

#### FR2.2: Quick Create Buttons
- **Description:** Shortcuts to create new content
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - 4 buttons: New Musing, Artwork, Publication, Project
  - Click navigates to editor for that type
  - Mobile: Available in menu or top section

### FR3: Content Management (All Types)

#### FR3.1: Create Content
- **Description:** Create new content of any type
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Editor opens with blank form
  - All required fields marked
  - Form validation on submit only (not on blur)
  - Helpful error messages if validation fails
  - Auto-save every 30 seconds
  - Unsaved changes warning on leave
  - Time estimate shown

#### FR3.2: Edit Content
- **Description:** Edit existing published or draft content
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Editor loads existing content
  - All fields pre-populated
  - Can modify any field
  - Title change auto-updates slug
  - Can override slug if needed
  - Auto-save working
  - Can unpublish without losing content
  - Undo/redo available (last 20 actions)

#### FR3.3: Delete Content
- **Description:** Remove content from system
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Confirmation dialog required
  - Shows content title in dialog
  - Cancel returns to content
  - Confirm deletes immediately
  - Deletion logged to activity
  - Cannot be undone (final)
  - Archive option preferred over delete (V02)

#### FR3.4: Publish Content
- **Description:** Make content live on public site
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Publish button available in editor
  - Shows confirmation dialog
  - Dialog shows title and type
  - Publish date set to current time
  - Verifies all required fields
  - Shows publishing status
  - Shows "View published post" link on success
  - Auto-commits to Git and deploys
  - Content appears on live site within 1 minute

#### FR3.5: Unpublish Content
- **Description:** Remove content from public view
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Unpublish button in editor (if published)
  - Confirmation dialog
  - Content reverts to draft status
  - Content removed from live site immediately
  - Content still editable
  - Can be republished

#### FR3.6: Preview Content
- **Description:** See how content looks when published
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Preview button in editor
  - Shows content as published view
  - Mobile preview option available
  - Desktop preview (default)
  - Can toggle between desktop/mobile
  - Links not functional in preview
  - Close preview button returns to editor

### FR4: Musing-Specific Features

#### FR4.1: Category Selection
- **Description:** Categorize musings by type
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Radio buttons for: Thinking, Feeling, Doing
  - Color indicators (blue, pink, teal)
  - Only one category per musing
  - Required field
  - Visual indication of selected category
  - Applied to editor background color

#### FR4.2: Rich Text Editing
- **Description:** Format musing text without Markdown
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - WYSIWYG editor with toolbar
  - Text formatting: Bold, Italic, Underline
  - Heading levels: H1, H2, H3
  - Lists: Ordered and unordered
  - Blockquotes
  - Code blocks with syntax highlighting
  - Link insertion with dialog
  - Image insertion from media library
  - Video embed (YouTube, custom)
  - Separator lines
  - Undo/Redo buttons
  - Keyboard shortcuts (Ctrl+B, etc.)

#### FR4.3: Audio/Video Support
- **Description:** Attach media to musings
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Optional audio file upload
  - Optional video URL (embed)
  - Audio player in published view
  - Video player/embed in published view
  - Max file sizes (50MB for audio, 250MB for video)
  - Supported formats: MP3, M4A, MP4, WebM

#### FR4.4: Featured Image
- **Description:** Set thumbnail for musing
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Optional image upload
  - Select from media library
  - Shows in previews and listings
  - Can set focal point (for cropping)
  - Alt text required
  - Caption optional

#### FR4.5: Excerpt
- **Description:** Short summary of content
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Manual entry or auto-generate
  - Auto-generation uses first 150 chars
  - Manual input max 500 chars
  - Shows in list views
  - Character counter

#### FR4.6: Featured Status
- **Description:** Mark content as featured
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Toggle switch
  - Shows featured indicator in list
  - Featured content shown prominently on site
  - Can feature/unfeature at any time

### FR5: Tag Management

#### FR5.1: Create Tags
- **Description:** Create new tags for organizing content
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Dedicated tags page
  - Create button shows dialog
  - Tag name required (lowercase, hyphens)
  - Optional display name (human-readable)
  - Optional color customization
  - Optional description
  - Save creates and adds to list
  - Cancel closes dialog

#### FR5.2: Apply Tags to Content
- **Description:** Associate content with tags
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Tags field in editor
  - Type to search existing tags
  - Autocomplete suggestions
  - Can create new tag inline
  - Click tag to add/remove
  - Show selected tags clearly
  - Max 20 tags per item (limit in V02)
  - Remove tag with X button

#### FR5.3: Manage Tags
- **Description:** Edit or delete tags
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Tag list page with usage count
  - Click tag to edit
  - Edit dialog updates name, color, description
  - Delete button shows warning
  - Warning shows number of items using tag
  - Option to remove from all items or cancel delete
  - Merged tags feature (V02)

### FR6: Media Library

#### FR6.1: Upload Media
- **Description:** Add images, audio, video, PDFs
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Upload button in media library
  - Drag-and-drop zone
  - Click to browse files
  - Multiple file upload
  - File validation (type, size)
  - Error message if invalid
  - Progress bar per file
  - Preview after upload
  - Max file size: 50MB

#### FR6.2: Media Library Display
- **Description:** View all uploaded media
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Grid view (default)
  - List view option
  - Thumbnail previews
  - Shows filename, size, date
  - Search by filename
  - Filter by type (image, audio, video, pdf)
  - Filter by usage (all, used, unused)
  - Sort by date, size, name
  - Pagination (50 items per page)

#### FR6.3: Media Details
- **Description:** View and edit media properties
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Click media to show detail panel
  - Shows large preview/thumbnail
  - File info: size, type, date, dimensions
  - Where used: list of content using this media
  - Alt text field (required for images)
  - Caption field (optional)
  - Save button to update
  - Copy URL button
  - Download button
  - Delete button with confirmation

#### FR6.4: Delete Media
- **Description:** Remove unused media
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Confirm before delete
  - If media in use: show warning with list of content
  - Option to delete anyway (removes references)
  - Media removed from library
  - Links in content become broken (handled gracefully)
  - Log deletion to activity

#### FR6.5: Image Optimization
- **Description:** Automatically improve image quality
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Automatic on upload
  - Resize large images (max 4000px)
  - Compress to reasonable quality
  - Generate WebP format
  - Generate thumbnails (200px)
  - Preserve EXIF if present
  - Display original and optimized size
  - User sees thumbnail by default

### FR7: Content Discovery

#### FR7.1: List Views
- **Description:** Display content by type
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Separate list for each content type
  - Shows: title, status, category, date, modified
  - Grid or list view toggle
  - Status badges (Published, Draft, Archived)
  - Category indicator with color
  - Quick actions: Edit, Delete, Copy
  - Pagination (20 items per page)

#### FR7.2: Filtering
- **Description:** Find specific content
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Status filter: All, Published, Drafts, Archived
  - Category filter: All, Thinking, Feeling, Doing
  - Featured filter: All, Featured only
  - Date range filter (optional V02)
  - Multiple filters combinable
  - Clear all filters button
  - Filter count shown

#### FR7.3: Search
- **Description:** Find content by keyword
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Search box in list header
  - Searches: title, excerpt, content, author
  - Debounced (300ms)
  - Results update as typing
  - Shows match count
  - Highlights matching terms
  - Case-insensitive
  - Works across all content types

#### FR7.4: Sorting
- **Description:** Organize content display
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Sort options: Date (newest), Date (oldest), Title A-Z, Modified
  - Default: Date (newest)
  - Applied to filtered results
  - Indicator showing current sort

### FR8: Site Settings

#### FR8.1: Basic Settings
- **Description:** Configure site information
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Settings page (/studio/settings)
  - Site title field
  - Site description field
  - Contact email field
  - Save button
  - Changes reflected on public site
  - Validation on required fields

#### FR8.2: Navigation Menu
- **Description:** Manage site navigation
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Drag-to-reorder menu items
  - Add menu item button
  - Edit menu item (name, link)
  - Delete menu item with confirmation
  - Preview site with new menu
  - Internal or external links
  - Open in new tab option

#### FR8.3: Social Links
- **Description:** Update social media profiles
- **Priority:** Low (V01)
- **Acceptance Criteria:**
  - Fields for major platforms
  - URL validation
  - Displayed in footer
  - Optional fields

### FR9: Publishing & Deployment

#### FR9.1: Automatic Commit
- **Description:** Save changes to Git
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Commit created on publish
  - Meaningful commit message
  - Author: Moura (system account)
  - Timestamp recorded
  - Visible in GitHub

#### FR9.2: Auto-Deployment
- **Description:** Deploy changes to live site
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Triggered by commit to main
  - Vercel webhook integration
  - Build takes < 2 minutes
  - Deployment status shown
  - Rollback capability
  - Live site updates immediately
  - No downtime during deploy

#### FR9.3: Deploy Status
- **Description:** Show deployment progress
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Status indicator in editor
  - Building status
  - Deploy status
  - Success message with link
  - Error message if failed
  - Retry button on failure

### FR10: Data Safety

#### FR10.1: Auto-Save
- **Description:** Prevent data loss
- **Priority:** Critical (V01)
- **Acceptance Criteria:**
  - Saves every 30 seconds
  - Only while editing (not after publish)
  - Shows save status: Saving, Saved
  - Timestamp of last save
  - Works without user interaction
  - Survives browser crashes
  - Graceful failure if network issue

#### FR10.2: Local Backup
- **Description:** Fallback to browser storage
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Auto-save to localStorage as backup
  - Cleared on successful server save
  - Restored if server save fails
  - One-tap restore from local version
  - Timestamp shown
  - Warning: local version may be stale

#### FR10.3: Confirmation Dialogs
- **Description:** Prevent accidental actions
- **Priority:** High (V01)
- **Acceptance Criteria:**
  - Confirm before delete
  - Confirm before unpublish
  - Confirm before archive
  - Warn on unsaved changes before leaving
  - Cancel returns to editing
  - Descriptive dialogs

#### FR10.4: Undo/Redo
- **Description:** Recover from mistakes
- **Priority:** Medium (V01)
- **Acceptance Criteria:**
  - Undo last 20 actions
  - Redo undone actions
  - Undo button in toolbar
  - Keyboard shortcut Ctrl+Z / Cmd+Z
  - Disabled when nothing to undo
  - Clear history on publish

---

## Non-Functional Requirements

### NFR1: Performance

#### NFR1.1: Page Load Times
- Dashboard: < 2 seconds (FCP), < 2.5s (LCP)
- Editor: < 1.5 seconds (FCP)
- List views: < 1 second (FCP)
- Search results: < 300ms response
- Image upload: < 5 seconds (5MB file)

#### NFR1.2: Responsiveness
- Auto-save roundtrip: < 500ms
- Search debounce: 300ms
- Form validation: immediate
- UI interactions: < 100ms perceived delay
- No jank (60fps animations)

#### NFR1.3: Bundle Size
- JavaScript: < 200KB (gzipped)
- CSS: < 50KB (gzipped)
- Total: < 250KB (gzipped)
- No regression from public site

#### NFR1.4: Metrics
- LCP < 2.5s (mobile target: < 2.5s)
- FID < 100ms
- CLS < 0.1
- Lighthouse score > 90

### NFR2: Security

#### NFR2.1: Authentication
- HTTPS enforced (always)
- Password hashing: bcrypt cost 12
- Session timeout: 24 hours
- httpOnly, Secure, SameSite cookies
- Brute force protection: max 5 attempts/5 min

#### NFR2.2: Authorization
- All /studio/* routes protected
- API routes check user identity
- No direct file access
- Proper HTTP status codes (401, 403)

#### NFR2.3: Input Validation
- Server-side validation (mandatory)
- Client-side validation (UX)
- Whitelist allowed characters
- Max length enforcement
- Type validation
- Slug uniqueness

#### NFR2.4: XSS Prevention
- React auto-escape (default)
- DOMPurify for user HTML
- No dangerouslySetInnerHTML with user content
- CSP headers

#### NFR2.5: CSRF Protection
- SameSite=Strict cookies
- NextAuth.js CSRF tokens
- No state-changing GET requests
- POST/PUT/DELETE for mutations

### NFR3: Usability

#### NFR3.1: Learning Curve
- No training required
- Intuitive interface
- First post in < 10 minutes
- Clear error messages
- In-app help (tooltips, placeholders)

#### NFR3.2: Mobile Responsiveness
- Works on iPad
- Touch-friendly (44px minimum targets)
- Swipe navigation (future)
- Vertical layout on mobile
- Full features on tablet

#### NFR3.3: Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Focus indicators visible
- Color not sole indicator
- Form labels associated

### NFR4: Reliability

#### NFR4.1: Uptime
- 99%+ uptime (managed by Vercel)
- Graceful failure (not lose data)
- Error recovery

#### NFR4.2: Data Integrity
- No data loss on crash
- Git audit trail
- File system backups
- Unique IDs (no collisions)

#### NFR4.3: Error Handling
- Graceful failures
- Clear error messages
- Retry capability
- Fallback options
- No exposure of system details

### NFR5: Scalability

#### NFR5.1: Content Limit
- Up to 1000 content items (comfortable)
- Up to 500 media items (comfortable)
- Performance maintained
- No database scaling needed

#### NFR5.2: Future Growth
- Architecture supports expansion
- Can add users later
- Can add database later
- Can add features without refactoring

---

## Technology Stack

### Frontend

```
Framework: Next.js 14 (App Router)
Language: TypeScript
UI Library: React 18
Styling: Tailwind CSS
Editor: TipTap
Form: React Hook Form
State: Context API
Testing: Jest + Playwright
```

### Backend

```
Runtime: Node.js (Vercel Serverless)
API: Next.js API Routes
Auth: NextAuth.js
Storage: File system
Version Control: Git
Image: Sharp
```

### Infrastructure

```
Hosting: Vercel
Repository: GitHub (dual remotes)
CDN: Vercel Edge Network
Domain: mq-studio-site.vercel.app (production)
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
GET  /api/auth/me           - Current user
POST /api/auth/refresh      - Refresh token
```

### Content (Musings, Artworks, etc.)
```
GET    /api/content/musings           - List musings
POST   /api/content/musings           - Create musing
GET    /api/content/musings/[id]      - Read musing
PUT    /api/content/musings/[id]      - Update musing
DELETE /api/content/musings/[id]      - Delete musing
POST   /api/content/musings/[id]/publish - Publish/unpublish
```

### Media
```
GET    /api/media              - List media
POST   /api/media/upload       - Upload file
GET    /api/media/[id]         - Media details
PUT    /api/media/[id]         - Update media
DELETE /api/media/[id]         - Delete media
```

### Tags
```
GET    /api/tags         - List tags
POST   /api/tags         - Create tag
PUT    /api/tags/[id]    - Update tag
DELETE /api/tags/[id]    - Delete tag
```

### Settings
```
GET  /api/settings       - Get settings
PUT  /api/settings       - Update settings
GET  /api/settings/menu  - Get navigation menu
PUT  /api/settings/menu  - Update menu
```

---

## File Structure

```
/content/
├── /musings/        - Musing MDX files
├── /artworks/       - Artwork MDX files
├── /publications/   - Publication MDX files
└── /projects/       - Project MDX files

/public/uploads/
├── /images/         - Image files
├── /audio/          - Audio files
├── /video/          - Video files
└── /pdfs/           - PDF files

/src/
├── /pages/studio/   - CMS interface pages
├── /pages/api/      - Backend API routes
├── /components/     - React components
├── /lib/services/   - Business logic
├── /lib/types/      - TypeScript types
├── /lib/hooks/      - Custom React hooks
├── /context/        - React context
└── /styles/         - Global styles
```

---

## User Journeys Summary

### Happy Path: Create & Publish Musing

```
1. Login (email + password)
2. Dashboard loads
3. Click "New Musing"
4. Enter title (slug auto-generates)
5. Select category (Thinking/Feeling/Doing)
6. Write content in editor
7. Add images from media library (or upload)
8. Add tags (create new or existing)
9. Set featured image and excerpt
10. Click "Preview" to review
11. Click "Publish"
12. Confirm dialog
13. Content publishes and goes live
14. View published post link

Time: 5-10 minutes
```

### Key Moment: Save & Recovery

```
1. User types in editor
2. Auto-save every 30 seconds (no action needed)
3. "Saved 30 seconds ago" indicator
4. Browser crash happens
5. User reopens CMS
6. Content restored from auto-save
7. "Restore from local backup?" dialog
8. Click restore
9. Content returns to last auto-save state
10. Resume editing
```

---

## Success Metrics

### Adoption Metrics
- Moura uses CMS for > 50% of content creation within 2 weeks
- Can create/publish first post in < 10 minutes
- No support requests (self-explanatory)
- High satisfaction score (> 90%)

### Performance Metrics
- Dashboard load: < 2 seconds (target achieved)
- Editor open: < 1.5 seconds (target achieved)
- No regression from current site performance
- Auto-save success rate: > 99.9%

### Content Metrics
- Increase content publication frequency
- More consistent posting schedule
- Longer average content (less need for revision)
- Higher engagement on new content

### Quality Metrics
- Zero unintentional data loss incidents
- Zero security incidents
- Zero prolonged downtime
- < 1 critical bug per month

---

## Launch Readiness Criteria

### Before Launch
- [ ] All functional requirements met
- [ ] Performance targets achieved
- [ ] Security audit passed
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Unit tests > 80% coverage
- [ ] E2E tests passing
- [ ] Manual QA complete
- [ ] User documentation complete
- [ ] Training completed with Moura
- [ ] Support procedures established
- [ ] Monitoring enabled
- [ ] Rollback plan tested

### Go/No-Go Decision
- All launch readiness criteria met: GO
- > 1 critical issue unresolved: HOLD
- Performance regression: HOLD
- Security vulnerability: NO-GO

---

## Roadmap for Future Versions

### V01 (Current)
```
✓ Single user (Moura)
✓ 4 content types (CRUD)
✓ Media library
✓ Tags & categories
✓ Publishing workflow
✓ Auto-commit to Git
✓ No database
✓ File-based content
```

### V02 (Next Release)
```
□ Multiple users (Viewer, Editor roles)
□ Content approval workflow
□ Scheduled publishing
□ Bulk operations
□ Content templates
□ Archive/restore
□ Comment moderation
□ Analytics dashboard
□ Email notifications
□ Version history UI
```

### V03+ (Future)
```
□ Real-time collaboration
□ Content relationships/linking
□ AI writing assistant
□ SEO optimization suggestions
□ Advanced analytics
□ Comment system
□ Newsletter integration
□ Social media scheduling
□ Content calendar
□ Advanced search
```

---

## Glossary

**MDX** - Markdown + JSX (allows React components in content)
**WYSIWYG** - What You See Is What You Get (visual editor)
**Slug** - URL-safe identifier (e.g., "my-post-title")
**Frontmatter** - Metadata at top of MDX file (YAML)
**Musing** - Blog post reflecting on thinking, feeling, or doing
**Featured** - Marked for prominence (appears in special sections)
**Draft** - Not yet published (only visible in CMS)
**Archived** - Soft deleted (hidden but recoverable)
**Auto-save** - Automatic saving every 30 seconds
**Deploy** - Publishing to live website (Vercel)
**Commit** - Saving changes to Git repository
**Rollback** - Reverting to previous version

---

## Support & Help

### Getting Help

**During Development:**
- Code comments and documentation in repo
- Developer guide in /docs/
- Slack/Discord channel for team communication

**After Launch:**
- Quick reference card
- Video tutorials
- FAQ document
- Email support
- Scheduled check-ins

### Reporting Issues

**Critical Issues** (content not publishing, data loss):
- Email: [Support email]
- Response time: < 1 hour
- Fallback: Manual intervention

**Standard Issues** (UI confusion, feature request):
- Email or support form
- Response time: < 24 hours
- Tracked in GitHub Issues

---

## Document Approval

**Status:** Ready for Development
**Author:** Design & Architecture Team
**Date:** 2025-11-09

**Approvals:**
- [ ] Development Lead
- [ ] Project Manager
- [ ] Client (Moura) - Verbal sign-off
- [ ] Security Review

---

## Appendices

### Appendix A: Related Documents

- `CMS_ACTIVITY_INVENTORY.md` - Complete list of all CMS activities
- `CMS_USER_JOURNEYS.md` - Detailed user workflows
- `CMS_INFORMATION_ARCHITECTURE_WIREFRAMES.md` - UI/UX design
- `CMS_TECHNICAL_ARCHITECTURE.md` - Implementation details
- `CMS_IMPLEMENTATION_ROADMAP.md` - Project timeline
- `CMS_SECURITY_PERFORMANCE.md` - Security & performance specs

### Appendix B: Content Examples

**Example Musing Frontmatter:**
```yaml
---
title: "Reflections on Design Thinking"
slug: "reflections-on-design-thinking"
date: "2025-11-09"
category: "thinking"
tags: ["design", "creativity", "process"]
excerpt: "Design thinking is a powerful approach..."
featured: true
author: "moura"
status: "published"
---
```

**Example API Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Musing",
    "slug": "my-musing",
    "status": "published",
    "publishedAt": "2025-11-09T10:30:00Z"
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

---

## Conclusion

This V01 Specification provides a complete, actionable blueprint for building the MQ Studio CMS. It balances **ambitious features** (full WYSIWYG editor, media management) with **realistic scope** (single user, file-based storage) to deliver a functional, safe, and delightful content management experience for Moura Quayle.

The CMS will enable Moura to manage her digital studio independently, maintain an audit trail of all changes via Git, and publish content to her live website in minutes—all without requiring technical knowledge.

**Ready for development to begin November 9, 2025.**
