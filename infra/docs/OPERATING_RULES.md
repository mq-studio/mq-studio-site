# 📜 Operating Rules for AI and Human Collaboration

This document defines collaboration guidelines for projects inside ~/code/.

## 🤖 Agent and Collaborator Rules
- Propose structured outputs (steps, tables, checklists)
- Provide reasoned justifications for recommendations
- Confirm real vs simulated execution at each major action
- Pause for validation after every major action
- If drift/confusion occurs, request reupload of manifest or project ZIP
- Use project manifest.md as source of truth

## 📦 Commit and Repository Discipline
- Always stage, commit, and push after major milestones
- Use descriptive, meaningful commit messages
- Keep GitHub project descriptions up to date
- Maintain license files

## 🔐 Secrets Management
- Never hardcode secrets
- Use secure secret tooling (e.g., Bitwarden CLI)

## 📈 Knowledge and Asset Governance
- SOPs, onboarding protocols, and strategic frameworks are version-controlled
- Manifest files track project evolution

## 🤖 AI Collaboration and Automation Principles

### Core Principles

1. **Optimize for the Ultimate Objective**: Automation should serve the goal of an efficient, reliable development environment, not be a goal itself.
2. **Human-in-the-Loop Validation**: Include human validation where it adds value (strategic decisions, critical operations, learning opportunities).
3. **Explicit Outcome Verification**: Every action must include verification that the intended outcome was achieved.
4. **Appropriate Automation Levels**: Choose the right level of automation for each task:
   - **One-Step Commands**: For routine, low-risk operations that benefit from simplicity
   - **Multi-Step Processes**: For complex or critical operations requiring validation between steps
   - **Manual Procedures**: For operations requiring judgment or where learning is the primary goal

### Effective Automation Patterns

#### One-Step Patterns (When Appropriate)

# Directory + File Creation + Execution
mkdir -p /path/to/dir && cat > /path/to/dir/file.sh << 'EOF'
#!/bin/bash
# Content here
EOF
chmod +x /path/to/dir/file.sh && /path/to/dir/file.sh

# Conditional Execution
[ -f /path/to/file ] || (echo "Creating file" && touch /path/to/file)

# Safe Backup Before Modification
([ -f ~/.bashrc ] && cp ~/.bashrc ~/.bashrc.bak || true) && \
cat >> ~/.bashrc << 'EOF'
# New content
EOF

#### Multi-Step Patterns (When Appropriate)
- Divide complex operations into logical phases
- Include validation checkpoints between phases
- Document expected state at each checkpoint

### Anti-Patterns to Avoid

- Automation for its own sake rather than to serve project goals
- Insufficient validation of critical operations
- Lack of error handling in automated processes
- Excessive complexity that hinders understanding
- Inconsistent documentation of automated processes

### Communication Protocol for AI Sessions

When starting a new AI interaction session:
1. Provide these operating rules and project context from manifest.md
2. State clearly what validation level is expected for the current task
3. Use the prompt template in ~/code/infra/dev-env-docs/PROMPTS/new-session-context-prompt.md

## 🔬 Atomized Action Protocol

All operations that modify the development environment or project artifacts must follow the OSAA (One Single Atomized Action) Directive:

- Every action must be discrete, specific, and independently verifiable
- Each step requires explicit validation before proceeding
- No action should be presented without complete implementation details
- Full instructions must be provided assuming no prior knowledge
- See [OSAA_DIRECTIVE.md](./OSAA_DIRECTIVE.md) for complete requirements

AI assistants must adhere to the OSAA Directive for all implementation tasks, without exception or deviation. Agents must never proceed past a single atomic action without explicit confirmation of successful completion.
