#!/bin/bash

# Complete Real-Time Governance Synchronization Setup
# Configures all components for automatic governance context updates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔄 Setting up Real-Time IDP Governance Synchronization"
echo "======================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Setup environment
echo -e "${BLUE}Step 1: Environment Setup${NC}"

if [ ! -d "$INFRA_DIR/governance-sync-env" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv "$INFRA_DIR/governance-sync-env"
    "$INFRA_DIR/governance-sync-env/bin/pip" install watchdog
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
fi

# Step 2: Setup file system monitoring service
echo -e "${BLUE}Step 2: File System Monitoring Service${NC}"

if [ -f "$SCRIPT_DIR/governance-sync-service.sh" ]; then
    chmod +x "$SCRIPT_DIR/governance-sync-service.sh"
    echo -e "${GREEN}✅ Sync service ready${NC}"
else
    echo -e "${RED}❌ Sync service script missing${NC}"
fi

# Step 3: Setup auto-refresh triggers
echo -e "${BLUE}Step 3: Auto-Refresh Triggers${NC}"

if [ -f "$SCRIPT_DIR/governance-auto-refresh.py" ]; then
    chmod +x "$SCRIPT_DIR/governance-auto-refresh.py"
    
    # Setup Git hooks
    echo "🔗 Setting up Git hooks..."
    python3 "$SCRIPT_DIR/governance-auto-refresh.py" --git-hooks
    
    # Setup cron job (optional)
    echo "⏰ Setting up periodic refresh..."
    python3 "$SCRIPT_DIR/governance-auto-refresh.py" --cron
    
    echo -e "${GREEN}✅ Auto-refresh triggers configured${NC}"
else
    echo -e "${RED}❌ Auto-refresh script missing${NC}"
fi

# Step 4: Initialize governance memory
echo -e "${BLUE}Step 4: Governance Memory Initialization${NC}"

mkdir -p "$INFRA_DIR/data/memory"
mkdir -p "$INFRA_DIR/logs"

# Create initial sync state
cat > "$INFRA_DIR/data/memory/governance-sync-state.json" << EOF
{
  "sync_version": "1.0.0",
  "last_sync_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "realtime_sync_enabled": true,
  "monitored_paths": [
    "$INFRA_DIR/idp-governance",
    "$INFRA_DIR/mcp-servers",
    "$INFRA_DIR/mcp-config",
    "$INFRA_DIR/security-tooling",
    "/home/ichardart/code/CLAUDE.md",
    "/home/ichardart/.claude/config.json",
    "/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
  ],
  "sync_clients": [
    "claude_code",
    "claude_desktop", 
    "cline"
  ],
  "auto_refresh_triggers": [
    "file_system_watcher",
    "git_hooks",
    "periodic_cron"
  ]
}
EOF

echo -e "${GREEN}✅ Governance memory initialized${NC}"

# Step 5: Test the system
echo -e "${BLUE}Step 5: System Testing${NC}"

echo "🧪 Testing file system monitoring..."
if python3 "$SCRIPT_DIR/governance-watcher.py" --test 2>/dev/null; then
    echo -e "${GREEN}✅ File system monitoring test passed${NC}"
else
    echo -e "${YELLOW}⚠️ File system monitoring test needs attention${NC}"
fi

echo "🧪 Testing auto-refresh system..."
if python3 "$SCRIPT_DIR/governance-auto-refresh.py" --refresh-all >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Auto-refresh test passed${NC}"
else
    echo -e "${YELLOW}⚠️ Auto-refresh test needs attention${NC}"
fi

# Step 6: Create management shortcuts
echo -e "${BLUE}Step 6: Management Shortcuts${NC}"

# Create convenient aliases
cat > "$INFRA_DIR/tools/governance-shortcuts.sh" << 'EOF'
#!/bin/bash

# IDP Governance Real-Time Sync Management Shortcuts

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start real-time sync
alias start-governance-sync="$TOOLS_DIR/governance-sync-service.sh start"

# Stop real-time sync  
alias stop-governance-sync="$TOOLS_DIR/governance-sync-service.sh stop"

# Check sync status
alias governance-sync-status="$TOOLS_DIR/governance-sync-service.sh status"

# Manual refresh all clients
alias refresh-governance="python3 $TOOLS_DIR/governance-auto-refresh.py --refresh-all"

# View sync logs
alias governance-logs="$TOOLS_DIR/governance-sync-service.sh logs"

# Test sync system
alias test-governance-sync="$TOOLS_DIR/governance-sync-service.sh test"

echo "🛠️ IDP Governance Sync Shortcuts Loaded"
echo "Available commands:"
echo "• start-governance-sync   - Start real-time monitoring"
echo "• stop-governance-sync    - Stop real-time monitoring"
echo "• governance-sync-status  - Check service status"
echo "• refresh-governance      - Manual refresh all clients"
echo "• governance-logs         - View live logs"
echo "• test-governance-sync    - Test the system"
EOF

chmod +x "$INFRA_DIR/tools/governance-shortcuts.sh"
echo -e "${GREEN}✅ Management shortcuts created${NC}"

# Step 7: Update bashrc for automatic loading
echo -e "${BLUE}Step 7: Shell Integration${NC}"

BASHRC_LINE="source $INFRA_DIR/tools/governance-shortcuts.sh"
if ! grep -q "governance-shortcuts.sh" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# IDP Governance Sync Shortcuts" >> ~/.bashrc
    echo "$BASHRC_LINE" >> ~/.bashrc
    echo -e "${GREEN}✅ Shell integration added${NC}"
else
    echo -e "${GREEN}✅ Shell integration already exists${NC}"
fi

# Step 8: Final verification and instructions
echo ""
echo -e "${BLUE}🎉 Real-Time Governance Synchronization Setup Complete!${NC}"
echo "======================================================="
echo ""
echo "📋 What's Now Available:"
echo "• 🔍 File system monitoring for governance artifacts"
echo "• 🔄 Real-time context synchronization across all Claude clients"
echo "• ⚡ Automatic refresh on Git commits and periodic intervals"
echo "• 🛠️ Management service with start/stop/status controls"
echo "• 📊 Change tracking and history"
echo ""
echo "🚀 How It Works:"
echo "1. Any change to governance artifacts triggers automatic updates"
echo "2. CLAUDE.md is updated in real-time for Claude Code"
echo "3. Claude Desktop context files are refreshed automatically"
echo "4. MCP server status is synchronized across all clients"
echo "5. Change history is tracked for audit purposes"
echo ""
echo "🛠️ Management Commands:"
echo "• Start monitoring: start-governance-sync"
echo "• Check status: governance-sync-status"
echo "• Manual refresh: refresh-governance"
echo "• View logs: governance-logs"
echo "• Stop monitoring: stop-governance-sync"
echo ""
echo "📝 To start real-time sync immediately:"
echo "   $SCRIPT_DIR/governance-sync-service.sh start"
echo ""
echo "💡 To load shortcuts in current session:"
echo "   source $INFRA_DIR/tools/governance-shortcuts.sh"
echo ""
echo "🔍 Test the system:"
echo "   1. Make a change to any governance file"
echo "   2. Watch automatic updates propagate to all Claude clients"
echo "   3. Check sync logs: governance-logs"