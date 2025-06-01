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
