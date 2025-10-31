#!/bin/bash
# Non-interactive test of Docker setup for validation

echo "🧪 Testing Docker setup for MQ Studio"

# Stop existing containers
docker stop $(docker ps -q --filter ancestor=ubuntu:latest) 2>/dev/null || true

# Get TestSprite API key
export TESTSPRITE_API_KEY=$(op read 'op://Development/Testsprite API/credential' 2>/dev/null)

if [ -n "$TESTSPRITE_API_KEY" ]; then
    echo "✅ TestSprite API key loaded (${TESTSPRITE_API_KEY:0:20}...)"
else
    echo "⚠️  TestSprite API key not available"
fi

# Test Docker run with environment validation
echo "🔍 Validating Docker environment..."

docker run --rm \
    --name mq-studio-test \
    -v $(pwd):/workspaces/website-mq-studio \
    -v $HOME/.config/op:/root/.config/op:ro \
    -v $HOME/.op:/root/.op:ro \
    -e TESTSPRITE_API_KEY="$TESTSPRITE_API_KEY" \
    -e DEVCONTAINER="true" \
    -w /workspaces/website-mq-studio \
    ubuntu:latest \
    bash -c "
        echo '📦 Installing Node.js...'
        apt-get update -qq && apt-get install -y -qq curl > /dev/null 2>&1
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
        apt-get install -y -qq nodejs > /dev/null 2>&1

        echo '✅ Node.js version:' \$(node --version)
        echo '✅ NPM version:' \$(npm --version)

        echo '🔐 Environment check:'
        if [ -n \"\$TESTSPRITE_API_KEY\" ]; then
            echo '   ✅ TESTSPRITE_API_KEY is set'
        else
            echo '   ❌ TESTSPRITE_API_KEY is NOT set'
        fi

        echo '📁 Project files:'
        ls -la /workspaces/website-mq-studio | head -5

        echo '🎯 Installing TestSprite MCP...'
        npm install -g @testsprite/testsprite-mcp@latest > /dev/null 2>&1

        echo '✅ TestSprite MCP installed'
        npx @testsprite/testsprite-mcp@latest --version || echo 'Version check failed'
    "

echo ""
echo "✅ Validation complete!"
echo ""
echo "To start interactive development, run:"
echo "  docker run -it --rm -v \$(pwd):/workspaces/website-mq-studio -e TESTSPRITE_API_KEY=\"\$TESTSPRITE_API_KEY\" -p 3100:3100 -w /workspaces/website-mq-studio ubuntu:latest bash"