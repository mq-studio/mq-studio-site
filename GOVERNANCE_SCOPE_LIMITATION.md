# 🚨 Critical Governance Scope Limitation Identified

## Issue Summary
**Identified by**: Gemini external review (2025-05-26)
**Severity**: High - Architectural limitation affecting IDP governance scope

## Problem Description
Current governance implementation is hardcoded to `/home/ichardart/code` repository, limiting effectiveness across the broader IDP ecosystem.

## Specific Limitations Identified

### 1. Hardcoded Path Dependencies
- `governance-enforcer.py`: `self.root_path = Path("/home/ichardart/code")`
- `governance-check.sh`: Assumes `/home/ichardart/code/CLAUDE.md`
- `init-governance-session.sh`: Hardcoded `GOVERNANCE_FRAMEWORK_PATH`
- Pre-commit hooks: Expect specific `infra/` structure

### 2. Agent Onboarding Scope
- Universal prompt forces `cd /home/ichardart/code`
- Context files referenced as `~/code/CLAUDE.md`
- Workspace hardcoded in initialization

### 3. Governance File Centralization
- `CLAUDE.md` and `manifest.md` serve only `/code` repository
- No federation model for multi-project governance
- Missing project-specific governance context

## Impact Assessment
- ❌ `ucf-phase1` project lacks governance enforcement
- ❌ `/home/ichardart/idp-projects/` not governed
- ❌ Future projects will inherit same limitation
- ❌ Agent confusion when working outside `/code`

## Proposed Solutions (From Gemini Analysis)

### 1. Parameterize Root Paths
- Accept target project root as command-line argument
- Detect project root from current working directory
- Use environment variables for active project context

### 2. Dynamic Agent Context
- Set workspace dynamically in agent prompts
- Support project-local governance files
- Hierarchical manifest system

### 3. Federated Governance Architecture
- Global IDP governance + project-specific governance
- Consistent enforcement across all project directories
- Scalable to new projects

## Next Steps
1. **Immediate**: Document limitation in manifest.md
2. **Short-term**: Implement path-agnostic governance tools
3. **Medium-term**: Design federated governance architecture
4. **Long-term**: Full IDP-wide governance implementation

## Lessons Learned
- External review critical for identifying blind spots
- Repository-focused implementation != IDP-wide governance
- Scalability considerations must be part of initial design

**This limitation does not invalidate current work but requires evolution for true IDP governance.**