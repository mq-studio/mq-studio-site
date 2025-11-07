# Development → Production Workflow

This document describes the workflow for managing changes between the development and production repositories for MQ Studio.

## Repository Structure

```
mq-studio/ (GitHub Organization)
├── mq-studio-dev          # Development & Experimentation (PRIVATE)
├── mq-studio-site         # Production Website (PUBLIC)
├── mq-studio-knowledge    # Documentation & History (PRIVATE)
├── mq-studio-assets       # Original Media Assets (PRIVATE)
├── website-mq-studio      # [ARCHIVED] Early development version
└── mq_studio_build        # [ARCHIVED] Google AI Studio prototype
```

## Git Remote Configuration

Your local repository (`~/code/clients/moura_quayle/website-mq-studio`) is configured with:

```bash
origin      → mq-studio/mq-studio-dev   # Development repo (default push/pull)
production  → mq-studio/mq-studio-site  # Production repo
```

**Verify with:** `git remote -v`

## Development Workflow

### 1. Daily Development (Feature Work)

**All development happens in `mq-studio-dev`:**

```bash
# Start new feature
git checkout -b feature/my-new-feature

# Make changes, commit
git add .
git commit -m "feat: Add new feature"

# Push to development repo
git push origin feature/my-new-feature
```

### 2. Experimentation

**Use experiment branches for risky changes:**

```bash
# Create experiment branch
git checkout -b experiment/visual-redesign

# Develop freely
npm run dev  # Test locally on localhost:3000

# Push to dev repo
git push origin experiment/visual-redesign
```

**Existing experiment branches:**
- `experiment/micro-interactions`
- `experiment/performance-2025`
- `experiment/scrollytelling-narrative`
- `experiment/visual-vibrancy-2025`

### 3. Testing Before Production

**Always validate before promoting to production:**

```bash
# Ensure you're on the feature branch
git checkout feature/my-feature

# Run all validation checks
npm run lint          # ESLint checks
npx tsc --noEmit      # TypeScript validation
npm run build         # Production build test

# Visual testing
npm run dev           # Test on localhost:3000
```

## Production Deployment Workflow

### Option A: Direct Push (Small, Safe Changes)

**For minor fixes or low-risk updates:**

```bash
# 1. Ensure dev branch is clean and tested
git checkout main
git pull origin main

# 2. Merge your feature
git merge feature/my-feature

# 3. Push to dev repo first
git push origin main

# 4. Push to production
git push production main
```

### Option B: Pull Request (Recommended for Major Changes)

**For significant features or breaking changes:**

```bash
# 1. Push feature to dev
git push origin feature/my-feature

# 2. Create PR on GitHub from dev to production
gh pr create --repo mq-studio/mq-studio-site \
  --head mq-studio/mq-studio-dev:feature/my-feature \
  --base main \
  --title "feat: Your feature title" \
  --body "Description of changes..."

# 3. Review, approve, merge via GitHub UI
# 4. Pull merged changes back to local
git checkout main
git pull production main
git push origin main  # Sync dev repo
```

## Syncing Development with Production

**Periodically sync dev repo with production to stay current:**

```bash
# Pull latest from production
git checkout main
git pull production main

# Push to dev repo
git push origin main

# Update feature branches
git checkout feature/my-feature
git rebase main  # or: git merge main
```

## Emergency Hotfixes

**For urgent production fixes:**

```bash
# 1. Create hotfix branch from production
git fetch production
git checkout -b hotfix/urgent-fix production/main

# 2. Make minimal fix
# ... edit files ...
git commit -m "fix: Emergency fix for X"

# 3. Push directly to production
git push production hotfix/urgent-fix:main

# 4. Backport to dev
git push origin hotfix/urgent-fix
# Then merge via PR or direct merge to dev main
```

## Branch Strategy

### Main Branches
- **`main`**: Stable, deployable code (in both repos)
- **`develop`**: Integration branch (optional, not currently used)

### Supporting Branches
- **`feature/*`**: New features (e.g., `feature/footer-redesign`)
- **`experiment/*`**: Experimental work (e.g., `experiment/micro-interactions`)
- **`hotfix/*`**: Emergency production fixes (e.g., `hotfix/broken-link`)
- **`refactor/*`**: Code improvements without feature changes

## Deployment

### Automatic Deployment (Vercel)

**Production site (`mq-studio-site`) is auto-deployed via Vercel:**

- **Trigger**: Any push to `main` branch in `mq-studio/mq-studio-site`
- **URL**: https://mq-studio-site.vercel.app (or custom domain)
- **Build command**: `npm run build`
- **Output directory**: `.next`

**Development site can also be deployed separately:**

```bash
# Deploy dev branch to Vercel preview
vercel --prod
```

## Safety Checklist

**Before pushing to production:**

- [ ] All tests pass locally (`npm run lint`, `npx tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Visual testing completed on dev server
- [ ] No hardcoded secrets or API keys
- [ ] Changes reviewed (self-review or peer review)
- [ ] Experiments/WIP code removed or feature-flagged
- [ ] Breaking changes documented

## Common Commands

```bash
# View current remotes
git remote -v

# Check which repo you're tracking
git branch -vv

# See differences between dev and production
git fetch production
git diff production/main..origin/main

# List all branches (local and remote)
git branch -a

# Clean up merged branches
git branch --merged | grep -v "main" | xargs git branch -d

# Push current branch to dev
git push origin HEAD

# Push current branch to production (use carefully!)
git push production HEAD:main
```

## Troubleshooting

### Wrong Remote
```bash
# If you accidentally pushed to wrong remote
git push --force origin main  # Fix dev
git push --force production main  # Fix production (dangerous!)
```

### Diverged Branches
```bash
# If dev and production diverge
git fetch --all
git checkout main
git merge production/main  # Resolve conflicts
git push origin main
```

### Reset to Production State
```bash
# If dev is broken, reset to production
git fetch production
git reset --hard production/main
git push --force origin main  # Overwrites dev repo
```

## Archive Repositories

**The following are archived and read-only:**

- **`mq-studio/website-mq-studio`**: Early development version with footer experiments
- **`mq-studio/mq_studio_build`**: Obsolete Vite/React prototype

**To reference archived work:**
```bash
# Clone archived repo (read-only)
gh repo clone mq-studio/website-mq-studio /tmp/archived-version

# Cherry-pick specific commits
cd /tmp/archived-version
git log --oneline  # Find commit hash
cd ~/code/clients/moura_quayle/website-mq-studio
git cherry-pick <commit-hash>
```

## Questions?

- **Which repo am I working on?** → `git remote -v` (origin = dev)
- **How do I test before production?** → `npm run build && npm run start`
- **How do I deploy to production?** → `git push production main`
- **Can I experiment freely?** → Yes! Use `experiment/*` branches in dev repo
- **What if I break production?** → Use hotfix workflow or revert commit

---

**Last Updated**: 2025-11-07
**Maintained By**: MQ Studio Development Team
