#!/bin/bash
# Claude Desktop WSL Bridge Setup
# Enables Windows Claude Desktop to access WSL-based IDP infrastructure

set -euo pipefail

echo "🌉 Setting up Claude Desktop WSL Bridge..."

# Configuration
WINDOWS_USER_DIR="/mnt/c/Users/RichardHart"
WSL_CLAUDE_DIR="/home/ichardart/.claude"
BRIDGE_DIR="$WINDOWS_USER_DIR/.claude"
WSL_CODE_DIR="/home/ichardart/code"

# Create Windows Claude config directory
echo "📁 Creating Windows Claude config directory..."
mkdir -p "$BRIDGE_DIR"

# Create WSL-compatible config with Windows-accessible paths
echo "⚙️ Creating WSL bridge configuration..."
cat > "$BRIDGE_DIR/config.json" << 'EOF'
{
  "workspace": "\\\\wsl.localhost\\Ubuntu\\home\\ichardart\\code",
  "verbose": "true",
  "mcpServers": {
    "context-awareness-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu",
        "node", "/home/ichardart/code/infra/mcp-servers/context-awareness-mcp/index.js"
      ],
      "env": {}
    },
    "governance-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu",
        "node", "/home/ichardart/code/infra/mcp-servers/governance-mcp/index.js"
      ],
      "env": {}
    },
    "filesystem-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu", 
        "node", "/home/ichardart/code/infra/mcp-servers/filesystem-mcp/index.js"
      ],
      "env": {
        "FS_WORKSPACE": "/home/ichardart/code",
        "GOVERNANCE_LOG": "/home/ichardart/code/infra/logs/filesystem-mcp.log"
      }
    },
    "git-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu",
        "node", "/home/ichardart/code/infra/mcp-servers/git-mcp/index.js"
      ],
      "env": {
        "GIT_WORKSPACE": "/home/ichardart/code",
        "GOVERNANCE_LOG": "/home/ichardart/code/infra/logs/git-mcp.log"
      }
    },
    "shell-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu",
        "node", "/home/ichardart/code/infra/mcp-servers/shell-mcp/index.js"
      ],
      "env": {
        "SHELL_WORKSPACE": "/home/ichardart/code",
        "GOVERNANCE_LOG": "/home/ichardart/code/infra/logs/shell-mcp.log"
      }
    },
    "api-testing-mcp": {
      "command": "wsl",
      "args": [
        "-d", "Ubuntu",
        "node", "/home/ichardart/code/infra/mcp-servers/api-testing-mcp/index.js"
      ],
      "env": {
        "GOVERNANCE_LOG": "/home/ichardart/code/infra/logs/api-testing-mcp.log"
      }
    }
  }
}
EOF

# Create context bridge file
echo "📋 Creating context bridge..."
cat > "$BRIDGE_DIR/wsl-context.md" << EOF
# WSL Bridge Context for Claude Desktop

## Environment
- **WSL Distribution**: Ubuntu
- **Development Root**: /home/ichardart/code
- **IDP Location**: /home/ichardart/code
- **Governance**: Active validation framework

## Quick Commands (from Windows)
\`\`\`cmd
# Access WSL filesystem
cd \\\\wsl.localhost\\Ubuntu\\home\\ichardart\\code

# Run WSL commands
wsl -d Ubuntu -e bash -c "cd /home/ichardart/code && ls"

# Execute health check
wsl -d Ubuntu -e /home/ichardart/code/infra/scripts/claude-desktop-health.sh
\`\`\`

## MCP Servers
All MCP servers run in WSL via 'wsl' command wrapper for Windows Claude Desktop compatibility.
EOF

# Backup original WSL config
cp "$WSL_CLAUDE_DIR/config.json" "$WSL_CLAUDE_DIR/config.wsl-backup.json"

# Test WSL access from Windows
echo "🧪 Testing WSL access from Windows..."
if cmd.exe /c "dir \\\\wsl.localhost\\Ubuntu\\home\\ichardart\\code" >/dev/null 2>&1; then
    echo "✅ Windows can access WSL filesystem via wsl.localhost"
else
    echo "⚠️ Direct filesystem access may have issues, but WSL commands should work"
fi

# Create restart script for Claude Desktop
cat > "$BRIDGE_DIR/restart-claude-desktop.bat" << 'EOF'
@echo off
echo Restarting Claude Desktop with WSL bridge configuration...
taskkill /f /im claude.exe 2>nul
timeout /t 2 >nul
start "" "C:\Users\RichardHart\AppData\Local\Programs\Claude\Claude.exe"
echo Claude Desktop restarted. Check for MCP server connections.
pause
EOF

echo "✅ WSL Bridge setup complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Close Claude Desktop completely"
echo "2. Run: $BRIDGE_DIR/restart-claude-desktop.bat"
echo "3. Or manually restart Claude Desktop"
echo "4. Verify MCP servers connect successfully"
echo ""
echo "📍 Configuration location: $BRIDGE_DIR/config.json"
echo "📍 Context information: $BRIDGE_DIR/wsl-context.md"