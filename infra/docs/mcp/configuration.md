# MCP Infrastructure Configuration Guide

## Overview

This guide explains how to configure the MCP infrastructure using the environment-based configuration system.

## Configuration System

The MCP infrastructure uses a template-based configuration system with environment variables:

1. **Template Files**: Define the structure of configuration with placeholders
2. **Environment Files**: Contain environment-specific values
3. **Application Script**: Substitutes environment values into templates

## Directory Structure

```
~/code/infra/mcp-config/
├── environments/             # Environment-specific variable definitions
│   ├── development.json      # Development environment
│   ├── testing.json          # Testing environment
│   └── production.json       # Production environment
├── templates/                # Configuration templates
│   ├── claude-config-template.json     # Claude configuration
│   └── mcp-hub-config-template.json    # MCP Hub configuration
└── apply-config.sh           # Configuration application script
```

## Environment Configuration Files

Environment configuration files define variables for different operational contexts:

### Structure

Each environment file contains JSON-formatted variable definitions:

```json
{
  "VERBOSE": true,
  "DEBUG_LEVEL": "mcp:*",
  "GITHUB_TOKEN": "ghp_development_token_here",
  "PYTHON_PATH": "/home/ichardart/code/infra/mcp-servers/weather-mcp/venv/bin/python",
  "WEATHER_MCP_PATH": "/home/ichardart/code/infra/mcp-servers/weather-mcp",
  "HUB_PORT": 3000,
  "LOG_LEVEL": "debug",
  "LOG_FILE_PATH": "/home/ichardart/code/infra/logs/mcp-hub.log",
  "SERVERS_AUTO_START": true
}
```

### Available Environments

- **development**: For daily development work (most verbose)
- **testing**: For testing changes before deployment
- **production**: For stable operation (least verbose)

## Configuration Templates

Templates define the structure of configuration files with variable placeholders:

### Claude Configuration Template

Located at `~/code/infra/mcp-config/templates/claude-config-template.json`:

```json
{
  "workspace": "/home/ichardart/code",
  "verbose": "${VERBOSE}",
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}",
        "DEBUG": "${DEBUG_LEVEL}"
      }
    },
    "weather": {
      "command": "${PYTHON_PATH}",
      "args": ["${WEATHER_MCP_PATH}/simple_weather_server.py"],
      "env": {
        "PYTHONPATH": "${WEATHER_MCP_PATH}"
      }
    }
  }
}
```

### MCP Hub Configuration Template

Located at `~/code/infra/mcp-config/templates/mcp-hub-config-template.json`:

```json
{
  "port": ${HUB_PORT},
  "logLevel": "${LOG_LEVEL}",
  "logFile": "${LOG_FILE_PATH}",
  "serversAutoStart": ${SERVERS_AUTO_START},
  "servers": {
    "github": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "weather": {
      "enabled": true,
      "command": "${PYTHON_PATH}",
      "args": ["${WEATHER_MCP_PATH}/simple_weather_server.py"],
      "env": {
        "PYTHONPATH": "${WEATHER_MCP_PATH}"
      }
    }
  }
}
```

## Applying Configurations

### Using the Apply Script

To apply a specific environment configuration:

```bash
~/code/infra/mcp-config/apply-config.sh [environment]
```

Where `[environment]` is one of:
- `development` (default)
- `testing`
- `production`

The script performs the following actions:
1. Loads variables from the specified environment file
2. Applies variable substitution to the Claude configuration template
3. Applies variable substitution to the MCP Hub configuration template
4. Saves the resulting configurations to their respective locations

### Output Locations

The script outputs configurations to:
- Claude configuration: `~/.claude/config.json`
- MCP Hub configuration: `~/code/infra/mcp-server-hub/config.json`

## Customizing Configurations

### Adding a New MCP Server

To add a new MCP server:

1. Update the templates in `~/code/infra/mcp-config/templates/`:
   - Add the server configuration to both template files
2. Update environment files in `~/code/infra/mcp-config/environments/`:
   - Add any server-specific variables needed

### Creating a New Environment

To create a new environment (e.g., "staging"):

1. Create a new file `~/code/infra/mcp-config/environments/staging.json`
2. Define all required variables
3. Apply using `~/code/infra/mcp-config/apply-config.sh staging`

## GitHub Token Configuration

The GitHub MCP server requires a Personal Access Token with specific permissions:

1. Generate a new token at GitHub: Settings → Developer settings → Personal access tokens
2. Required permissions:
   - repo (Full control of private repositories)
   - read:org (Read organization information)
   - admin:repo_hook (Repository hooks)
   - read:user (Read user profile information)
   - user:email (Access user email addresses)
3. Update the token in each environment file:
   ```json
   {
     "GITHUB_TOKEN": "ghp_your_new_token_here"
   }
   ```
4. Apply the updated configuration