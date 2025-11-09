# Issue Template: Set up Copilot Instructions

**Use this template when creating the GitHub issue**

---

## Title
Set up Copilot Instructions

---

## Description

### Overview
Create a `.github/copilot-instructions.md` file to provide context and guidance to GitHub Copilot when working with code in this repository.

### Context
The repository currently has instruction files for other AI assistants:
- `CLAUDE.md` for Claude Code
- `GEMINI.md` for Gemini CLI

Following the same pattern, we need Copilot instructions at `.github/copilot-instructions.md` as referenced in `templates/plan-template.md`.

### Requirements

#### File Location
- Path: `.github/copilot-instructions.md`

#### Content Should Include

1. **Repository Information**
   - Repository type (PRODUCTION)
   - GitHub repository name
   - Deployment information (Vercel auto-deploys)
   - Critical warnings about production status

2. **Project Overview**
   - Brief description of MQ Studio
   - Core features and architecture
   - Tech stack (Next.js, React, TypeScript, Tailwind CSS)

3. **Development Workflow**
   - Key commands (`npm run dev`, `npm run build`, `npm run test`)
   - Testing strategy (unit tests, Stagehand tests)
   - Linting and verification

4. **Repository Guidelines**
   - Project structure & module organization
   - Build, test, and development commands
   - Coding style & naming conventions
   - Testing guidelines
   - Commit & PR guidelines
   - Security & configuration notes

5. **Design System**
   - Color tokens (Rice Paper, Ink Black, Moura Teal, etc.)
   - Typography (Montserrat for headings, Lora for body)
   - Layout conventions

#### Success Criteria
- [ ] File created at `.github/copilot-instructions.md`
- [ ] Content follows similar structure to CLAUDE.md and GEMINI.md
- [ ] Includes repository-specific guidelines
- [ ] Provides clear development workflow guidance
- [ ] Documents the design system
- [ ] Includes critical production warnings

### Reference Files
- `CLAUDE.md` - Reference for structure and content
- `GEMINI.md` - Reference for concise formatting
- `templates/plan-template.md` - References Copilot instructions file

### Labels
- `documentation`
- `enhancement`

### Priority
Medium - This improves developer experience for those using GitHub Copilot

---

## How to Use This Template

1. Go to: https://github.com/mq-studio/mq-studio-site/issues/new
2. Copy the content above (from "Overview" to "Priority")
3. Paste into the issue description
4. Add appropriate labels
5. Submit the issue
