# Validation Checklist - Content Migration Sample

**Created:** 2025-10-26
**Purpose:** Real-life validation of Session #004 content migration
**Status:** ⏳ Awaiting user testing

---

## Prerequisites

- [ ] Dev server running at http://localhost:3100
- [ ] Browser ready (Chrome, Firefox, or Safari recommended)

**Start server if needed:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev
```

---

## Test 1: Artworks Gallery

**URL:** http://localhost:3100/gallery/artworks

**Expected Items (7 new):**
- [ ] Cherry Blossoms (watercolor, should be featured)
- [ ] Daffodils (watercolor, should be featured)
- [ ] Fraser River Willows (watercolor, should be featured)
- [ ] University Excellence Sketch (landscape design)
- [ ] Northgate Concept (landscape design)
- [ ] Shufa Calligraphy 1
- [ ] Shufa Calligraphy 2

**Validation Checks:**
- [ ] All 7 items display in gallery grid
- [ ] Images load correctly (no broken images)
- [ ] Featured items have featured badge/indicator
- [ ] Titles are readable and descriptive
- [ ] Click on item opens detail page
- [ ] Detail page shows full description

**Issues Found:**
```
(Note any problems here)
```

---

## Test 2: Projects Gallery

**URL:** http://localhost:3100/gallery/projects

**Expected Items (2 new):**
- [ ] University Excellence Sketch (duplicate from artworks)
- [ ] Northgate Concept (duplicate from artworks)

**Validation Checks:**
- [ ] Both landscape design items appear
- [ ] Same images as in artworks gallery
- [ ] Category shows "landscape design"
- [ ] Descriptions appropriate for project context
- [ ] Client/location shows "Unknown" (placeholder)
- [ ] Year shows correct value

**Issues Found:**
```
(Note any problems here)
```

---

## Test 3: Publications Gallery

**URL:** http://localhost:3100/gallery/publications

**Expected Items (1 new):**
- [ ] "Principled Governance When Everything Matters"

**Validation Checks:**
- [ ] Publication displays in gallery
- [ ] Author shows: David S. Fushtey
- [ ] Editors show: Richard Littlemore and Moura Quayle
- [ ] Year shows: 2021
- [ ] PDF link is present
- [ ] PDF link works (downloads or opens PDF)
- [ ] Featured indicator shows (should be featured)

**Issues Found:**
```
(Note any problems here)
```

---

## Test 4: Image Quality

**For each image, check:**
- [ ] Images are clear and not pixelated
- [ ] Colors render correctly
- [ ] Aspect ratios are correct (not stretched)
- [ ] File sizes are reasonable (<5MB each)
- [ ] Images load quickly (<2 seconds)

**Image Locations:**
- Optimized: `/public/images/[category]/`
- Originals: `/public/images/originals/[category]/`

**Issues Found:**
```
(Note any problems here)
```

---

## Test 5: Content Quality

**For each item, review:**
- [ ] Title is descriptive and appropriate
- [ ] Description is reasonable (even if AI-generated)
- [ ] Tags are relevant
- [ ] Dates are reasonable (or marked "date unknown")
- [ ] Artist statements marked "[AI GENERATED - PLACEHOLDER]"
- [ ] Medium/category information is correct

**Items Needing Revision:**
```
(List items that need manual updates)
```

---

## Test 6: Responsive Design

**Resize browser window to test:**
- [ ] Mobile (375px): 1 column layout
- [ ] Tablet (768px): 2 column layout
- [ ] Desktop (1920px): 3 column layout
- [ ] Images scale correctly at all sizes
- [ ] Text remains readable at all sizes
- [ ] Navigation works at all sizes

**Issues Found:**
```
(Note any problems here)
```

---

## Test 7: Search Functionality

**URL:** http://localhost:3100

**Test searches:**
- [ ] Search "cherry blossoms" - Should find artwork
- [ ] Search "landscape" - Should find university designs
- [ ] Search "calligraphy" - Should find shufa pieces
- [ ] Search "governance" - Should find publication

**Issues Found:**
```
(Note any problems here)
```

---

## Test 8: Cross-Reference Validation

**Landscape Designs Should Appear in BOTH:**
- [ ] University Excellence Sketch in artworks AND projects
- [ ] Northgate Concept in artworks AND projects
- [ ] Same image used in both places
- [ ] Descriptions appropriate for each context

**Issues Found:**
```
(Note any problems here)
```

---

## Overall Assessment

### What Works:
```
(List what's working correctly)
```

### What Needs Fixing:
```
(List critical issues that must be fixed)
```

### What Needs Improvement:
```
(List nice-to-have improvements)
```

---

## Approval Decision

Based on validation results:

- [ ] **APPROVED** - Proceed with full migration (50+ items)
- [ ] **APPROVED WITH CHANGES** - Fix issues first, then proceed
- [ ] **NEEDS REWORK** - Significant issues, need to revise approach

**Notes:**
```
(Additional comments or instructions)
```

---

## Next Steps After Approval

If approved, the full migration will include:
- ~50 remaining watercolors
- ~4 remaining landscape designs
- Any additional publications
- Image optimization (compress to 200-500KB)
- All following same structure as sample

**Estimated time:** 1-2 hours with parallel agents
**Estimated token cost:** 30-40k tokens (using 4-5 parallel agents)

---

## Files to Review

**Content Files:**
- `/content/artworks/cherry-blossoms-painting.md`
- `/content/artworks/daffodils-spring-painting.md`
- `/content/artworks/fraser-river-willows.md`
- `/content/artworks/university-excellence-sketch.md`
- `/content/artworks/northgate-concept.md`
- `/content/artworks/shufa-calligraphy-long-life.md`
- `/content/artworks/shufa-calligraphy-happiness-scroll.md`
- `/content/projects/university-excellence-sketch.md`
- `/content/projects/northgate-concept-landscape.md`
- `/content/publications/principled-governance-fushtey.md`

**Review Document:**
- `/CONTENT_MIGRATION_SAMPLE_REVIEW.md`

---

**Validation Date:** _____________
**Validated By:** _____________
**Status:** ⏳ Pending
