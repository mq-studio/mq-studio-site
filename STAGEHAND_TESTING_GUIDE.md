# Stagehand Testing Guide - MQ Studio

A practical guide for writing and running E2E tests using Anthropic's Stagehand with natural language assertions.

## Quick Start Workflow
2
Get tests running immediately:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (1Password CLI required)
cp .env.example .env
op item create --category=login --title="MQ Studio API Keys" \
  anthropic_api_key="your-claude-api-key"

# 3. Start dev server (separate terminal)
npm run dev

# 4. Run existing homepage tests
npm run test:stagehand
```

**Troubleshooting:**
- Ensure localhost:3000 is running before tests
- Check 1Password CLI: `op whoami`
- Tests run in headed mode locally for debugging

## Writing New Test Workflow

Create tests using the 3 core Stagehand functions:

```javascript
// tests/stagehand/your-feature.test.js
const { Stagehand } = require('@browserbasehq/stagehand');

test('Your test description', async () => {
  // 1. OBSERVE - Ask yes/no questions
  const isVisible = await stagehand.observe('Is the contact form visible on the page?');
  expect(isVisible).toBe(true);

  // 2. EXTRACT - Get structured data with schema
  const formData = await stagehand.extract({
    instruction: 'Extract contact form field information',
    schema: {
      nameField: 'string',
      emailField: 'string',
      hasSubmitButton: 'boolean'
    }
  });
  expect(formData.hasSubmitButton).toBe(true);

  // 3. ACT - Perform interactions
  await stagehand.act({
    action: 'type',
    element: 'name field',
    text: 'Test User'
  });
});
```

**Pattern from `tests/stagehand/homepage-hero.test.js`:**
- Use descriptive test names matching acceptance criteria
- Include viewport testing for responsive behavior
- Test keyboard navigation and accessibility
- Extract data with clear schemas before assertions

## Debugging Workflow

When tests fail:

```bash
# 1. Run in headed mode (default locally)
npm run test:stagehand

# 2. Increase timeout for slow elements
# In test file: jest.setTimeout(120000)

# 3. Check API key configuration
op read "op://Development/MQ Studio API Keys/anthropic_api_key"

# 4. Debug specific test
npx jest tests/stagehand/homepage-hero.test.js --verbose
```

**Debugging Tips:**
- Tests run headed locally, headless in CI automatically
- Use `page.waitForLoadState('networkidle')` before assertions
- Break complex extractions into smaller steps
- Stagehand uses Claude 3.5 Sonnet for natural language understanding

## CI/CD Workflow

Configure for automated pipelines:

```bash
# Environment variables needed in CI
ANTHROPIC_API_KEY=your-api-key
CI=true  # Forces headless mode
NODE_ENV=test
```

**1Password Integration:**
```yaml
# GitHub Actions example
- name: Configure 1Password
  uses: 1password/load-secrets-action@v1
  env:
    ANTHROPIC_API_KEY: op://Development/MQ Studio API Keys/anthropic_api_key
```

**CI Configuration:**
- Tests automatically run headless when `CI=true`
- 60-second timeout configured in `jest.config.stagehand.js`
- JUnit XML reports generated in `./test-results/`
- Requires Chrome/Chromium in CI environment

## Local Development Workflow

Testing during development:

```bash
# Terminal 1: Start dev server with hot reload
npm run dev

# Terminal 2: Run tests (re-run as needed)
npm run test:stagehand

# Watch mode for test development
npx jest tests/stagehand/ --watch
```

**Hot Reload Considerations:**
- Tests navigate to `localhost:3000` by default
- Use `page.waitForLoadState('networkidle')` after navigation
- Dev server changes don't require test restart
- Port conflicts: check Next.js runs on 3000, tests expect same

**Development Tips:**
- Write assertions in natural language like user stories
- Test real user workflows, not implementation details
- Use viewport testing for responsive features
- Reference `tests/stagehand/homepage-hero.test.js` for patterns

## Key Configuration Files

- `jest.config.stagehand.js` - Test runner config with 60s timeout
- `.env` - API keys via 1Password CLI references
- `package.json` - npm scripts for running tests
- Tests use Claude model: configurable via `ANTHROPIC_MODEL_NAME` (defaults to `claude-sonnet-4`)

## Model Configuration Best Practices

**Avoiding Model Deprecation:**
- Use model aliases (`claude-sonnet-4`) instead of specific versions (`claude-3-5-sonnet-20241022`)
- Configure via environment variable: `ANTHROPIC_MODEL_NAME=claude-sonnet-4`
- Available models as of 2025: `claude-opus-4-1`, `claude-sonnet-4`, `claude-3-7-sonnet`
- Update `.env` when new models are released rather than changing code

**Model Selection Guidelines:**
- `claude-sonnet-4` - Best balance of performance and cost for testing
- `claude-opus-4-1` - Most capable model for complex scenarios
- `claude-3-7-sonnet` - Hybrid reasoning model for specialized tasks