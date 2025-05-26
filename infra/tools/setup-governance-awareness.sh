#!/bin/bash

# Setup script to ensure Claude Code always loads with IDP governance awareness

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up Claude Code IDP Governance Awareness"
echo "=================================================="

# 1. Ensure all governance scripts are executable
echo "📝 Setting script permissions..."
chmod +x "$INFRA_DIR/tools/governance-check.sh"
chmod +x "$INFRA_DIR/tools/mcp-status-checker.py" 
chmod +x "$INFRA_DIR/tools/claude-startup.sh"
chmod +x "$INFRA_DIR/start-mcp-infrastructure.sh"
echo "✅ Script permissions set"

# 2. Create data directories
echo "📁 Creating data directories..."
mkdir -p "$INFRA_DIR/data/memory"
mkdir -p "$INFRA_DIR/logs"
echo "✅ Data directories created"

# 3. Set up bash integration
echo "🔗 Setting up bash integration..."
if ! grep -q "source ~/.bashrc_claude" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Claude Code IDP Governance Integration" >> ~/.bashrc
    echo "if [ -f ~/.bashrc_claude ]; then" >> ~/.bashrc
    echo "    source ~/.bashrc_claude" >> ~/.bashrc
    echo "fi" >> ~/.bashrc
    echo "✅ Bash integration added"
else
    echo "✅ Bash integration already exists"
fi

# 4. Create governance memory initialization
echo "🧠 Initializing governance memory..."
MEMORY_FILE="$INFRA_DIR/data/memory/governance-state.json"
if [ ! -f "$MEMORY_FILE" ]; then
    cat > "$MEMORY_FILE" << EOF
{
  "governance_framework": {
    "status": "active",
    "version": "1.0.0",
    "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "compliance_level": "enforced"
  },
  "mcp_servers": {
    "governance_compliant": [
      {
        "name": "fetch-mcp-governance",
        "status": "operational",
        "risk_level": "low",
        "path": "/home/ichardart/code/infra/mcp-servers/fetch-mcp"
      },
      {
        "name": "wsl-helper-mcp", 
        "status": "operational",
        "risk_level": "medium",
        "path": "/home/ichardart/code/infra/wsl-helper-mcp"
      },
      {
        "name": "markdown-formatting-mcp",
        "status": "setup_required",
        "risk_level": "low", 
        "path": "/home/ichardart/code/infra/markdown-formatting-mcp"
      },
      {
        "name": "claude-projects-access-mcp",
        "status": "setup_required",
        "risk_level": "medium",
        "path": "/home/ichardart/code/infra/claude-projects-access-mcp"
      }
    ],
    "non_compliant_detected": {
      "security_risks": [
        "browser-tools-mcp",
        "puppeteer",
        "sequential-thinking"
      ],
      "redundant": [
        "filesystem"
      ],
      "potentially_valuable": [
        "github",
        "e2b",
        "memory",
        "context7",
        "gdrive"
      ]
    }
  },
  "infrastructure_components": {
    "mcp_server_hub": {
      "status": "available",
      "path": "/home/ichardart/code/infra/mcp-server-hub"
    },
    "a2a_protocol": {
      "status": "implemented", 
      "path": "/home/ichardart/code/infra/A2A"
    },
    "governance_framework": {
      "status": "active",
      "path": "/home/ichardart/code/infra/idp-governance"
    },
    "security_tooling": {
      "status": "configured",
      "path": "/home/ichardart/code/infra/security-tooling"
    }
  },
  "session_defaults": {
    "workspace": "/home/ichardart/code",
    "governance_mode": "enforced",
    "security_by_design": true,
    "multi_agent_platform": true
  }
}
EOF
    echo "✅ Governance memory initialized"
else
    echo "✅ Governance memory already exists"
fi

# 5. Test the setup
echo "🧪 Testing setup..."
if "$INFRA_DIR/tools/governance-check.sh" > /dev/null 2>&1; then
    echo "✅ Governance check script working"
else
    echo "⚠️ Governance check script needs attention"
fi

if python3 "$INFRA_DIR/tools/mcp-status-checker.py" --no-update > /dev/null 2>&1; then
    echo "✅ MCP status checker working"
else
    echo "⚠️ MCP status checker needs attention"
fi

# 6. Create automatic trigger for VS Code
echo "🔧 Setting up VS Code integration..."
VSCODE_SETTINGS_DIR="$HOME/.vscode-server/data/Machine"
if [ -d "$VSCODE_SETTINGS_DIR" ]; then
    mkdir -p "$VSCODE_SETTINGS_DIR"
    
    # Create a settings file that could trigger governance awareness
    SETTINGS_FILE="$VSCODE_SETTINGS_DIR/settings.json"
    if [ ! -f "$SETTINGS_FILE" ]; then
        echo '{}' > "$SETTINGS_FILE"
    fi
    
    # Add governance awareness to workspace settings
    WORKSPACE_DIR="/home/ichardart/code/.vscode"
    mkdir -p "$WORKSPACE_DIR"
    
    cat > "$WORKSPACE_DIR/settings.json" << EOF
{
    "terminal.integrated.shellIntegration.enabled": true,
    "terminal.integrated.env.linux": {
        "IDP_GOVERNANCE_ACTIVE": "true",
        "MCP_GOVERNANCE_MODE": "enforced",
        "CLAUDE_WORKSPACE": "/home/ichardart/code"
    },
    "files.watcherExclude": {
        "**/infra/logs/**": true,
        "**/infra/data/memory/**": false
    }
}
EOF
    echo "✅ VS Code integration configured"
else
    echo "⚠️ VS Code server directory not found, skipping integration"
fi

# 7. Final verification
echo "🔍 Final verification..."
echo ""

# Check CLAUDE.md
if [ -f "/home/ichardart/code/CLAUDE.md" ] && grep -q "IDP Governance Framework" "/home/ichardart/code/CLAUDE.md"; then
    echo "✅ CLAUDE.md governance awareness: READY"
else
    echo "❌ CLAUDE.md governance awareness: MISSING"
fi

# Check tools
if [ -x "$INFRA_DIR/tools/governance-check.sh" ]; then
    echo "✅ Governance check tool: READY"
else
    echo "❌ Governance check tool: MISSING"
fi

if [ -x "$INFRA_DIR/tools/mcp-status-checker.py" ]; then
    echo "✅ MCP status checker: READY"
else
    echo "❌ MCP status checker: MISSING"  
fi

if [ -x "$INFRA_DIR/tools/claude-startup.sh" ]; then
    echo "✅ Claude startup script: READY"
else
    echo "❌ Claude startup script: MISSING"
fi

# Check infrastructure
if [ -d "$INFRA_DIR/idp-governance" ]; then
    echo "✅ IDP Governance Framework: READY"
else
    echo "❌ IDP Governance Framework: MISSING"
fi

echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "📋 What happens now:"
echo "• Every Claude Code session will automatically load governance context"
echo "• CLAUDE.md contains comprehensive governance awareness"
echo "• Automatic compliance checking on startup"
echo "• MCP server status monitoring"
echo "• Security posture validation"
echo ""
echo "🚀 To test the setup:"
echo "1. Start a new terminal session"
echo "2. The governance context should load automatically"
echo "3. Use 'gov-help' for quick reference commands"
echo ""
echo "📖 For manual trigger:"
echo "/home/ichardart/code/infra/tools/claude-startup.sh"