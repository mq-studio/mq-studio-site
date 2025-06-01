#!/bin/bash
# Complete GodCode System Installation
# Sets up "*GodCode" activation for both Claude Code and Claude Desktop

echo "🧠 GODCODE SYSTEM INSTALLATION"
echo "==============================="
echo ""
echo "Installing comprehensive thinking protocol activation system..."
echo ""

# Run Claude Code setup
echo "1️⃣ Setting up Claude Code integration..."
/home/ichardart/code/infra/scripts/godcode-activator.sh

echo ""
echo "2️⃣ Setting up Claude Desktop integration..."
/home/ichardart/code/infra/scripts/claude-desktop-godcode-setup.sh

# Create unified status check
cat > /home/ichardart/code/infra/scripts/godcode-status.sh << 'EOF'
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
EOF

chmod +x /home/ichardart/code/infra/scripts/godcode-status.sh

# Create test script
cat > /home/ichardart/code/infra/scripts/test-godcode.sh << 'EOF'
#!/bin/bash
# Test GodCode System

echo "🧪 TESTING GODCODE SYSTEM"
echo "========================="
echo ""

echo "1. Testing Claude Code activation..."
godcode-activate
sleep 1
godcode-status

echo ""
echo "2. Testing protocol file..."
PROTOCOL_FILE="/home/ichardart/code/infra/config/godcode-thinking-protocol.txt"
if [[ -f "$PROTOCOL_FILE" ]]; then
    echo "✅ Protocol file exists"
    echo "📏 Size: $(wc -c < "$PROTOCOL_FILE") bytes"
    echo "📝 Lines: $(wc -l < "$PROTOCOL_FILE") lines"
else
    echo "❌ Protocol file missing"
fi

echo ""
echo "3. Testing Claude Desktop templates..."
TEMPLATES_DIR="/mnt/c/Users/RichardHart/AppData/Roaming/Claude/godcode-templates"
if [[ -d "$TEMPLATES_DIR" ]]; then
    echo "✅ Templates directory exists"
    echo "📁 Files:"
    ls -la "$TEMPLATES_DIR" | grep -v "^total" | tail -n +2 | while read line; do
        echo "   $line"
    done
else
    echo "❌ Templates directory missing"
fi

echo ""
echo "4. Testing aliases..."
if alias godcode-activate >/dev/null 2>&1; then
    echo "✅ godcode-activate alias available"
else
    echo "⚠️ godcode-activate alias not loaded (run: source ~/.bashrc)"
fi

echo ""
echo "✅ Test complete!"
echo ""
echo "💡 To activate GodCode:"
echo "   Claude Code: Type 'godcode-activate'"
echo "   Claude Desktop: Type '*GodCode' and press Enter"
EOF

chmod +x /home/ichardart/code/infra/scripts/test-godcode.sh

# Add aliases to current session
source ~/.bashrc 2>/dev/null || true

echo ""
echo "✅ GODCODE SYSTEM INSTALLATION COMPLETE!"
echo ""
echo "🎯 ACTIVATION METHODS:"
echo ""
echo "For Claude Code:"
echo "  • Type: godcode-activate"
echo "  • Check status: godcode-status"
echo "  • Deactivate: godcode-deactivate"
echo ""
echo "For Claude Desktop:"
echo "  • Type: *GodCode (and press Enter)"
echo "  • Or run: godcode.bat (copies to clipboard)"
echo "  • Or use desktop shortcut"
echo ""
echo "🧪 TEST YOUR SETUP:"
echo "  Run: /home/ichardart/code/infra/scripts/test-godcode.sh"
echo ""
echo "📊 CHECK STATUS:"
echo "  Run: /home/ichardart/code/infra/scripts/godcode-status.sh"
echo ""
echo "🔄 RESTART REQUIREMENTS:"
echo "  • Source bash config: source ~/.bashrc"
echo "  • Restart Claude Desktop for config changes"
echo ""
echo "🧠 Now you can type '*GodCode' in either application to activate"
echo "   comprehensive thinking protocol!"