#!/bin/bash
# Claude Desktop GodCode Integration Setup

CLAUDE_DESKTOP_CONFIG="/mnt/c/Users/RichardHart/AppData/Roaming/Claude"
GODCODE_TEMPLATES_DIR="$CLAUDE_DESKTOP_CONFIG/godcode-templates"
PROTOCOL_FILE="/home/ichardart/code/infra/config/godcode-thinking-protocol.txt"

echo "🖥️ Setting up Claude Desktop GodCode Integration..."

# Create GodCode templates directory
mkdir -p "$GODCODE_TEMPLATES_DIR"

# Create quick-access protocol file for Claude Desktop
cat > "$GODCODE_TEMPLATES_DIR/thinking-protocol.txt" << 'EOF'
*GodCode Thinking Protocol Activated*

Please engage your comprehensive thinking protocol for all subsequent interactions in this conversation. Use detailed, stream-of-consciousness analysis before responding to any queries.

Key activation phrase: "*GodCode" activates this comprehensive thinking mode.
EOF

# Create PowerShell script for Windows integration
cat > "$GODCODE_TEMPLATES_DIR/godcode-activator.ps1" << 'EOF'
# GodCode Activator for Claude Desktop
# Run this to automatically copy the thinking protocol to clipboard

$protocolPath = "$env:APPDATA\Claude\godcode-templates\thinking-protocol.txt"

if (Test-Path $protocolPath) {
    $protocol = Get-Content $protocolPath -Raw
    Set-Clipboard $protocol
    Write-Host "🧠 GodCode protocol copied to clipboard!" -ForegroundColor Green
    Write-Host "📋 Paste it into Claude Desktop to activate thinking mode" -ForegroundColor Yellow
} else {
    Write-Host "❌ Protocol file not found at: $protocolPath" -ForegroundColor Red
}

# Keep window open
Read-Host "Press Enter to close..."
EOF

# Create batch file for easy Windows access
cat > "$GODCODE_TEMPLATES_DIR/godcode.bat" << 'EOF'
@echo off
echo 🧠 GodCode Thinking Protocol Activator
echo =====================================
echo.
powershell -ExecutionPolicy Bypass -File "%APPDATA%\Claude\godcode-templates\godcode-activator.ps1"
EOF

# Create comprehensive thinking protocol template for Claude Desktop
cat > "$GODCODE_TEMPLATES_DIR/full-protocol-template.txt" << 'EOF'
Please activate your comprehensive thinking protocol with the following characteristics:

🧠 **Thinking Process Requirements:**
- Use ```thinking blocks for all internal analysis
- Engage in stream-of-consciousness reasoning
- Question assumptions and explore multiple perspectives
- Show genuine problem-solving progression
- Connect ideas naturally and authentically

🎯 **Analysis Depth:**
- Scale analysis to match query complexity
- Consider multiple solution approaches
- Test reasoning for consistency and completeness
- Build understanding progressively
- Synthesize insights from different domains

⚡ **Activation Keywords:**
- "*GodCode" = Enable comprehensive thinking for conversation
- "Think deeply" = Use enhanced analysis for next response
- "Analyze thoroughly" = Apply full thinking protocol

This mode remains active for our entire conversation unless explicitly deactivated.
EOF

# Create keyboard shortcut template
cat > "$GODCODE_TEMPLATES_DIR/quick-activation.txt" << 'EOF'
*GodCode

[Paste this simple trigger to activate comprehensive thinking mode]
EOF

# Create detailed instructions file
cat > "$GODCODE_TEMPLATES_DIR/README.md" << 'EOF'
# Claude Desktop GodCode Integration

## Quick Activation Methods:

### Method 1: Simple Trigger
Type: `*GodCode` and press Enter in Claude Desktop

### Method 2: Copy-Paste Activation
1. Run: `godcode.bat` (copies protocol to clipboard)
2. Paste into Claude Desktop
3. Send message to activate

### Method 3: Manual Template
Copy and paste the content from `quick-activation.txt`

## Files in this directory:

- `thinking-protocol.txt` - Basic activation template
- `full-protocol-template.txt` - Comprehensive instructions
- `quick-activation.txt` - Simple "*GodCode" trigger
- `godcode-activator.ps1` - PowerShell clipboard utility
- `godcode.bat` - Windows batch file for easy access

## Windows Desktop Shortcut:

Create a desktop shortcut pointing to:
`%APPDATA%\Claude\godcode-templates\godcode.bat`

This gives you one-click access to activate GodCode mode.

## Usage:

1. **Activate**: Use any method above to start comprehensive thinking
2. **Active Mode**: Claude will use detailed thinking blocks for all responses
3. **Deactivate**: Start a new conversation or explicitly request normal mode

## Integration with Claude Desktop Config:

The GodCode system works alongside your existing MCP servers and doesn't interfere with Claude Desktop's normal operation.
EOF

# Create Windows desktop shortcut helper
cat > "$GODCODE_TEMPLATES_DIR/create-desktop-shortcut.bat" << 'EOF'
@echo off
echo Creating desktop shortcut for GodCode activation...

set "shortcutPath=%USERPROFILE%\Desktop\GodCode Activator.lnk"
set "targetPath=%APPDATA%\Claude\godcode-templates\godcode.bat"

powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%shortcutPath%'); $Shortcut.TargetPath = '%targetPath%'; $Shortcut.Description = 'Activate GodCode Thinking Protocol for Claude Desktop'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Save()}"

echo ✅ Desktop shortcut created: GodCode Activator
echo 🖱️ Double-click the shortcut to copy GodCode protocol to clipboard
pause
EOF

# Update Claude Desktop config to include context awareness
CONFIG_JSON="$CLAUDE_DESKTOP_CONFIG/config.json"
if [[ -f "$CONFIG_JSON" ]]; then
    # Create backup
    cp "$CONFIG_JSON" "$CONFIG_JSON.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Add GodCode workspace context
    python3 -c "
import json
import sys

try:
    with open('$CONFIG_JSON', 'r') as f:
        config = json.load(f)
    
    # Add GodCode context to workspace
    if 'workspace' not in config:
        config['workspace'] = {}
    
    config['godcode_integration'] = {
        'enabled': True,
        'templates_path': '$GODCODE_TEMPLATES_DIR',
        'activation_phrase': '*GodCode',
        'version': '1.0'
    }
    
    with open('$CONFIG_JSON', 'w') as f:
        json.dump(config, f, indent=2)
    
    print('✅ Claude Desktop config updated with GodCode integration')
except Exception as e:
    print(f'⚠️ Could not update config: {e}')
    sys.exit(1)
"
else
    echo "⚠️ Claude Desktop config not found at $CONFIG_JSON"
fi

echo ""
echo "✅ Claude Desktop GodCode Integration Complete!"
echo ""
echo "📋 Available Activation Methods:"
echo "  1. Type '*GodCode' directly in Claude Desktop"
echo "  2. Run godcode.bat to copy protocol to clipboard"
echo "  3. Use desktop shortcut (run create-desktop-shortcut.bat)"
echo ""
echo "📁 Templates Location: $GODCODE_TEMPLATES_DIR"
echo "🔧 Config Updated: $CONFIG_JSON"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run create-desktop-shortcut.bat for easy access"
echo "  2. Test activation by typing '*GodCode' in Claude Desktop"
echo "  3. Restart Claude Desktop to load updated configuration"