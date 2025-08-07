#!/bin/bash

# Navigate to MCP servers directory
mkdir -p ~/.local/share/mcp-servers/
cd ~/.local/share/mcp-servers/

# Clone the Crawl4AI MCP server repository
git clone https://github.com/coleam00/mcp-crawl4ai-rag.git
cd mcp-crawl4ai-rag

# Install dependencies
python3 -m venv venv
source venv/bin/activate
python3 -m pip install .
# Deactivate venv for now, server runner will activate it
deactivate

# Create documentation stub
mkdir -p ~/.idp/docs/mcp-servers/
echo "# MCP Server: Crawl4AI
## Purpose: A server for crawling and retrieving AI data
## Version: [commit hash or tag]
## Runtime: Python
## Configuration: Default
## Testing Status: In Progress
## Security Review: Pending" > ~/.idp/docs/mcp-servers/crawl4ai.md

# Update claude_desktop_config.json
# Add server configuration with minimal permissions
mkdir -p ~/.config/claude/
echo '{
  "servers": [
    {
      "name": "Crawl4AI",
      "path": "~/.local/share/mcp-servers/mcp-crawl4ai-rag",
      "permissions": "minimal"
    }
  ]
}' > ~/.config/claude/claude_desktop_config.json

# Document test results and security review
echo "Crawl4AI MCP server installation completed."