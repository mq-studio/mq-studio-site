#!/bin/bash

# Test script to find Anthropic API key in 1Password

echo "🔐 Testing 1Password access..."

# List all vaults
echo "📂 Available vaults:"
op vault list 2>/dev/null || echo "  Need to sign in first: eval \$(op signin)"

# List items in Development vault
echo ""
echo "📋 Items in Development vault:"
op item list --vault Development 2>/dev/null | head -10

# Search for Anthropic-related items
echo ""
echo "🔍 Searching for Anthropic/Claude items:"
op item list --categories "API Credential" 2>/dev/null | grep -i "anthropic\|claude" || echo "  No items found with 'anthropic' or 'claude'"

# Try to get a generic API Keys item
echo ""
echo "🔑 Looking for generic API Keys items:"
op item list --vault Development 2>/dev/null | grep -i "api"

echo ""
echo "💡 To manually check an item:"
echo "   op item get 'ITEM_NAME' --vault Development"