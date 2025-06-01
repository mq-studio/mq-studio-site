#!/bin/bash
# Claude Desktop Config Diagnostic Script
# Finds ALL Claude configurations and identifies which one is being used

echo "🔍 CLAUDE DESKTOP CONFIG DIAGNOSTIC"
echo "====================================="

echo ""
echo "1. CHECKING CONFIG LOCATIONS:"
echo "-----------------------------"

# Check User Profile
if [[ -f "/mnt/c/Users/RichardHart/.claude/config.json" ]]; then
    echo "✅ Found: %USERPROFILE%\\.claude\\config.json (our bridge)"
    echo "   Servers: $(cat /mnt/c/Users/RichardHart/.claude/config.json | jq -r '.mcpServers | keys[]' | wc -l) configured"
else
    echo "❌ Missing: %USERPROFILE%\\.claude\\config.json"
fi

# Check AppData Roaming
if [[ -f "/mnt/c/Users/RichardHart/AppData/Roaming/Claude/config.json" ]]; then
    echo "🚨 Found: %APPDATA%\\Claude\\config.json (HIGH PRIORITY - likely being used)"
    echo "   This config takes priority over our bridge!"
else
    echo "✅ Clear: %APPDATA%\\Claude\\config.json (not found)"
fi

# Check AppData Local
if [[ -f "/mnt/c/Users/RichardHart/AppData/Local/Claude/config.json" ]]; then
    echo "🚨 Found: %LOCALAPPDATA%\\Claude\\config.json (MEDIUM PRIORITY)"
    echo "   This config takes priority over our bridge!"
else
    echo "✅ Clear: %LOCALAPPDATA%\\Claude\\config.json (not found)"
fi

echo ""
echo "2. SEARCHING FOR OTHER CLAUDE CONFIGS:"
echo "--------------------------------------"

# Search for any other config files
find /mnt/c/Users/RichardHart -name "config.json" -path "*claude*" 2>/dev/null | while read config; do
    echo "📄 Found config: $config"
    if [[ -f "$config" ]]; then
        servers=$(cat "$config" | jq -r '.mcpServers | keys[]' 2>/dev/null | wc -l)
        echo "   Servers configured: $servers"
        
        # Check for problematic external servers
        if cat "$config" | grep -q "filesystem-windows\|@smithery-ai/puppeteer\|brave-search" 2>/dev/null; then
            echo "   🚨 CONTAINS EXTERNAL SERVERS - This is likely the active config!"
        fi
    fi
done

echo ""
echo "3. CLAUDE DESKTOP PROCESS CHECK:"
echo "--------------------------------"

if tasklist.exe | grep -q claude.exe; then
    echo "✅ Claude Desktop is running"
    echo "   Process count: $(tasklist.exe | grep -c claude.exe)"
else
    echo "❌ Claude Desktop not running"
fi

echo ""
echo "4. RECOMMENDED ACTIONS:"
echo "----------------------"

if [[ -f "/mnt/c/Users/RichardHart/AppData/Roaming/Claude/config.json" ]]; then
    echo "🎯 Move our bridge config to AppData\\Roaming\\Claude\\ (highest priority)"
elif [[ -f "/mnt/c/Users/RichardHart/AppData/Local/Claude/config.json" ]]; then
    echo "🎯 Move our bridge config to AppData\\Local\\Claude\\ (medium priority)"
else
    echo "🤔 Config location mystery - Claude Desktop may be using embedded defaults"
    echo "🎯 Try moving bridge config to AppData\\Roaming\\Claude\\ anyway"
fi

echo ""
echo "5. NEXT STEPS:"
echo "-------------"
echo "Run: claude-config-fix.sh to implement the recommended solution"