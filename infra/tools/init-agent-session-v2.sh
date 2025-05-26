#!/bin/bash
# 🏛️ IDP Agent Session Initializer v2.0
# Context-aware preparation for governance-compliant agent sessions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🏛️ IDP AGENT SESSION INITIALIZER v2.0"
echo "====================================="
echo "Context-aware governance preparation"
echo

# Step 1: Detect context
echo "🔍 Step 1: Detecting governance context..."
"$SCRIPT_DIR/detect-agent-context.sh"

# Step 2: Load context summary
if [[ -f ".agent_context_summary.tmp" ]]; then
    CONTEXT_TYPE=$(grep '"context_type"' .agent_context_summary.tmp | cut -d'"' -f4)
    READINESS=$(grep '"governance_readiness"' .agent_context_summary.tmp | cut -d':' -f2 | tr -d ' ,')
    PROJECT_NAME=$(grep '"project_name"' .agent_context_summary.tmp | cut -d'"' -f4)
    
    echo
    echo "📊 Context Summary:"
    echo "   Type: $CONTEXT_TYPE"
    echo "   Project: $PROJECT_NAME" 
    echo "   Readiness: $READINESS%"
fi

echo
echo "🔧 Step 2: Running context-specific preparation..."

case $CONTEXT_TYPE in
    "INFRASTRUCTURE")
        echo "🏗️ INFRASTRUCTURE PREPARATION"
        
        # Run governance check
        if [[ -f "/home/ichardart/code/infra/tools/governance-check.sh" ]]; then
            echo "Running governance compliance check..."
            /home/ichardart/code/infra/tools/governance-check.sh
        else
            echo "⚠️ Governance check script not found"
        fi
        
        # Check file access
        echo "✅ Verifying governance file access..."
        [[ -f "/home/ichardart/code/CLAUDE.md" ]] && echo "   ✓ CLAUDE.md accessible" || echo "   ❌ CLAUDE.md missing"
        [[ -f "/home/ichardart/code/manifest.md" ]] && echo "   ✓ manifest.md accessible" || echo "   ❌ manifest.md missing"
        [[ -f "/home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md" ]] && echo "   ✓ OPERATING_RULES.md accessible" || echo "   ❌ OPERATING_RULES.md missing"
        ;;
        
    "IDP_PROJECT")
        echo "📦 IDP PROJECT PREPARATION"
        
        # Check local governance files
        echo "📋 Checking project-specific governance..."
        if [[ -f "manifest.md" ]]; then
            echo "   ✓ Local manifest.md found"
        else
            echo "   ⚠️ No local manifest.md - consider creating one"
            echo "   💡 Template available at: /home/ichardart/code/infra/dev-env-docs/manifest-standard.md"
        fi
        
        # Check governance readiness
        if [[ $READINESS -lt 50 ]]; then
            echo "   🚨 Low governance readiness ($READINESS%)"
            echo "   📝 Consider adding: manifest.md, .idp_project_root marker"
        elif [[ $READINESS -lt 80 ]]; then
            echo "   ⚠️ Moderate governance readiness ($READINESS%)"
            echo "   📝 Good foundation, some governance files missing"
        else
            echo "   ✅ High governance readiness ($READINESS%)"
        fi
        
        # Link to core governance
        echo "🔗 Linking to core IDP governance..."
        [[ -f "/home/ichardart/code/CLAUDE.md" ]] && echo "   ✓ Core governance accessible" || echo "   ❌ Core governance not accessible"
        ;;
        
    "IDP_ADJACENT"|"EXTERNAL")
        echo "🌐 EXTERNAL/ADJACENT PREPARATION"
        
        # Establish governance boundaries
        echo "🔒 Establishing governance boundaries..."
        echo "   📍 Working outside core IDP governance"
        echo "   🔗 Reference governance: /home/ichardart/code"
        echo "   ⚠️ Consider impact on main IDP before major changes"
        
        # Check for local documentation
        if [[ -f "README.md" ]] || [[ -f "manifest.md" ]] || [[ -f "GOVERNANCE.md" ]]; then
            echo "   ✓ Local documentation found"
        else
            echo "   💡 Consider adding local documentation for governance clarity"
        fi
        ;;
esac

echo
echo "🚀 Step 3: Agent initialization guidance..."
echo "=========================================="

# Display appropriate initialization prompt
echo "📋 Copy this initialization prompt:"
echo
case $CONTEXT_TYPE in
    "INFRASTRUCTURE")
        cat << 'EOF'
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
EOF
        ;;
        
    "IDP_PROJECT")
        cat << EOF
\`\`\`
I'm starting work in an IDP project under federated governance.

Context: /home/ichardart/idp-projects/$PROJECT_NAME
Please read:
$(if [[ -f "manifest.md" ]]; then echo "- ./manifest.md (project-specific context)"; fi)
- ~/code/CLAUDE.md (global IDP governance status) 
- ~/code/infra/dev-env-docs/OPERATING_RULES.md (governance rules)

MANDATORY requirements:
• OSAA Directive: One action at a time, validate each step
• Federated governance: Follow both global IDP + project-specific rules
• Cross-project awareness: Changes may affect other IDP components
• Documentation: Update both local and global manifests as needed

Workspace: /home/ichardart/idp-projects/$PROJECT_NAME | Mode: FEDERATED
Governance Status: Check ~/code/CLAUDE.md for current compliance score
Confirm understanding and identify project-specific governance needs.
\`\`\`
EOF
        ;;
        
    *)
        cat << 'EOF'
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
EOF
        ;;
esac

echo
echo "📁 Files to share with agent:"
case $CONTEXT_TYPE in
    "INFRASTRUCTURE")
        echo "   1. /home/ichardart/code/CLAUDE.md"
        echo "   2. /home/ichardart/code/manifest.md"
        echo "   3. /home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md"
        ;;
    "IDP_PROJECT")
        [[ -f "manifest.md" ]] && echo "   1. ./manifest.md (project-specific)"
        echo "   2. /home/ichardart/code/CLAUDE.md (global status)"
        echo "   3. /home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md"
        ;;
    *)
        echo "   1. /home/ichardart/code/CLAUDE.md (reference)"
        [[ -f "README.md" ]] && echo "   2. ./README.md (local context)"
        [[ -f "manifest.md" ]] && echo "   3. ./manifest.md (local context)"
        ;;
esac

echo
echo "✅ Agent session preparation complete!"
echo "🔄 To reinitialize, run this script again from your target directory"

# Cleanup
rm -f .agent_context_summary.tmp