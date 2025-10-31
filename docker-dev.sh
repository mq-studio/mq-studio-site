#!/bin/bash
# Pragmatic Docker development script for MQ Studio
# Maintains VS Code compatibility while working around extension issues

echo "🚀 Starting MQ Studio Development Environment"

# Stop any existing containers
docker stop $(docker ps -q --filter ancestor=ubuntu:latest) 2>/dev/null

# Get TestSprite API key from 1Password
export TESTSPRITE_API_KEY=$(op read 'op://Development/Testsprite API/credential' 2>/dev/null)

if [ -z "$TESTSPRITE_API_KEY" ]; then
    echo "⚠️  TestSprite API key not found. Some features will be unavailable."
fi

# Run container with proper mounts and environment
docker run -it --rm \
    --name mq-studio-dev \
    -v $(pwd):/workspaces/website-mq-studio \
    -v $HOME/.config/op:/root/.config/op:ro \
    -v $HOME/.op:/root/.op:ro \
    -e TESTSPRITE_API_KEY="$TESTSPRITE_API_KEY" \
    -e DEVCONTAINER="true" \
    -p 3100:3100 \
    -p 8080:8080 \
    -w /workspaces/website-mq-studio \
    ubuntu:latest \
    bash -c "
        # Install dependencies
        apt-get update && apt-get install -y curl python3-pip git nodejs npm

        # Install TestSprite MCP
        npm install -g @testsprite/testsprite-mcp@latest

        # Install project dependencies
        npm install

        echo '✅ Environment ready!'
        echo '   - Run: npm run dev (for development server)'
        echo '   - Run: npm test:all (for all tests)'
        echo '   - TestSprite is available via MCP'
        echo ''

        # Keep container running with bash
        exec bash
    "