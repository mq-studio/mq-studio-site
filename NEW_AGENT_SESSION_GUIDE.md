# 🚀 New AI Agent Session Workflow Guide

**Updated**: 2025-05-26 (Context-Aware v2.0)

## 📋 **Step 1: Navigate to Your Working Directory**

Before starting any AI agent session, navigate to where you'll be working:

```bash
# For infrastructure work:
cd /home/ichardart/code

# For IDP project work:
cd /home/ichardart/idp-projects/[PROJECT_NAME]

# For external work:
cd [YOUR_WORKING_DIRECTORY]
```

## 🔧 **Step 2: Run Context Detection & Preparation**

```bash
# From ANY directory, run the context-aware initializer:
/home/ichardart/code/infra/tools/init-agent-session-v2.sh
```

This script will:
- ✅ **Detect your governance context** automatically
- ✅ **Assess governance readiness** (0-120% score)
- ✅ **Generate appropriate initialization prompt**
- ✅ **Recommend files to share** with your agent
- ✅ **Provide context-specific guidance**

## 📋 **Step 3: Copy the Generated Prompt**

The script will provide a ready-to-use initialization prompt. **Copy it exactly** and paste into your AI agent session.

## 📁 **Step 4: Share Required Files**

The script will list specific files to share with your agent based on your context.

---

## 🎯 **Context-Specific Workflows**

### **For Infrastructure Work (/code)**

**Prompt Generated**:
```
I'm starting work in my IDP core infrastructure under active governance.

Context: /home/ichardart/code (Core infrastructure repository)
Please read:
- ~/code/CLAUDE.md (current governance status)
- ~/code/manifest.md (repository context)
- ~/code/infra/dev-env-docs/OPERATING_RULES.md (governance rules)

MANDATORY requirements:
• OSAA Directive: One action at a time, validate each step
• Security-first: No secrets, use 1Password CLI
• Manifest updates: Required for infrastructure changes
• Pre-commit validation: All commits must pass governance hooks

Workspace: /home/ichardart/code | Mode: ENFORCED
Confirm understanding and summarize governance status.
```

**Files to Share**:
1. `/home/ichardart/code/CLAUDE.md`
2. `/home/ichardart/code/manifest.md`
3. `/home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md`

### **For IDP Project Work (idp-projects/)**

**Prompt Generated** (Example from ucf-phase1):
```
I'm starting work in an IDP project under federated governance.

Context: /home/ichardart/idp-projects/ucf-phase1
Please read:
- ~/code/CLAUDE.md (global IDP governance status) 
- ~/code/infra/dev-env-docs/OPERATING_RULES.md (governance rules)

MANDATORY requirements:
• OSAA Directive: One action at a time, validate each step
• Inventory Awareness: Query dynamic inventory before filesystem operations
• Federated governance: Follow both global IDP + project-specific rules
• Cross-project awareness: Changes may affect other IDP components
• Documentation: Update both local and global manifests as needed

INVENTORY PROTOCOL:
Before any filesystem operation, you MUST:
1. Query: get_inventory_context(target_path)
2. Analyze: analyze_impact([paths], change_type)  
3. If risk_level='high': Require explicit user confirmation
4. Use inventory as guidance for investigation, not definitive truth

Workspace: /home/ichardart/idp-projects/ucf-phase1 | Mode: FEDERATED
Governance Status: Check ~/code/CLAUDE.md for current compliance score
Confirm understanding and identify project-specific governance needs.
```

**Files to Share**:
1. `/home/ichardart/code/CLAUDE.md` (global status)
2. `/home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md`
3. `./manifest.md` (if project has local manifest)

### **For External Work**

**Prompt Generated**:
```
I'm starting work outside the core IDP but with governance awareness.

Context: [CURRENT_DIRECTORY] (External to main IDP)
Governance Link: /home/ichardart/code (Core IDP infrastructure)

Please read:
- ~/code/CLAUDE.md (global governance reference)
- Local manifest.md or README.md [if exists]

ADAPTED requirements:
• OSAA Directive: One action at a time, validate each step
• Governance-aware: Consider IDP impact of any changes
• Security-first: No secrets, maintain security standards
• Documentation: Clear isolation from or integration with IDP

Workspace: [CURRENT_DIRECTORY] | Mode: GOVERNANCE_AWARE
Confirm understanding and establish governance boundaries.
```

**Files to Share**:
1. `/home/ichardart/code/CLAUDE.md` (reference)
2. Local README.md or documentation (if exists)

---

## 🔄 **Quick Reference Commands**

```bash
# Quick context check (from any directory):
/home/ichardart/code/infra/tools/detect-agent-context.sh

# Full session preparation (from any directory):
/home/ichardart/code/infra/tools/init-agent-session-v2.sh

# Manual governance check (from /code only):
cd /home/ichardart/code && ./infra/tools/governance-check.sh
```

---

## 🎯 **Key Changes from v1.0**

### **What's Different**:
- ❌ **Old**: Always forced to `/code` directory
- ✅ **New**: Works from any directory with context detection

- ❌ **Old**: Single hardcoded prompt for all scenarios
- ✅ **New**: Dynamic prompts based on working context

- ❌ **Old**: Manual file selection 
- ✅ **New**: Automated file recommendations by context

### **Why This Matters**:
- **Scales to entire IDP**: No longer limited to `/code` repository
- **Federated governance**: Supports `idp-projects/` work properly  
- **Context awareness**: Agents understand their scope and boundaries
- **Future ready**: Prepared for governance expansion across all projects

This workflow directly addresses Gemini's critical feedback about governance scope limitations!