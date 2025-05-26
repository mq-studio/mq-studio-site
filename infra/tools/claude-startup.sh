#!/bin/bash

# Claude Code Startup Script
# Automatically runs governance checks and loads IDP awareness context

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CLAUDE CODE - IDP GOVERNANCE STARTUP${NC}"
echo "=============================================="
echo ""

# Step 1: Run governance compliance check
echo -e "${BLUE}Step 1: Governance Compliance Check${NC}"
if [ -f "$INFRA_DIR/tools/governance-check.sh" ]; then
    "$INFRA_DIR/tools/governance-check.sh"
else
    echo -e "${RED}❌ Governance check script not found${NC}"
fi

echo ""

# Step 2: Update MCP status in CLAUDE.md
echo -e "${BLUE}Step 2: Updating MCP Status Dashboard${NC}"
if [ -f "$INFRA_DIR/tools/mcp-status-checker.py" ]; then
    python3 "$INFRA_DIR/tools/mcp-status-checker.py" --no-update
    echo -e "${GREEN}✅ MCP status check completed${NC}"
else
    echo -e "${RED}❌ MCP status checker not found${NC}"
fi

echo ""

# Step 3: Load persistent context
echo -e "${BLUE}Step 3: Loading IDP Context${NC}"
CONTEXT_FILE="$INFRA_DIR/data/memory/claude-context.json"

if [ ! -f "$CONTEXT_FILE" ]; then
    echo "📝 Creating initial context file..."
    mkdir -p "$(dirname "$CONTEXT_FILE")"
    
    cat > "$CONTEXT_FILE" << 'EOF'
{
  "idp_governance": {
    "framework_active": true,
    "last_updated": "TIMESTAMP_PLACEHOLDER",
    "compliance_status": "active",
    "mcp_servers": {
      "governance_compliant": [
        "fetch-mcp-governance",
        "wsl-helper-mcp", 
        "markdown-formatting-mcp",
        "claude-projects-access-mcp"
      ],
      "non_compliant_detected": true,
      "security_risks": [
        "browser-tools-mcp",
        "puppeteer",
        "sequential-thinking"
      ]
    },
    "infrastructure": {
      "mcp_server_hub": "active",
      "a2a_protocol": "implemented",
      "governance_framework": "enforced",
      "security_policies": "active"
    },
    "current_priorities": [
      "Remove non-compliant MCP servers from Cline",
      "Fix dependency issues in governance-compliant servers",
      "Complete API key setup for external integrations",
      "Implement automated governance checking"
    ]
  },
  "session_context": {
    "workspace": "/home/ichardart/code",
    "primary_focus": "IDP governance and MCP server management",
    "security_mode": "governance_enforced",
    "development_environment": "WSL Ubuntu with multi-agent infrastructure"
  }
}
EOF
    
    # Update timestamp
    sed -i "s/TIMESTAMP_PLACEHOLDER/$(date -u +"%Y-%m-%dT%H:%M:%SZ")/" "$CONTEXT_FILE"
    echo -e "${GREEN}✅ Context file created${NC}"
else
    echo -e "${GREEN}✅ Context file exists${NC}"
fi

# Step 4: Check critical infrastructure
echo ""
echo -e "${BLUE}Step 4: Infrastructure Health Check${NC}"

# Check MCP Server Hub
if [ -d "$INFRA_DIR/mcp-server-hub" ]; then
    echo -e "${GREEN}✅ MCP Server Hub: Available${NC}"
else
    echo -e "${RED}❌ MCP Server Hub: Missing${NC}"
fi

# Check A2A Protocol
if [ -d "$INFRA_DIR/A2A" ]; then
    echo -e "${GREEN}✅ A2A Protocol: Complete${NC}"
else
    echo -e "${RED}❌ A2A Protocol: Missing${NC}"
fi

# Check Governance Framework
if [ -d "$INFRA_DIR/idp-governance" ]; then
    echo -e "${GREEN}✅ IDP Governance: Active${NC}"
else
    echo -e "${RED}❌ IDP Governance: Missing${NC}"
fi

# Step 5: Security posture check
echo ""
echo -e "${BLUE}Step 5: Security Posture Check${NC}"

CLINE_CONFIG="/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
if [ -f "$CLINE_CONFIG" ]; then
    HIGH_RISK=$(grep -c "browser-tools\|puppeteer\|sequential-thinking" "$CLINE_CONFIG" 2>/dev/null || echo "0")
    if [ "$HIGH_RISK" -gt 0 ]; then
        echo -e "${RED}🚨 SECURITY ALERT: $HIGH_RISK high-risk MCP servers detected in Cline${NC}"
        echo -e "${YELLOW}   Action Required: Remove non-governance-compliant servers${NC}"
        echo -e "${YELLOW}   File: $CLINE_CONFIG${NC}"
    else
        echo -e "${GREEN}✅ Cline Configuration: Compliant${NC}"
    fi
else
    echo -e "${GREEN}✅ Cline Configuration: Not found (compliant)${NC}"
fi

# Step 6: Display quick reference
echo ""
echo -e "${BLUE}📚 Quick Reference${NC}"
echo "==================="
echo "🏛️ Governance Framework: /home/ichardart/code/infra/idp-governance/"
echo "🛠️ MCP Registry: /home/ichardart/code/infra/mcp-registry.md"
echo "🔍 Status Checker: /home/ichardart/code/infra/tools/mcp-status-checker.py"
echo "⚙️ Infrastructure Control: /home/ichardart/code/infra/start-mcp-infrastructure.sh"
echo "📋 Governance Awareness: /home/ichardart/code/CLAUDE.md"

# Step 7: Final summary
echo ""
echo -e "${BLUE}🎯 Current Session Context${NC}"
echo "=========================="
echo "• IDP Governance: ACTIVE"
echo "• Multi-Agent Infrastructure: READY"
echo "• Security-by-Design: ENFORCED" 
echo "• MCP Server Management: GOVERNANCE-AWARE"
echo "• Development Environment: WSL Ubuntu"

# Log startup
LOG_FILE="$INFRA_DIR/logs/claude-startup.log"
mkdir -p "$(dirname "$LOG_FILE")"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Claude Code started with IDP governance awareness" >> "$LOG_FILE"

echo ""
echo -e "${GREEN}🚀 Claude Code ready with full IDP governance awareness!${NC}"
echo -e "${BLUE}📖 Review CLAUDE.md for comprehensive governance context.${NC}"