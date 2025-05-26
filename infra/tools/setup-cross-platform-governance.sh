#!/bin/bash

# Cross-Platform Governance Setup
# Configures governance awareness for both Claude Desktop and Cline

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo "🌐 Setting up Cross-Platform IDP Governance"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Setup Governance MCP Server for Claude Desktop
echo -e "${BLUE}Step 1: Configuring Claude Desktop${NC}"

CLAUDE_CONFIG="/home/ichardart/.claude/config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "📝 Adding governance MCP server to Claude Desktop..."
    
    # Backup existing config
    cp "$CLAUDE_CONFIG" "$CLAUDE_CONFIG.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Read current config
    TEMP_CONFIG=$(mktemp)
    cat "$CLAUDE_CONFIG" > "$TEMP_CONFIG"
    
    # Add governance MCP server if not already present
    if ! grep -q "governance-mcp" "$CLAUDE_CONFIG"; then
        # Use jq to add the governance server (if jq is available)
        if command -v jq &> /dev/null; then
            jq '.mcpServers["governance-mcp"] = {
                "command": "node",
                "args": ["/home/ichardart/code/infra/mcp-servers/governance-mcp/index.js"],
                "env": {}
            }' "$TEMP_CONFIG" > "$CLAUDE_CONFIG"
            echo -e "${GREEN}✅ Added governance MCP server to Claude Desktop${NC}"
        else
            echo -e "${YELLOW}⚠️ jq not available, manual configuration needed${NC}"
            echo "Add this to $CLAUDE_CONFIG mcpServers section:"
            echo '"governance-mcp": {'
            echo '  "command": "node",'
            echo '  "args": ["/home/ichardart/code/infra/mcp-servers/governance-mcp/index.js"],'
            echo '  "env": {}'
            echo '},'
        fi
    else
        echo -e "${GREEN}✅ Governance MCP server already configured in Claude Desktop${NC}"
    fi
    
    rm -f "$TEMP_CONFIG"
else
    echo -e "${YELLOW}⚠️ Claude Desktop config not found${NC}"
fi

# Step 2: Setup Governance MCP Server for Cline
echo -e "${BLUE}Step 2: Configuring Cline${NC}"

CLINE_CONFIG="/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
if [ -f "$CLINE_CONFIG" ]; then
    echo "📝 Adding governance MCP server to Cline..."
    
    # Backup existing config
    cp "$CLINE_CONFIG" "$CLINE_CONFIG.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Add governance MCP server if not already present
    if ! grep -q "governance-mcp" "$CLINE_CONFIG"; then
        # Use jq to add the governance server (if jq is available)
        if command -v jq &> /dev/null; then
            TEMP_CONFIG=$(mktemp)
            jq '.mcpServers["governance-mcp"] = {
                "command": "node",
                "args": ["/home/ichardart/code/infra/mcp-servers/governance-mcp/index.js"],
                "env": {},
                "disabled": false,
                "autoApprove": []
            }' "$CLINE_CONFIG" > "$TEMP_CONFIG"
            mv "$TEMP_CONFIG" "$CLINE_CONFIG"
            echo -e "${GREEN}✅ Added governance MCP server to Cline${NC}"
        else
            echo -e "${YELLOW}⚠️ jq not available, manual configuration needed${NC}"
        fi
    else
        echo -e "${GREEN}✅ Governance MCP server already configured in Cline${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Cline config not found${NC}"
fi

# Step 3: Create universal governance context loader
echo -e "${BLUE}Step 3: Creating Universal Context Loader${NC}"

cat > "$INFRA_DIR/tools/universal-governance-loader.py" << 'EOF'
#!/usr/bin/env python3
"""
Universal Governance Context Loader
Works with any Claude client by detecting the environment
"""

import os
import json
import sys
from pathlib import Path

class UniversalGovernanceLoader:
    def __init__(self):
        self.infra_path = Path("/home/ichardart/code/infra")
        self.memory_path = self.infra_path / "data/memory"
        
    def detect_claude_client(self):
        """Detect which Claude client is being used"""
        # Check for Claude Desktop
        if Path("/home/ichardart/.claude/config.json").exists():
            return "claude-desktop"
        
        # Check for Cline
        cline_config = Path("/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
        if cline_config.exists():
            return "cline"
        
        # Check for Claude Code environment variables
        if os.getenv("CLAUDE_CODE_SESSION") or os.getenv("ANTHROPIC_CLI"):
            return "claude-code"
        
        return "unknown"
    
    def load_governance_context(self):
        """Load appropriate governance context"""
        client = self.detect_claude_client()
        
        context = {
            "client": client,
            "governance_active": True,
            "idp_platform": "Multi-Agent with A2A Protocol",
            "security_mode": "enforced",
            "workspace": "/home/ichardart/code"
        }
        
        # Client-specific context
        if client == "claude-desktop":
            from claude_desktop_governance import ClaudeDesktopGovernance
            governance = ClaudeDesktopGovernance()
            context.update(governance.generate_governance_context())
        
        elif client == "cline":
            context["note"] = "Use governance-mcp tools for compliance checking"
            context["mcp_tools"] = [
                "get_governance_status",
                "check_mcp_compliance", 
                "get_security_posture"
            ]
        
        elif client == "claude-code":
            context["note"] = "Governance awareness loaded via CLAUDE.md and startup scripts"
            
        return context
    
    def display_governance_summary(self):
        """Display governance summary for the detected client"""
        client = self.detect_claude_client()
        
        print(f"🏛️ IDP Governance Active - {client.title()}")
        print("=" * 50)
        print()
        print("📋 Available via governance-mcp tools:")
        print("• get_governance_status - Overall framework status")
        print("• check_mcp_compliance - Validate MCP server compliance") 
        print("• get_security_posture - Security and risk assessment")
        print("• get_infrastructure_status - Platform component status")
        print()
        print("🔗 Key Resources:")
        print("• Framework: /home/ichardart/code/infra/idp-governance/")
        print("• Tools: /home/ichardart/code/infra/tools/")
        print("• Memory: /home/ichardart/code/infra/data/memory/")
        print()
        print("🎯 Platform: Multi-Agent IDP with Security-by-Design")

if __name__ == "__main__":
    loader = UniversalGovernanceLoader()
    
    if "--context" in sys.argv:
        context = loader.load_governance_context()
        print(json.dumps(context, indent=2))
    else:
        loader.display_governance_summary()
EOF

chmod +x "$INFRA_DIR/tools/universal-governance-loader.py"
echo -e "${GREEN}✅ Universal governance loader created${NC}"

# Step 4: Test governance MCP server
echo -e "${BLUE}Step 4: Testing Governance MCP Server${NC}"

if [ -f "$INFRA_DIR/mcp-servers/governance-mcp/index.js" ]; then
    # Test if the server starts
    timeout 5s node "$INFRA_DIR/mcp-servers/governance-mcp/index.js" <<< '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' 2>/dev/null
    if [ $? -eq 124 ]; then  # Timeout means server is running
        echo -e "${GREEN}✅ Governance MCP server is functional${NC}"
    else
        echo -e "${YELLOW}⚠️ Governance MCP server may need attention${NC}"
    fi
else
    echo -e "${RED}❌ Governance MCP server not found${NC}"
fi

# Step 5: Create governance-aware session initializer
echo -e "${BLUE}Step 5: Creating Session Initializer${NC}"

cat > "$INFRA_DIR/tools/init-governance-session.sh" << 'EOF'
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
EOF

chmod +x "$INFRA_DIR/tools/init-governance-session.sh"
echo -e "${GREEN}✅ Session initializer created${NC}"

# Step 6: Final verification
echo -e "${BLUE}Step 6: Final Verification${NC}"

echo "🔍 Checking configurations..."

# Check Claude Desktop
if [ -f "$CLAUDE_CONFIG" ] && grep -q "governance-mcp" "$CLAUDE_CONFIG"; then
    echo -e "${GREEN}✅ Claude Desktop: Governance MCP configured${NC}"
else
    echo -e "${YELLOW}⚠️ Claude Desktop: Configuration needs attention${NC}"
fi

# Check Cline
if [ -f "$CLINE_CONFIG" ] && grep -q "governance-mcp" "$CLINE_CONFIG"; then
    echo -e "${GREEN}✅ Cline: Governance MCP configured${NC}"
else
    echo -e "${YELLOW}⚠️ Cline: Configuration needs attention${NC}"
fi

# Check governance MCP server
if [ -f "$INFRA_DIR/mcp-servers/governance-mcp/index.js" ]; then
    echo -e "${GREEN}✅ Governance MCP Server: Available${NC}"
else
    echo -e "${RED}❌ Governance MCP Server: Missing${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Cross-Platform Governance Setup Complete!${NC}"
echo "============================================="
echo ""
echo "📋 What's Available Now:"
echo "• Governance MCP server in both Claude Desktop and Cline"
echo "• Universal governance context loader"
echo "• Cross-platform session initializer"
echo "• Consistent governance awareness across all Claude clients"
echo ""
echo "🚀 How to Use:"
echo "• Claude Desktop: Use governance-mcp tools directly"
echo "• Cline: Use governance-mcp tools via MCP interface"
echo "• Claude Code: Automatic governance awareness via CLAUDE.md"
echo ""
echo "🛠️ Available Tools:"
echo "• get_governance_status"
echo "• check_mcp_compliance"  
echo "• get_security_posture"
echo "• get_infrastructure_status"
echo "• run_compliance_check"
echo ""
echo "📖 Test with: python3 $INFRA_DIR/tools/universal-governance-loader.py"