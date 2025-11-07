# How to Create "Set up Copilot Instructions" Issue

This guide explains how to create a GitHub issue for setting up GitHub Copilot instructions in this repository.

## Why This Issue is Needed

The repository currently has AI assistant instruction files for:
- **Claude Code**: `CLAUDE.md` 
- **Gemini CLI**: `GEMINI.md`

However, there is no instruction file for **GitHub Copilot**. According to the repository's template system (see `templates/plan-template.md`), Copilot instructions should be stored at `.github/copilot-instructions.md`.

## How to Create the Issue

### Step 1: Navigate to the Issues Tab

1. Go to the repository on GitHub: https://github.com/mq-studio/mq-studio-site
2. Click on the **"Issues"** tab at the top of the repository page
3. Click the green **"New issue"** button

### Step 2: Fill Out the Issue Form

Use the following information when creating the issue:

**Title:**
```
Set up Copilot Instructions
```

**Description:**

```markdown
## Overview
Create a `.github/copilot-instructions.md` file to provide context and guidance to GitHub Copilot when working with code in this repository.

## Context
The repository currently has instruction files for other AI assistants:
- `CLAUDE.md` for Claude Code
- `GEMINI.md` for Gemini CLI

Following the same pattern, we need Copilot instructions at `.github/copilot-instructions.md` as referenced in `templates/plan-template.md`.

## Requirements

### File Location
- Path: `.github/copilot-instructions.md`

### Content Should Include

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

4. **Repository Guidelines** (from repository context)
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

### Success Criteria
- [ ] File created at `.github/copilot-instructions.md`
- [ ] Content follows similar structure to CLAUDE.md and GEMINI.md
- [ ] Includes repository-specific guidelines
- [ ] Provides clear development workflow guidance
- [ ] Documents the design system
- [ ] Includes critical production warnings

## Reference Files
- `CLAUDE.md` - Reference for structure and content
- `GEMINI.md` - Reference for concise formatting
- `templates/plan-template.md` - References Copilot instructions file
- Repository custom instructions - Available in system context

## Labels
Add the following labels when creating the issue:
- `documentation`
- `enhancement`
- `good first issue` (if applicable)

## Priority
Medium - This improves developer experience for those using GitHub Copilot
```

### Step 3: Add Labels (Optional)

If the repository has labels set up, add relevant ones such as:
- `documentation`
- `enhancement`
- `good first issue`

### Step 4: Assign (Optional)

If you want to assign the issue to someone specific, use the "Assignees" section on the right side of the issue form.

### Step 5: Submit

Click the green **"Submit new issue"** button to create the issue.

## What Happens Next

Once the issue is created:
1. The issue will be assigned a number (e.g., #123)
2. Team members can comment and discuss the implementation
3. Someone can be assigned to work on it
4. A pull request can be opened that references the issue number

## Implementation Notes

When someone works on this issue, they should:
1. Review the existing `CLAUDE.md` and `GEMINI.md` files
2. Extract relevant content applicable to GitHub Copilot
3. Create `.github/copilot-instructions.md` with appropriate content
4. Follow the repository's style and formatting conventions
5. Test that the instructions are helpful for Copilot users

## Related Documentation
- `CLAUDE.md` - Existing Claude Code instructions
- `GEMINI.md` - Existing Gemini CLI instructions  
- `templates/plan-template.md` - References Copilot instructions
- `README.md` - General project documentation
