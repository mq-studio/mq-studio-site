# 🚀 IDP Agent Quick Start v2.0
## Context-Aware Governance Initiation

**Updated**: 2025-05-26 (Post-governance gap analysis)

## 🔍 **Pre-Session: Determine Your Context**

### Step 1: Identify Current Project Context
```bash
# Run this to understand your current governance context
pwd  # Where are you?
ls manifest.md 2>/dev/null && echo "✅ Project-specific manifest found" || echo "❌ No local manifest"
ls .idp_project_root 2>/dev/null && echo "✅ IDP project root marker found" || echo "❌ No project marker"
```

### Step 2: Choose Initialization Mode

#### **Mode A: Working in /home/ichardart/code (Infrastructure)**
```bash
cd /home/ichardart/code
./infra/tools/governance-check.sh
```

#### **Mode B: Working in IDP Project (e.g., idp-projects/)**  
```bash
cd /home/ichardart/idp-projects/[PROJECT_NAME]
# TODO: Run project-specific governance check when available
```

#### **Mode C: Working in Non-IDP Directory**
```bash
# For work outside IDP - link to core governance
export IDP_CORE_PATH="/home/ichardart/code"
```

## 📋 **Context-Aware Initialization Prompts**

### **For Infrastructure Work (/code)**
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

### **For IDP Project Work (idp-projects/)**
```
I'm starting work in an IDP project under federated governance.

Context: /home/ichardart/idp-projects/[PROJECT_NAME]
Please read:
- ./manifest.md (project-specific context) [if exists]
- ~/code/CLAUDE.md (global IDP governance status) 
- ~/code/infra/dev-env-docs/OPERATING_RULES.md (governance rules)

MANDATORY requirements:
• OSAA Directive: One action at a time, validate each step
• Federated governance: Follow both global IDP + project-specific rules
• Cross-project awareness: Changes may affect other IDP components
• Documentation: Update both local and global manifests as needed

Workspace: /home/ichardart/idp-projects/[PROJECT_NAME] | Mode: FEDERATED
Governance Status: Check ~/code/CLAUDE.md for current compliance score
Confirm understanding and identify project-specific governance needs.
```

### **For External/Experimental Work**
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

## 🔧 **Pre-Session Checklists by Context**

### Infrastructure Context (/code)
- [ ] `cd /home/ichardart/code`
- [ ] `./infra/tools/governance-check.sh`
- [ ] Compliance score >75%
- [ ] Share: CLAUDE.md, manifest.md, OPERATING_RULES.md

### IDP Project Context (idp-projects/)
- [ ] `cd /home/ichardart/idp-projects/[PROJECT]`
- [ ] Check for local manifest.md
- [ ] Verify project governance readiness
- [ ] Share: Local manifest + global governance files

### External Context
- [ ] `pwd` to confirm location
- [ ] Establish governance boundaries
- [ ] Link to core IDP for reference
- [ ] Share: Relevant local docs + core CLAUDE.md

## 🚨 **Critical Updates from v1.0**

### **What Changed:**
1. **Context Detection**: Tools now detect where you're working
2. **Federated Prompts**: Different prompts for different contexts
3. **Project Awareness**: Recognition of idp-projects/ governance needs
4. **Boundary Setting**: Clear governance scope for external work

### **Why This Matters:**
- **Addresses Gemini's feedback**: No longer assumes /code workspace
- **Scales to 15+ IDP projects**: Each gets appropriate governance
- **Prevents confusion**: Agents understand their scope
- **Enables expansion**: Ready for federated governance rollout

## 🎯 **Quick Context Detector Script**

```bash
#!/bin/bash
# Quick context detection for agent initialization
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == "/home/ichardart/code"* ]]; then
    echo "🏗️ INFRASTRUCTURE CONTEXT"
    echo "Use Infrastructure prompt"
elif [[ "$CURRENT_DIR" == "/home/ichardart/idp-projects"* ]]; then
    echo "📦 IDP PROJECT CONTEXT"
    echo "Use IDP Project prompt"
else
    echo "🌐 EXTERNAL CONTEXT"
    echo "Use External/Experimental prompt"
fi
```

---

**This v2.0 addresses the critical governance scope limitation identified by our analysis!**