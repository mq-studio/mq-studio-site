#!/bin/bash

# Create Governance-Aware Claude Desktop Project
# This creates a project that automatically loads governance context

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏛️ Creating Governance-Aware Claude Desktop Project"
echo "=================================================="

# Update Claude Desktop project configuration
CLAUDE_PROJECT="/home/ichardart/code/.claude/project.json"

if [ -f "$CLAUDE_PROJECT" ]; then
    echo "📝 Updating project configuration..."
    
    # Backup existing
    cp "$CLAUDE_PROJECT" "$CLAUDE_PROJECT.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Create governance-aware project config
    cat > "$CLAUDE_PROJECT" << 'EOF'
{
  "name": "IDP Governance Platform",
  "description": "Multi-Agent IDP with comprehensive governance framework and security-by-design enforcement",
  "language": "multi-language",
  "type": "governance-platform",
  "governance": {
    "framework_active": true,
    "compliance_mode": "enforced",
    "startup_tools": [
      "get_governance_status",
      "check_mcp_compliance", 
      "get_security_posture"
    ]
  },
  "platform": "Multi-Agent IDP with A2A Protocol",
  "workspace": "/home/ichardart/code"
}
EOF
    
    echo "✅ Project configuration updated"
else
    echo "⚠️ Claude Desktop project.json not found"
fi

# Create governance context file for Claude Desktop
CLAUDE_CONTEXT="/home/ichardart/code/.claude/governance-context.json"

echo "📊 Creating governance context file..."

python3 << 'EOF'
import json
import datetime
from pathlib import Path

# Generate comprehensive governance context
context = {
    "session_type": "Claude Desktop with IDP Governance",
    "timestamp": datetime.datetime.now().isoformat(),
    "governance_framework": {
        "status": "ACTIVE",
        "mode": "ENFORCED",
        "version": "1.0.0"
    },
    "startup_sequence": [
        {
            "step": 1,
            "action": "Load governance status",
            "tool": "get_governance_status",
            "description": "Get comprehensive IDP governance overview"
        },
        {
            "step": 2, 
            "action": "Check MCP compliance",
            "tool": "check_mcp_compliance",
            "description": "Validate all MCP servers against governance policies"
        },
        {
            "step": 3,
            "action": "Assess security posture", 
            "tool": "get_security_posture",
            "description": "Review security risks and compliance scores"
        },
        {
            "step": 4,
            "action": "Review infrastructure",
            "tool": "get_infrastructure_status", 
            "description": "Check all platform components and services"
        }
    ],
    "platform_overview": {
        "type": "Multi-Agent IDP",
        "features": [
            "MCP Server Hub with A2A protocol",
            "Governance framework enforcement",
            "Security-by-design architecture", 
            "Cross-framework agent communication",
            "Risk-based access controls"
        ],
        "workspace": "/home/ichardart/code",
        "governance_compliant_servers": [
            "fetch-mcp-governance",
            "wsl-helper-mcp",
            "markdown-formatting-mcp", 
            "claude-projects-access-mcp",
            "governance-mcp"
        ]
    },
    "current_priorities": [
        "Remove security risk MCP servers from configuration",
        "Complete API key setup for valuable external integrations",
        "Fix dependency issues in governance-compliant servers",
        "Maintain security-by-design principles"
    ],
    "governance_tools": {
        "available_via_mcp": [
            "get_governance_status",
            "check_mcp_compliance",
            "get_security_posture", 
            "get_infrastructure_status",
            "get_governance_framework",
            "run_compliance_check",
            "update_governance_context"
        ],
        "server": "governance-mcp"
    }
}

# Save to Claude Desktop directory
with open("/home/ichardart/code/.claude/governance-context.json", "w") as f:
    json.dump(context, f, indent=2)

print("✅ Governance context file created")
EOF

# Create startup instructions for Claude Desktop
echo "📋 Creating startup instructions..."

cat > "/home/ichardart/code/.claude/README-GOVERNANCE.md" << 'EOF'
# Claude Desktop - IDP Governance Integration

## Automatic Governance Loading

When starting Claude Desktop in this workspace, please immediately run these governance tools to load complete IDP awareness:

### 1. Initial Governance Status
```
Use the get_governance_status tool to load the current IDP governance framework status and infrastructure overview.
```

### 2. MCP Compliance Check  
```
Use the check_mcp_compliance tool to validate all MCP server configurations against governance policies.
```

### 3. Security Assessment
```
Use the get_security_posture tool to review security risks, compliance scores, and overall security posture.
```

### 4. Infrastructure Overview
```
Use the get_infrastructure_status tool to check all platform components and services.
```

## Platform Context

This workspace contains a **production-ready multi-agent platform** with:

- **IDP Governance Framework**: Active security-by-design enforcement
- **MCP Server Hub**: Central coordination with A2A protocol support
- **Agent2Agent (A2A)**: Multi-framework agent communication
- **Security Tooling**: Comprehensive governance compliance
- **Governance-Compliant MCP Servers**: Validated tool ecosystem

## Governance Mode: ENFORCED

All development activities must comply with IDP governance requirements:
- MCP server changes require governance review
- Security-by-design principles enforced
- Risk-based access controls in effect
- Audit trails maintained

## Quick Actions

To get started with governance awareness:
1. Ask: "Use get_governance_status to show me the current IDP governance overview"
2. Ask: "Use check_mcp_compliance to analyze my MCP server configuration"
3. Ask: "Use get_security_posture to assess security risks"

The governance-mcp server provides all necessary tools for comprehensive governance awareness.
EOF

echo "✅ Startup instructions created"

echo ""
echo "🎉 Governance-Aware Claude Desktop Project Created!"
echo "================================================="
echo ""
echo "📋 What's Available:"
echo "• Enhanced project configuration with governance metadata"
echo "• Governance context file with complete platform overview"
echo "• Startup instructions for immediate governance loading"
echo "• README with governance integration guide"
echo ""
echo "🚀 How Claude Desktop Now Works:"
echo "1. Start Claude Desktop in /home/ichardart/code workspace"
echo "2. Ask Claude to use governance tools for immediate awareness"
echo "3. Get complete IDP governance context automatically"
echo ""
echo "💡 Example Startup Request:"
echo '   "Use get_governance_status to load IDP governance awareness"'
echo ""
echo "📖 Files Created:"
echo "• .claude/project.json - Enhanced project config"
echo "• .claude/governance-context.json - Platform context"
echo "• .claude/README-GOVERNANCE.md - Integration guide"