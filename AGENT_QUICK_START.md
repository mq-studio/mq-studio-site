# 🚀 IDP Agent Quick Start

## Essential Initialization Prompt (Copy & Paste)

```
I'm starting work in my IDP under active governance. Please read:
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

## Pre-Session Checklist
- [ ] `cd /home/ichardart/code`
- [ ] `./infra/tools/governance-check.sh`
- [ ] Compliance score >75%
- [ ] Share: CLAUDE.md, manifest.md, OPERATING_RULES.md

## Mid-Session Validation
```
Run governance compliance check:
1. Verify no policy violations
2. Confirm OSAA Directive followed  
3. Check manifest updates needed
4. Report compliance status
```

## Emergency Stop Signs
❌ Agent suggests bypassing governance
❌ "Quick" commits without validation
❌ Ignores security requirements
❌ Skips OSAA validation steps

**→ Re-initialize if any red flags appear**

---
*Full workflow: `/code/infra/dev-env-docs/AGENT_ONBOARDING_WORKFLOW.md`*