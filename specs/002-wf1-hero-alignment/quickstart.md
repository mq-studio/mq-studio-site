# Quickstart Validation: WF1 – Hero Alignment & Routes

## Prerequisites
- Node.js 20.x (matches project `.nvmrc` / devcontainer configuration)
- Dependencies installed (`npm install`)

## Validation Steps
1. **Run unit suite**
   ```bash
   npm run test:unit
   ```
   Confirms `Hero` component contract remains intact after integration.

2. **Launch dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` and verify:
   - Triadic hero renders once (no duplicate Tailwind markup).
   - Resonance and marginalia slots display as in spec.

3. **Test navigation placeholders**
   - From the hero, follow Thinking, Feeling, and Doing links/CTAs.
   - Confirm each route loads its placeholder page with mission copy plus a back-to-home link.

4. **Manual accessibility spot-check**
   - Tab through CTAs to confirm focus ring persists.
   - Inspect placeholder pages for semantic headings and descriptive text.

5. **(Optional) Prepare Stagehand**
   - Once placeholders confirm, update Stagehand fixtures and re-run `npm run test:stagehand` in a future iteration.

## Expected Outcomes
- Unit tests pass with no regressions.
- Hero is rendered from `src/components/Hero.tsx` and matches SpecKit requirements.
- `/artworks`, `/publications`, `/musings` placeholders respond and preserve MQ tone.
