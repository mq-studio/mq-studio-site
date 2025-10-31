# Specifications Directory

This directory contains formal feature specifications for the MQ Studio website. These specifications serve as the source of truth for feature requirements and implementation guidance.

## Purpose

While we don't use Speckit as a tool, we adopt its philosophy of specification-driven development for major features. Each specification:
- Defines the "what and why" before the "how"
- Provides clear acceptance criteria
- Guides AI agents and developers in implementation
- Serves as living documentation

## Structure

Each specification follows this format:
1. **Feature Overview** - What the feature does and why it's needed
2. **User Stories** - Who benefits and how
3. **Functional Requirements** - What must be built
4. **Non-functional Requirements** - Performance, accessibility, etc.
5. **Technical Constraints** - Existing system limitations
6. **Acceptance Criteria** - How we know it's done
7. **Implementation Notes** - Technical guidance (optional)

## Current Specifications

- [SPEC-001: Musings Feature](./SPEC-001-musings-feature.md) - Blog/vlog capability for Moura's thoughts
- [SPEC-002: Publications View Refinement](./SPEC-002-publications-views.md) - Multiple view options for publications

## Workflow

1. **Before implementing a major feature**: Create a specification
2. **During implementation**: Reference the spec in code comments and commits
3. **After implementation**: Update spec with any deviations or learnings
4. **Link to governance**: Reference specs in IMPLEMENTATION_DECISIONS_LOG.md

## Status Key

- 🟢 **Approved** - Ready for implementation
- 🟡 **Draft** - Under review/refinement
- 🔵 **Implemented** - Completed and deployed
- 🔴 **Deprecated** - No longer relevant