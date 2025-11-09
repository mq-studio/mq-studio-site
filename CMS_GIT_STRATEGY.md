# CMS Git Strategy & Branch Management

**Date:** 2025-11-09
**Project:** MQ Studio CMS Implementation
**Current Setup:** Dual-repository (dev → production) workflow

---

## Current Repository Structure

```
mq-studio-dev (private) → Development & experimentation
    ↓ (manual push)
mq-studio-site (private) → Production deployment
    ↓ (auto-deploy)
Vercel Production
```

---

## Recommended Strategy: Feature Branch Development

### Why This Approach?

✅ **Pros:**
- Isolated development without affecting main branch
- Easy rollback if issues arise
- Clear separation of concerns
- Supports parallel development
- Enables code review via Pull Requests
- Maintains stable main branch
- Familiar workflow for most developers

❌ **Alternatives Considered:**
- **Trunk-based development**: Too risky for major feature like CMS
- **GitFlow**: Overcomplicated for small team
- **Forking**: Unnecessary complexity for private repos
- **Monorepo**: Would require restructuring entire project

---

## Branch Strategy

### Primary Branches

```
main
├── feature/cms-v01          # Main CMS feature branch
│   ├── feature/cms-auth     # Authentication subsystem
│   ├── feature/cms-editor   # WYSIWYG editor
│   ├── feature/cms-media    # Media library
│   ├── feature/cms-api      # API endpoints
│   └── feature/cms-ui       # UI components
└── staging                   # Pre-production testing (optional)
```

### Branch Naming Convention

```
feature/cms-[component]    # CMS features
fix/cms-[issue]           # Bug fixes
docs/cms-[topic]          # Documentation
test/cms-[area]           # Testing branches
```

---

## Implementation Workflow

### Phase 1: Initial Setup (Now)

```bash
# 1. Create and push design docs to main
git add CMS_*.md
git commit -m "docs: Add comprehensive CMS design documentation

- Activity inventory and user journeys
- Information architecture and wireframes
- Technical architecture
- Implementation roadmap
- Security and performance specs
- V01 specification"

git push origin main

# 2. Create feature branch
git checkout -b feature/cms-v01
git push -u origin feature/cms-v01

# 3. Set branch protection (via GitHub UI or CLI)
gh repo edit --default-branch main
gh api repos/mq-studio/mq-studio-dev/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["continuous-integration"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false}'
```

### Phase 2: Development Workflow

```bash
# Developer workflow for each feature
git checkout feature/cms-v01
git pull origin feature/cms-v01

# Create sub-feature branch
git checkout -b feature/cms-auth

# Work on feature
# ... make changes ...
git add .
git commit -m "feat(cms): Implement NextAuth authentication"

# Push and create PR
git push origin feature/cms-auth
gh pr create --base feature/cms-v01 --title "CMS: Add authentication" --body "..."

# After review, merge to cms-v01
gh pr merge --squash

# Periodically sync with main
git checkout feature/cms-v01
git pull origin main
git push origin feature/cms-v01
```

### Phase 3: Testing & Staging

```bash
# When ready for testing
git checkout main
git pull origin main

git checkout -b staging
git merge feature/cms-v01

# Deploy to staging environment
git push origin staging

# Run tests
npm test
npm run e2e

# If tests pass, create PR to main
gh pr create --base main --head feature/cms-v01
```

### Phase 4: Production Deployment

```bash
# After approval and testing
git checkout main
git pull origin main

# Merge CMS feature
git merge --no-ff feature/cms-v01
git push origin main

# Tag release
git tag -a v2.0.0-cms -m "CMS V01 Release"
git push origin v2.0.0-cms

# Push to production repo
git push production main

# Vercel auto-deploys from production/main
```

---

## Parallel Development Structure

### Week 1-2: Foundation
```
feature/cms-v01
├── feature/cms-setup      # Next.js routes, folder structure
├── feature/cms-auth       # NextAuth setup
└── feature/cms-api-base   # Base API structure
```

### Week 3-4: Core Features
```
feature/cms-v01
├── feature/cms-editor     # TipTap WYSIWYG
├── feature/cms-media      # Upload & library
└── feature/cms-content    # Content management
```

### Week 5-6: Integration
```
feature/cms-v01
├── feature/cms-git        # Auto-commit functionality
├── feature/cms-preview    # Preview system
└── feature/cms-dashboard  # Dashboard UI
```

---

## Environment Strategy

### Development Environments

1. **Local Development**
   ```
   http://localhost:3000       # Main site
   http://localhost:3000/studio # CMS interface
   ```

2. **Feature Branch Preview** (Vercel)
   ```
   https://mq-studio-cms-v01-*.vercel.app
   ```

3. **Staging** (Optional)
   ```
   https://mq-studio-staging.vercel.app
   ```

4. **Production**
   ```
   https://mq-studio-site.vercel.app
   ```

### Environment Variables

```bash
# .env.local (development)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret
DATABASE_URL=postgresql://...

# .env.staging
NEXTAUTH_URL=https://mq-studio-staging.vercel.app
NEXTAUTH_SECRET=staging-secret
DATABASE_URL=postgresql://...

# .env.production
NEXTAUTH_URL=https://mq-studio-site.vercel.app
NEXTAUTH_SECRET=production-secret
DATABASE_URL=postgresql://...
```

---

## Database/Storage Strategy

### Option 1: Vercel KV (Recommended for V01)
- Simple key-value storage
- Good for auth sessions
- No additional setup

### Option 2: PostgreSQL (Future)
```
Development: Local PostgreSQL or Docker
Staging: Vercel Postgres (hobby)
Production: Vercel Postgres (pro)
```

### Option 3: File-based (Current)
- Continue using `/content/` directory
- Git as version control
- Good for content, not for auth

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/cms-ci.yml
name: CMS CI

on:
  pull_request:
    branches: [feature/cms-v01, main]
  push:
    branches: [feature/cms-v01]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Risk Mitigation

### Backup Strategy
```bash
# Before major merges
git checkout main
git pull origin main
git tag backup-before-cms-$(date +%Y%m%d)
git push origin --tags
```

### Rollback Plan
```bash
# If issues in production
git checkout main
git reset --hard backup-before-cms-20251109
git push --force-with-lease origin main
git push --force-with-lease production main
```

### Feature Flags (Optional)
```typescript
// lib/features.ts
export const features = {
  cms: process.env.NEXT_PUBLIC_FEATURE_CMS === 'true',
  cmsAuth: process.env.NEXT_PUBLIC_FEATURE_CMS_AUTH === 'true',
};

// In components
if (features.cms) {
  // Show CMS features
}
```

---

## Team Collaboration

### Pull Request Template

```markdown
## CMS Feature: [Component Name]

### Description
Brief description of changes

### Type
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Testing

### Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No performance regression
- [ ] Security review complete

### Screenshots
[If applicable]

### Related Issues
Closes #XX
```

### Code Review Process

1. Developer creates PR from feature branch
2. Automated tests run
3. Preview deployment created
4. Code review by team
5. Manual testing in preview
6. Merge to feature/cms-v01
7. Integration testing
8. Merge to main when stable

---

## Migration Path

### Current Site → CMS Integration

1. **Phase 1**: CMS runs alongside current site
   - `/studio/*` routes for CMS
   - Current content flow unchanged

2. **Phase 2**: Gradual migration
   - New content via CMS
   - Old content remains file-based

3. **Phase 3**: Full migration
   - All content managed via CMS
   - File-based system deprecated

---

## Commands Quick Reference

```bash
# Start CMS development
git checkout -b feature/cms-v01
npm install       # Install dependencies
npm run dev       # Start dev server

# Create sub-feature
git checkout -b feature/cms-[component]
# ... develop ...
git push origin feature/cms-[component]
gh pr create

# Sync with main
git checkout feature/cms-v01
git pull origin main
git push origin feature/cms-v01

# Deploy to staging
git checkout staging
git merge feature/cms-v01
git push origin staging

# Release to production
git checkout main
git merge --no-ff feature/cms-v01
git tag -a v2.0.0-cms -m "CMS Release"
git push origin main --tags
git push production main
```

---

## Timeline

### Week 1-2: Foundation
- Create feature/cms-v01 branch
- Set up basic CMS routes
- Implement authentication

### Week 3-4: Core Development
- WYSIWYG editor
- Media management
- Content CRUD

### Week 5-6: Integration
- Git integration
- Preview system
- Dashboard

### Week 7: Testing
- Integration testing
- Performance testing
- Security audit

### Week 8: Staging
- Deploy to staging
- User acceptance testing
- Bug fixes

### Week 9: Production
- Final review
- Merge to main
- Production deployment
- Monitor and support

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Feature branch strategy | Isolates CMS development from main site | 2025-11-09 |
| Squash merge for sub-features | Keeps history clean | 2025-11-09 |
| No-FF merge to main | Preserves feature branch history | 2025-11-09 |
| Vercel for previews | Already integrated, automatic | 2025-11-09 |
| NextAuth for auth | Industry standard, well-supported | 2025-11-09 |

---

## Next Immediate Steps

1. **Commit design docs to main** ✅
2. **Create feature/cms-v01 branch**
3. **Set up branch protection rules**
4. **Create initial CMS routes**
5. **Set up NextAuth**
6. **Create first PR**

This strategy provides:
- **Isolation**: CMS development won't break production
- **Flexibility**: Multiple developers can work in parallel
- **Safety**: Easy rollback if needed
- **Visibility**: Clear progress tracking via PRs
- **Quality**: Code review before merging