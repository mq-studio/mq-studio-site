# MCP Infrastructure Architecture

## Overview

The MCP (Model Context Protocol) infrastructure is designed with a centralized configuration approach and standardized directory structure. This document outlines the architecture of the consolidated MCP server infrastructure.

## Directory Structure

```
~/code/infra/
├── mcp-servers/             # All MCP servers
│   ├── github-mcp/          # GitHub MCP server
│   ├── weather-mcp/         # Weather MCP server
│   └── claude-task-master/  # Task Master MCP server
├── mcp-server-hub/          # MCP Server Hub
├── mcp-config/              # Configuration management
│   ├── environments/        # Environment-specific configs
│   │   ├── development.json
│   │   ├── testing.json
│   │   └── production.json
│   ├── templates/           # Configuration templates
│   │   ├── claude-config-template.json
│   │   └── mcp-hub-config-template.json
│   └── apply-config.sh      # Configuration application script
├── logs/                    # Centralized logs
├── docs/                    # Documentation
└── transition-plan/         # Migration artifacts
    └── backups/             # Original configuration backups
```

## System Components

### 1. MCP Server Hub

The MCP Server Hub acts as a central coordinator for all MCP servers. It manages server processes, provides a unified API for querying available servers, and handles server lifecycle.

- **Location**: `~/code/infra/mcp-server-hub/`
- **Configuration**: `~/code/infra/mcp-server-hub/config.json`
- **Port**: 3000 (default for development/production), 3001 (testing)

### 2. Individual MCP Servers

#### GitHub MCP Server
- **Purpose**: Provides GitHub integration capabilities through the MCP protocol
- **Location**: `~/code/infra/mcp-servers/github-mcp/`
- **Authentication**: Uses GitHub Personal Access Token

#### Weather MCP Server
- **Purpose**: Provides weather data retrieval capabilities
- **Location**: `~/code/infra/mcp-servers/weather-mcp/`
- **Implementation**: Python-based

#### Task Master MCP Server
- **Purpose**: Provides task management capabilities
- **Location**: `~/code/infra/mcp-servers/claude-task-master/`

### 3. Configuration Management

The infrastructure uses a template-based configuration system with environment-specific variable substitution:

- **Template Files**: Located in `~/code/infra/mcp-config/templates/`
- **Environment Files**: Located in `~/code/infra/mcp-config/environments/`
- **Application Script**: `~/code/infra/mcp-config/apply-config.sh`

### 4. Claude Integration

Claude AI is configured to use the MCP Server Hub and individual MCP servers through:

- **Configuration**: `~/.claude/config.json`

## Authentication and Security

- GitHub MCP uses a GitHub Personal Access Token with the following scopes:
  - repo (Full control of private repositories)
  - read:org (Read organization information)
  - admin:repo_hook (Repository hooks)
  - read:user (Read user profile information)
  - user:email (Access user email addresses)

- Environment-specific tokens are stored in the corresponding environment configuration files

## Network Architecture

- MCP Server Hub listens on port 3000 (default)
- Individual MCP servers use dynamic port assignment managed by the hub
- All communication is localhost-only for security

## Backwards Compatibility

For backwards compatibility with existing tools and scripts, symbolic links are created:

```
~/idp-projects/weather-mcp -> ~/code/infra/mcp-servers/weather-mcp
~/idp-projects/claude-task-master -> ~/code/infra/mcp-servers/claude-task-master
~/idp-projects/mcp-server-hub -> ~/code/infra/mcp-server-hub
```

## Sequence Diagram

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Claude  │     │  MCP Hub    │     │  GitHub MCP  │     │  Weather MCP │
└────┬────┘     └──────┬──────┘     └──────┬───────┘     └──────┬───────┘
     │                 │                   │                    │
     │   1. Request    │                   │                    │
     │─────────────────>                   │                    │
     │                 │                   │                    │
     │                 │  2. Forward Req   │                    │
     │                 │───────────────────>                    │
     │                 │                   │                    │
     │                 │  3. API Response  │                    │
     │                 │<───────────────────                    │
     │                 │                   │                    │
     │ 4. Response     │                   │                    │
     │<─────────────────                   │                    │
     │                 │                   │                    │
```