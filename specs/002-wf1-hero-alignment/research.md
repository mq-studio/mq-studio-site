# Research Notes: WF1 – Hero Alignment & Routes

## Current Implementation Snapshot
- `app/page.tsx` renders a Tailwind-based hero section that duplicates the triadic experience and lacks some data attributes present in `src/components/Hero.tsx`.
- `src/components/Hero.tsx` already satisfies the spec contract (semantic roles, design tokens, marginalia, resonance) but is not imported in the App Router entry point.
- Stagehand test (`tests/stagehand/homepage-hero.test.js`) expects `/artworks`, `/publications`, `/musings` to respond; they do not currently exist.

## Questions & Resolutions
1. **How to consolidate hero markup?**  
   Use `<Hero />` in `app/page.tsx`, ensure surrounding layout supports the existing header + hero structure, and remove the Tailwind duplicate block.
2. **What to render for new routes?**  
   Add simple Next.js pages under `app/artworks/page.tsx`, `app/publications/page.tsx`, and `app/musings/page.tsx` with explanatory copy and a back-to-home link.
3. **Handling absent dynamic content?**  
   Until CMS integration exists, keep static text that mirrors the invitational tone and explicitly mark the pages as placeholders.
4. **Testing implications?**  
   `npm run test:unit` already exercises the hero; once placeholders exist we can revisit Stagehand to confirm navigation flow without failures.

## Decisions
- Adopt the canonical `Hero` component as the single source of truth on the homepage.
- Provide branded placeholder pages for the triadic routes with navigation back to `/`.
- Update documentation (README / roadmap) to mention the hero consolidation and new paths.

## Follow-ups
- Future work: integrate real content feeds and revisit Stagehand assertions for end-to-end acceptance.•
- Stagehand suite remains temporarily disabled until routes display real content.
