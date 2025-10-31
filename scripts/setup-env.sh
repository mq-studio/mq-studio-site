#!/bin/bash

# Setup environment variables using 1Password CLI
# This script fetches secrets from 1Password and creates a local .env file

set -e

echo "🔐 Setting up environment variables with 1Password CLI..."

# Check if op CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI (op) is not installed."
    echo "Install it from: https://developer.1password.com/docs/cli/get-started/"
    exit 1
fi

# Check if user is signed in to 1Password
if ! op account list &> /dev/null; then
    echo "📝 Please sign in to 1Password first by running:"
    echo "   eval \$(op signin)"
    echo ""
    echo "Then re-run this script."
    exit 1
fi

# Create .env file from template with actual values
echo "📄 Creating .env file with secrets from 1Password..."

# Function to safely read from 1Password
read_secret() {
    local reference=$1
    local fallback=$2
    
    # Try to read from 1Password, removing the op:// prefix if needed
    local clean_ref="${reference#op://}"
    
    if op read "op://$clean_ref" 2>/dev/null; then
        op read "op://$clean_ref"
    else
        echo "$fallback"
    fi
}

# Try to find Anthropic API key in Development vault
echo "🔍 Searching for Anthropic API key in Development vault..."

# First, let's check what items are available
ANTHROPIC_KEY=""

# Try common names for the API key
for item_name in "Anthropic API" "Anthropic" "Claude API" "Claude" "API Keys"; do
    echo "  Trying: $item_name..."
    if op item get "$item_name" --vault Development 2>/dev/null | grep -q "anthropic"; then
        # Try to get the API key field
        ANTHROPIC_KEY=$(op item get "$item_name" --vault Development --fields label="api_key" 2>/dev/null || \
                        op item get "$item_name" --vault Development --fields label="API Key" 2>/dev/null || \
                        op item get "$item_name" --vault Development --fields label="key" 2>/dev/null || \
                        op item get "$item_name" --vault Development --fields label="credential" 2>/dev/null || \
                        op item get "$item_name" --vault Development --fields label="password" 2>/dev/null || \
                        op item get "$item_name" --vault Development --fields type="concealed" 2>/dev/null | head -1)
        if [ -n "$ANTHROPIC_KEY" ]; then
            echo "  ✓ Found Anthropic API key in: $item_name"
            break
        fi
    fi
done

# If still not found, try searching for items with "sk-ant" prefix
if [ -z "$ANTHROPIC_KEY" ]; then
    echo "  Searching for items containing Anthropic keys..."
    ANTHROPIC_KEY=$(op item list --vault Development --format json 2>/dev/null | \
                    jq -r '.[].title' | \
                    while read -r item; do
                        op item get "$item" --vault Development --format json 2>/dev/null | \
                        jq -r '.fields[]? | select(.value // "" | startswith("sk-ant")) | .value' | \
                        head -1
                    done | head -1)
fi

if [ -z "$ANTHROPIC_KEY" ]; then
    echo "  ⚠️  Could not find Anthropic API key in Development vault"
    echo "     Please add it to 1Password with one of these names:"
    echo "     - Anthropic API"
    echo "     - Claude API"
    echo "     - API Keys (with an 'anthropic' field)"
fi

# Create .env file
cat > .env << EOF
# Stagehand Configuration
ANTHROPIC_API_KEY=$ANTHROPIC_KEY

# Browserbase Configuration (optional)
BROWSERBASE_API_KEY=

# Development Environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ Environment variables set up successfully!"
echo ""
echo "💡 To add API keys to 1Password:"
echo "   1. Create an item named 'MQ Studio API Keys' in your 'Development' vault"
echo "   2. Add fields: anthropic_api_key, browserbase_api_key, browserbase_project_id"
echo "   3. Run this script again to fetch the values"