# Summary: How to Create "Set up Copilot Instructions" Issue

## Quick Answer

To create a new GitHub issue titled "Set up Copilot Instructions", follow these steps:

### 1. Navigate to GitHub Issues
- Go to: https://github.com/mq-studio/mq-studio-site/issues/new
- Or: Repository page → "Issues" tab → "New issue" button

### 2. Use This Information

**Title:**
```
Set up Copilot Instructions
```

**Description:** See [COPILOT_ISSUE_TEMPLATE.md](COPILOT_ISSUE_TEMPLATE.md) for the complete issue description template.

### 3. Add Labels (if available)
- `documentation`
- `enhancement`

### 4. Submit
Click "Submit new issue"

## Why This Issue Matters

The repository has AI assistant instructions for:
- ✅ Claude Code (`CLAUDE.md`)
- ✅ Gemini CLI (`GEMINI.md`)
- ❌ GitHub Copilot (`.github/copilot-instructions.md`) - **Missing**

This issue will create the missing Copilot instructions file to help GitHub Copilot users work more effectively in this repository.

## Detailed Documentation

For more detailed information, see:
- **[CREATE_COPILOT_ISSUE.md](CREATE_COPILOT_ISSUE.md)** - Complete step-by-step guide
- **[COPILOT_ISSUE_TEMPLATE.md](COPILOT_ISSUE_TEMPLATE.md)** - Ready-to-copy issue template

## What the Issue Will Accomplish

When implemented, this issue will:
1. Create `.github/copilot-instructions.md`
2. Provide GitHub Copilot with repository context
3. Document the development workflow
4. Explain the design system and conventions
5. Include critical production warnings

## Note

Since this repository is in production and connected to Vercel (auto-deploys on push), the Copilot instructions should include clear warnings about this to prevent accidental production deployments.
