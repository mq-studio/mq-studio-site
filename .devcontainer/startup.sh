#!/bin/bash
# Startup script for MQ Studio development environment

set -e

echo "🚀 Starting MQ Studio development environment..."

# Initialize secrets
if [ -f ".devcontainer/init-secrets.sh" ]; then
    chmod +x .devcontainer/init-secrets.sh
    .devcontainer/init-secrets.sh
fi

# Ensure Node modules are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm ci
fi

# Run verification
echo "🔍 Running verification checks..."
npm run verify || echo "⚠️  Verification completed with warnings"

# Show helpful info
echo ""
echo "🎉 MQ Studio is ready for development!"
echo ""
echo "📝 Available commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm run test     - Run unit tests"
echo "  npm run lint     - Run linting"
echo "  npm run verify   - Run all checks"
echo ""
echo "🌐 Development server will start on:"
echo "  http://localhost:3100"
echo ""