# GitHub MCP Server Setup Instructions

## Current Status
✅ GitHub MCP Server is installed and configured  
⚠️  Requires real GitHub Personal Access Token

## Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Click your profile photo → Settings
   - Left sidebar → Developer settings
   - Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token (classic)"
   - Note: "MCP Server Access"
   - Expiration: Choose appropriate duration

3. **Required Permissions for MCP Server:**
   ```
   ✅ repo                    # Full repository access
   ✅ read:org                # Read organization info
   ✅ read:user               # Read user profile
   ✅ user:email              # Access user email
   ✅ read:project            # Read projects
   ✅ read:discussion         # Read discussions
   ```

4. **Copy the Token:**
   - Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it securely - you won't see it again!

## Step 2: Update Environment Configuration

Replace the placeholder token in your development environment:

```bash
# Edit the development.json file
nano /home/ichardart/code/infra/mcp-config/environments/development.json
```

Update this line:
```json
"GITHUB_TOKEN": "ghp_your_actual_github_token_here"
```

## Step 3: Apply Configuration

```bash
cd /home/ichardart/code/infra/mcp-config
./apply-config.sh development
```

## Step 4: Test GitHub Integration

Once configured, the GitHub MCP server enables:

### Repository Operations:
- Browse repository contents
- Read files and directories
- Search across repositories
- Access commit history

### Issue Management:
- List and read issues
- Search issues by various criteria
- Access issue comments and metadata

### Pull Request Operations:
- List and read pull requests
- Access PR reviews and comments
- Check PR status and merge information

### Organization Access:
- List organization repositories
- Access team information
- Read organization settings

## Step 5: Verify Integration

After applying configuration, test with:
```bash
# This will attempt to use the GitHub MCP server
# (Requires actual token to work)
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
npx -y @modelcontextprotocol/server-github
```

## Security Best Practices:

1. **Minimal Permissions**: Only grant necessary permissions
2. **Token Rotation**: Regularly rotate your tokens
3. **Environment Variables**: Never commit tokens to git
4. **Monitoring**: Monitor token usage in GitHub settings

## Features Available After Setup:

- **Repository Analysis**: AI can analyze your codebase
- **Issue Tracking**: Query and manage GitHub issues
- **Code Search**: Find code patterns across repositories
- **Project Management**: Access GitHub Projects data
- **Collaboration**: Analyze team workflows and contributions

Your GitHub MCP server will provide AI agents with comprehensive GitHub integration capabilities!