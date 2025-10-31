# Speckit Roadmap: MQ Studio Foundation

## Objectives (Explicit & Inferred)
1. Provision a reproducible, AI-ready development environment for collaborators (`README.md:3`, `.devcontainer/devcontainer.json:1`).
2. Deliver the "living studio" hero experience with triadic Thinking/Feeling/Doing pathways (`README.md:57`, `specs/001-homepage-hero/spec.md:1`).
3. Maintain a unified design system via shared tokens and reusable components (`src/design/tokens.ts:1`, `src/components/Hero.tsx:1`).
4. Guarantee accessible, keyboard-friendly interactions sitewide (`app/globals.css:11`, `tests/stagehand/homepage-hero.test.js:152`).
5. Operate with spec-driven development backed by automated tests (Stagehand + unit suites) (`tests/stagehand/homepage-hero.test.js:1`, `tests/unit/homepage-hero.unit.test.tsx`).
6. Safeguard API secrets with 1Password CLI during local and CI runs (`.devcontainer/run-with-secrets.sh:1`, `.devcontainer/secrets.template:1`).
7. Support future dynamic content and themed routes aligned to the MQ framework (links in `src/components/Hero.tsx:44` and `app/page.tsx:70`).

## Current State Snapshot
- **Hero implementation split**: `app/page.tsx:1` renders static Tailwind markup; `src/components/Hero.tsx:1` encapsulates tokenized, accessible hero. Navigation targets `/artworks`, `/publications`, `/musings` are missing.
- **Environment gap**: Devcontainer relies on `ubuntu:latest` with an overlong `postCreateCommand` and no AI tooling/Python 3.11 despite README claims.
- **Design tokens defined but underused**: Tokens export in `src/design/tokens.ts:1`; page-level markup ignores them.
- **Accessibility coverage mixed**: Global focus ring exists; canonical hero includes ARIA region, but live page omits it.
- **Testing**: Jest unit suite passes (21 specs) but targets component layer; Stagehand tests depend on unimplemented routes and secrets. ESLint not configured for project.
- **Secrets workflow**: Wrapper script + template ready, not invoked automatically by devcontainer or CI.
- **Content**: All hero data is hardcoded; no seasonal theming or data pipeline.

## Consensus Findings (Codex · Claude · Gemini)
1. Canonicalize the hero implementation to eliminate dual sources and broken navigation.
2. Harden the development container with predictable tooling, AI assistants, and built-in 1Password integration (likely via Dockerfile).
3. Consolidate styling around design tokens—extend Tailwind config or ensure components consume token-based primitives.
4. Bring Stagehand tests online after structural fixes; retain existing Jest suite as regression guard.
5. Plan for data-model evolution: mock or CMS-backed feeds needed to honour "living studio" objective.

## Prioritized Workstreams (Spec Seeds)
### Critical
- **WF1 – Hero Alignment & Routes**: Adopt `Hero` in Next.js page, scaffold `/artworks`, `/publications`, `/musings` (or anchor targets), ensure ARIA semantics and CTA wiring. Update `specs/001-homepage-hero/spec.md` as acceptance source. *Exit*: Stagehand hero tests pass locally.
- **WF2 – Devcontainer Rebuild**: Replace `postCreateCommand` with Dockerfile + entry scripts installing Node 20, Python 3.11, AI extensions, 1Password CLI, and automatically leveraging `run-with-secrets.sh`. Document workflow in `README.md` + `AGENTS.md`.
- **WF3 – Lint & Tooling Baseline**: Configure ESLint (`npm run lint`), ensure Prettier/custom rules align with tokens and Next.js conventions.

### High Priority
- **WF4 – Design System Cohesion**: Extend `tailwind.config.ts:1` with token palette, refactor hero + future components to consume unified styles, remove ad-hoc inline styling.
- **WF5 – Stagehand Enablement**: With hero and routes stable, update Stagehand prompts/selectors, add secrets instructions, and run `npm run test:stagehand` under `run-with-secrets.sh`.
- **WF6 – Documentation Realignment**: Sync README, AGENTS, and Stagehand guides with delivered capabilities and workflows.

### Medium Priority
- **WF7 – Dynamic Content Architecture**: Design data contracts for artwork/publication/reflection feeds (JSON mocks first, CMS later). Identify seasonal theming triggers.
- **WF8 – Integration Testing**: Add Next.js page integration test harness (React Testing Library or Playwright) to cover hero + navigation.
- **WF9 – Performance & Asset Strategy**: Define image handling, bundle optimization, and remove unused background assets before launch.

## Speckit Actions & Templates
- Create new SpecKit project entry (e.g., `specs/002-foundation-alignment/`) with `spec.md`, `plan.md`, and `tasks.md` referencing WF1–WF3.
- Update `specs/001-homepage-hero/tests.md` after hero consolidation to reflect executable Stagehand scenarios.
- Use `templates/spec-template.md` and `templates/tasks-template.md` to seed scoped tasks for each workflow (e.g., "Task: Implement Hero alignment" with explicit acceptance criteria).

## Immediate Task Seeds
- Draft SpecKit spec for WF1 (Hero refactor) with measurable acceptance tied to Stagehand results.
- Author Dockerfile-based devcontainer spec and task list for WF2.
- Prepare lint/tooling setup task capturing ESLint config and CI hook.

## Process & Tooling Notes
- Adopt SuperDesign for every net-new or refreshed visual feature:
  1. Verify extension availability (`code --list-extensions | grep superdesign`), initialize the workspace via `SuperDesign: Initialize Superdesign`, and keep `.superdesign/` uncommitted.
  2. Bake MQ Studio constraints into the SuperDesign prompt canvas (tokens from `src/design/tokens.ts`, Tailwind-over-CSS preference, accessibility and Speckit acceptance reminders) before ideation.
  3. For each prioritized workflow (WF1–WF9), begin with SuperDesign explorations, export selected variants, and translate them into real components that reuse tokens and existing patterns.
  4. Mirror the accepted visual behaviour back into Speckit—update specs/tests, rerun `npm run spec:check`, and capture reference imagery or notes for reviewers.
  5. Treat SuperDesign output as a starting point: run `npm run lint`, `npm run test:unit`, and (once staged) `npm run test:stagehand` prior to sign-off.
- Run commands through `.devcontainer/run-with-secrets.sh -- <command>` until devcontainer automation is updated.
- Gate merges with `npm run lint`, `npm run test:unit`, and (post-WF1/WF5) `npm run test:stagehand`.
- Maintain a living roadmap by reviewing this file at the start/end of each iteration; record decisions back into the relevant SpecKit docs.
