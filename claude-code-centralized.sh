#!/bin/bash
# Claude Code with Centralized MCP Configuration

echo "🚀 Starting Claude Code with Centralized MCP..."
echo "📊 Dashboard: http://localhost:3010"
echo "🔗 A2A API: http://localhost:3011"
echo "🐳 Docker Bridge: http://localhost:3012"
echo ""

# Check if centralized MCP is running
if ! curl -s http://localhost:3010/api/health > /dev/null 2>&1; then
    echo "❌ Centralized MCP not running!"
    echo "   Start with: cd /home/ichardart/code/infra/mcp-central && docker-compose -f docker-compose.working.yml up -d"
    exit 1
fi

# Start Claude Code with centralized MCP config
exec claude --mcp-config "/home/ichardart/code/infra/mcp-central/claude-code-centralized.json" "$@"
