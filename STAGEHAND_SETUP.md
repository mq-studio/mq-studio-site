# Stagehand Testing Setup for MQ Studio

## Overview
Stagehand is an AI-powered browser automation framework that uses natural language to write and run tests. It's built on Playwright but uses AI (Claude) to make tests more resilient and easier to write.

## Why Stagehand for MQ Studio?

1. **Natural Language Tests** - Your specs are already written in plain English
2. **Visual Testing** - Perfect for testing the artistic/visual aspects of the site
3. **Accessibility Testing** - Can verify screen reader compatibility naturally
4. **Dynamic Content** - Handles the "latest content" requirement elegantly
5. **Less Brittle** - Won't break when CSS classes or IDs change

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up 1Password Integration

First, ensure you have 1Password CLI installed:
```bash
# On Ubuntu/WSL
curl -sS https://downloads.1password.com/linux/cli/stable/op_linux_amd64_v2.24.0.tar.gz | tar xz
sudo mv op /usr/local/bin/
```

Create a 1Password item for your API keys:
1. Open 1Password
2. Create a new item called "MQ Studio API Keys" in your "Development" vault
3. Add these fields:
   - `anthropic_api_key`: Your Anthropic API key
   - `browserbase_api_key`: (Optional) For cloud testing
   - `browserbase_project_id`: (Optional) For cloud testing

### 3. Configure Environment
```bash
# Fetch secrets from 1Password and create .env
./scripts/setup-env.sh
```

### 4. Install Playwright Browsers
```bash
npx playwright install
npx playwright install-deps
```

## Running Tests

### Local Testing
```bash
# Run all Stagehand tests
npm run test:stagehand

# Or run directly
node tests/stagehand/run-tests.js
```

### With Next.js Dev Server
```bash
# In terminal 1: Start the dev server
npm run dev

# In terminal 2: Run tests
npm run test:stagehand
```

## Writing New Tests

Stagehand tests use three main functions:

1. **observe()** - Ask if something is visible/present
```javascript
const isVisible = await stagehand.observe('Is the hero section visible?');
```

2. **extract()** - Get structured data from the page
```javascript
const data = await stagehand.extract({
  instruction: 'Find the featured content',
  schema: {
    title: 'string',
    type: 'string'
  }
});
```

3. **act()** - Interact with the page
```javascript
await stagehand.act({
  action: 'click',
  element: 'The Thinking entry point'
});
```

## Test Structure

```
tests/
└── stagehand/
    ├── homepage-hero.test.js     # Hero section tests
    ├── run-tests.js              # Test runner
    └── [future tests...]
```

## CI/CD Integration

For GitHub Actions:
```yaml
- name: Setup 1Password CLI
  uses: 1password/load-secrets-action@v1
  with:
    export-env: true
  env:
    ANTHROPIC_API_KEY: op://Development/MQ Studio API Keys/anthropic_api_key

- name: Run Stagehand Tests
  run: npm run test:stagehand
```

## Troubleshooting

### Missing API Key
```bash
# Check if 1Password CLI is signed in
op account list

# Re-run setup
./scripts/setup-env.sh
```

### Browser Issues
```bash
# Reinstall Playwright browsers
npx playwright install --force
sudo npx playwright install-deps
```

### Test Timeouts
- Increase timeout in `jest.config.stagehand.js`
- Check if dev server is running on port 3000

## Best Practices

1. **Write tests from user perspective** - "Can I see X?" not "Does element #id exist?"
2. **Test user journeys** - Follow the scenarios in your specs
3. **Use extract for complex validation** - Let AI understand the content
4. **Keep schemas simple** - Boolean/string types work best
5. **Run headed mode locally** - Add `headless: false` to debug