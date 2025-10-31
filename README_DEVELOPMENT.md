# MQ Studio - Development Quick Reference

**Last Updated:** 2025-10-26

---

## 🚀 Quick Start

### View the Website
```bash
# Server is currently running at:
http://localhost:3100

# From Windows (WSL2):
http://172.21.180.197:3100
```

### Start Development Server
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev
```

### Run Tests
```bash
npm run test:unit      # Unit tests only
npm run test:e2e       # Playwright tests (broken - use npx)
npx playwright test    # Actual Playwright command
```

---

## 📚 Essential Documentation

**Start Here:**
1. [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md) - Central hub for everything
2. [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md) - Known issues and their status
3. [docs/SESSION_HISTORY.md](docs/SESSION_HISTORY.md) - What was learned in previous sessions

**Before Making Changes:**
4. [docs/IMPLEMENTATION_DECISIONS_LOG.md](docs/IMPLEMENTATION_DECISIONS_LOG.md) - See past decisions
5. [docs/FILE_MANAGEMENT_POLICY.md](docs/FILE_MANAGEMENT_POLICY.md) - How to handle docs

---

## 🎯 Current Status (2025-10-26)

### ✅ What's Working
- Application loads successfully (HTTP 200)
- Search API functional
- Content files parsing correctly
- 81% of tests passing (29/36)

### ⚠️ What Needs Fixing
1. **Search form navigation** (High) - Form doesn't navigate to results page
2. **Test timeouts** (Medium) - 5 tests timing out on page loads
3. **Gallery layout** (Medium) - Desktop shows 1 column instead of 3+
4. **React warning** (Low) - Event handler on client component

See [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md) for details

---

## 🤖 For AI Agents

### Before Starting Work:
1. Read [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
2. Check [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md) for current priorities
3. Review recent entries in [docs/SESSION_HISTORY.md](docs/SESSION_HISTORY.md)

### While Working:
- Use TodoWrite tool to track progress
- Document decisions in [docs/IMPLEMENTATION_DECISIONS_LOG.md](docs/IMPLEMENTATION_DECISIONS_LOG.md)
- Log new issues in [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md)

### Before Ending Session:
1. Update [docs/SESSION_HISTORY.md](docs/SESSION_HISTORY.md) with lessons learned
2. Update [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md) with discoveries/resolutions
3. Archive obsolete files to `docs/archive/YYYY-MM-DD/`
4. Update [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md) status

**See:** [docs/FILE_MANAGEMENT_POLICY.md](docs/FILE_MANAGEMENT_POLICY.md) for details

---

## 🏗️ Project Architecture

**Framework:** Next.js 14.2.5 with App Router (NOT Astro!)

**Key Directories:**
```
app/                    # Next.js pages and routes
├── page.tsx           # Homepage
├── search/page.tsx    # Search results page
├── gallery/           # Gallery pages
└── api/content/       # Content API endpoint

components/            # React components
├── search/SearchBar.tsx  # Search interface
└── content/           # Content display components

content/              # Markdown content files
├── publications/     # 6 files
├── artworks/        # 6 files
├── musings/         # 4 files
└── projects/        # 3 files

lib/                 # Utilities and services
└── content/         # Content loading and search

tests/               # Test suites
├── playwright/      # E2E tests (36 tests)
└── unit/           # Unit tests

docs/                # Project documentation
├── PROJECT_MANAGEMENT.md           # Start here!
├── ISSUES_TRACKER.md              # Issue tracking
├── SESSION_HISTORY.md             # Lessons learned
├── IMPLEMENTATION_DECISIONS_LOG.md # Decisions
├── FILE_MANAGEMENT_POLICY.md      # File hygiene
└── archive/                       # Old docs
```

---

## 🔧 Common Commands

### Development
```bash
npm run dev          # Start dev server (port 3100)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint
```

### Testing
```bash
npm run test         # All tests (Jest)
npm run test:unit    # Unit tests only
npx playwright test  # E2E tests
npx playwright test --ui  # E2E in UI mode
```

### Utilities
```bash
npm run verify       # Lint + unit tests
npm run spec:check   # Spec compliance
```

---

## 📊 Test Status

**Last Run:** 2025-10-26

| Suite | Total | Passed | Failed | Pass Rate |
|-------|-------|--------|--------|-----------|
| **Responsive Design** | 25 | 20 | 5 | 80% |
| **Search Functionality** | 11 | 9 | 2 | 82% |
| **Overall** | 36 | 29 | 7 | **81%** |

---

## 🐛 Known Issues

| ID | Priority | Issue | Status |
|----|----------|-------|--------|
| #001 | 🟠 High | Search navigation | In Progress |
| #002 | 🟡 Medium | Test timeouts | New |
| #003 | 🟡 Medium | Gallery layout | New |
| #004 | 🟢 Low | React warning | New |
| #005 | ✅ Resolved | YAML parsing | Fixed |

See [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md) for full details

---

## 🎓 Key Lessons from Recent Work

1. **YAML Special Characters:** Always quote values with colons in frontmatter
2. **Framework Verification:** Trust code over docs (this is Next.js, not Astro)
3. **Dev Server First:** Always check server is running before debugging
4. **Use Agents:** Delegate heavy tasks to specialized agents for efficiency

See [docs/SESSION_HISTORY.md](docs/SESSION_HISTORY.md) for complete lessons

---

## 📞 Need Help?

1. **Documentation unclear?** Check [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
2. **Found a bug?** Add to [docs/ISSUES_TRACKER.md](docs/ISSUES_TRACKER.md)
3. **Making a decision?** Document in [docs/IMPLEMENTATION_DECISIONS_LOG.md](docs/IMPLEMENTATION_DECISIONS_LOG.md)
4. **Session complete?** Update [docs/SESSION_HISTORY.md](docs/SESSION_HISTORY.md)

---

## 🎯 Next Priorities

1. Fix search form navigation (browser testing needed)
2. Update test timeouts (quick win)
3. Fix gallery layout CSS
4. Add YAML validation tooling

---

**Remember:** This is a living project. Keep documentation current, learn from past sessions, and be kind to future developers (AI or human) who will continue this work.
