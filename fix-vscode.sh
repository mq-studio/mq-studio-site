#!/bin/bash
# VS Code Dev Containers fix script

echo "🔧 Attempting to fix VS Code Dev Containers setup"

# Kill any existing VS Code server processes
echo "Stopping VS Code Server processes..."
pkill -f vscode-server

# Clear VS Code server cache
echo "Clearing VS Code server cache..."
rm -rf ~/.vscode-server/bin/*

# Install Dev Containers extension via direct download
echo "Installing Dev Containers extension..."
mkdir -p ~/.vscode-server/extensions
cd ~/.vscode-server/extensions
curl -L https://marketplace.visualstudio.com/_apis/public/gallery/publishers/ms-vscode-remote/vsextensions/remote-containers/latest/vspackage | \
    tar -xz

# Return to project directory
cd /home/ichardart/code/clients/website-mq-studio

echo "✅ VS Code fix complete!"
echo ""
echo "Next steps:"
echo "1. Run: code ."
echo "2. Wait for VS Code to rebuild server"
echo "3. Press F1 → 'Dev Containers: Reopen in Container'"
echo ""
echo "If this doesn't work, use: ./docker-dev.sh"