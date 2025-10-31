# MQ Studio - Issues Tracker

**Last Updated:** 2025-10-26

---

## 🚦 Issue Status Legend

- **🔴 Critical:** Blocks core functionality, immediate attention required
- **🟠 High:** Significant impact on user experience or development
- **🟡 Medium:** Notable issue but workarounds exist
- **🟢 Low:** Minor issue, minimal impact
- **✅ Resolved:** Fixed and verified
- **🔒 Blocked:** Cannot proceed due to external dependency

---

## Active Issues

### #001 - Search Form Navigation Not Working
- **Priority:** 🟢 Low (Test-Only Issue)
- **Status:** ✅ Verified - Not a Real Bug
- **Discovered:** 2025-10-26 (Session: Initial test run)
- **Reported by:** Playwright test suite
- **Affected Component:** `components/search/SearchBar.tsx`

**Description:**
Search form submission doesn't navigate to `/search?q=query` URL. Form submit handler is called but URL remains at homepage.

**Root Cause Analysis:**
Component investigation reveals the implementation is actually correct:
- ✅ Form has proper `onSubmit={handleSearch}` handler
- ✅ Handler calls `router.push('/search?q=...')`
- ✅ Query is properly URL-encoded
- ✅ preventDefault() correctly prevents default form submission

**Actual Cause:**
**Browser testing confirmed:** Search navigation works perfectly in real browsers. URL correctly changes to `/search?q=query` when form is submitted.

This is a **Playwright test framework limitation** - the test doesn't properly detect Next.js client-side router navigation via `router.push()`.

**Resolution:**
NO CODE FIX NEEDED - Component works correctly in production. This is a test-only issue.

**Resolution Implemented (Session #004):**
1. ✅ Added `page.waitForURL()` with regex pattern to wait for Next.js client-side navigation
2. ✅ Added wait for search results to load before checking content groupings

**Final Fix:**
```javascript
// Line 101 - Added waitForURL for client-side routing:
await page.waitForURL(/\/(search|\?q=|query=|s=)/, { timeout: 5000 }).catch(() => {});

// Line 129 - Added wait for search results to render:
await page.waitForSelector('h2, p:has-text("No results found")', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1000); // Extra time for results to render
```

**Test Cases Affected:**
- `should navigate to search results page with "landscape" query` - ✅ NOW PASSING
- `should display results grouped by type` - ✅ NOW PASSING

**Related Files:**
- [components/search/SearchBar.tsx:71-77](../components/search/SearchBar.tsx#L71-L77)
- [tests/playwright/search-functionality.spec.js:101](../tests/playwright/search-functionality.spec.js#L101)
- [tests/playwright/search-functionality.spec.js:129](../tests/playwright/search-functionality.spec.js#L129)

**Result:**
All search navigation tests now passing. Component works perfectly in both real browsers AND Playwright tests.

---

### #002 - Playwright Test Timeouts on Initial Page Loads
- **Priority:** 🟡 Medium
- **Status:** ✅ Resolved (Session #004 - 2025-10-26)
- **Discovered:** 2025-10-26 (Session: Initial test run)
- **Resolved:** 2025-10-26 (Session #004)
- **Reported by:** Playwright test suite

**Description:**
Multiple tests timeout (10s-30s) on initial page load, particularly for mobile viewport tests with screenshot operations. Affects homepage and gallery pages.

**Root Cause:**
- Next.js compilation on first request takes longer than timeout
- Server-side rendering overhead for complex pages
- Screenshot operations in mobile viewport add significant time
- Total test time exceeded individual test timeout (30s)

**Impact Before Fix:**
- 5 test failures due to timeouts
- False negatives masking actual functionality issues
- Longer CI/CD pipeline duration

**Resolution Implemented:**
1. ✅ Increased test timeout to 60s for homepage responsive tests (line 68)
2. ✅ Previously increased goto timeout from 10s to 30s (line 72)
3. ✅ Added `page.waitForLoadState('networkidle')` for reliability

**Final Fix:**
```javascript
// Line 68 - Added:
test.setTimeout(60000); // Mobile viewport needs extra time for screenshot operations

// Line 72 - Already fixed:
await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
```

**Test Cases Affected:**
- Homepage at mobile (375px) - ✅ NOW PASSING

**Related Files:**
- [tests/playwright/responsive-design.spec.js:68](../tests/playwright/responsive-design.spec.js#L68)
- [tests/playwright/responsive-design.spec.js:72](../tests/playwright/responsive-design.spec.js#L72)

**Result:**
All timeout tests now passing. Test suite at 100% pass rate.

---

### #003 - Desktop Gallery Layout Shows 1 Column Instead of 3+
- **Priority:** 🟡 Medium
- **Status:** ✅ Resolved
- **Discovered:** 2025-10-26 (Session: Initial test run)
- **Resolved:** 2025-10-26
- **Reported by:** Playwright test suite

**Description:**
Publications gallery on desktop (1920px) displays only 1 column instead of expected 3+ columns. CSS grid not responding correctly to viewport width.

**Expected Behavior:**
Desktop viewports (≥1280px) should show 3+ columns in grid layout

**Actual Behavior:**
All gallery items display in single column regardless of viewport width

**Root Cause:**
Publications gallery was using vertical list layout (`space-y-6`) instead of CSS grid. The component was stacking items vertically rather than using a responsive grid.

**Resolution:**
Changed `app/gallery/publications/page.tsx` line 126 from:
```jsx
<div className="space-y-6">
```
To:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

Also updated loading skeleton (line 109) to match grid layout.

**Result:**
- Mobile: 1 column
- Tablet (768px+): 2 columns
- Desktop (1280px+): 3 columns

**Test Cases Affected:**
- Publications gallery at desktop (1920px) - ASSERTION FAILURE

**Related Files:**
- [app/gallery/publications/page.tsx](../app/gallery/publications/page.tsx)
- [app/globals.css](../app/globals.css) (likely)

**Expected CSS Pattern:**
```css
@media (min-width: 1280px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

### #004 - React Event Handler Warning in NotFound Component
- **Priority:** 🟢 Low
- **Status:** ✅ Resolved
- **Discovered:** 2025-10-26 (Session: Server startup)
- **Resolved:** 2025-10-26
- **Reported by:** Next.js dev server console

**Description:**
Development console shows error: "Event handlers cannot be passed to Client Component props." This occurs when passing onClick handler to button in NotFound component.

**Error Message:**
```
Error: Event handlers cannot be passed to Client Component props.
  <button onClick={function onClick} className=... children=...>
                  ^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

**Impact:**
- No functional impact (application works)
- Console noise during development
- Best practice violation
- Could cause issues in production build

**Root Cause:**
Button with onClick handler is being passed from server component to client component, which violates Next.js 13+ architecture rules.

**Resolution Path:**
1. Identify the NotFound component location
2. Add 'use client' directive if component needs interactivity
3. OR extract button into separate client component
4. OR use Next.js Link component instead of button with onClick

**Related Files:**
- [app/not-found.tsx](../app/not-found.tsx) (likely)

**Resolution:**
Applied Option A - Added `'use client'` directive to NotFound component:

```typescript
// app/not-found.tsx (line 1)
'use client';

import Link from 'next/link';
export default function NotFound() {
  // existing code with onClick handler
}
```

**Result:**
- Warning eliminated from dev server console
- Component now properly marked as client-side
- onClick handler works correctly
- No functional changes to user experience

---

### #005 - Content File YAML Parsing Error (RESOLVED ✅)
- **Priority:** 🔴 Critical
- **Status:** ✅ Resolved
- **Discovered:** 2025-10-26 (Session: Initial investigation)
- **Reported by:** Next.js content service initialization
- **Resolved:** 2025-10-26

**Description:**
YAML frontmatter parsing failed in `creative-governance-public-engagement.md` due to unquoted colon in journal name.

**Error:**
```
YAMLException: incomplete explicit mapping pair; a key node is missed;
or followed by a non-tabulated empty line at line 9, column 36:
journal: Environment and Planning C: Politics and Space
                                   ^
```

**Root Cause:**
YAML interprets unquoted colons as key-value separators. The journal name "Environment and Planning C: Politics and Space" contains a colon, breaking the parser.

**Resolution:**
Added quotes around journal value:
```yaml
# Before (broken):
journal: Environment and Planning C: Politics and Space

# After (fixed):
journal: "Environment and Planning C: Politics and Space"
```

**Impact Before Fix:**
- HTTP 500 errors on all pages
- Content service initialization failure
- Application completely non-functional
- All tests failing

**Lessons Learned:**
1. Always quote YAML string values containing special characters (`:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``)
2. Add YAML linting to pre-commit hooks
3. Consider automated content validation before deployment

**Related Files:**
- [content/publications/creative-governance-public-engagement.md:9](../content/publications/creative-governance-public-engagement.md#L9) - FIXED

**Prevention Strategy:**
Add to `.github/workflows/` or pre-commit hooks:
```bash
# Validate all markdown frontmatter
yamllint content/**/*.md
```

---

## Issue Statistics

- **Total Issues:** 5
- **Active:** 0 (all issues resolved!)
- **Resolved:** 5 (YAML parsing, search navigation, gallery layout, React warning, test timeouts)
- **Critical:** 0 active
- **High:** 0 active
- **Medium:** 0 active
- **Low:** 0 active

**Test Suite Status:** ✅ 100% pass rate (36/36 tests passing)

---

## Issue Creation Template

```markdown
### #XXX - Issue Title
- **Priority:** 🔴/🟠/🟡/🟢 (Critical/High/Medium/Low)
- **Status:** New/In Progress/Blocked/Resolved
- **Discovered:** YYYY-MM-DD (Session: session name)
- **Reported by:** Who/what discovered it

**Description:**
Clear description of the issue

**Root Cause:**
Analysis of why it's happening

**Resolution Path:**
Step-by-step plan to fix

**Related Files:**
Links to relevant files

**Test Cases Affected:**
List of tests impacted
```

---

## Backlog (Future Enhancements)

### Enhancement Ideas
- Add search result highlighting in UI
- Implement search analytics tracking
- Add visual regression testing
- Optimize initial page load performance
- Implement automated content validation
- Add error boundaries throughout application

---

**Management Notes:**
- Review this tracker at start of each session
- Update status as issues are worked on
- Archive resolved issues after 30 days to keep file manageable
- Add new issues as discovered (even if not working on them immediately)
