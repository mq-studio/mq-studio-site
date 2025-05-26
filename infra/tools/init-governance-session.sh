#!/bin/bash

# Governance Session Initializer
# Automatically loads governance context for any Claude client

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏛️ Initializing IDP Governance Session"

# Run universal governance loader
if [ -f "$INFRA_DIR/tools/universal-governance-loader.py" ]; then
    python3 "$INFRA_DIR/tools/universal-governance-loader.py"
fi

# Set environment variables for governance awareness
export IDP_GOVERNANCE_ACTIVE=true
export MCP_GOVERNANCE_MODE=enforced
export GOVERNANCE_FRAMEWORK_PATH="$INFRA_DIR/idp-governance"

echo ""
echo "✅ Governance session initialized"
echo "💡 Use governance-mcp tools for compliance checking"
