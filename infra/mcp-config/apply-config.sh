#!/bin/bash

ENV=${1:-development}
echo "Applying $ENV configuration..."

# Check if environment file exists
if [ ! -f "/home/ichardart/code/infra/mcp-config/environments/$ENV.json" ]; then
    echo "Error: Environment file $ENV.json does not exist"
    exit 1
fi

# Create directory for Claude config if it doesn't exist
mkdir -p ~/.claude

# Load environment variables from JSON file
ENV_FILE="/home/ichardart/code/infra/mcp-config/environments/$ENV.json"

# Extract values using more reliable jq if available
if command -v jq &> /dev/null; then
    VERBOSE=$(jq -r '.VERBOSE' "$ENV_FILE")
    DEBUG_LEVEL=$(jq -r '.DEBUG_LEVEL' "$ENV_FILE")
    GITHUB_TOKEN=$(jq -r '.GITHUB_TOKEN' "$ENV_FILE")
    PYTHON_PATH=$(jq -r '.PYTHON_PATH' "$ENV_FILE")
    WEATHER_MCP_PATH=$(jq -r '.WEATHER_MCP_PATH' "$ENV_FILE")
    FETCH_MCP_PATH=$(jq -r '.FETCH_MCP_PATH' "$ENV_FILE")
    POSTGRES_CONNECTION_STRING=$(jq -r '.POSTGRES_CONNECTION_STRING' "$ENV_FILE")
    POSTGRES_ENABLED=$(jq -r '.POSTGRES_ENABLED' "$ENV_FILE")
    SLACK_BOT_TOKEN=$(jq -r '.SLACK_BOT_TOKEN' "$ENV_FILE")
    SLACK_TEAM_ID=$(jq -r '.SLACK_TEAM_ID' "$ENV_FILE")
    SLACK_ENABLED=$(jq -r '.SLACK_ENABLED' "$ENV_FILE")
    GDRIVE_OAUTH_PATH=$(jq -r '.GDRIVE_OAUTH_PATH' "$ENV_FILE")
    GDRIVE_CREDENTIALS_PATH=$(jq -r '.GDRIVE_CREDENTIALS_PATH' "$ENV_FILE")
    E2B_API_KEY=$(jq -r '.E2B_API_KEY' "$ENV_FILE")
    E2B_ENABLED=$(jq -r '.E2B_ENABLED' "$ENV_FILE")
    MEMORY_FILE_PATH=$(jq -r '.MEMORY_FILE_PATH' "$ENV_FILE")
    MEMORY_ENABLED=$(jq -r '.MEMORY_ENABLED' "$ENV_FILE")
    HUB_PORT=$(jq -r '.HUB_PORT' "$ENV_FILE")
    LOG_LEVEL=$(jq -r '.LOG_LEVEL' "$ENV_FILE")
    LOG_FILE_PATH=$(jq -r '.LOG_FILE_PATH' "$ENV_FILE")
    SERVERS_AUTO_START=$(jq -r '.SERVERS_AUTO_START' "$ENV_FILE")
else
    # Fallback to grep/sed approach
    VERBOSE=$(grep -o '"VERBOSE":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    DEBUG_LEVEL=$(grep -o '"DEBUG_LEVEL":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    GITHUB_TOKEN=$(grep -o '"GITHUB_TOKEN":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    PYTHON_PATH=$(grep -o '"PYTHON_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    WEATHER_MCP_PATH=$(grep -o '"WEATHER_MCP_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    FETCH_MCP_PATH=$(grep -o '"FETCH_MCP_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    POSTGRES_CONNECTION_STRING=$(grep -o '"POSTGRES_CONNECTION_STRING":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    POSTGRES_ENABLED=$(grep -o '"POSTGRES_ENABLED":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    SLACK_BOT_TOKEN=$(grep -o '"SLACK_BOT_TOKEN":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    SLACK_TEAM_ID=$(grep -o '"SLACK_TEAM_ID":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    SLACK_ENABLED=$(grep -o '"SLACK_ENABLED":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    GDRIVE_OAUTH_PATH=$(grep -o '"GDRIVE_OAUTH_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    GDRIVE_CREDENTIALS_PATH=$(grep -o '"GDRIVE_CREDENTIALS_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    E2B_API_KEY=$(grep -o '"E2B_API_KEY":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    E2B_ENABLED=$(grep -o '"E2B_ENABLED":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    MEMORY_FILE_PATH=$(grep -o '"MEMORY_FILE_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    MEMORY_ENABLED=$(grep -o '"MEMORY_ENABLED":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    HUB_PORT=$(grep -o '"HUB_PORT":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
    LOG_LEVEL=$(grep -o '"LOG_LEVEL":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    LOG_FILE_PATH=$(grep -o '"LOG_FILE_PATH":"[^"]*"' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' "')
    SERVERS_AUTO_START=$(grep -o '"SERVERS_AUTO_START":[^,}]*' "$ENV_FILE" | cut -d ':' -f2 | tr -d ' ,')
fi

# Update Claude configuration
CLAUDE_TEMPLATE="/home/ichardart/code/infra/mcp-config/templates/claude-config-template.json"
CLAUDE_CONFIG_FILE=~/.claude/config.json

# Use temporary file for substitution
cp "$CLAUDE_TEMPLATE" /tmp/claude-config-temp.json
sed -i "s/\${GITHUB_TOKEN}/$GITHUB_TOKEN/g" /tmp/claude-config-temp.json
sed -i "s/\${DEBUG_LEVEL}/$DEBUG_LEVEL/g" /tmp/claude-config-temp.json
sed -i "s/\${VERBOSE}/$VERBOSE/g" /tmp/claude-config-temp.json
sed -i "s#\${PYTHON_PATH}#$PYTHON_PATH#g" /tmp/claude-config-temp.json
sed -i "s#\${WEATHER_MCP_PATH}#$WEATHER_MCP_PATH#g" /tmp/claude-config-temp.json
sed -i "s#\${FETCH_MCP_PATH}#$FETCH_MCP_PATH#g" /tmp/claude-config-temp.json
sed -i "s#\${POSTGRES_CONNECTION_STRING}#$POSTGRES_CONNECTION_STRING#g" /tmp/claude-config-temp.json
sed -i "s#\${SLACK_BOT_TOKEN}#$SLACK_BOT_TOKEN#g" /tmp/claude-config-temp.json
sed -i "s#\${SLACK_TEAM_ID}#$SLACK_TEAM_ID#g" /tmp/claude-config-temp.json
sed -i "s#\${GDRIVE_OAUTH_PATH}#$GDRIVE_OAUTH_PATH#g" /tmp/claude-config-temp.json
sed -i "s#\${GDRIVE_CREDENTIALS_PATH}#$GDRIVE_CREDENTIALS_PATH#g" /tmp/claude-config-temp.json
sed -i "s#\${E2B_API_KEY}#$E2B_API_KEY#g" /tmp/claude-config-temp.json
sed -i "s#\${MEMORY_FILE_PATH}#$MEMORY_FILE_PATH#g" /tmp/claude-config-temp.json
cp /tmp/claude-config-temp.json "$CLAUDE_CONFIG_FILE"

echo "Claude configuration updated at $CLAUDE_CONFIG_FILE"

# Update MCP server hub configuration
HUB_TEMPLATE="/home/ichardart/code/infra/mcp-config/templates/mcp-hub-config-template.json"
HUB_CONFIG_FILE="/home/ichardart/code/infra/mcp-server-hub/config.json"

# Create directory for MCP hub if it doesn't exist
mkdir -p "/home/ichardart/code/infra/mcp-server-hub"

# Use temporary file for substitution
cp "$HUB_TEMPLATE" /tmp/mcp-hub-config-temp.json
sed -i "s/\${GITHUB_TOKEN}/$GITHUB_TOKEN/g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${HUB_PORT}/$HUB_PORT/g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${LOG_LEVEL}/$LOG_LEVEL/g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${LOG_FILE_PATH}#$LOG_FILE_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${SERVERS_AUTO_START}/$SERVERS_AUTO_START/g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${PYTHON_PATH}#$PYTHON_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${WEATHER_MCP_PATH}#$WEATHER_MCP_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${FETCH_MCP_PATH}#$FETCH_MCP_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${POSTGRES_CONNECTION_STRING}#$POSTGRES_CONNECTION_STRING#g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${POSTGRES_ENABLED}/$POSTGRES_ENABLED/g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${SLACK_BOT_TOKEN}#$SLACK_BOT_TOKEN#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${SLACK_TEAM_ID}#$SLACK_TEAM_ID#g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${SLACK_ENABLED}/$SLACK_ENABLED/g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${GDRIVE_OAUTH_PATH}#$GDRIVE_OAUTH_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${GDRIVE_CREDENTIALS_PATH}#$GDRIVE_CREDENTIALS_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${E2B_API_KEY}#$E2B_API_KEY#g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${E2B_ENABLED}/$E2B_ENABLED/g" /tmp/mcp-hub-config-temp.json
sed -i "s#\${MEMORY_FILE_PATH}#$MEMORY_FILE_PATH#g" /tmp/mcp-hub-config-temp.json
sed -i "s/\${MEMORY_ENABLED}/$MEMORY_ENABLED/g" /tmp/mcp-hub-config-temp.json
cp /tmp/mcp-hub-config-temp.json "$HUB_CONFIG_FILE"

echo "MCP Hub configuration updated at $HUB_CONFIG_FILE"

echo "Configuration applied for environment: $ENV"
echo "Please restart MCP Server Hub for changes to take effect."