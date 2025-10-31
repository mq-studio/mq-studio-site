# Stagehand Setup Analysis: Local vs Dockerized Environments

## Overview
This analysis compares the Stagehand setup in our MQ Studio project with requirements for dockerized environments, based on our implementation experience.

## What We Did in This Project

### 1. Core Setup Components
- **Package Installation**: `@browserbasehq/stagehand` as npm dependency
- **API Key Management**: 1Password CLI integration for secure secret storage
- **Browser Installation**: Playwright browsers (chromium) with system dependencies
- **Test Structure**: Jest-based test runner with custom configuration
- **Environment Detection**: Scripts adapted for VS Code Dev Containers

### 2. Key Files Created
```
├── scripts/
│   ├── setup-env.sh              # 1Password integration for API keys
│   ├── setup-stagehand.sh        # Automated setup script
├── tests/
│   └── stagehand/
│       ├── homepage-hero.test.js # Actual test implementation
│       └── run-tests.js          # Test runner
├── jest.config.stagehand.js      # Jest configuration
├── .env                          # Environment variables (gitignored)
└── STAGEHAND_SETUP.md           # Documentation
```

## Docker-Specific Requirements

### System Dependencies
In Docker/DevContainer environments, additional system packages are required:

```dockerfile
# Essential browser dependencies
RUN apt-get update && apt-get install -y \
    wget ca-certificates fonts-liberation \
    libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgbm1 libgcc1 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 \
    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    lsb-release xdg-utils
```

### Environment Differences

| Aspect | Local Setup | Docker Setup |
|--------|------------|--------------|
| **Browser Mode** | Can run headed or headless | Headless only |
| **System Deps** | Installed via `playwright install-deps` | Must install manually via apt |
| **1Password CLI** | Direct system integration | Requires volume mount or env vars |
| **File Permissions** | User-level | May need root or specific user |
| **Network Access** | Direct localhost | May need network configuration |

## Automated Setup Script Features

The `setup-stagehand.sh` script we created handles:

1. **Environment Detection**
   ```bash
   detect_environment() {
       if [ -f /.dockerenv ]; then
           echo "docker"
       elif [ -n "$DEVCONTAINER" ]; then
           echo "devcontainer"
       else
           echo "local"
       fi
   }
   ```

2. **Conditional Installation**
   - Installs Node.js in containers
   - Skips browser deps installation on local (uses playwright install-deps)
   - Manually installs all deps in Docker

3. **Secret Management**
   - Attempts 1Password CLI if available
   - Falls back to .env template
   - Provides clear instructions for manual setup

## Key Learnings

### 1. Browser Installation Complexity
- Docker requires explicit system dependency installation
- Playwright's `install-deps` doesn't work in containers
- Must use specific package list for Chromium support

### 2. Headless Limitations
- Docker containers can only run headless mode
- Dev containers same limitation unless X11 forwarding configured
- Local development benefits from headed mode for debugging

### 3. Secret Management Strategy
- 1Password CLI works best for local development
- Docker requires passing secrets via:
  - Environment variables at runtime
  - Docker secrets
  - Mounted .env files
  - Build arguments (not recommended for secrets)

### 4. Network Configuration
- Local: Direct access to localhost:3000
- Docker: May need `--network host` or proper port mapping
- Dev containers: VS Code handles port forwarding automatically

## Recommended Docker Setup

### Dockerfile Example
```dockerfile
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # ... (full dependency list from above)

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application code
COPY . .

# Set environment
ENV HEADLESS=true
ENV NODE_ENV=test

# Run tests
CMD ["npm", "run", "test:stagehand"]
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  stagehand-tests:
    build: .
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - HEADLESS=true
    volumes:
      - ./tests:/app/tests
      - ./test-results:/app/test-results
    network_mode: host
```

## Usage Instructions

### For New Projects
```bash
# 1. Copy the setup script to your project
cp scripts/setup-stagehand.sh /path/to/new/project/

# 2. Run the setup
cd /path/to/new/project
./setup-stagehand.sh

# 3. Add your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# 4. Run tests
npm run test:stagehand
```

### For Docker Projects
```bash
# 1. Include setup script in Dockerfile
COPY setup-stagehand.sh /tmp/
RUN bash /tmp/setup-stagehand.sh

# 2. Pass API key at runtime
docker run -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY my-app-tests
```

## Conclusion

The automated setup script successfully handles both local and dockerized environments by:
1. Detecting the runtime environment
2. Installing appropriate dependencies
3. Configuring tests for headless operation in containers
4. Providing flexible secret management options

This approach makes Stagehand testing portable across different development environments while maintaining security and ease of use.