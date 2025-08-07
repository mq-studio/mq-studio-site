#!/bin/bash
set -e

echo "🔄 Configuring Claude Code for Centralized MCP"
echo "=============================================="

# Check if centralized MCP is running
echo "🔍 Checking centralized MCP status..."
if ! curl -s http://localhost:3010/api/health > /dev/null; then
    echo "❌ Centralized MCP not running. Please start with:"
    echo "   cd /home/ichardart/code/infra/mcp-central"
    echo "   docker-compose -f docker-compose.working.yml up -d"
    exit 1
fi

echo "✅ Centralized MCP is running"

# Get the centralized config path
CENTRALIZED_CONFIG="/home/ichardart/code/infra/mcp-central/claude-code-centralized.json"

echo "🔧 Creating Claude Code startup script for centralized MCP..."

# Create a wrapper script for Claude Code with centralized MCP
cat > /home/ichardart/code/claude-code-centralized.sh << EOF
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
exec claude --mcp-config "$CENTRALIZED_CONFIG" "\$@"
EOF

chmod +x /home/ichardart/code/claude-code-centralized.sh

echo "✅ Claude Code centralized startup script created!"
echo ""
echo "🎯 Usage Options:"
echo ""
echo "1. **Direct with config file:**"
echo "   claude --mcp-config $CENTRALIZED_CONFIG"
echo ""
echo "2. **Using startup script:**"
echo "   /home/ichardart/code/claude-code-centralized.sh"
echo ""
echo "3. **Create alias for convenience:**"
echo "   alias claude-central='/home/ichardart/code/claude-code-centralized.sh'"
echo "   echo 'alias claude-central=\"/home/ichardart/code/claude-code-centralized.sh\"' >> ~/.bashrc"
echo ""
echo "🔗 Centralized MCP Endpoints:"
echo "  • Main Dashboard: http://localhost:3010"
echo "  • A2A Protocol: http://localhost:3011"
echo "  • Docker Bridge: http://localhost:3012"
echo "  • Jaeger Tracing: http://localhost:16686"
echo ""
echo "📋 Example usage:"
echo "   claude-central --model sonnet"
echo "   claude-central --continue"
echo "   claude-central --model opus \"Hello from centralized MCP!\""