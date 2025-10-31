# Codex Analysis Snapshot

## Objectives (Explicit & Inferred)
1. Reproducible, AI-enabled development environment for MQ Studio collaborators.
2. Deliver a triadic homepage experience (Thinking/Feeling/Doing) that reflects the "living studio" concept.
3. Maintain a consistent design system through shared tokens and reusable components.
4. Provide accessible, keyboard-friendly interactions across the site.
5. Operate with spec-driven development backed by automated tests (Stagehand + unit suites).
6. Protect API secrets using 1Password CLI within the dev container workflow.

## Current State vs Objectives
- The README promises rich tooling (AI assistants, language runtimes) that the current devcontainer image and post-create script do not yet provision. Secrets wrapper script exists but is not wired into the container lifecycle.
- `app/page.tsx` implements a static hero mock; anchor targets and dynamic data sources are absent, so the triadic experience is not functionally complete.
- Design tokens live in `src/design/tokens.ts` and power the `Hero` component, but the Next.js page bypasses that component and leans on ad-hoc Tailwind classes, fragmenting the system.
- Global focus styling exists (`app/globals.css`), yet hero markup lacks landmark semantics and ARIA structure expected by specs/tests.
- Stagehand tests in `tests/stagehand/homepage-hero.test.js` expect dynamic navigation/accessibility; they currently fail because the UI doesn’t satisfy those behaviors. Unit tests are minimal and disconnected.
- Secrets management tooling is partially implemented via `.devcontainer/run-with-secrets.sh`, but process integration and documentation remain incomplete.

## Recommendations
1. Expand `.devcontainer/devcontainer.json` (or switch to a Dockerfile) that installs Node 20, Python 3.11, AI extensions, 1Password CLI, and documents how to invoke `run-with-secrets.sh` during container startup.
2. Replace inlined hero markup with the reusable `Hero` component, fetch real content (mocked or CMS), and ensure target sections/routes exist for each CTA.
3. Align styling by mapping design tokens into Tailwind (theme extensions) or refactoring components to consume the tokenized React primitives.
4. Strengthen accessibility: add roles/ARIA labels consistent with specs, verify with `jest-axe`, and update Stagehand prompts/selectors accordingly.
5. Stabilize testing: align Stagehand flows with implemented routes, add integration tests for the Next.js page, and gate merges with `npm run lint`, `npm run test:unit`, and `npm run test:stagehand`.
6. Maintain spec/document parity—create a living roadmap summarizing current objectives, highlight feature ownership, and keep README honest about delivered capabilities.

## Process Notes
- Start with an environment hardening sprint (devcontainer + secrets wiring).
- Move to hero parity and design system cohesion, developing against the existing SpecKit specs.
- Adopt milestone-based planning with demos for each objective; ensure secrets tooling and background assets are reviewed monthly.
