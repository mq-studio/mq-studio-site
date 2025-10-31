# MQ Studio - File Management Policy

**Purpose:** Prevent documentation bloat, maintain clarity, and ensure AI agents can efficiently navigate project artifacts.

**Last Updated:** 2025-10-26

---

## 🎯 Core Principles

### 1. Revise First, Create Second
**Default Action:** Update existing files when information changes or expands

**Create New Files Only When:**
- Representing genuinely new work (new feature, new milestone)
- File would become too large (>500 lines)
- Topic is orthogonal to existing documentation
- Creating a new versioned artifact (e.g., spec v2)

**Example - REVISE:**
```
❌ Don't create: SEARCH_FUNCTIONALITY_UPDATE_2025_10_26.md
✅ Do update: docs/ISSUES_TRACKER.md (add new issue)
```

**Example - CREATE:**
```
✅ New feature: docs/AUTHENTICATION_IMPLEMENTATION.md
✅ New milestone: docs/V2_MIGRATION_GUIDE.md
```

### 2. Archive, Don't Delete
**Rule:** Outdated or superseded files should be archived, not deleted

**Archive Location:** `docs/archive/YYYY-MM-DD/`

**When to Archive:**
- File is superseded by newer version
- Information moved to centralized location
- Context document from completed session
- Temporary analysis no longer relevant

**Never Delete:**
- Decision logs (even old ones)
- Session summaries
- Issue tracking history
- Architectural documentation

**Example:**
```bash
# Archive old resume context after work is complete
mv RESUME_FROM_HUNG_CHAT.md docs/archive/2025-10-26/
```

### 3. Use Descriptive, Stable Names
**Good Names:**
- `ISSUES_TRACKER.md` (clear purpose, doesn't change)
- `SESSION_HISTORY.md` (append-only, stable name)
- `IMPLEMENTATION_DECISIONS_LOG.md` (clear purpose)

**Bad Names:**
- `NEW_ISSUES.md` (will become old immediately)
- `TEMP_NOTES.md` (unclear purpose, will proliferate)
- `FINAL_FINAL_v2.md` (versioning in filename)
- `2025_10_26_SESSION.md` (should be in SESSION_HISTORY.md)

---

## 📁 File Lifecycle

### Phase 1: Creation
**Before creating a new file, ask:**
1. ✅ Does similar documentation already exist?
2. ✅ Can I update an existing file instead?
3. ✅ Will this file have lasting value beyond current session?
4. ✅ Is the filename descriptive and stable?

**If all yes:** Create the file
**If any no:** Update existing file or reconsider

### Phase 2: Active Use
**During development:**
- Update files as information changes
- Keep centralized docs (ISSUES_TRACKER, SESSION_HISTORY) current
- Avoid creating multiple versions of same information

### Phase 3: Obsolescence
**When file becomes outdated:**
1. Determine if information should be preserved
2. If yes: Archive to `docs/archive/YYYY-MM-DD/`
3. If no: Still archive (don't delete)
4. Update any references to point to new location

### Phase 4: Archive
**Archived files:**
- Moved to `docs/archive/YYYY-MM-DD/`
- Organized by date of archival
- Never deleted (git history insufficient for context)
- Can be referenced if needed for historical context

---

## 📂 Directory Structure

### Core Documentation (Permanent)
```
docs/
├── PROJECT_MANAGEMENT.md           # Central hub (update, don't replace)
├── ISSUES_TRACKER.md               # Issue list (append, mark resolved)
├── IMPLEMENTATION_DECISIONS_LOG.md # Decision history (append only)
├── SESSION_HISTORY.md              # Session summaries (append only)
├── FILE_MANAGEMENT_POLICY.md       # This file (update rarely)
└── archive/                        # Archived files
    ├── 2025-10-25/
    │   └── resume-from-hung-chat.md
    └── 2025-10-26/
        └── (future archives)
```

### Feature Documentation (As Needed)
```
docs/
├── INTEGRATED_PATHWAYS_IMPLEMENTATION.md  # Feature spec (versioned if major changes)
├── AUTHENTICATION_DESIGN.md               # Feature spec
└── API_DOCUMENTATION.md                   # Feature spec
```

### Temporary/Session Files
```
docs/
├── INVESTIGATION_SEARCH_NAVIGATION.md  # Archive after issue resolved
├── PERFORMANCE_ANALYSIS.md             # Archive after optimization complete
└── MIGRATION_CHECKLIST.md              # Archive after migration
```

---

## 🔄 Common Scenarios

### Scenario 1: Discovering a New Issue
**❌ Don't:**
- Create `NEW_BUG_SEARCH_FORM.md`
- Create `TODO_FIX_TESTS.md`

**✅ Do:**
- Add entry to `docs/ISSUES_TRACKER.md`
- Reference issue number in code comments
- Update session history with discovery

### Scenario 2: Making an Architectural Decision
**❌ Don't:**
- Create `DECISION_USE_TYPESCRIPT.md`
- Create `WHY_WE_CHOSE_NEXTJS.md`

**✅ Do:**
- Add entry to `docs/IMPLEMENTATION_DECISIONS_LOG.md`
- Follow existing decision log format
- Include rationale and alternatives considered

### Scenario 3: Ending a Development Session
**❌ Don't:**
- Create `SESSION_2025_10_26_SUMMARY.md`
- Create `COMPLETED_WORK_TODAY.md`

**✅ Do:**
- Add session entry to `docs/SESSION_HISTORY.md`
- Update `docs/ISSUES_TRACKER.md` with new/resolved issues
- Update `docs/PROJECT_MANAGEMENT.md` status section

### Scenario 4: Investigating Complex Issue
**✅ Do (During Investigation):**
- Create `docs/INVESTIGATION_ISSUE_001.md` for detailed analysis
- Reference from ISSUES_TRACKER.md

**✅ Do (After Resolution):**
- Update ISSUES_TRACKER.md with resolution
- Archive investigation document to `docs/archive/YYYY-MM-DD/`
- Keep if investigation reveals architectural insights

### Scenario 5: Feature Implementation Complete
**✅ Do:**
- Update feature spec with "Completed" status
- Add completion entry to SESSION_HISTORY.md
- Mark related issues as resolved in ISSUES_TRACKER.md
- Archive any temporary implementation notes

---

## 📝 Documentation Types & Lifecycle

| Doc Type | Create When | Update When | Archive When | Example |
|----------|-------------|-------------|--------------|---------|
| **Central Hubs** | Once | Every session | Never | PROJECT_MANAGEMENT.md |
| **Append-Only Logs** | Once | Every session | Never | SESSION_HISTORY.md |
| **Issue Trackers** | Once | Issue discovered/resolved | Never (mark resolved) | ISSUES_TRACKER.md |
| **Decision Logs** | Once | Decision made | Never | IMPLEMENTATION_DECISIONS_LOG.md |
| **Feature Specs** | Feature kickoff | Feature evolves | Feature complete | INTEGRATED_PATHWAYS_IMPLEMENTATION.md |
| **Investigation Reports** | Complex issue | Finding discovered | Issue resolved | INVESTIGATION_*.md |
| **Session Artifacts** | Temporary need | As needed | Session complete | RESUME_FROM_*.md |
| **Test Reports** | Test run | Never (regenerate) | Test suite changes | SEARCH_TEST_REPORT.md |

---

## 🚨 Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Version Proliferation
```
docs/
├── ISSUES_v1.md
├── ISSUES_v2.md
├── ISSUES_FINAL.md
└── ISSUES_FINAL_UPDATED.md
```
**✅ Correct:** One `ISSUES_TRACKER.md` file, updated in place

### ❌ Anti-Pattern 2: Date-Based Session Files
```
docs/
├── 2025_10_25_session.md
├── 2025_10_26_session.md
└── 2025_10_27_session.md
```
**✅ Correct:** Single `SESSION_HISTORY.md` with dated entries

### ❌ Anti-Pattern 3: Scattered Issue Tracking
```
docs/
├── TODO.md
├── BUGS.md
├── FIXES_NEEDED.md
└── KNOWN_ISSUES.md
```
**✅ Correct:** One `ISSUES_TRACKER.md` with all issues

### ❌ Anti-Pattern 4: Duplicate Information
```
docs/
├── SEARCH_IMPLEMENTATION.md    (says search uses router.push)
├── SEARCH_NOTES.md             (says search uses router.push)
└── HOW_SEARCH_WORKS.md         (says search uses router.push)
```
**✅ Correct:** One source of truth, others link to it

### ❌ Anti-Pattern 5: Unclear Naming
```
docs/
├── temp.md
├── notes.md
├── misc.md
└── stuff.md
```
**✅ Correct:** `INVESTIGATION_SEARCH_NAVIGATION.md` (clear purpose)

---

## 🛠️ AI Agent Checklist

### Before Creating a New File:
- [ ] I checked if similar documentation exists
- [ ] I considered updating an existing file instead
- [ ] This file will have lasting value beyond current session
- [ ] The filename is descriptive and won't need changing
- [ ] This isn't a duplicate of existing information

### Before Ending a Session:
- [ ] I updated central documentation (PROJECT_MANAGEMENT.md, ISSUES_TRACKER.md, SESSION_HISTORY.md)
- [ ] I archived any temporary files to `docs/archive/YYYY-MM-DD/`
- [ ] I didn't leave loose notes files
- [ ] I didn't create date-stamped session files
- [ ] File structure is cleaner than when I started

### When Information Changes:
- [ ] I updated the existing file rather than creating a new one
- [ ] I preserved history in git (no information loss)
- [ ] I maintained single source of truth
- [ ] I updated references if file was moved

---

## 📊 Metrics for Success

**Good File Hygiene:**
- `docs/` directory has <20 active files
- Archive directory grows steadily
- No files with dates in names
- No duplicate information
- Clear purpose for every file

**Bad File Hygiene:**
- `docs/` directory has >30 files
- Multiple versions of same content
- Many files with "temp", "new", "old" in names
- Unclear which document is authoritative

---

## 🔍 Monthly Audit Checklist

**Perform monthly (or when docs feel cluttered):**

1. **Identify Obsolete Files**
   - [ ] Files marked "temp" or "draft"
   - [ ] Session artifacts from >30 days ago
   - [ ] Investigation reports for resolved issues
   - [ ] Old test reports

2. **Archive Obsolete Files**
   - [ ] Move to `docs/archive/YYYY-MM-DD/`
   - [ ] Update any references
   - [ ] Verify git history preserved

3. **Check for Duplication**
   - [ ] Search for similar content across files
   - [ ] Consolidate if found
   - [ ] Archive superseded versions

4. **Verify Central Docs Current**
   - [ ] PROJECT_MANAGEMENT.md reflects current state
   - [ ] ISSUES_TRACKER.md has no stale issues
   - [ ] SESSION_HISTORY.md is up to date

---

## 📚 Examples from This Project

### ✅ Good Practices Used:

1. **Created central hub:** `PROJECT_MANAGEMENT.md` - single entry point
2. **Consolidated issue tracking:** `ISSUES_TRACKER.md` - all issues in one place
3. **Append-only history:** `SESSION_HISTORY.md` - complete session record
4. **Clear naming:** All files have descriptive, stable names

### ✅ Planned Improvements:

1. **Archive old resume doc:** `RESUME_FROM_HUNG_CHAT.md` → `docs/archive/2025-10-26/`
2. **Consolidate test reports:** Multiple test reports → single current report, archive old ones
3. **Clean up test directories:** Remove old screenshots, keep recent only

---

## 🎓 Training for Future AI Agents

**Read this file:**
- At the start of any session involving documentation
- Before creating any new markdown file
- When docs directory feels cluttered

**Remember:**
1. **Revise existing files** when information updates
2. **Archive, don't delete** when files become outdated
3. **Use central docs** (PROJECT_MANAGEMENT, ISSUES_TRACKER, SESSION_HISTORY)
4. **Name files descriptively** without dates or versions

**Your Legacy:**
The documentation you leave behind determines how easily the next agent can continue your work. Be thoughtful, be organized, be kind to your successors.

---

**Questions?** See [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md) or ask the project owner.
