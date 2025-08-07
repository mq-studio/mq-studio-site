#!/bin/bash
set -e

echo "🔄 Switching Claude Desktop to Centralized MCP"
echo "=============================================="

# Backup current config
BACKUP_FILE=~/.claude/config.json.backup-$(date +%Y%m%d-%H%M%S)
echo "📋 Backing up current config to: $BACKUP_FILE"
cp ~/.claude/config.json "$BACKUP_FILE"

# Check if centralized MCP is running
echo "🔍 Checking centralized MCP status..."
if ! curl -s http://localhost:3010/api/health > /dev/null; then
    echo "❌ Centralized MCP not running. Please start with:"
    echo "   cd /home/ichardart/code/infra/mcp-central"
    echo "   docker-compose -f docker-compose.working.yml up -d"
    exit 1
fi

echo "✅ Centralized MCP is running"

# Apply centralized configuration
echo "🔧 Applying centralized MCP configuration..."
cp /home/ichardart/code/infra/mcp-central/claude-desktop-centralized.json ~/.claude/config.json

echo "✅ Configuration updated successfully!"
echo ""
echo "🎯 Centralized MCP Dashboard: http://localhost:3010"
echo "🔗 A2A Protocol Endpoint: http://localhost:3011"
echo "🐳 Docker Bridge Endpoint: http://localhost:3012"
echo ""
echo "📋 To revert to previous configuration:"
echo "   cp $BACKUP_FILE ~/.claude/config.json"
echo ""
echo "🚀 Restart Claude Desktop to use centralized MCP servers"