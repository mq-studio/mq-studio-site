# MQ Studio - Project Management Hub

**Last Updated:** 2025-10-26
**Project Status:** Active Development

---

## 📋 Quick Links

- **[Active Issues Tracker](ISSUES_TRACKER.md)** - All known issues, bugs, and enhancements
- **[Decision Log](IMPLEMENTATION_DECISIONS_LOG.md)** - Architectural decisions with rationale
- **[Session History](SESSION_HISTORY.md)** - Lessons learned from each development session
- **[File Management Policy](FILE_MANAGEMENT_POLICY.md)** - How to handle documentation and artifacts

---

## 🎯 Project Governance Principles

### 1. Decision Documentation
**Every architectural or implementation decision MUST include:**
- Date and decision maker
- Problem context
- Options considered with pros/cons
- Rationale for chosen option
- Implementation implications
- Success criteria

**Location:** `docs/IMPLEMENTATION_DECISIONS_LOG.md`

### 2. Issue Tracking
**All issues (bugs, enhancements, tech debt) MUST be tracked with:**
- Unique ID
- Discovery date and session
- Priority (Critical/High/Medium/Low)
- Status (New/In Progress/Blocked/Resolved)
- Root cause analysis
- Resolution path

**Location:** `docs/ISSUES_TRACKER.md`

### 3. Session Continuity
**After each development session, AI agents MUST:**
- Document lessons learned
- Update issue tracker with new discoveries
- Archive obsolete artifacts (don't delete - archive)
- Update this hub with current status

**Location:** `docs/SESSION_HISTORY.md`

### 4. File Management
**To prevent documentation bloat:**
- **REVISE existing files** when information updates
- **CREATE new files only** when representing new work or milestones
- **ARCHIVE outdated files** to `docs/archive/YYYY-MM-DD/`
- **DELETE ONLY** if duplicate or accidental creation

**Policy:** See `docs/FILE_MANAGEMENT_POLICY.md`

---

## 📊 Current Project Status

### Active Development Focus
- Fixing search navigation (form submission not updating URL)
- Playwright test reliability improvements
- Desktop gallery layout corrections

### Recent Wins (2025-10-26)
- ✅ Fixed HTTP 500 error (YAML parsing in content file)
- ✅ Application fully functional
- ✅ Search API working correctly
- ✅ Test pass rate improved from 18% to 81%

### Known Issues
See [ISSUES_TRACKER.md](ISSUES_TRACKER.md) for complete list

### Next Session Priorities
1. Fix search form navigation
2. Increase test timeouts
3. Desktop gallery layout fix

---

## 🤖 AI Agent Onboarding

### When Starting a New Session:

1. **READ FIRST:**
   - This file (PROJECT_MANAGEMENT.md)
   - [ISSUES_TRACKER.md](ISSUES_TRACKER.md) - What needs fixing
   - [SESSION_HISTORY.md](SESSION_HISTORY.md) - What was learned previously

2. **BEFORE CREATING NEW FILES:**
   - Check if existing file can be updated instead
   - Review [FILE_MANAGEMENT_POLICY.md](FILE_MANAGEMENT_POLICY.md)

3. **WHEN MAKING DECISIONS:**
   - Document in [IMPLEMENTATION_DECISIONS_LOG.md](IMPLEMENTATION_DECISIONS_LOG.md)
   - Include full rationale

4. **BEFORE ENDING SESSION:**
   - Update [SESSION_HISTORY.md](SESSION_HISTORY.md) with lessons learned
   - Update [ISSUES_TRACKER.md](ISSUES_TRACKER.md) with any new issues discovered
   - Archive any obsolete files to `docs/archive/YYYY-MM-DD/`
   - Update this hub's "Current Project Status"

---

## 📁 Documentation Structure

```
docs/
├── PROJECT_MANAGEMENT.md           (This file - central hub)
├── ISSUES_TRACKER.md               (All issues and their status)
├── IMPLEMENTATION_DECISIONS_LOG.md (Architectural decisions)
├── SESSION_HISTORY.md              (Lessons learned per session)
├── FILE_MANAGEMENT_POLICY.md       (How to handle files)
├── INTEGRATED_PATHWAYS_IMPLEMENTATION.md (Feature spec)
├── codespaces-guide.md             (Dev environment setup)
└── archive/                        (Archived outdated docs)
    ├── 2025-10-25/
    │   └── old-resume-context.md
    └── 2025-10-26/
        └── (future archives)
```

---

## 🔄 Session Workflow

### Phase 1: Planning
1. Review issue tracker for next priorities
2. Read relevant session history
3. Check for related decisions in decision log

### Phase 2: Implementation
4. Work on task with TodoWrite tool tracking
5. Document decisions as they're made
6. Discover and log new issues

### Phase 3: Wrap-Up
7. Update issue tracker
8. Write session summary in SESSION_HISTORY.md
9. Archive obsolete files
10. Update project status in this file

---

## 📈 Metrics

### Test Coverage
- **Current:** 36 tests total, 29 passing (81%)
- **Target:** 90%+ pass rate
- **Last Updated:** 2025-10-26

### Known Issues
- **Critical:** 0
- **High:** 1 (search navigation)
- **Medium:** 2 (timeouts, gallery layout)
- **Low:** 1 (React warning)
- **Last Updated:** 2025-10-26

### Documentation Health
- **Decision Log Entries:** 2
- **Session Summaries:** 2
- **Tracked Issues:** 4
- **Last Audit:** 2025-10-26

---

## 🚨 Emergency Procedures

### If Project State Is Unclear:
1. Read `docs/SESSION_HISTORY.md` (most recent entries)
2. Check `docs/ISSUES_TRACKER.md` for current problems
3. Review git log: `git log --oneline -10`

### If Tests Are Failing:
1. Check `docs/ISSUES_TRACKER.md` for known test issues
2. Review last session summary in `docs/SESSION_HISTORY.md`
3. Consult test reports in `tests/playwright/`

### If Documentation Is Messy:
1. Follow `docs/FILE_MANAGEMENT_POLICY.md`
2. Archive outdated files (don't delete)
3. Update this hub with current structure

---

**Remember:** Future AI agents depend on your documentation. Be thorough, be clear, be kind to your successors.
