# 🏛️ IDP Agent Onboarding Workflow

## Universal AI Agent Initialization Protocol

**Purpose**: Ensure all AI agents (Claude Desktop, Claude Code, Gemini, etc.) operate under IDP governance from session start.

---

## 🔄 STEP 1: Pre-Session Preparation

### Your Actions:
1. **Navigate to workspace**: `cd /home/ichardart/code`
2. **Run governance check**: `./infra/tools/governance-check.sh`
3. **Verify compliance score**: Should be >75% before proceeding

### Expected Output:
```
✅ GOVERNANCE COMPLIANT (Score: 85%)
🔧 All governance tools operational
```

---

## 📋 STEP 2: Universal Agent Initialization

### Your Prompt (Use for ALL agents):
```
I'm starting work in my IDP (Integrated Development Platform) under active governance. 

Please read and acknowledge the following governance context files:
- ~/code/CLAUDE.md (governance status and workspace configuration)
- ~/code/manifest.md (repository purpose and recent changes)
- ~/code/infra/dev-env-docs/OPERATING_RULES.md (mandatory operating principles)

Key governance requirements you MUST follow:
1. **OSAA Directive**: One Single Atomized Action - validate each step before proceeding
2. **Manifest updates**: Any infrastructure changes require manifest.md updates
3. **Security-first**: Never commit secrets, use 1Password CLI for credentials
4. **Pre-commit validation**: All commits go through governance enforcement hooks

Current workspace: /home/ichardart/code
Governance mode: ENFORCED
Compliance score: [Check current score in CLAUDE.md]

Please confirm you understand these requirements and provide a summary of the current governance status.
```

### Files to Share/Attach:
- `CLAUDE.md` (always current governance status)
- `manifest.md` (project context)
- `infra/dev-env-docs/OPERATING_RULES.md` (core governance rules)

---

## 🔍 STEP 3: Agent Compliance Verification

### Expected Agent Response:
Agent should acknowledge:
- ✅ Governance framework understood
- ✅ OSAA Directive accepted
- ✅ Security policies acknowledged
- ✅ Current compliance score noted
- ✅ Summary of workspace status provided

### Red Flags (Re-initialize if agent shows):
- ❌ Offers to bypass governance
- ❌ Suggests "quick" commits without validation
- ❌ Ignores OSAA requirements
- ❌ Doesn't mention security considerations

---

## 🎯 STEP 4: Task-Specific Context Loading

### For Development Tasks:
**Additional Prompt:**
```
Before we begin development work:
1. Run: `python3 infra/tools/governance-enforcer.py` to verify current compliance
2. Check MCP server status in CLAUDE.md
3. If working on specific project, read its manifest.md file
4. Confirm all governance enforcement tools are active
```

### For Infrastructure Tasks:
**Additional Prompt:**
```
We're working on IDP infrastructure. Extra requirements:
1. Check infra/data/memory/governance-state.json for current infrastructure status
2. Any MCP server changes require governance framework review
3. Infrastructure changes must update governance metrics
4. Consider multi-agent coordination via A2A protocol if applicable
```

### For Security Tasks:
**Additional Prompt:**
```
Security-focused work requires enhanced governance:
1. Verify 1Password CLI integration: `op account list`
2. Review infra/security-tooling/ for current security posture
3. All security changes require compliance score validation
4. Document security decisions in governance state
```

---

## 🚨 STEP 5: Continuous Governance Validation

### During Work Session:
- **Every 30 minutes**: Ask agent to check governance compliance
- **Before major commits**: Run `./infra/tools/governance-enforcer.py`
- **After infrastructure changes**: Update manifest.md
- **Before session end**: Verify compliance score maintained/improved

### Mid-Session Compliance Check Prompt:
```
Please run a governance compliance check:
1. Verify no policy violations have occurred
2. Confirm OSAA Directive being followed
3. Check if any manifest updates are needed
4. Report current compliance status
```

---

## 🎨 AGENT-SPECIFIC VARIATIONS

### Claude Code (CLI)
**Additional Context:**
- Emphasize command-line workflow compliance
- Mention git hooks are active and will block non-compliant commits
- Reference audit.sh for additional security scanning

### Claude Desktop 
**Additional Context:**
- Leverage MCP servers for enhanced governance integration
- Reference infra/data/memory/claude-desktop-governance.json for session tracking
- Use MCP-based compliance checking when available

### Gemini/Other Agents
**Additional Context:**
- May not have MCP integration - rely on file-based governance state
- Emphasize manual validation steps
- Request explicit confirmation of governance rule understanding

---

## 🚀 QUICK START TEMPLATES

### New Project Initialization:
```
I'm starting a new project in the IDP. Please:
1. Load governance context (CLAUDE.md, manifest.md, OPERATING_RULES.md)
2. Run governance compliance check
3. Create project manifest following manifest-standard.md template
4. Set up governance-aware project structure
5. Verify all compliance requirements are met
```

### Existing Project Work:
```
Continuing work on [PROJECT_NAME] in the IDP. Please:
1. Load governance context and current compliance status
2. Read [PROJECT]/manifest.md for project-specific context
3. Verify no governance violations since last session
4. Confirm understanding of OSAA and security requirements
5. Proceed with governance-compliant workflow
```

### Emergency/Quick Fix:
```
Emergency fix needed in IDP with full governance compliance. Please:
1. Load critical governance files (CLAUDE.md, OPERATING_RULES.md)
2. Acknowledge this is still subject to ALL governance requirements
3. Use OSAA approach even for urgent changes
4. Ensure pre-commit hooks will validate all changes
5. Document emergency rationale in commit message
```

---

## 📊 SUCCESS METRICS

### Governance Effectiveness Indicators:
- ✅ Agent follows OSAA without reminders
- ✅ No governance violations detected
- ✅ Compliance score maintains/improves
- ✅ Pre-commit hooks pass without intervention
- ✅ Manifest files kept current
- ✅ Security policies enforced

### Failure Indicators (Re-train agent):
- ❌ Multiple validation failures
- ❌ Attempts to bypass governance
- ❌ Decreasing compliance scores
- ❌ Forgotten manifest updates
- ❌ Security policy violations

---

**Last Updated**: 2025-05-25
**Version**: 1.0
**Compliance**: Required for all IDP agent interactions