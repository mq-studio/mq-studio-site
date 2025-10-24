# Monorepo to Multi-Repo Migration Strategy
**Created:** 2025-10-24
**Status:** Analysis & Planning Phase

---

## EXECUTIVE SUMMARY

Your codebase is a **10.6GB monorepo with 16 nested git repositories** that has naturally grown into distinct business units. The current structure creates operational burden without providing unified benefits.

**Key Decision:** Should remain as monorepo if teams share development closely, or split if teams work independently.

---

## CURRENT PAIN POINTS

### 1. Operational Burden
- **Clone Time:** ~10-15 minutes for full monorepo
- **Repository Size:** 10.6GB locally
- **Disk Space:** 363+ dependency directories
- **Git Operations:** Slow on large repo
- **CI/CD Coordination:** Complex pipeline for multiple projects

### 2. Architectural Coupling
- Client projects (MQ Studio, 86MB) bundled with CHEEV business suite (8.5GB)
- All projects share `/infra/` but don't need all of it
- Version coordination required for coordinated releases
- Difficult to isolate security changes

### 3. Team Scalability
- Hard to grant selective access (either full repo or nothing)
- Unclear project boundaries for new team members
- Difficult to maintain project-specific governance
- Complex branching strategy for independent releases

### 4. Dependency Bloat
- 363+ node_modules and venv directories
- Each project maintains separate dependencies
- No workspace optimization (monorepo pattern not used)
- Redundant packages across projects

---

## RECOMMENDED STRUCTURE

### Option A: HYBRID MONOREPO (Recommended if tight integration needed)

**Implement proper monorepo tooling:**

```
primary-monorepo/
├── packages/
│   ├── @ichardart/infra-governance
│   │   └── index.ts (exports governance, dev-env, tools)
│   ├── @ichardart/mcp-servers
│   │   └── index.ts (exports all MCP server integrations)
│   ├── @ichardart/protocols
│   │   └── index.ts (exports A2A, BMAD)
│   │
│   ├── moura-quayle-studio (depends on @ichardart/infra)
│   ├── cheev-business-suite (submodule)
│   ├── dog-patio-vancouver (depends on @ichardart/infra)
│   └── agent-orchestrator (depends on @ichardart/protocols)
│
├── shared/
│   ├── resources/ (images, docs)
│   └── utils/ (common utilities)
│
├── pnpm-workspace.yaml (or npm/yarn workspace)
├── turbo.json (for build orchestration)
└── package.json

Benefits:
- ~40% size reduction (shared dependencies)
- Faster local installs
- Unified build/test pipeline
- Clear package boundaries
- Easy selective cloning with workspaces
- Better performance

Requires:
- Migration to pnpm workspaces (or npm v7+ workspaces)
- Turbo or nx for build orchestration
- ~2-3 weeks implementation
```

### Option B: PURE MULTI-REPO (Recommended if independent teams)

**Separate repositories:**

```
1. ichardart-code-infra/ (Shared Infrastructure)
   - /infra/idp-governance/
   - /infra/dev-env-*/
   - /infra/tools/
   - /infra/mcp-*/
   - Published as: @ichardart/code-infra npm package
   
2. cheev-business-suite/ (Business Unit)
   - Current /business/CHEEV/ structure
   - 4 submodules maintained
   - Internal only
   
3. moura-quayle-studio/ (Client Project)
   - /clients/moura_quayle/website-mq-studio/
   - Depends on: @ichardart/code-infra
   - Published to client
   
4. ichardart-products/ (Product Portfolio)
   - dog-patio-vancouver/
   - agent-orchestrator/
   - Depends on: @ichardart/code-infra
   
5. experiments-archive/ (Learning/Historical)
   - Learning projects
   - No active development
   - Reference only

Benefits:
- Independent release cycles
- Selective access control
- Clear team boundaries
- Smaller repos (faster clone)
- Easier to archive/deprecate

Challenges:
- Cross-repo dependency management
- Coordinated governance updates
- Version alignment complexity
- Requires npm package publishing

```

---

## DETAILED MIGRATION PATH

### Phase 1: Analysis & Planning (2 weeks)

**Current State Mapping:**
- Identify all cross-project dependencies ✓ (Done in this analysis)
- Map data flows between projects
- Document governance requirements
- List shared resources/utilities

**Decision Point:**
```
Interview questions for teams:
1. Do MQ Studio, Dog Patio, and Agent Orchestrator teams
   collaborate daily? → YES = Keep monorepo | NO = Split
   
2. Does CHEEV team need separate release cycle? 
   → YES = Extract | NO = Keep integrated
   
3. Are governance updates always synchronized?
   → YES = Keep shared | NO = Publish as package
   
4. Do experiments need to be accessible?
   → YES = Keep | NO = Archive separately
```

**Deliverables:**
- Team preferences documented
- Governance model defined
- Dependency matrix finalized

### Phase 2: Infrastructure Extraction (2-3 weeks)

**For either option, extract shared infrastructure first:**

**2.1 Create infrastructure package:**
```bash
# Create new repo or directory structure
mkdir ichardart-code-infra
cp -r infra/{idp-governance,dev-env-cli,dev-env-docs,tools} .
cp -r share/ .

# Create package.json to export main APIs
{
  "name": "@ichardart/code-infra",
  "version": "1.0.0",
  "exports": {
    "./governance": "./idp-governance/index.js",
    "./dev-env": "./dev-env-cli/index.js",
    "./tools": "./tools/index.js"
  }
}
```

**2.2 Update all projects to use as dependency:**
```json
{
  "dependencies": {
    "@ichardart/code-infra": "^1.0.0"
  }
}
```

**2.3 Create CI/CD for shared infrastructure:**
- Automated testing
- SemVer versioning
- npm registry publishing (internal or public)

**Deliverables:**
- New infrastructure package repo
- All projects using updated import paths
- Automated tests passing
- Package versioning strategy established

### Phase 3: Extract Major Projects (2-3 weeks each)

**For Option B (Multi-Repo):**

**3.1 Extract CHEEV:**
```bash
git clone . cheev-repo
cd cheev-repo
git filter-branch --subdirectory-filter business/CHEEV
git remote set-url origin git@github.com:rhart696/cheev-business-suite.git
git push -u origin main
```

**3.2 Extract Client Projects:**
```bash
git clone . moura-repo
cd moura-repo
git filter-branch --subdirectory-filter clients/moura_quayle/website-mq-studio
git remote set-url origin git@github.com:rhart696/moura-quayle-studio.git
```

**3.3 Extract Products:**
```bash
git clone . products-repo
cd products-repo
git filter-branch --subdirectory-filter products
```

**For Option A (Monorepo with Workspaces):**

Skip this phase, use npm workspaces instead.

**Deliverables:**
- Each project in separate repository (if Option B)
- All projects depend on shared infrastructure
- GitHub actions updated for independent CI/CD
- No remaining monorepo

### Phase 4: Governance & Documentation (1-2 weeks)

**4.1 Update CLAUDE.md files:**
```markdown
# CLAUDE.md

## Dependencies
This project depends on:
- @ichardart/code-infra (v1.x)
  - Governance framework
  - Development tools
  - MCP servers

## Setup
npm install
source node_modules/@ichardart/code-infra/init.sh

## Running Tests
npm test

## Contributing
- Follow governance framework
- Run pre-commit hooks
- Update CHANGELOG.md
```

**4.2 Create governance README:**
- Document shared governance approach
- Define version coordination strategy
- Specify release procedures

**4.3 Update CI/CD:**
- Each repo gets independent pipeline
- Shared infrastructure has separate pipeline
- Cross-repo dependency testing

**Deliverables:**
- Updated documentation
- CI/CD pipelines working
- Team training completed

### Phase 5: Deprecation & Archival (1-2 weeks)

**5.1 Archive experiments:**
```
1. Create experiments-archive repo
2. Move hello-react-firebase, colour-mixer-app, curd-nerd-website
3. Mark as "learning/reference only"
4. Do not maintain actively
```

**5.2 Archive legacy clients:**
```
1. Create legacy-clients repo
2. Move shufa-and-leadership, mercfx
3. Mark as "historical/reference"
```

**5.3 Cleanup main repo:**
- Remove archived content
- Update .gitignore
- Remove stale branches
- Final cleanup

**Deliverables:**
- Archive repos created and pushed
- Main repo cleaned
- Historical access maintained

---

## DECISION MATRIX

### Choose Option A (Monorepo) if:
- [✓] Teams work together daily on multiple projects
- [✓] Shared governance requirements are high
- [✓] Version coordination is critical
- [✓] Want single clone/install experience
- [✓] Using pnpm or npm workspaces

### Choose Option B (Multi-Repo) if:
- [✓] Teams work independently
- [✓] Different release schedules needed
- [✓] Want selective access control
- [✓] Need clear project boundaries
- [✓] Different governance per project

---

## RISK MITIGATION

### Risk: Broken Dependencies During Migration
```
Mitigation:
- Create feature branch for all changes
- Test each phase before merge
- Maintain both old/new side-by-side during transition
- Keep rollback plan ready
```

### Risk: Lost Git History
```
Mitigation:
- Use git filter-branch (preserves history)
- Keep original monorepo as archive
- Create tags at migration points
```

### Risk: Team Productivity During Transition
```
Mitigation:
- Migrate non-critical projects first
- Run parallel systems for 1-2 weeks
- Pair programming for new workflows
- Create runbook for common operations
```

### Risk: Governance Enforcement
```
Mitigation:
- Test governance in new repos first
- Publish infrastructure as versioned package
- Document governance inheritance
- Automated testing of compliance
```

---

## EFFORT ESTIMATION

### Option A (Monorepo Optimization)
**Total: 4-6 weeks**
- Setup workspace tooling: 1 week
- Migrate projects to workspaces: 2 weeks
- Test and optimize: 1 week
- Documentation and training: 1 week
- Contingency: 1 week

### Option B (Multi-Repo Split)
**Total: 6-8 weeks**
- Infrastructure extraction: 2 weeks
- CHEEV extraction: 1 week
- Client projects extraction: 1 week
- Products extraction: 1 week
- Governance & testing: 1 week
- Documentation & training: 1 week
- Contingency: 1 week

---

## RECOMMENDED APPROACH

**Hybrid Path: Start with Option A, migrate to Option B later**

**Reasoning:**
1. Lower risk (workspace changes are local)
2. Immediate benefits (faster builds, clearer structure)
3. No breaking changes to workflows
4. Foundation for future multi-repo split
5. Teams can evaluate independence afterward

**Timeline:**
- Week 1-2: Implement npm workspaces
- Week 3-4: Stress test and optimize
- Month 2-3: Gather team feedback
- Month 3-4: If needed, split to multi-repo

---

## QUICK WINS (Implement Now)

### Win #1: Setup npm Workspaces (No breaking changes)
```json
{
  "workspaces": [
    "packages/*",
    "clients/*",
    "business/*",
    "products/*"
  ]
}
```

**Benefit:** 40-50% size reduction, shared node_modules
**Time:** 3-4 hours

### Win #2: Add Turbo for Build Optimization
```bash
npm install -D turbo
```

**Benefit:** Fast incremental builds, better caching
**Time:** 2-3 hours

### Win #3: Create .npmrc with workspace rules
```
# Prevent hoisting of dev dependencies
hoist-pattern[]=**/typescript
```

**Benefit:** Better isolation, clearer dependencies
**Time:** 1 hour

### Win #4: Document Project Boundaries
Create README in each major directory:
- /business/CHEEV/README.md
- /clients/README.md
- /products/README.md
- /infra/README.md

**Benefit:** Clear understanding, easier onboarding
**Time:** 2-3 hours

---

## NEXT STEPS

1. **Share this analysis with team**
   - Decision meeting on Option A vs B
   - Get consensus on timeline

2. **Start with Quick Wins (8-10 hours)**
   - Implement npm workspaces
   - Add Turbo
   - Document boundaries

3. **Schedule Phase 1 work**
   - Interview teams on collaboration
   - Finalize infrastructure extraction plan
   - Create detailed timeline

4. **Create implementation branch**
   - Branch: `feature/monorepo-optimization`
   - Regular commits with working tests
   - Weekly integration tests

---

## RESOURCES

**pnpm Workspaces:**
https://pnpm.io/workspaces

**Turbo:**
https://turbo.build/repo

**npm Workspaces:**
https://docs.npmjs.com/cli/v7/using-npm/workspaces

**Git Filter-Branch Migration:**
https://git-scm.com/docs/git-filter-branch

---

## SUCCESS METRICS

### If Option A (Monorepo):
- [ ] npm install time: 30% faster
- [ ] Build time: 40% faster (with Turbo)
- [ ] Disk space: 30-40% reduction
- [ ] Clear workspace boundaries
- [ ] Teams report better DX

### If Option B (Multi-Repo):
- [ ] Each repo <500MB size
- [ ] Independent release cycles
- [ ] 5-minute clone time
- [ ] Clear project ownership
- [ ] Selective access control works
- [ ] Shared infrastructure versioned and tested

---

## CONCLUSION

Your monorepo has grown naturally but now creates operational burden. A structured migration to either a **properly-configured monorepo** (Option A) or **multi-repo structure** (Option B) will:

1. Reduce operational overhead by 30-50%
2. Improve team autonomy and boundaries
3. Enable independent release cycles
4. Simplify onboarding for new team members
5. Reduce disk space and clone times

**Recommended immediate action:** Start with Option A quick wins (npm workspaces) - low risk, high benefit. Evaluate Option B split after 1-2 months based on team feedback.

