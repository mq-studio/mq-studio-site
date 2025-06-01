#!/bin/bash

# Claude Projects Access MCP Server Startup Script
# This script starts the Claude Projects Access MCP Server

echo "Starting Claude Projects Access MCP Server..."

# Change to the directory of this script
cd "$(dirname "$0")"

# Start the server using the simple implementation
node simple-mcp-server.js
