# MCP Server Registry

## Overview

This document maintains a registry of all MCP servers in the infrastructure, their purpose, location, and status.

## MCP Servers

| Server Name | Location | Purpose | Status | Dependencies |
|-------------|----------|---------|--------|--------------|
| MCP Server Hub | ~/code/infra/mcp-server-hub | Coordinates all MCP servers | Active | None |
| GitHub MCP | ~/code/infra/mcp-servers/github-mcp | GitHub integration | Active | GitHub PAT |
| Weather MCP | ~/code/infra/mcp-servers/weather-mcp | Weather data retrieval | Active | Python runtime |
| Task Master MCP | ~/code/infra/mcp-servers/claude-task-master | Task management | Active | None |
| Chrome DevTools MCP | ~/.local/share/mcp-servers/chrome-devtools-mcp | Browser automation & debugging | Partial (pending Chrome install) | Chrome, Xvfb, Node.js 20+ |

## Configuration

| Environment | Hub Port | Log Level | Auto-Start Servers |
|-------------|----------|-----------|-------------------|
| development | 3000 | debug | Yes |
| testing | 3001 | debug | No |
| production | 3000 | error | Yes |

## API Endpoints

All servers are accessible through the MCP Server Hub, which provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| /servers | GET | List all registered servers |
| /server/:id | GET | Get details about a specific server |
| /server/:id/restart | POST | Restart a specific server |

## Authentication

| Server | Authentication Method | Notes |
|--------|----------------------|-------|
| GitHub MCP | GitHub Personal Access Token | Requires specific permissions |
| Weather MCP | None | Public API |
| Task Master MCP | None | Local operation only |
| Chrome DevTools MCP | None | Sandboxed with --isolated flag |

## Maintenance Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Token rotation | Monthly | Rotate GitHub PAT |
| Log rotation | Weekly | Archive and rotate logs |
| Configuration backup | Weekly | Backup all configurations |

## Recent Changes

| Date | Change | Author |
|------|--------|--------|
| 2025-09-29 | Added Chrome DevTools MCP (browser automation) | Claude Code |
| YYYY-MM-DD | Initial consolidation | Richard Hart |

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| GitHub authentication fails | Check token permissions and validity |
| MCP Server Hub fails to start | Check port 3000 is not in use |
| Weather MCP returns errors | Verify Python environment is correctly set up |
| Chrome DevTools MCP fails to start | Ensure Chrome is installed: `sudo apt-get install google-chrome-stable` |
| Xvfb display errors | Check Xvfb is running on :99: `pgrep Xvfb` |