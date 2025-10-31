#!/bin/bash
# Container secret initialization script

# Check if running in devcontainer
if [ -n "$DEVCONTAINER" ]; then
    echo "🔐 Initializing container secrets..."

    # Try to get TestSprite API key from multiple sources
    if [ -z "$TESTSPRITE_API_KEY" ]; then
        # Method 1: Try 1Password CLI if available
        if command -v op &> /dev/null; then
            if op whoami &> /dev/null 2>&1; then
                export TESTSPRITE_API_KEY=$(op read 'op://Development/Testsprite API/credential' 2>/dev/null)
                if [ -n "$TESTSPRITE_API_KEY" ]; then
                    echo "✅ TestSprite API key loaded from 1Password"
                    # Persist for container session
                    echo "export TESTSPRITE_API_KEY='$TESTSPRITE_API_KEY'" >> ~/.bashrc
                fi
            else
                echo "⚠️  1Password CLI not authenticated"
            fi
        fi

        # Method 2: Check for mounted secrets file
        if [ -z "$TESTSPRITE_API_KEY" ] && [ -f "/workspaces/.secrets" ]; then
            source /workspaces/.secrets
            echo "✅ Secrets loaded from mounted file"
        fi

        # Method 3: Prompt user if still missing
        if [ -z "$TESTSPRITE_API_KEY" ]; then
            echo "⚠️  TESTSPRITE_API_KEY not found. TestSprite integration will be unavailable."
            echo "   To fix: Set TESTSPRITE_API_KEY in your host environment before opening the container"
        fi
    else
        echo "✅ TestSprite API key already present in environment"
    fi
fi