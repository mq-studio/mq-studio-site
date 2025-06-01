#!/bin/bash
# GodCode System Status Check

echo "🧠 GODCODE SYSTEM STATUS"
echo "========================"
echo ""

# Check Claude Code integration
echo "📟 Claude Code:"
if [[ -f /tmp/godcode-active ]]; then
    echo "  Status: ✅ ACTIVE"
    echo "  Mode: Comprehensive thinking enabled"
else
    echo "  Status: ⚪ INACTIVE"
    echo "  Activation: Type 'godcode-activate'"
fi

echo ""

# Check Claude Desktop integration
echo "🖥️ Claude Desktop:"
TEMPLATES_DIR="/mnt/c/Users/RichardHart/AppData/Roaming/Claude/godcode-templates"
if [[ -d "$TEMPLATES_DIR" ]]; then
    echo "  Templates: ✅ INSTALLED"
    echo "  Location: $TEMPLATES_DIR"
    echo "  Activation: Type '*GodCode' in Claude Desktop"
else
    echo "  Templates: ❌ NOT FOUND"
    echo "  Run: claude-desktop-godcode-setup.sh"
fi

echo ""

# Check protocol file
PROTOCOL_FILE="/home/ichardart/code/infra/config/godcode-thinking-protocol.txt"
if [[ -f "$PROTOCOL_FILE" ]]; then
    echo "📋 Protocol File: ✅ READY"
    echo "  Location: $PROTOCOL_FILE"
    SIZE=$(wc -c < "$PROTOCOL_FILE")
    echo "  Size: ${SIZE} bytes"
else
    echo "📋 Protocol File: ❌ MISSING"
fi

echo ""
echo "🚀 Quick Commands:"
echo "  godcode-activate    - Enable for Claude Code"
echo "  godcode-deactivate  - Disable for Claude Code"
echo "  godcode-status      - Check system status"
echo "  *GodCode           - Activate in Claude Desktop"
