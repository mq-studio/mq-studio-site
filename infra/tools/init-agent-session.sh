#!/bin/bash
# 🏛️ IDP Agent Session Initializer
# Prepares workspace and validates governance before agent interaction

echo "🏛️ INITIALIZING IDP AGENT SESSION"
echo "=================================="

cd /home/ichardart/code

# Check current governance status
echo "🔍 Checking governance compliance..."
./infra/tools/governance-check.sh

compliance_check=$?
if [ $compliance_check -ne 0 ]; then
    echo "❌ Governance issues detected. Please resolve before proceeding."
    exit 1
fi

# Display current workspace status
echo ""
echo "📋 WORKSPACE STATUS"
echo "==================="
echo "Location: $(pwd)"
echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'Not a git repo')"
echo "Last commit: $(git log -1 --oneline 2>/dev/null || echo 'No commits')"
echo ""

# Show governance context files
echo "📁 GOVERNANCE CONTEXT FILES"
echo "==========================="
echo "✓ CLAUDE.md - Current governance status"
echo "✓ manifest.md - Repository context"
echo "✓ infra/dev-env-docs/OPERATING_RULES.md - Core governance"
echo "✓ AGENT_QUICK_START.md - Quick reference"
echo ""

# Display ready prompt
echo "🚀 READY FOR AGENT INITIALIZATION"
echo "================================="
echo "Use the initialization prompt from AGENT_QUICK_START.md"
echo "Share the three governance context files with your agent"
echo ""
echo "Quick copy:"
echo "cat AGENT_QUICK_START.md"