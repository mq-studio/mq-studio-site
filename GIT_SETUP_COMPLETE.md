# Git Repository Setup - Complete

**Date:** 2025-11-07
**Status:** ✅ Complete and Working

## What Was Done

Your website development environment is now properly configured as a **standalone git repository** with clean separation from the infrastructure code.

## Current Setup

### Local Repository
```
Location: /home/ichardart/code/clients/moura_quayle/website-mq-studio/
Git Status: Standalone repository (not tracked by parent)
```

### Git Remotes Configuration
```bash
origin      → https://github.com/mq-studio/mq-studio-dev.git      # Development
production  → https://github.com/mq-studio/mq-studio-site.git     # Production
```

### Parent Repository
```
Location: /home/ichardart/code/
Status: Infrastructure repo (no longer tracks website files)
Gitignore: clients/moura_quayle/website-mq-studio/ added
```

## Repository Structure (Final)

```
/home/ichardart/code/                              ← Infrastructure git repo
├── .git/                                          ← Tracks: infra/, tools/, etc.
├── .gitignore                                     ← Ignores: website-mq-studio/
├── infra/                                         ← Infrastructure code
├── clients/
│   └── moura_quayle/
│       └── website-mq-studio/                     ← Separate git repo
│           ├── .git/                              ← NEW: Website git repo
│           │   └── remotes/
│           │       ├── origin → mq-studio-dev     ← Development (default)
│           │       └── production → mq-studio-site ← Production
│           ├── app/                               ← Next.js app
│           ├── content/                           ← MDX content
│           ├── experiments/                       ← Your experiments
│           ├── package.json
│           └── DEV_PRODUCTION_WORKFLOW.md         ← Workflow guide
```

## Why This Structure?

**Before (Problematic):**
- `/home/ichardart/code/.git` tracked EVERYTHING including website
- Path mismatch: Local had `clients/moura_quayle/website-mq-studio/`, GitHub expected root
- Couldn't push/pull properly
- Confusing nested structure

**After (Clean):**
- Separate git repository for website
- Direct mapping: Local root = GitHub root
- Standard workflow with multiple remotes
- No path translation needed

## How to Use

### Daily Development Work

```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio

# Make changes, test
npm run dev

# Commit and push to development
git add .
git commit -m "feat: Your feature"
git push origin main                    # Pushes to mq-studio-dev
```

### Deploy to Production

```bash
# Ensure all changes are tested
npm run build
npm run lint
npx tsc --noEmit

# Push to production
git push production main                # Pushes to mq-studio-site
```

### Check Which Repos You're Connected To

```bash
git remote -v
# Shows:
# origin → mq-studio-dev (your daily work)
# production → mq-studio-site (production deployments)
```

### View Differences Between Dev and Production

```bash
git fetch --all
git diff production/main..origin/main
```

## Current State Verification

**Local repository:**
- ✅ Initialized at `/home/ichardart/code/clients/moura_quayle/website-mq-studio/`
- ✅ Connected to `mq-studio-dev` (origin)
- ✅ Connected to `mq-studio-site` (production)
- ✅ All files committed and synced
- ✅ Experiments and local work preserved

**Remote repositories:**
- ✅ `mq-studio/mq-studio-dev` - Contains your local work with experiments
- ✅ `mq-studio/mq-studio-site` - Production site (unchanged, stable)

**Parent repository:**
- ✅ Website directory removed from tracking
- ✅ Gitignore updated to exclude website

## Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│  Local: /home/ichardart/code/clients/moura_quayle/     │
│         website-mq-studio/                              │
│         ├── .git/                                       │
│         ├── app/                                        │
│         ├── content/                                    │
│         ├── experiments/   ← Your experiments here     │
│         └── package.json                                │
└─────────────────────────────────────────────────────────┘
                    │                │
                    │                │
          git push origin     git push production
                    │                │
                    ▼                ▼
         ┌─────────────────┐  ┌─────────────────┐
         │ mq-studio-dev   │  │ mq-studio-site  │
         │ (PRIVATE)       │  │ (PUBLIC)        │
         │                 │  │                 │
         │ Development     │  │ Production      │
         │ Experiments OK  │  │ Stable only     │
         └─────────────────┘  └─────────────────┘
                                        │
                                        │
                                  Auto-deploy
                                        │
                                        ▼
                                  ┌─────────┐
                                  │ Vercel  │
                                  │ (Live)  │
                                  └─────────┘
```

## Benefits of This Setup

1. **Clean separation** - Website code is isolated
2. **Standard git workflow** - Works like any normal project
3. **Multiple remotes** - Push to dev, production separately
4. **No path confusion** - Local structure matches remote
5. **Experiment freely** - Dev repo is your sandbox
6. **Safe production** - Production only gets tested code

## Common Commands

```bash
# Where am I?
pwd                           # Should show: .../website-mq-studio

# What repo am I in?
git remote -v                 # Shows origin=dev, production=prod

# What branch?
git branch                    # Should show: main

# Status
git status                    # Clean working tree

# Push to dev (daily work)
git push origin main

# Push to production (tested code)
git push production main

# Pull latest from production
git pull production main

# Create experiment branch
git checkout -b experiment/my-idea
git push origin experiment/my-idea
```

## Troubleshooting

**Q: Which repository am I working in?**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
pwd                           # Verify location
git remote -v                 # Verify remotes
```

**Q: How do I know if I'm in the right place?**
```bash
ls -la                        # Should see: app/, content/, package.json, .git/
git remote -v                 # Should show: origin → mq-studio-dev
```

**Q: Did my changes sync to GitHub?**
```bash
git status                    # Should say: "nothing to commit, working tree clean"
git log --oneline -1          # Shows your latest commit
```

**Q: What if I accidentally work in the parent repo?**
```bash
# Check where you are
git rev-parse --show-toplevel

# If it shows /home/ichardart/code:
cd clients/moura_quayle/website-mq-studio   # Move to website repo
```

## Next Steps

1. **Continue your work** - All your experiments and changes are preserved
2. **Push feature branches** - Your experiment branches are ready to push
3. **Test thoroughly** - Build and test before pushing to production
4. **Deploy when ready** - Use `git push production main` after validation

## Documentation

- **Workflow Guide:** [DEV_PRODUCTION_WORKFLOW.md](DEV_PRODUCTION_WORKFLOW.md:1)
- **Repository Structure:** This document
- **GitHub Org:** https://github.com/mq-studio

---

**Setup completed:** 2025-11-07
**Verified by:** Claude Code
**Status:** ✅ Ready for development
