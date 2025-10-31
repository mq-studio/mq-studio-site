# Repository Guidelines

## Project Structure & Module Organization
The Next.js application entry point lives in `app/`, with `app/layout.tsx` defining global providers and `app/globals.css` loading shared styles. Reusable UI sits under `src/components`, while `src/design` centralizes tokens and helpers surfaced through `src/index.ts`. Stagehand and design references stay in `background/`, and authored prompts/specifications are tracked in `specs/` and `templates/`. Automation scripts reside in `scripts/`, with browser automation and unit tests under `tests/` (see `tests/stagehand` and `tests/unit`). Python utilities and parity checks live in `python_utils/` and `python_tests/`.

## Build, Test, and Development Commands
Use `npm run dev` for the hot-reloading development server. Ship builds with `npm run build`, followed by `npm run start` to verify the production bundle. Keep lint clean via `npm run lint`, and validate accessibility plus DOM behaviour with `npm run test:unit`. Trigger Stagehand browser flows through `npm run test:stagehand`, or pair them with unit suites using `npm run test:all`. Speckit specs should pass `npm run spec:check` before shipping.

## Coding Style & Naming Conventions
Write React components and utilities in TypeScript with 2-space indentation and trailing commas, mirroring existing files. Use PascalCase for components (`HeroSection.tsx`), camelCase for hooks/utilities, and kebab-case for file paths in Stagehand scripts. Tailwind classes belong in JSX; limit bespoke CSS to `app/globals.css` or `background/mq-design-system.css`. Run `npm run lint` to enforce the Next.js + ESLint ruleset before opening a PR.

## Testing Guidelines
Co-locate unit tests in `tests/unit` using Jest and Testing Library; name files `<component>.unit.test.tsx`. Browser regression tests belong in `tests/stagehand`, and should import shared helpers from `tests/stagehand/axe-helper.js` for accessibility assertions. End-to-end runs exit via `npm run test:e2e`. Python parity checks live in `python_tests/`; keep them passing when touching cross-language logic.

## Commit & Pull Request Guidelines
Author commits in the imperative mood (e.g., `Add hero animation`), matching the existing history. Group unrelated work into separate commits and let automated `Auto-commit:` hooks stand alone. Pull requests need a concise summary, linked issue or spec, and updated screenshots or Stagehand output for user-facing changes. Note any follow-up tasks and call out configuration updates (env vars, secrets) explicitly.

## Security & Configuration Notes
Store secrets in `.env.local` and document required keys in the PR body rather than checking them in. When modifying Stagehand or Speckit configs, double-check repository access scopes and keep personal tokens out of scripts. Remove stray background assets before merging to avoid bloating the published app bundle.
