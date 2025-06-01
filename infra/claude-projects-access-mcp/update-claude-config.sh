#!/bin/bash

# Update Claude Desktop config to include the Claude Projects Access MCP Server
CLAUDE_CONFIG_PATH="$HOME/.claude/config.json"

if [ ! -f "$CLAUDE_CONFIG_PATH" ]; then
  echo "Claude Desktop configuration file not found at $CLAUDE_CONFIG_PATH"
  exit 1
fi

# Create a backup of the current config
cp "$CLAUDE_CONFIG_PATH" "${CLAUDE_CONFIG_PATH}.bak"
echo "Created backup at ${CLAUDE_CONFIG_PATH}.bak"

# Read current config
config=$(cat "$CLAUDE_CONFIG_PATH")

# Check if the configuration already contains the Claude Projects Access MCP Server
if grep -q "claude-projects-access-mcp" "$CLAUDE_CONFIG_PATH"; then
  echo "Claude Projects Access MCP Server already configured."
  exit 0
fi

# Get the project directory
PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)

# Create updated configuration with the new MCP server
cat > "$CLAUDE_CONFIG_PATH" << EOF
{ 
  "workspace": "/home/ichardart/code", 
  "verbose": true,
  "mcpServers": {
    "claude-projects-access-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "$PROJECT_DIR"
    },
    "Context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", 
        "@modelcontextprotocol/server-filesystem",
        "/home/ichardart"
      ]
    }
  }
}
EOF

echo "Claude Desktop configuration updated successfully!"
