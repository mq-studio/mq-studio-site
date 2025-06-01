# Claude Projects Access MCP Server

## Overview

The Claude Projects Access MCP Server provides a seamless way for Claude Desktop to access all your previous projects and chats. This server integrates with your existing MCP infrastructure and exposes tools that allow Claude to search, retrieve, and analyze your conversation history.

## Features

- **Project Listing**: View all available Claude projects
- **Project Details**: Get comprehensive information about specific projects
- **Chat Access**: Access the content of individual chats within projects
- **Search Capability**: Search across all projects and chats for specific content
- **WSL Integration**: Specially adapted to work with your WSL environment structure

## Installation

The server is already installed and configured in your development environment at:
```
/home/ichardart/code/infra/claude-projects-access-mcp
```

## Configuration

To update your Claude Desktop configuration to include this MCP server, run:

```bash
./update-claude-config.sh
```

This will automatically add the server to your ~/.claude/config.json file.

## Usage

### Starting the Server

To start the Claude Projects Access MCP Server:

```bash
./start-server.sh
```

Or manually:

```bash
cd /home/ichardart/code/infra/claude-projects-access-mcp
node dist/index.js
```

### Using with Claude Desktop

Once the server is running and configured, Claude will have access to all your projects and chats. You can ask questions like:

- "Show me my recent projects"
- "Find all chats related to [topic]"
- "Retrieve the conversation where we discussed [specific content]"
- "Search across all my chats for mentions of [keyword]"

## Available MCP Tools

The server exposes the following tools to Claude:

1. `list_claude_projects`: Lists all available Claude Projects
2. `get_claude_project`: Gets details about a specific Claude Project
3. `list_project_chats`: Lists all chats in a Claude Project
4. `get_chat`: Gets the content of a specific chat
5. `search_projects`: Searches across all Claude Projects and chats

## Integration with Development Environment

This server is part of the broader Development Environment Optimization Project and is designed to work with your existing MCP infrastructure, including:

- Environment Validator MCP Server
- Plumber Data Server
- Future MCP Server Hub (when implemented)

## Troubleshooting

- If Claude can't access your projects, ensure the server is running
- If you change the location of your Claude projects, update the `getClaudeProjectsPath()` method
- Check the console output for any error messages when starting the server

## Development

The server is implemented in TypeScript and uses the MCP SDK to expose tools to Claude Desktop.

To build the server after making changes:

```bash
npm run build
```

To run in development mode with automatic reloading:

```bash
npm run dev
```
