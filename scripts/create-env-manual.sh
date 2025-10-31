#!/bin/bash

# Manual environment setup script
# This creates a .env file that you can fill in with your API keys

echo "📝 Creating .env template file..."

cat > .env << 'EOF'
# Stagehand Configuration
# Please add your Anthropic API key here (starts with sk-ant-)
ANTHROPIC_API_KEY=

# Browserbase Configuration (optional, for cloud testing)
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=

# Development Environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ Created .env file"
echo ""
echo "📝 Next steps:"
echo "1. Get your Anthropic API key from 1Password:"
echo "   In a new terminal where you're signed in to 1Password, run:"
echo "   op item get 'Anthropic' --vault Development"
echo ""
echo "2. Edit the .env file and add your API key:"
echo "   nano .env"
echo ""
echo "3. The ANTHROPIC_API_KEY should start with 'sk-ant-'"