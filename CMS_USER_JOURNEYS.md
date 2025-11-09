# CMS User Journeys

**Date:** 2025-11-09
**Project:** MQ Studio CMS Interface Design
**User:** Moura Quayle (Non-technical content creator)

---

## Journey 1: Create and Publish a New Musing

### Context
Moura has written a new reflection on design thinking and wants to share it on her website. She has the text ready and a few images to include.

### Happy Path

1. **Login to CMS**
   - Navigate to mq-studio.com/studio
   - Enter email and password
   - Click "Sign In"
   - → Dashboard appears

2. **Start New Musing**
   - Click prominent "New Musing" button on dashboard
   - → Editor page opens with empty form

3. **Fill Basic Information**
   - Enter title: "Reflections on Design Thinking"
   - → Slug auto-generates: "reflections-on-design-thinking"
   - Select category dropdown: "Thinking" (blue indicator appears)
   - → Category color theme applied to editor

4. **Write Content**
   - Click in main content area
   - → WYSIWYG editor activates with formatting toolbar
   - Type/paste content
   - Format text (bold key phrases, create headings)
   - → Formatting appears in real-time

5. **Add Images**
   - Drag image from desktop into editor
   - → Upload progress bar appears
   - → Image inserts at cursor position
   - Click image to add caption and alt text
   - → Image settings panel slides in
   - Enter caption and alt text
   - Click "Save" on panel

6. **Add Metadata**
   - Scroll to metadata section
   - Start typing tags: "design, creativity, process"
   - → Existing tags autocomplete
   - Select or create new tags
   - Write excerpt in dedicated field (2-3 sentences)
   - Toggle "Featured" switch if desired

7. **Preview Content**
   - Click "Preview" button
   - → Preview pane opens showing how post will appear
   - Review formatting, images, metadata
   - Close preview

8. **Save and Publish**
   - Click "Save Draft" (auto-saves already happening)
   - → "Draft saved" confirmation appears
   - Click "Publish" button
   - → Confirmation dialog: "Publish this musing now?"
   - Click "Yes, Publish"
   - → Publishing spinner appears
   - → Success message: "Published! View your post"
   - Click link to view live post

### Edge Cases & Error Handling

1. **Network Issues During Image Upload**
   - Drag image into editor
   - → Upload starts, network fails
   - → Error message: "Upload failed. Click to retry"
   - Click retry button
   - → Upload resumes

2. **Duplicate Title/Slug**
   - Enter title that already exists
   - → Warning appears: "A post with this title exists"
   - → Slug auto-appends number: "reflections-on-design-thinking-2"
   - → Option to override slug manually

3. **Session Timeout**
   - Work on post for extended time
   - Session expires in background
   - Click "Publish"
   - → Modal: "Session expired. Please sign in to continue"
   - → Content preserved in form
   - Sign in
   - → Return to editor with content intact

4. **Validation Errors**
   - Try to publish without title
   - → Field highlights red
   - → Error: "Title is required"
   - Try to publish without category
   - → Error: "Please select a category"

5. **Large File Upload**
   - Drag 50MB image
   - → Warning: "Image too large (max 10MB)"
   - → Suggestion: "Would you like to optimize this image?"
   - Click "Optimize"
   - → Image compressed and uploaded

6. **Unsaved Changes**
   - Make edits
   - Try to navigate away
   - → Browser warning: "You have unsaved changes"
   - → Options: "Save and Leave" / "Leave Without Saving" / "Cancel"

### Time Estimates
- Happy path: 5-10 minutes
- With image optimization: +2 minutes
- With multiple images: +3-5 minutes
- First-time user: +5 minutes exploration

---

## Journey 2: Edit Existing Musing

### Context
Moura notices a typo in a published post and wants to update it. She also wants to add a new image.

### Happy Path

1. **Find Content**
   - Login to CMS → Dashboard
   - Click "Musings" in main navigation
   - → List of all musings appears
   - Use search box: "design thinking"
   - → List filters to matching posts
   - Click on post title
   - → Editor opens with existing content

2. **Make Edits**
   - Click in text where typo exists
   - Fix typo
   - → Auto-save indicator shows "Saving..."
   - → Changes to "Saved"

3. **Add New Image**
   - Position cursor where image should go
   - Click image button in toolbar
   - → Media library modal opens
   - Click "Upload New"
   - Select image from computer
   - → Upload progress, then image appears in library
   - Click "Insert"
   - → Image added to content

4. **Update and Republish**
   - Review changes
   - Click "Update" button
   - → "Update published post?" confirmation
   - Click "Yes, Update"
   - → Processing spinner
   - → Success: "Post updated successfully"

### Edge Cases

1. **Concurrent Editing** (Future consideration)
   - Someone else editing same post
   - → Warning: "This post is being edited by [name]"
   - → Options: "View Only" / "Take Over Editing"

2. **Breaking Changes**
   - Delete all content accidentally
   - → Undo button appears prominently
   - Click undo
   - → Content restored

---

## Journey 3: Manage Media Library

### Context
Moura wants to organize her images and delete unused ones to keep things tidy.

### Happy Path

1. **Access Media Library**
   - From dashboard, click "Media Library"
   - → Grid view of all uploaded media
   - → Shows image thumbnails, file names, dates

2. **Find Specific Images**
   - Use search box: "watercolor"
   - → Grid filters to matching images
   - Click "Unused" filter
   - → Shows only images not in any posts

3. **Select and Delete**
   - Click checkbox on multiple images
   - → Selection count appears: "3 selected"
   - Click "Delete Selected"
   - → Confirmation: "Delete 3 images? This cannot be undone"
   - Click "Delete"
   - → Images removed, success message

4. **Upload Multiple Images**
   - Click "Upload" button
   - → File picker or drag-drop zone appears
   - Select 10 images
   - → Upload progress for each
   - → All images appear in grid when complete

### Edge Cases

1. **Delete Image in Use**
   - Select image used in post
   - Click delete
   - → Warning: "This image is used in 2 posts"
   - → Show list of posts
   - → Options: "Cancel" / "Delete Anyway"

2. **Duplicate Upload**
   - Upload image that already exists
   - → Notice: "Similar image already exists"
   - → Options: "Replace Existing" / "Keep Both" / "Cancel"

---

## Journey 4: Create and Manage Tags

### Context
Moura wants to organize her content better with a new tagging system.

### Happy Path

1. **Access Tag Management**
   - From dashboard, click "Tags & Categories"
   - → Page shows all existing tags with usage counts

2. **Create New Tag**
   - Click "New Tag" button
   - Enter tag name: "sustainability"
   - Select color (optional)
   - Add description (optional)
   - Click "Create"
   - → Tag added to list

3. **Bulk Apply Tags**
   - Go to Musings list
   - Select multiple posts via checkboxes
   - Click "Actions" → "Add Tags"
   - → Tag selector appears
   - Select "sustainability"
   - Click "Apply"
   - → "Tags added to 5 posts"

4. **Merge Tags**
   - Notice "eco-design" and "ecological-design" are similar
   - Select both tags
   - Click "Merge Tags"
   - → "Merge into which tag?"
   - Select "ecological-design"
   - → All posts updated, old tag removed

### Edge Cases

1. **Delete Tag in Use**
   - Try to delete active tag
   - → Warning: "This tag is used in 15 posts"
   - → Options: "Remove from all posts" / "Cancel"

---

## Journey 5: Daily Dashboard Check

### Context
Moura starts her day by checking her website's activity and planning new content.

### Happy Path

1. **Login and Overview**
   - Navigate to CMS, sign in
   - → Dashboard loads with widgets

2. **Review Statistics Widget**
   - See "Week at a Glance"
   - → 3 posts published
   - → 1,247 visitors
   - → 5 comments pending (future)

3. **Check Drafts Widget**
   - See "Drafts (2)"
   - → List shows titles and last edited
   - Click draft title
   - → Opens in editor

4. **Quick Actions**
   - Use "Quick Create" buttons
   - → New Musing / New Artwork / New Publication
   - Click based on today's priority

5. **Review Recent Activity**
   - See timeline of recent actions
   - → "Published 'Design Thinking' - 2 hours ago"
   - → "Uploaded 3 images - Yesterday"
   - → "Updated About page - 3 days ago"

### Customization Options
- Drag widgets to reorder
- Hide/show widgets via settings
- Set default view (dashboard vs. content list)

---

## Journey 6: Add New Artwork

### Context
Moura has finished a new watercolor painting and wants to add it to her gallery.

### Happy Path

1. **Start New Artwork**
   - Click "New Artwork" from dashboard
   - → Artwork editor opens

2. **Upload Artwork Image**
   - Drag high-res image into primary image area
   - → Upload with progress
   - → Image appears with crop/focal point tool
   - Adjust focal point for thumbnail generation
   - Click "Apply"

3. **Add Artwork Details**
   - Enter title: "Morning Mist"
   - Select medium: "Watercolor on paper"
   - Enter dimensions: "16 x 20 inches"
   - Enter year: "2024"
   - Write description (1-2 paragraphs)
   - Toggle "Featured" if desired
   - Add tags: "landscape, watercolor, nature"

4. **Add Process Images** (Optional)
   - Click "Add Process Images"
   - Upload 2-3 work-in-progress photos
   - → Creates image carousel

5. **Set Availability** (Future)
   - Select "Original Available" / "Prints Available" / "Sold"
   - Enter price (optional)

6. **Publish to Gallery**
   - Click "Add to Gallery"
   - → Processing
   - → Success: "Artwork added to gallery"

---

## Journey 7: Update Publication

### Context
Moura's research paper has been published in a journal and she wants to update the listing with the final PDF.

### Happy Path

1. **Find Publication**
   - Navigate to "Publications"
   - → List of all publications
   - Find draft entry
   - Click to edit

2. **Upload PDF**
   - Click "Upload PDF" button
   - Select file from computer
   - → Upload progress
   - → PDF preview appears

3. **Update Metadata**
   - Update status: "Draft" → "Published"
   - Add journal name
   - Add DOI/link
   - Update publication date
   - Add co-authors

4. **Update and Publish**
   - Click "Update"
   - → Changes saved
   - → Publication now shows in public list

---

## Journey 8: Emergency Content Removal

### Context
Moura realizes she accidentally published sensitive information and needs to immediately remove it.

### Critical Path

1. **Quick Access**
   - Login to CMS
   - → See "Recent Posts" on dashboard
   - Post is at top of list

2. **Immediate Unpublish**
   - Click "Unpublish" button next to post
   - → Confirmation: "Remove this post from public view?"
   - Click "Yes, Unpublish Now"
   - → Post immediately removed from site
   - → Status changes to "Draft"

3. **Edit Content**
   - Click post title to edit
   - Remove sensitive information
   - Save as draft

4. **Verify Removal**
   - Open site in new tab
   - Verify post no longer accessible
   - → 404 page shows for old URL

**Time to Remove: < 30 seconds from login**

---

## Mobile/Tablet Journeys

### Context
Moura is traveling and wants to draft a post on her iPad.

### Adapted Flow

1. **Mobile Dashboard**
   - Open CMS on iPad
   - → Responsive layout with hamburger menu
   - Tap menu → "New Musing"

2. **Mobile Editor**
   - → Full-screen editor opens
   - → Formatting toolbar scrolls horizontally
   - → Virtual keyboard appears

3. **Image Handling**
   - Tap image button
   - → Options: "Take Photo" / "Photo Library" / "Files"
   - Select from photo library
   - → Image uploads and inserts

4. **Save for Later**
   - Type content
   - → Auto-saves every 30 seconds
   - Tap "Save Draft"
   - → Can finish on desktop later

### Mobile-Specific Considerations
- Larger touch targets (min 44px)
- Swipe gestures for navigation
- Simplified toolbar (most-used options)
- Full-screen focus mode
- Offline draft capability (future)

---

## Accessibility Journeys

### Context
Ensuring the CMS is usable with keyboard navigation and screen readers.

### Keyboard Navigation Flow

1. **Tab Through Interface**
   - Tab key moves through all interactive elements
   - Shift+Tab moves backward
   - Enter activates buttons/links
   - Escape closes modals

2. **Editor Shortcuts**
   - Ctrl/Cmd + B = Bold
   - Ctrl/Cmd + I = Italic
   - Ctrl/Cmd + S = Save
   - Ctrl/Cmd + Enter = Publish
   - Ctrl/Cmd + Z = Undo

3. **Screen Reader Announcements**
   - "Main navigation"
   - "New Musing, button"
   - "Title, edit text, required"
   - "Rich text editor, application"
   - "Publish, button"

---

## Performance Expectations

### Load Times
- Initial dashboard: < 2 seconds
- Content list (100 items): < 1 second
- Editor open: < 1.5 seconds
- Image upload (5MB): < 5 seconds
- Publish action: < 3 seconds
- Auto-save: < 500ms

### Feedback Timing
- Button click feedback: Immediate (< 100ms)
- Form validation: On blur (< 200ms)
- Search results: As typing (< 300ms)
- Preview generation: < 2 seconds

---

## Error Recovery Patterns

### Universal Patterns

1. **Network Failure**
   - Action fails
   - → Show error with retry button
   - → Preserve user data
   - → Retry with exponential backoff

2. **Validation Failure**
   - Show inline error messages
   - Highlight problem fields
   - Scroll to first error
   - Provide clear fix instructions

3. **Permission Errors**
   - Session expired
   - → Save current state
   - → Prompt re-authentication
   - → Restore state after login

4. **Data Loss Prevention**
   - Auto-save every 30 seconds
   - Local storage backup
   - Confirmation for destructive actions
   - Undo/redo for last 20 actions

---

## Success Metrics for User Journeys

### Task Completion Rates
- Create and publish musing: > 95%
- Edit existing content: > 98%
- Upload media: > 95%
- Manage tags: > 90%

### Time on Task
- First post: < 10 minutes
- Subsequent posts: < 7 minutes
- Quick edit: < 2 minutes
- Image upload: < 30 seconds

### Error Rates
- Validation errors per session: < 2
- Failed publishes: < 1%
- Lost work incidents: 0%

### User Satisfaction
- "Easy to use" rating: > 90%
- "Would recommend" score: > 85%
- Support tickets: < 1 per month

---

## Next Steps

These user journeys inform:
1. Information architecture design
2. Wireframe layouts
3. Technical requirements
4. API endpoint planning
5. Error handling strategies
6. Performance budgets
7. Accessibility requirements

The journeys prioritize:
- **Simplicity** - Minimal steps to achieve goals
- **Clarity** - Clear feedback at every step
- **Safety** - No data loss, easy recovery
- **Speed** - Quick task completion
- **Flexibility** - Multiple ways to achieve goals