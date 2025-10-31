#!/bin/bash

# Automated Stagehand Setup Script for Testing Projects
# This script installs and configures Stagehand for browser automation testing
# Works in both regular and dockerized environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎭 Stagehand Automated Setup Script"
echo "===================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Detect environment
detect_environment() {
    if [ -f /.dockerenv ]; then
        echo "docker"
    elif [ -n "$DEVCONTAINER" ] || [ -n "$REMOTE_CONTAINERS_IPC" ]; then
        echo "devcontainer"
    else
        echo "local"
    fi
}

ENV_TYPE=$(detect_environment)
print_status "Detected environment: $ENV_TYPE"

# Check Node.js installation
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"

        if [ "$ENV_TYPE" = "docker" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
            print_status "Installing Node.js 20..."
            apt-get update
            apt-get install -y curl
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        else
            print_error "Please install Node.js 20+ manually"
            exit 1
        fi
    else
        NODE_VERSION=$(node -v)
        print_status "Node.js found: $NODE_VERSION"
    fi
}

# Install Stagehand
install_stagehand() {
    print_status "Installing Stagehand..."

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_status "Initializing npm project..."
        npm init -y
    fi

    # Install Stagehand
    npm install @browserbasehq/stagehand --save

    # Install testing dependencies
    npm install --save-dev jest @playwright/test dotenv

    print_status "Stagehand installed successfully"
}

# Install Playwright browsers
install_browsers() {
    print_status "Installing Playwright browsers..."

    if [ "$ENV_TYPE" = "docker" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        # Install system dependencies for Docker
        print_status "Installing system dependencies for containerized environment..."
        apt-get update
        apt-get install -y \
            wget \
            ca-certificates \
            fonts-liberation \
            libappindicator3-1 \
            libasound2 \
            libatk-bridge2.0-0 \
            libatk1.0-0 \
            libc6 \
            libcairo2 \
            libcups2 \
            libdbus-1-3 \
            libexpat1 \
            libfontconfig1 \
            libgbm1 \
            libgcc1 \
            libglib2.0-0 \
            libgtk-3-0 \
            libnspr4 \
            libnss3 \
            libpango-1.0-0 \
            libpangocairo-1.0-0 \
            libstdc++6 \
            libx11-6 \
            libx11-xcb1 \
            libxcb1 \
            libxcomposite1 \
            libxcursor1 \
            libxdamage1 \
            libxext6 \
            libxfixes3 \
            libxi6 \
            libxrandr2 \
            libxrender1 \
            libxss1 \
            libxtst6 \
            lsb-release \
            xdg-utils
    fi

    # Install Playwright browsers
    npx playwright install chromium

    if [ "$ENV_TYPE" != "docker" ]; then
        # Install deps for non-Docker environments
        npx playwright install-deps chromium
    fi

    print_status "Browsers installed successfully"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."

    # Check if .env exists
    if [ -f ".env" ]; then
        print_warning ".env file already exists, skipping creation"
    else
        # Check for 1Password CLI
        if command -v op &> /dev/null; then
            print_status "1Password CLI detected, attempting to fetch secrets..."

            # Try to run the existing setup-env.sh if it exists
            if [ -f "scripts/setup-env.sh" ]; then
                bash scripts/setup-env.sh
            else
                # Create basic .env template
                cat > .env.example << 'EOF'
# Stagehand Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Browserbase Configuration for cloud testing
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=

# Development Environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Test Configuration
TEST_TIMEOUT=120000
HEADLESS=true
EOF
                cp .env.example .env
                print_warning "Created .env template. Please add your ANTHROPIC_API_KEY"
            fi
        else
            # Create basic .env template
            cat > .env.example << 'EOF'
# Stagehand Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Browserbase Configuration for cloud testing
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=

# Development Environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Test Configuration
TEST_TIMEOUT=120000
HEADLESS=true
EOF
            cp .env.example .env
            print_warning "Created .env template. Please add your ANTHROPIC_API_KEY"
        fi
    fi
}

# Create test structure
create_test_structure() {
    print_status "Creating test structure..."

    # Create directories
    mkdir -p tests/stagehand

    # Create test runner
    cat > tests/stagehand/run-tests.js << 'EOF'
#!/usr/bin/env node

/**
 * Stagehand Test Runner
 * Executes all Stagehand tests with proper configuration
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

// Validate environment
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('🎭 Running Stagehand Tests...\n');

try {
  // Run tests with Jest
  execSync('npx jest --config jest.config.stagehand.js --verbose', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
}

console.log('\n✅ All tests passed!');
EOF
    chmod +x tests/stagehand/run-tests.js

    # Create Jest config
    cat > jest.config.stagehand.js << 'EOF'
module.exports = {
  testMatch: ['**/tests/stagehand/**/*.test.js'],
  testTimeout: 120000,
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['dotenv/config']
};
EOF

    # Create sample test
    cat > tests/stagehand/sample.test.js << 'EOF'
/**
 * Sample Stagehand Test
 * Demonstrates basic Stagehand functionality
 */

const { Stagehand } = require('@browserbasehq/stagehand');
const { expect } = require('@playwright/test');

require('dotenv').config();

describe('Sample Stagehand Test', () => {
  let stagehand;
  let page;

  beforeAll(async () => {
    stagehand = new Stagehand({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: process.env.ANTHROPIC_MODEL_NAME || 'claude-sonnet-4',
      headless: process.env.HEADLESS !== 'false',
    });

    await stagehand.init();
    page = stagehand.page;
  });

  afterAll(async () => {
    await stagehand.close();
  });

  test('Can navigate to a page and observe content', async () => {
    await page.goto('https://example.com');

    const hasTitle = await stagehand.observe('Is there a heading that says "Example Domain"?');
    expect(hasTitle).toBeTruthy();
  });
});
EOF

    print_status "Test structure created"
}

# Update package.json with scripts
update_package_json() {
    print_status "Updating package.json scripts..."

    # Check if package.json exists
    if [ -f "package.json" ]; then
        # Use Node.js to update package.json
        node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add test scripts
if (!pkg.scripts) pkg.scripts = {};
pkg.scripts['test:stagehand'] = 'node tests/stagehand/run-tests.js';
pkg.scripts['test:stagehand:watch'] = 'npx jest --config jest.config.stagehand.js --watch';
pkg.scripts['test:stagehand:headed'] = 'HEADLESS=false node tests/stagehand/run-tests.js';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✓ package.json updated');
"
    fi
}

# Create documentation
create_docs() {
    print_status "Creating documentation..."

    cat > STAGEHAND_QUICKSTART.md << 'EOF'
# Stagehand Quick Start Guide

## Running Tests

```bash
# Run all tests
npm run test:stagehand

# Run in headed mode (see browser)
npm run test:stagehand:headed

# Run in watch mode
npm run test:stagehand:watch
```

## Writing Tests

Stagehand provides three main methods:

### 1. observe() - Check if something exists
```javascript
const isVisible = await stagehand.observe('Is the login button visible?');
```

### 2. extract() - Get structured data
```javascript
const data = await stagehand.extract({
  instruction: 'Find the product price',
  schema: { price: 'string', currency: 'string' }
});
```

### 3. act() - Interact with the page
```javascript
await stagehand.act({
  action: 'click',
  element: 'The submit button'
});
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Required for AI features
- `ANTHROPIC_MODEL_NAME` - Claude model to use (default: claude-sonnet-4)
- `HEADLESS` - Set to 'false' to see browser
- `TEST_TIMEOUT` - Timeout in milliseconds

## Troubleshooting

1. **Missing API Key**: Add ANTHROPIC_API_KEY to .env
2. **Browser Issues**: Run `npx playwright install --force`
3. **Docker Issues**: Ensure all system deps are installed
EOF

    print_status "Documentation created: STAGEHAND_QUICKSTART.md"
}

# Main execution
main() {
    echo ""

    # Step 1: Check Node.js
    check_node

    # Step 2: Install Stagehand
    install_stagehand

    # Step 3: Install browsers
    install_browsers

    # Step 4: Setup environment
    setup_env

    # Step 5: Create test structure
    create_test_structure

    # Step 6: Update package.json
    update_package_json

    # Step 7: Create documentation
    create_docs

    echo ""
    echo "========================================="
    echo -e "${GREEN}✅ Stagehand setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your ANTHROPIC_API_KEY to .env file"
    echo "2. Run: npm run test:stagehand"
    echo "3. See STAGEHAND_QUICKSTART.md for details"
    echo ""

    if [ "$ENV_TYPE" = "docker" ] || [ "$ENV_TYPE" = "devcontainer" ]; then
        print_warning "Note: Running in $ENV_TYPE environment"
        print_warning "Tests will run in headless mode only"
    fi
}

# Run main function
main