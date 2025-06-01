# Slack Bot Setup for MCP Server

## Step 1: Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. App Name: "MCP Bot"
5. Select your workspace

## Step 2: Configure Bot Permissions

1. Go to "OAuth & Permissions" in left sidebar
2. Under "Scopes" → "Bot Token Scopes", add:
   - `channels:read` - View basic information about public channels
   - `channels:history` - View messages in public channels
   - `groups:read` - View basic information about private channels  
   - `groups:history` - View messages in private channels
   - `im:read` - View basic information about direct messages
   - `im:history` - View messages in direct messages
   - `mpim:read` - View basic information about group direct messages
   - `mpim:history` - View messages in group direct messages
   - `users:read` - View people in workspace

## Step 3: Install App to Workspace

1. Scroll up to "OAuth Tokens for Your Workspace"
2. Click "Install to Workspace"
3. Authorize the app
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 4: Get Team ID

Method 1 - From Slack App:
1. In your Slack app settings, go to "Basic Information"
2. Find "App Credentials" section
3. Copy the "Verification Token" or check Team ID in workspace settings

Method 2 - From Slack Workspace:
1. Go to your Slack workspace in browser
2. Click workspace name → Settings & Administration → Workspace Settings
3. Team ID is shown in the URL or settings

Method 3 - API Call:
```bash
curl -H "Authorization: Bearer xoxb-your-bot-token" \
  https://slack.com/api/team.info
```

## Environment Variables

Add to development.json:
```json
"SLACK_BOT_TOKEN": "xoxb-your-actual-bot-token-here",
"SLACK_TEAM_ID": "T1234567890",
"SLACK_ENABLED": true
```

## Test the Bot

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_TEAM_ID="your-team-id"
npx -y @modelcontextprotocol/server-slack --help
```

## Required Bot Permissions Summary

- Read channel information and messages
- Read user information
- Access direct messages and group messages
- Basic workspace information

The bot will be read-only for MCP server purposes.