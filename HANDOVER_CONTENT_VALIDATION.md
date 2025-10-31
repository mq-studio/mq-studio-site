# Content Validation Handover - Session #005

**Created:** 2025-10-27
**Handover From:** Session #004 Migration Specialist
**Handover To:** Content Validation Orchestrator
**Project:** MQ Studio Website
**Branch:** `initial-release`
**Expected Duration:** 30-45 minutes

---

## Executive Summary

### What Was Completed (Session #004)
- ✅ Migrated 9 diverse content items from `background_assets/`
- ✅ Created 10 markdown files (7 artworks, 2 projects, 1 publication)
- ✅ Copied 20 images (10 optimized + 10 originals)
- ✅ Generated AI descriptions (marked as placeholders)
- ✅ Created comprehensive validation checklist
- ✅ Files created but **NOT validated in browser**

### What Needs Validation (Your Task)
- 🔲 Validate content displays correctly in browser
- 🔲 Test images load properly at all breakpoints
- 🔲 Review AI-generated descriptions for quality
- 🔲 Document issues systematically
- 🔲 Get user approval to proceed with full migration

### Success Criteria
✅ All images display correctly
✅ Content is readable and well-formatted
✅ No broken links or image paths
✅ Responsive design works (mobile/tablet/desktop)
✅ User approves migration approach
✅ Issues documented with severity levels

---

## Quick Start Instructions

### Step 1: Review This Document (5 minutes)
Read sections 1-7 to understand the context and validation approach.

### Step 2: Start Dev Server (1 minute)
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev
# Server will start at: http://localhost:3100
```

### Step 3: Open Browser (Required for Real-Life Testing)
**Human Required:** This step cannot be automated due to IDP Testing Framework:
- Open browser to: http://localhost:3100
- Keep `VALIDATION_CHECKLIST.md` open alongside browser
- Prepare to document findings

### Step 4: Systematic Validation (25-35 minutes)
Follow `VALIDATION_CHECKLIST.md` systematically:
1. Test 1: Artworks Gallery (7 items)
2. Test 2: Projects Gallery (2 items)
3. Test 3: Publications Gallery (1 item)
4. Test 4: Image Quality
5. Test 5: Content Quality
6. Test 6: Responsive Design
7. Test 7: Search Functionality
8. Test 8: Cross-Reference Validation

### Step 5: Document Results (5 minutes)
Update `VALIDATION_CHECKLIST.md` with findings and make approval decision.

### Step 6: Report to User (2 minutes)
Summarize findings and recommendation in clear, actionable format.

---

## 1. Validation Approach

### Testing Strategy (IDP Framework Compliant)

#### Phase 1: Simulated Testing ✅ (Already Done)
- File structure validation
- Markdown syntax validation
- Image file existence checks
- Frontmatter schema compliance

#### Phase 2: Real-Life Testing ⏳ (Current Phase)
**Why Human Required:**
- Visual assessment of image quality
- Subjective evaluation of AI-generated descriptions
- Responsive design validation across viewports
- Interaction testing (clicks, navigation, filtering)
- Browser console error detection

**Cannot be automated because:**
- Requires subjective design judgment
- Need to assess "good enough" for AI descriptions
- Visual regression baseline doesn't exist yet
- First-time content migration (no comparison data)

#### Phase 3: Automated Testing 🔮 (Future Phase)
**After approval, can implement:**
- Screenshot comparison tests (Playwright)
- Automated responsive design checks
- Broken link detection
- Image optimization validation
- Performance benchmarking

### Validation Methodology
1. **Systematic:** Follow checklist line-by-line
2. **Documented:** Record every issue found
3. **Categorized:** Use severity levels (Critical/High/Medium/Low)
4. **Actionable:** Provide specific fix recommendations
5. **Evidence-Based:** Capture screenshots of issues

---

## 2. Files to Know About

### Primary Tool
📋 **VALIDATION_CHECKLIST.md**
- Your primary reference during testing
- 8 comprehensive test scenarios
- Pre-formatted issue documentation sections
- Approval decision framework

### Background Context
📄 **CONTENT_MIGRATION_SAMPLE_REVIEW.md**
- Detailed migration summary
- File structure overview
- Metadata quality notes
- Image optimization recommendations

### Content Files Created (10 total)

#### Artworks (7 files)
```
/content/artworks/cherry-blossoms-painting.md
/content/artworks/daffodils-spring-painting.md
/content/artworks/fraser-river-willows.md
/content/artworks/university-excellence-sketch.md
/content/artworks/northgate-concept.md
/content/artworks/shufa-calligraphy-long-life.md
/content/artworks/shufa-calligraphy-happiness-scroll.md
```

#### Projects (2 files - dual entries from landscape designs)
```
/content/projects/university-excellence-sketch.md
/content/projects/northgate-concept-landscape.md
```

#### Publications (1 file)
```
/content/publications/principled-governance-fushtey.md
```

### Image Files Created (20 total)

#### Optimized Images (10 files)
```
/public/images/artworks/cherry-blossoms.jpg
/public/images/artworks/daffodils.jpg
/public/images/artworks/fraser-river-willows.jpg
/public/images/artworks/university-excellence-sketch.jpeg
/public/images/artworks/northgate-concept.jpg
/public/images/artworks/shufa-calligraphy-1.jpeg
/public/images/artworks/shufa-calligraphy-2.jpeg
/public/images/projects/university-excellence-sketch.jpeg
/public/images/projects/northgate-concept.jpg
/public/images/publications/principled-governance-cover.jpg
```

#### Original Images (10 files - preserved in /originals/)
```
/public/images/originals/[category]/[same-filenames]
```

### Project Configuration
```
/package.json - Dev server config (port 3100)
/.claude/CLAUDE.md - Project context (optional review)
/CLAUDE.md - Repository context (optional review)
```

---

## 3. Testing Protocol (IDP Framework)

### Testing Hierarchy

#### Level 1: Simulated Testing ✅ Complete
**What was tested:**
- File existence and structure
- Markdown syntax validation
- Image file presence
- Frontmatter schema compliance
- URL slug generation

**Results:** All passed

#### Level 2: Real-Life Testing ⏳ Current Phase
**What needs testing:**
1. **Visual Display**
   - Images render correctly
   - Aspect ratios preserved
   - No pixelation or distortion
   - Colors accurate

2. **Content Quality**
   - Titles descriptive and appropriate
   - Descriptions reasonable (even if AI-generated)
   - Dates shown correctly or marked "date unknown"
   - Tags relevant and useful

3. **Interaction**
   - Gallery grids display correctly
   - Click-through to detail pages works
   - PDF download functions
   - Search finds items correctly
   - Featured items marked appropriately

4. **Responsive Design**
   - Mobile (375px): 1 column layout
   - Tablet (768px): 2 column layout
   - Desktop (1920px): 3-4 column layout
   - Navigation accessible at all sizes

5. **Cross-References**
   - Landscape designs appear in BOTH artworks AND projects
   - Same images used in both places
   - Descriptions appropriate for each context

#### Level 3: Automated Testing 🔮 Post-Approval
**Can be implemented after validation:**
- Screenshot regression tests
- Responsive design automation
- Link checking automation
- Image optimization validation
- Performance profiling

### Testing Tools Available

#### Browser Vision Capabilities ✅ Available
**Method 1: bash_tool + Playwright (Ready Now)**
```bash
# Take screenshots for documentation
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({ path: "artworks-gallery.png", fullPage: true });
  await browser.close();
})();'
```

**Use cases:**
- Capture gallery views for review
- Document issues visually
- Compare before/after fixes
- Create validation evidence

**Note:** Playwright is already installed (`@playwright/test@^1.48.0`)

---

## 4. Agent Delegation Strategy

### What Should Use Agent Assistance

#### Automated Screenshot Capture ✅
**Agent Capability:** High
**Tools:** Playwright via bash_tool
**Use for:**
- Capturing gallery views at different viewports
- Documenting issues with screenshots
- Creating before/after comparison images

**Example delegation:**
```
Agent: "Capture screenshots of artworks gallery at mobile (375px),
tablet (768px), and desktop (1920px) viewports"
```

#### Console Error Detection ✅
**Agent Capability:** High
**Tools:** Playwright console listener
**Use for:**
- Detecting JavaScript errors
- Finding broken image URLs
- Identifying 404s or network issues

#### Content File Analysis ✅
**Agent Capability:** High
**Tools:** Read, Grep
**Use for:**
- Verifying frontmatter consistency
- Checking for placeholder text patterns
- Validating image path references

### What Needs Human Testing ⚠️

#### Visual Quality Assessment 👤 Human Required
**Why:** Subjective design judgment needed
- Image quality and appearance
- Color accuracy and vibrancy
- Layout aesthetic appeal
- Typography readability

#### Description Quality Review 👤 Human Required
**Why:** Contextual understanding needed
- AI-generated descriptions accuracy
- Tone and voice alignment
- Cultural sensitivity (especially Chinese calligraphy)
- Personal/historical context only owner knows

#### Feature Prioritization 👤 Human Required
**Why:** Business decision needed
- Which items should be "featured"
- Content categorization decisions
- Navigation structure preferences

#### Final Approval Decision 👤 Human Required
**Why:** Stakeholder sign-off needed
- Overall satisfaction with migration approach
- Approval to proceed with full migration
- Budget allocation for next phase

### Hybrid Approach (Human + Agent)

**Recommended workflow:**
1. Agent captures screenshots at all viewports
2. Human reviews screenshots for visual issues
3. Agent checks console for technical errors
4. Human validates content quality and descriptions
5. Agent documents findings in checklist
6. Human makes final approval decision

---

## 5. Expected Issues

Based on migration process and common patterns, expect these issues:

### High Probability Issues

#### Image Path Problems 🔴 Critical
**Likelihood:** Medium
**Symptoms:**
- Broken image icons
- Alt text displayed instead of images
- 404 errors in console

**Causes:**
- Incorrect path in markdown frontmatter
- File extension mismatch (.jpg vs .jpeg)
- Case sensitivity issues

**How to diagnose:**
- Check browser console for 404s
- Compare image path in markdown to actual file location
- Verify public/ prefix usage

**Fix approach:**
```bash
# Verify image paths in content files
grep -r "image:" content/ | grep -v "^#"

# Check actual image files exist
ls -la public/images/artworks/
ls -la public/images/projects/
ls -la public/images/publications/
```

#### AI Description Quality 🟡 Medium
**Likelihood:** High
**Symptoms:**
- Generic, uninspired descriptions
- Factual inaccuracies
- Cultural misinterpretation (calligraphy)
- Overly verbose or flowery language

**Causes:**
- AI generated without human context
- No personal insight or backstory
- Limited visual analysis

**How to diagnose:**
- Read each description critically
- Look for `[AI GENERATED - PLACEHOLDER]` tags
- Check for obvious errors or assumptions

**Fix approach:**
- Document which descriptions need rewriting
- Prioritize by importance (featured items first)
- Note specific issues to guide rewrite

#### Date Information Missing 🟢 Low
**Likelihood:** Very High (8 of 9 items)
**Symptoms:**
- "Date unknown" shown in metadata
- Timeline sorting may be inaccurate

**Causes:**
- Filenames didn't contain dates
- No metadata in original files

**How to diagnose:**
- Check frontmatter `date:` field
- Count items marked "date unknown"

**Fix approach:**
- User needs to provide dates from memory/records
- Can estimate based on style/context
- Lower priority (doesn't block approval)

### Medium Probability Issues

#### Dual Entry Consistency 🟡 Medium
**Likelihood:** Medium
**Symptoms:**
- Same item appears differently in artworks vs projects
- Image doesn't match between entries
- Description not appropriate for context

**Causes:**
- Manual creation of dual entries
- Copy-paste errors
- Different context requirements

**How to diagnose:**
- Compare university-excellence-sketch in both galleries
- Compare northgate-concept in both galleries
- Check image URLs match
- Verify descriptions make sense in each context

#### Featured Item Selection 🟡 Medium
**Likelihood:** Medium
**Symptoms:**
- Featured items not user's preference
- Homepage displays wrong items
- Important works not highlighted

**Causes:**
- Agent made assumptions about featured status
- Used visual quality as proxy for importance
- No user guidance on preferences

**How to diagnose:**
- Check which items show on homepage
- Review featured: true/false in frontmatter
- Assess if selections align with user's priorities

### Low Probability Issues

#### Responsive Layout Issues 🟢 Low
**Likelihood:** Low (framework handles this)
**Symptoms:**
- Layout breaks at certain viewports
- Images overflow containers
- Text truncated or overlapping

**Causes:**
- CSS framework issues
- Custom styles conflicting
- Image aspect ratio edge cases

#### Search Not Finding Items 🟢 Low
**Likelihood:** Low
**Symptoms:**
- Expected search terms don't return results
- Items with matching tags not found

**Causes:**
- Search indexing issue
- Tag format inconsistency

---

## 6. Success Criteria

### Must Pass (Critical)

✅ **All Images Display**
- No broken image icons
- No 404 errors in console
- Images load within 2 seconds
- File size <5MB each (optimization phase)

✅ **Content Structure Works**
- Gallery grids render correctly
- Detail pages accessible via click
- Featured items show on homepage
- PDF download functions (publication)

✅ **No Critical Errors**
- No JavaScript console errors
- No broken internal links
- All pages load successfully

### Should Pass (High Priority)

✅ **Responsive Design Functions**
- Mobile layout: 1 column
- Tablet layout: 2 columns
- Desktop layout: 3-4 columns
- Navigation accessible at all sizes

✅ **Cross-References Work**
- Landscape designs in BOTH galleries
- Same images used in both contexts
- Descriptions appropriate for context

✅ **Search Functions**
- Key terms find relevant items
- Tag filtering works
- Results display correctly

### Nice to Have (Medium Priority)

✅ **Description Quality Acceptable**
- AI descriptions "good enough" for now
- No obvious factual errors
- Tone reasonably aligned
- Can be refined in next phase

✅ **Visual Polish**
- Images well-composed
- Color balance acceptable
- Aspect ratios pleasing
- Overall aesthetic coherent

### Can Defer (Low Priority)

⏸️ **Date Information**
- Many items marked "date unknown"
- Can research/estimate later
- Doesn't block approval

⏸️ **Image Optimization**
- Files currently unoptimized (1-4MB)
- Target: 200-500KB for web
- Planned for separate optimization pass

⏸️ **Metadata Completeness**
- Some fields empty (client, location)
- Some placeholders present
- Can populate during full migration

---

## 7. Next Steps After Validation

### Scenario A: Approved ✅

**If validation passes and user approves:**

1. **Immediate Actions**
   - Mark VALIDATION_CHECKLIST.md as approved
   - Document any minor issues to track
   - Commit validated sample to git

2. **Full Migration Plan**
   - **Batch 1:** Remaining watercolors (~50 items)
   - **Batch 2:** Additional landscape designs (~4 items)
   - **Batch 3:** Dave Fushtey publications
   - **Batch 4:** Audio/podcast content (if applicable)

3. **Parallel Agent Strategy**
   - Deploy 4-5 parallel migration agents
   - Each handles 10-15 items
   - Coordinated by orchestrator
   - Expected time: 1-2 hours
   - Expected cost: 30-40k tokens

4. **Image Optimization Phase**
   - Compress all images to 200-500KB
   - Generate WebP versions
   - Create responsive image sets
   - Preserve originals in /originals/

5. **Description Refinement**
   - User reviews AI descriptions
   - Prioritize featured items
   - Add personal context/backstories
   - Cultural expert review (calligraphy)

### Scenario B: Approved with Changes 🔧

**If issues found but approach is sound:**

1. **Immediate Actions**
   - Document all issues by severity
   - Create fix plan with priorities
   - Estimate time to resolve

2. **Fix Phase**
   - Address Critical issues first
   - Handle High priority issues
   - Defer Medium/Low if needed

3. **Re-Validation**
   - Test fixes in browser
   - Verify issues resolved
   - Get user confirmation

4. **Proceed to Full Migration**
   - Apply learnings from fixes
   - Incorporate improvements
   - Continue with parallel agents

### Scenario C: Needs Rework 🔴

**If significant issues or wrong approach:**

1. **Immediate Actions**
   - Document fundamental issues
   - Schedule discussion with user
   - Gather requirements clarification

2. **Revision Phase**
   - Revise migration strategy
   - Update templates/schemas
   - Adjust agent instructions

3. **New Sample Migration**
   - Migrate 2-3 items with new approach
   - Quick validation cycle
   - Iterate until approved

4. **Full Migration Delayed**
   - Wait for approach approval
   - Ensure confidence before scaling
   - Avoid wasted effort

---

## 8. Orchestrator Model Recommendation

### Recommended Model: Claude Opus 4

**Rationale:**

#### Why Opus 4 (Not Sonnet 4.5)

1. **Human Coordination Required**
   - This task requires extensive human interaction
   - Opus excels at nuanced communication
   - Need to explain issues clearly to non-technical user

2. **Subjective Judgment**
   - Many validation decisions are subjective
   - Opus better at contextual reasoning
   - Quality assessment requires deeper analysis

3. **Documentation Quality**
   - Need clear, well-written issue reports
   - Opus produces more polished documentation
   - User-facing communication is critical

4. **Token Budget Not Critical**
   - Validation primarily human-driven (browser testing)
   - Agent does documentation/screenshots
   - ~5-10k tokens estimated (well within budget)

5. **Decision Support**
   - Final approval recommendation is complex
   - Needs to weigh multiple factors
   - Opus provides better strategic thinking

#### When Sonnet 4.5 Would Be Better

Use Sonnet 4.5 for the **next phase** (full migration):
- High-volume repetitive tasks (50+ items)
- Clear template-based work
- Cost optimization important
- Parallel agent deployment
- Speed over nuance

### Token Budget Expectation

**Validation Phase (Current):**
- Orchestrator planning: ~2k tokens
- Screenshot capture: ~1k tokens
- Issue documentation: ~2k tokens
- Final report: ~2k tokens
- **Total: 7-10k tokens**

**Full Migration Phase (If Approved):**
- 4-5 parallel Sonnet agents: ~30k tokens
- Orchestrator coordination: ~5k tokens
- Quality assurance: ~5k tokens
- **Total: 40-50k tokens**

---

## 9. Detailed Validation Workflow

### Phase 1: Pre-Validation (5 minutes)

#### Step 1.1: Environment Check
```bash
# Verify you're in correct directory
pwd
# Should be: /home/ichardart/code/clients/moura_quayle/website-mq-studio

# Check git branch
git branch --show-current
# Should be: initial-release

# Verify Node.js available
node --version
# Should be: v20.x or higher
```

#### Step 1.2: Start Dev Server
```bash
npm run dev
# Expected output:
# - Local: http://localhost:3100
# - Ready in X seconds
```

#### Step 1.3: Open Documentation
- VALIDATION_CHECKLIST.md (primary tool)
- This handover document (reference)
- Text editor for taking notes

### Phase 2: Browser Testing (25-35 minutes)

#### Test 1: Artworks Gallery (8 minutes)
**URL:** http://localhost:3100/gallery/artworks

**Validation Steps:**
1. Count items displayed (expect 7 new items)
2. Check each image loads correctly
3. Verify featured badges show (Cherry Blossoms, Daffodils, Fraser River Willows)
4. Click each item to test detail page
5. Read descriptions for quality
6. Check responsive behavior (resize browser)

**Document in VALIDATION_CHECKLIST.md:**
- [ ] Item checklist (7 items)
- Issues Found section
- Screenshots if needed

#### Test 2: Projects Gallery (5 minutes)
**URL:** http://localhost:3100/gallery/projects

**Validation Steps:**
1. Verify 2 landscape design items appear
2. Check they're the same as in artworks gallery
3. Verify descriptions appropriate for project context
4. Check category shows "landscape design"
5. Verify dates/metadata

**Document in VALIDATION_CHECKLIST.md:**
- [ ] Item checklist (2 items)
- Issues Found section

#### Test 3: Publications Gallery (5 minutes)
**URL:** http://localhost:3100/gallery/publications

**Validation Steps:**
1. Locate "Principled Governance" publication
2. Verify author: David S. Fushtey
3. Verify editors: Richard Littlemore and Moura Quayle
4. Check PDF link exists
5. Test PDF download works
6. Verify featured indicator

**Document in VALIDATION_CHECKLIST.md:**
- [ ] Item checklist (1 item)
- Issues Found section

#### Test 4: Image Quality (3 minutes)
**For each image type:**

**Validation Steps:**
1. Visual clarity check (no pixelation)
2. Color accuracy check
3. Aspect ratio check (not stretched/squashed)
4. Load time check (<2 seconds)

**Use browser DevTools:**
- Open Network tab
- Reload page
- Check image sizes and load times
- Look for any 404s or errors

#### Test 5: Content Quality (5 minutes)

**Validation Steps:**
1. Read all AI-generated descriptions
2. Check for obvious factual errors
3. Verify `[AI GENERATED - PLACEHOLDER]` tags present
4. Assess overall tone and quality
5. Note which need most improvement

**Rating scale:**
- ✅ Good enough (minor refinement only)
- ⚠️ Needs improvement (but usable)
- ❌ Needs rewrite (poor quality)

#### Test 6: Responsive Design (4 minutes)

**Test viewports:**
```
Mobile: 375px width
  - Expect: 1 column layout
  - Navigation: Hamburger menu
  - Images: Full width

Tablet: 768px width
  - Expect: 2 column layout
  - Navigation: May collapse or stay
  - Images: Scale appropriately

Desktop: 1920px width
  - Expect: 3-4 column layout
  - Navigation: Full horizontal
  - Images: Constrained max-width
```

**Use browser DevTools:**
- Open responsive design mode (F12)
- Test each viewport size
- Check layout doesn't break
- Verify images scale correctly

#### Test 7: Search Functionality (3 minutes)

**URL:** http://localhost:3100

**Test searches:**
1. "cherry blossoms" → Should find artwork
2. "landscape" → Should find university designs
3. "calligraphy" → Should find shufa pieces
4. "governance" → Should find publication

**Document results:**
- Which searches worked
- Which didn't find expected items
- Any error messages

#### Test 8: Cross-Reference Validation (2 minutes)

**Validation Steps:**
1. Compare University Excellence Sketch:
   - Artworks URL: /gallery/artworks/university-excellence-sketch
   - Projects URL: /gallery/projects/university-excellence-sketch
   - Check same image used
   - Check descriptions appropriate for context

2. Compare Northgate Concept:
   - Artworks URL: /gallery/artworks/northgate-concept
   - Projects URL: /gallery/projects/northgate-concept
   - Check same image used
   - Check descriptions appropriate for context

### Phase 3: Issue Documentation (5 minutes)

#### Categorize Issues by Severity

**Critical 🔴 (Must fix before approval)**
- Broken functionality
- Images don't load
- Major layout breaks
- Console errors preventing use

**High 🟠 (Should fix before approval)**
- Poor image quality
- Confusing descriptions
- Inconsistent cross-references
- Navigation issues

**Medium 🟡 (Can fix after approval)**
- Minor description improvements
- Missing metadata
- Optimization opportunities
- Nice-to-have enhancements

**Low 🟢 (Defer to later)**
- Date information missing
- Minor styling tweaks
- Additional tag suggestions
- Future feature ideas

#### Document Each Issue

**Use this format:**
```
Issue: [Brief description]
Severity: [Critical/High/Medium/Low]
Location: [URL or file path]
Expected: [What should happen]
Actual: [What actually happens]
Fix: [Recommended solution]
Screenshot: [Path if captured]
```

### Phase 4: Decision & Report (5 minutes)

#### Make Approval Recommendation

**Approval Criteria:**
- No Critical issues remaining
- High issues documented with fix plan
- Medium/Low issues acceptable to defer
- Overall migration approach validated

**Decision options:**
1. **APPROVED** - Proceed with full migration
2. **APPROVED WITH CHANGES** - Fix issues first
3. **NEEDS REWORK** - Significant issues found

#### Prepare User Report

**Include:**
1. Executive summary (2-3 sentences)
2. Test results summary
3. Issues found (categorized by severity)
4. Approval recommendation with reasoning
5. Next steps based on decision

---

## 10. Troubleshooting Guide

### Dev Server Won't Start

**Symptom:** `npm run dev` fails or errors

**Diagnosis:**
```bash
# Check Node.js version
node --version  # Should be v20.x

# Check for port conflict
lsof -i :3100  # Should be empty or show node process

# Check dependencies
ls -la node_modules/  # Should exist with many packages
```

**Fixes:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try different port
npm run dev -- --port 3101

# Check for errors in package.json
cat package.json | grep "dev"
```

### Images Not Loading

**Symptom:** Broken image icons or alt text

**Diagnosis:**
```bash
# Check image files exist
ls -la public/images/artworks/
ls -la public/images/projects/
ls -la public/images/publications/

# Check image paths in content
grep -r "image:" content/artworks/
grep -r "image:" content/projects/
grep -r "image:" content/publications/
```

**Common causes:**
- Path missing /images/ prefix
- File extension wrong (.jpg vs .jpeg)
- Case sensitivity (Linux is case-sensitive)
- Image in wrong category folder

**Fixes:**
- Update markdown frontmatter image path
- Rename file to match reference
- Move image to correct folder

### Gallery Page Empty

**Symptom:** Gallery shows "No items found" or is blank

**Diagnosis:**
```bash
# Check content files exist
ls -la content/artworks/
ls -la content/projects/
ls -la content/publications/

# Check frontmatter syntax
head -20 content/artworks/cherry-blossoms-painting.md
```

**Common causes:**
- Frontmatter syntax error (YAML)
- Missing required fields
- File not in correct directory
- File doesn't have .md extension

**Fixes:**
- Validate YAML syntax
- Check required fields present
- Ensure file in correct content/ subdirectory

### Console Errors

**Symptom:** Red errors in browser console (F12)

**Diagnosis:**
- Open browser DevTools (F12)
- Switch to Console tab
- Look for error messages
- Note file paths and line numbers

**Common errors:**
- 404 Not Found: File path wrong
- JavaScript error: Code issue (less likely)
- Network error: Server issue
- CORS error: Resource loading issue

**Fixes:**
- For 404s: Verify file paths
- For JS errors: Check console for details
- For network: Restart dev server
- For CORS: Usually not an issue in dev

### Responsive Layout Broken

**Symptom:** Layout doesn't adapt to viewport size

**Diagnosis:**
- Open DevTools (F12)
- Switch to responsive design mode
- Test viewports: 375px, 768px, 1920px
- Check for horizontal scrolling

**Common causes:**
- CSS framework issue
- Fixed widths in custom styles
- Images too large
- Content overflow

**Fixes:**
- Usually handled by framework
- Check for custom CSS overrides
- Ensure max-width on images
- Report to user if persistent

---

## 11. Browser Vision Integration

### Available Now: Playwright Screenshots

**Purpose:** Automate screenshot capture for documentation

#### Basic Screenshot Capture
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio

# Capture artworks gallery
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({
    path: "validation-artworks-gallery.png",
    fullPage: true
  });
  await browser.close();
})();'
```

#### Responsive Screenshots
```bash
# Mobile viewport
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({ path: "artworks-mobile.png" });
  await browser.close();
})();'

# Tablet viewport
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({ path: "artworks-tablet.png" });
  await browser.close();
})();'

# Desktop viewport
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({ path: "artworks-desktop.png" });
  await browser.close();
})();'
```

#### Console Error Detection
```bash
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console messages
  page.on("console", msg => console.log("CONSOLE:", msg.text()));

  // Listen for errors
  page.on("pageerror", err => console.log("ERROR:", err.message));

  await page.goto("http://localhost:3100/gallery/artworks");
  await page.waitForTimeout(2000);
  await browser.close();
})();'
```

#### Network Request Monitoring
```bash
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for failed requests
  page.on("requestfailed", req => {
    console.log("FAILED:", req.url(), req.failure().errorText);
  });

  await page.goto("http://localhost:3100/gallery/artworks");
  await page.waitForTimeout(2000);
  await browser.close();
})();'
```

### Use Cases for Browser Vision

1. **Issue Documentation**
   - Capture screenshots of broken layouts
   - Document visual issues
   - Create before/after comparisons

2. **Responsive Testing**
   - Automated viewport testing
   - Screenshot at all breakpoints
   - Compare layouts side-by-side

3. **Console Error Detection**
   - Find JavaScript errors automatically
   - Detect 404s for images/assets
   - Monitor network failures

4. **Evidence for User**
   - Show validation results visually
   - Demonstrate issues found
   - Provide clear visual documentation

---

## 12. Key Contacts & Resources

### Project Resources

**Project Directory:**
```
/home/ichardart/code/clients/moura_quayle/website-mq-studio/
```

**Key Documentation:**
- VALIDATION_CHECKLIST.md (primary tool)
- CONTENT_MIGRATION_SAMPLE_REVIEW.md (background)
- This handover document
- CLAUDE.md (project context)

**Dev Server:**
- URL: http://localhost:3100
- Command: `npm run dev`
- Port: 3100 (configurable)

### Architecture References

**Component System:**
- HeroToday Block: Dynamic homepage section
- Marginalia Component: Responsive quote annotations
- Musings Audio Player: Custom accessible audio
- Filterable Publications: Tag-based filtering

**Design System:**
- Colors: Rice Paper (#FDFCF8), Ink Black (#1A1A1A), Moura Teal (#00A8A8)
- Typography: Montserrat (headings), Lora (body)
- Layout: 1 column (mobile) → 4 columns (desktop)
- Accessibility: High-contrast focus indicators

### Testing Resources

**Browser Vision:**
- Playwright installed: @playwright/test@^1.48.0
- Chrome in WSL2: v140.0.7339.207
- Examples: tests/browser-vision-examples.md
- Integration: .claude/browser-vision-integration.md

**IDP Framework:**
- Testing hierarchy: Simulated → Real-life → Automated
- Minimize human-in-loop where safe
- Document all decisions and findings
- Follow evidence-based methodology

---

## 13. Final Checklist

### Before You Start
- [ ] Read this entire handover document
- [ ] Understand IDP Testing Framework requirements
- [ ] Review VALIDATION_CHECKLIST.md structure
- [ ] Have browser ready for human testing
- [ ] Prepare note-taking system

### During Validation
- [ ] Start dev server successfully
- [ ] Follow checklist systematically
- [ ] Document every issue found
- [ ] Categorize issues by severity
- [ ] Capture screenshots where helpful
- [ ] Test all viewports (mobile/tablet/desktop)
- [ ] Check console for errors
- [ ] Verify cross-references

### After Validation
- [ ] Complete all sections of VALIDATION_CHECKLIST.md
- [ ] Make approval recommendation
- [ ] Document reasoning clearly
- [ ] Prepare user-facing report
- [ ] Outline next steps based on decision
- [ ] Estimate time/cost for next phase

### Handover Complete When
- [ ] Validation executed systematically
- [ ] All issues documented with severity
- [ ] Approval decision made with justification
- [ ] Next steps clearly defined
- [ ] User report prepared
- [ ] Ready for user review and decision

---

## Success Markers

**You'll know you're successful when:**

✅ Every item in VALIDATION_CHECKLIST.md is checked or documented
✅ Issues are categorized by severity with clear descriptions
✅ User understands exactly what works and what doesn't
✅ Approval recommendation is well-justified and actionable
✅ Next steps are clear regardless of approval decision
✅ User can make informed decision about proceeding

**This validation is successful if:**
- All critical functionality works (even with minor issues)
- Migration approach is validated as sound
- Issues are documented for future improvement
- User has confidence to proceed or clear path to fix

**This validation reveals problems if:**
- Fundamental approach is flawed
- Critical functionality broken
- Migration strategy needs revision
- User cannot make informed decision

---

## Appendix A: Quick Reference Commands

### Start Dev Server
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev
```

### Verify File Structure
```bash
# List content files
ls -la content/artworks/
ls -la content/projects/
ls -la content/publications/

# List image files
ls -la public/images/artworks/
ls -la public/images/projects/
ls -la public/images/publications/
```

### Check Image Paths
```bash
# Extract image paths from content
grep -r "image:" content/ | grep -v "^#"

# Compare to actual files
find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \)
```

### Capture Screenshot
```bash
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.screenshot({ path: "artworks.png", fullPage: true });
  await browser.close();
})();'
```

### Check Console Errors
```bash
node -e 'const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("CONSOLE:", msg.text()));
  page.on("pageerror", err => console.log("ERROR:", err.message));
  await page.goto("http://localhost:3100/gallery/artworks");
  await page.waitForTimeout(2000);
  await browser.close();
})();'
```

---

## Appendix B: Severity Level Definitions

### Critical 🔴
**Definition:** Blocks basic functionality or causes data loss

**Examples:**
- Images fail to load (404 errors)
- Gallery page crashes or won't render
- Navigation completely broken
- PDF download fails
- Console errors prevent page use

**Action Required:**
- Must fix before approval
- Cannot proceed to full migration
- User cannot evaluate content

---

### High 🟠
**Definition:** Significantly impacts user experience or content quality

**Examples:**
- Images display but very poor quality
- Descriptions contain obvious factual errors
- Cross-references inconsistent (wrong images)
- Responsive layout breaks at key viewport
- Featured items selection clearly wrong

**Action Required:**
- Should fix before approval
- Can proceed with documented plan to fix
- User should review and decide

---

### Medium 🟡
**Definition:** Impacts quality but doesn't prevent evaluation

**Examples:**
- AI descriptions generic but usable
- Some metadata missing (not critical fields)
- Minor layout quirks at edge viewports
- Search doesn't find all expected items
- Featured selection debatable

**Action Required:**
- Document for improvement
- Can fix after approval
- Include in full migration learnings

---

### Low 🟢
**Definition:** Nice-to-have improvements or future enhancements

**Examples:**
- Dates marked "date unknown"
- Images unoptimized (large file size)
- Additional tags could be added
- Minor description refinements
- Styling tweaks

**Action Required:**
- Document for future
- Defer to later phase
- Not blocking approval

---

## Document History

**Version 1.0** - 2025-10-27
- Initial comprehensive handover document created
- Prepared for Session #005 Content Validation Orchestrator

**Created By:** Session #004 Migration Specialist
**For:** Content Validation Orchestrator (Session #005)
**Model Recommendation:** Claude Opus 4
**Estimated Completion Time:** 30-45 minutes

---

*This handover document follows IDP Testing & Validation Framework: Simulated testing complete, real-life testing required, automated testing available for future.*
