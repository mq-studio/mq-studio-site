  # Feature Specification: WF1 – Hero Alignment & Routes

  **Feature Branch**: `002-wf1-hero-alignment`
  **Created**: 2025-09-18
  **Status**: Draft
  **Input**: Align homepage hero implementation with SpecKit contract,
  adopt design tokens, and scaffold navigation routes for Thinking /
  Feeling / Doing pathways.

  ## User Scenarios & Testing *(mandatory)*

  ### Primary User Story
  A first-time visitor loads the MQ Studio homepage, immediately sees
  the triadic hero, and can dive into Thinking, Feeling, or Doing
  content with working navigation.

  ### Acceptance Scenarios
  1. **Given** the homepage renders, **When** the hero loads, **Then**
  it presents the triadic content zones, resonance, and marginalia
  exactly as defined in `specs/001-homepage-hero/spec.md`.
  2. **Given** the visitor clicks any hero link or CTA, **When** the
  navigation completes, **Then** the browser lands on a responsive
  placeholder page that explains what will live there and provides a
  functional back-to-home link.

  ### Edge Cases
  - What happens when hero data is temporarily unavailable? A graceful
  placeholder or fallback must render without breaking layout.
  - How does navigation behave on mobile when the CTA is activated via
  keyboard or screen reader?

  ## Requirements *(mandatory)*

  ### Functional Requirements
  - **FR-001**: Homepage MUST render the production hero by importing
  `Hero` from `src/components/Hero.tsx` and removing the legacy
  Tailwind markup in `app/page.tsx`.
  - **FR-002**: Hero component MUST receive any necessary props or
  provider context so the rendered DOM matches `tests/unit/homepage-
  hero.unit.test.tsx` expectations.
  - **FR-003**: Project MUST expose `/artworks`, `/publications`, and
  `/musings` routes (temporary static pages are acceptable) reachable
  via hero links and CTAs.
  - **FR-004**: Each new route MUST describe its purpose, acknowledge
  the upcoming build-out, and link back to `/`.
  - **FR-005**: Updated structure MUST satisfy `npm run test:unit`
  and enable `specify check` validation of required tools; plan future
  Stagehand re-enablement once routes render real content.
  - **FR-006**: Project documentation MUST call out the new hero
  alignment and placeholder routes so designers and writers know where
  to plug in content.

  ### Key Entities *(include if feature involves data)*
  - **HeroSection**: No data model change; simply becomes the
  canonical homepage composition.
  - **Route Placeholders**: Static Next.js pages whose only data is
  copy describing what future features will provide.

  ## Review & Acceptance Checklist

  ### Content Quality
  - [ ] No implementation details (languages, frameworks, APIs)
  - [ ] Focused on user value and business needs
  - [ ] Written for non-technical stakeholders
  - [ ] All mandatory sections completed

  ### Requirement Completeness
  - [ ] No [NEEDS CLARIFICATION] markers remain
  - [ ] Requirements are testable and unambiguous
  - [ ] Success criteria are measurable
  - [ ] Scope is clearly bounded
  - [ ] Dependencies and assumptions identified

  ## Execution Status
  - [ ] User description parsed
  - [ ] Key concepts extracted
  - [ ] Ambiguities marked
  - [ ] User scenarios defined
  - [ ] Requirements generated
  - [ ] Entities identified
  - [ ] Review checklist passed
