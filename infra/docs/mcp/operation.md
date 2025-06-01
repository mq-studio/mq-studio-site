# MCP Infrastructure Operation Guide

## Overview

This guide covers the day-to-day operations of the MCP infrastructure, including startup, shutdown, monitoring, and troubleshooting.

## Starting the Infrastructure

### Using the Master Startup Script

The simplest way to start the entire MCP infrastructure is using the master startup script:

```bash
~/code/infra/start-mcp-infrastructure.sh [environment]
```

Where `[environment]` is optional and defaults to `development`.

This script:
1. Applies the specified environment configuration
2. Starts the MCP Server Hub
3. Verifies the hub is running
4. Displays available servers

### Starting Individual Components

If you need to start components individually:

1. **Apply Configuration**:
   ```bash
   ~/code/infra/mcp-config/apply-config.sh [environment]
   ```

2. **Start MCP Server Hub**:
   ```bash
   cd ~/code/infra/mcp-server-hub
   ./start.sh
   ```

3. **Verify Hub Status**:
   ```bash
   curl http://localhost:3000/servers
   ```

## Managing Environments

### Switching Environments

To switch between environments (e.g., from development to production):

```bash
~/code/infra/mcp-config/apply-config.sh production
```

After switching, restart the MCP Server Hub:

```bash
# Find and kill the current hub process
ps aux | grep mcp-server-hub
kill [PID]

# Start the hub with the new configuration
cd ~/code/infra/mcp-server-hub
./start.sh
```

### Environment-Specific Behavior

Each environment configures different behaviors:

- **Development**: Verbose logging, full debugging, auto-start servers
- **Testing**: Runs on port 3001, verbose logging, servers do not auto-start
- **Production**: Minimal logging, only errors reported, auto-start servers

## Monitoring

### Checking Server Status

To see all available MCP servers and their status:

```bash
curl http://localhost:3000/servers
```

### Viewing Logs

Logs are centralized in the `/home/ichardart/code/infra/logs/` directory:

- MCP Hub logs: `~/code/infra/logs/mcp-hub.log` (or as configured)
- Infrastructure startup logs: `~/code/infra/logs/mcp-infrastructure.log`

To view logs in real-time:

```bash
tail -f ~/code/infra/logs/mcp-hub.log
```

## Troubleshooting

### Common Issues

#### MCP Server Hub Not Starting

If the MCP Server Hub fails to start:

1. Check if it's already running:
   ```bash
   ps aux | grep mcp-server-hub
   ```

2. Check the log file for errors:
   ```bash
   tail ~/code/infra/logs/mcp-hub.log
   ```

3. Verify the configuration is valid:
   ```bash
   cat ~/code/infra/mcp-server-hub/config.json
   ```

#### GitHub Authentication Issues

If GitHub MCP authentication fails:

1. Check the GitHub token in the environment configuration:
   ```bash
   cat ~/code/infra/mcp-config/environments/development.json | grep GITHUB_TOKEN
   ```

2. Verify the token has the required permissions
3. Test the token with a direct API call:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

#### General Debugging

For general debugging:

1. Switch to development environment:
   ```bash
   ~/code/infra/mcp-config/apply-config.sh development
   ```

2. Restart the infrastructure:
   ```bash
   ~/code/infra/start-mcp-infrastructure.sh development
   ```

3. Check the detailed logs

## Backup and Recovery

### Creating Backups

To create a backup of the current configuration:

```bash
mkdir -p ~/code/infra/backups/$(date +%Y-%m-%d)
cp ~/.claude/config.json ~/code/infra/backups/$(date +%Y-%m-%d)/
cp ~/code/infra/mcp-server-hub/config.json ~/code/infra/backups/$(date +%Y-%m-%d)/
```

### Restoring from Backup

To restore from a backup:

```bash
cp ~/code/infra/backups/YYYY-MM-DD/config.json ~/.claude/config.json
cp ~/code/infra/backups/YYYY-MM-DD/config.json ~/code/infra/mcp-server-hub/config.json
```

## Updating MCP Servers

### GitHub MCP

To update the GitHub MCP server:

```bash
# Update the npm package
npm update -g @modelcontextprotocol/server-github
```

### Custom MCP Servers

For custom MCP servers (like weather-mcp):

1. Pull the latest code:
   ```bash
   cd ~/code/infra/mcp-servers/weather-mcp
   git pull origin main
   ```

2. Update dependencies if needed:
   ```bash
   pip install -r requirements.txt
   ```

3. Restart the MCP Server Hub to apply changes

## Maintenance

### Regular Maintenance Tasks

1. **Log Rotation**: Regularly check and rotate logs
   ```bash
   find ~/code/infra/logs -name "*.log" -size +100M
   ```

2. **Configuration Backup**: Weekly configuration backup
   ```bash
   mkdir -p ~/code/infra/backups/weekly/$(date +%Y-%m-%d)
   cp -r ~/.claude ~/code/infra/mcp-server-hub ~/code/infra/backups/weekly/$(date +%Y-%m-%d)/
   ```

3. **Token Rotation**: Regularly rotate GitHub tokens
   - Generate new tokens
   - Update in environment files
   - Apply new configuration