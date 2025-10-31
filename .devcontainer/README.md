# MQ Studio Development Container

This directory contains the development container configuration for the MQ Studio website project.

## Features

- **Node.js 22**: Latest LTS version with npm
- **Python 3.11**: For development tools and utilities
- **VS Code Extensions**: Pre-configured with essential extensions
- **Port Forwarding**: Automatic forwarding of development server (port 3100)
- **Auto-setup**: Automated dependency installation and environment setup

## Quick Start

### GitHub Codespaces
1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for the container to build and initialize
3. The development server will start automatically on port 3100

### VS Code with Dev Containers
1. Install the "Dev Containers" extension
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for the container to build and initialize

## Environment Variables

The container automatically loads environment variables from:
- `.env` file (created from secrets)
- `TESTSPRITE_API_KEY` from local environment

For 1Password integration:
1. Install 1Password CLI locally
2. Configure vault items as shown in `secrets.template`
3. The `init-secrets.sh` script will load them automatically

## Available Commands

Once the container is running:

```bash
npm run dev      # Start development server (http://localhost:3100)
npm run build    # Build for production
npm run test     # Run unit tests
npm run lint     # Run ESLint
npm run verify   # Run all checks (lint + test)
```

## Troubleshooting

### Container won't start
- Check Docker is running
- Ensure you have the latest VS Code and Dev Containers extension
- Try "Dev Containers: Rebuild Container"

### Port issues
- The development server runs on port 3100 (not 3000)
- Ports are automatically forwarded in Codespaces
- In local dev containers, access via `http://localhost:3100`

### Dependencies issues
- Run `npm ci` to reinstall dependencies
- Check `requirements.txt` for Python dependencies
- Rebuild container if persistent issues

### Secrets not loading
- Ensure 1Password CLI is installed and configured
- Check vault items match those in `secrets.template`
- Manually create `.env` file if needed

## Files

- `devcontainer.json` - Main container configuration
- `init-secrets.sh` - Secrets initialization script
- `startup.sh` - Startup and setup script
- `secrets.template` - Template for 1Password secrets