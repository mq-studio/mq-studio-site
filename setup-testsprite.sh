#!/bin/bash
# Quick setup script for TestSprite in current WSL session

echo "🔐 Setting up TestSprite API key in WSL environment..."

# Get the API key from 1Password
export TESTSPRITE_API_KEY=$(op read 'op://Development/Testsprite API/credential' 2>/dev/null)

if [ -n "$TESTSPRITE_API_KEY" ]; then
    echo "✅ TestSprite API key loaded successfully"

    # Add to bashrc for persistence in WSL
    if ! grep -q "TESTSPRITE_API_KEY" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# TestSprite API Key (auto-added)" >> ~/.bashrc
        echo "export TESTSPRITE_API_KEY=\$(op read 'op://Development/Testsprite API/credential' 2>/dev/null)" >> ~/.bashrc
        echo "✅ Added to ~/.bashrc for future sessions"
    fi

    echo ""
    echo "📋 Next steps:"
    echo "  1. Launch VS Code: code ."
    echo "  2. Reopen in Container (F1 → Dev Containers: Reopen in Container)"
    echo "  3. Verify in container: echo \$TESTSPRITE_API_KEY"
else
    echo "❌ Failed to retrieve TestSprite API key"
    echo "   Please run: op signin"
fi