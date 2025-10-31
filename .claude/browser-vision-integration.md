# Browser Vision Integration for MQ Studio
**For Claude Code Autonomous Usage**

---

## Available Browser Vision Tools

Claude Code has **THREE browser vision tools** available for autonomous use when working on MQ Studio:

### 1. **Playwright MCP** (Claude Desktop)
**Status:** ✅ Configured in `~/.config/claude/claude_desktop_config.json`

**Autonomous invocation:**
```javascript
// Claude can autonomously use Playwright MCP to:
- Take screenshots of any URL
- Navigate and interact with pages
- Extract DOM elements and content
- Run JavaScript in browser context
- Monitor network requests
- Test responsive layouts
```

**When Claude should use this:**
- "Check how the homepage looks"
- "Take a screenshot of the About page"
- "Verify the navigation menu is working"
- "Test the mobile layout"

**Example autonomous usage pattern:**
```
User: "Make sure the hero section looks good on mobile"

Claude's autonomous process:
1. Use Playwright MCP to navigate to http://localhost:3100
2. Set viewport to mobile (375x667)
3. Take screenshot of hero section
4. Analyze visual layout
5. Report findings and suggest adjustments
```

---

### 2. **Chrome DevTools MCP** (Claude Desktop)
**Status:** ✅ Configured, Chrome installed, Xvfb available

**Autonomous invocation:**
```javascript
// Claude can autonomously use Chrome DevTools to:
- Debug JavaScript errors in real-time
- Monitor console logs
- Profile performance
- Inspect network waterfall
- Analyze memory usage
- Capture HAR files
```

**When Claude should use this:**
- "Debug why the audio player isn't loading"
- "Check for console errors on the Publications page"
- "Profile the page load performance"
- "Find which API calls are slow"

**Example autonomous usage pattern:**
```
User: "The Marginalia component seems slow to render"

Claude's autonomous process:
1. Use Chrome DevTools MCP to open http://localhost:3100
2. Open Performance panel
3. Record page load with Marginalia component
4. Analyze flame graph
5. Identify bottleneck (e.g., expensive layout calculations)
6. Suggest optimization (e.g., use CSS containment)
```

---

### 3. **Stagehand** (Project-Specific, AI-Powered)
**Status:** ✅ Installed in MQ Studio (`@browserbasehq/stagehand@^2.5.0`)

**Location:** `/home/ichardart/code/clients/moura_quayle/website-mq-studio/node_modules/@browserbasehq/stagehand`

**Autonomous invocation:**
```javascript
// Claude can autonomously use Stagehand via test scripts to:
- Use natural language to interact with browser
- Self-healing selectors (adapts to page changes)
- AI-powered visual verification
- Element detection without explicit selectors
- Form filling and interaction
```

**When Claude should use this:**
- "Test the contact form submission"
- "Verify all links in the navigation work"
- "Check that clicking a publication opens the PDF"
- "Test the search functionality"

**Example autonomous usage pattern:**
```
User: "Make sure users can filter publications by tag"

Claude's autonomous process:
1. Write Stagehand test script
2. Run: npm run test:stagehand
3. Stagehand uses AI to:
   - Find tag filter buttons (no hardcoded selectors)
   - Click a tag (e.g., "Governance")
   - Verify publications list updates
   - Screenshot the filtered results
4. Claude analyzes screenshots
5. Report: "✅ Tag filtering works correctly, found 5 governance papers"
```

---

## How Claude Should Choose Which Tool

**Decision Tree for Autonomous Tool Selection:**

```
Task: Visual verification or browser interaction

├─ Need to see static page layout?
│  └─ USE: Playwright MCP
│     └─ Fast screenshots, responsive testing
│
├─ Need to debug runtime errors or performance?
│  └─ USE: Chrome DevTools MCP
│     └─ Console logs, network, performance profiling
│
├─ Need to test user interactions or workflows?
│  └─ USE: Stagehand
│     └─ AI-powered, natural language commands, self-healing
│
└─ Need comprehensive E2E testing?
   └─ USE: Stagehand + Playwright MCP together
      └─ Stagehand for interactions, Playwright for assertions
```

---

## Autonomous Usage Patterns for MQ Studio

### Pattern 1: Visual Layout Verification

**Trigger:** User asks about appearance, styling, or visual layout

**Claude's autonomous workflow:**
```bash
# 1. Start dev server if not running
npm run dev

# 2. Use Playwright MCP to capture screenshots
# (Claude calls Playwright MCP tool internally)
# - Desktop: 1920x1080
# - Tablet: 768x1024
# - Mobile: 375x667

# 3. Analyze screenshots for:
# - Typography hierarchy (Montserrat headings, Lora body)
# - Color palette (Rice Paper, Ink Black, Moura Teal)
# - Spacing consistency (8px base)
# - Responsive breakpoints

# 4. Report findings with visual evidence
```

### Pattern 2: Interactive Component Testing

**Trigger:** User asks to test clicks, forms, navigation, or interactions

**Claude's autonomous workflow:**
```javascript
// 1. Create Stagehand test file
const test = `
const { Stagehand } = require('@browserbasehq/stagehand');

async function testComponent() {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    verbose: 1,
  });

  await stagehand.init();
  await stagehand.page.goto('http://localhost:3100');

  // AI-powered interaction (no selectors needed!)
  await stagehand.act("click on the Publications menu");
  await stagehand.act("filter by tag: Governance");

  // Visual verification
  const screenshot = await stagehand.page.screenshot();

  await stagehand.close();
  return screenshot;
}
`;

// 2. Write test file
// tests/stagehand/auto-generated-test.test.js

// 3. Run test
npm run test:stagehand

// 4. Analyze results and screenshot
```

### Pattern 3: Performance Analysis

**Trigger:** User mentions slow loading, lag, or performance issues

**Claude's autonomous workflow:**
```bash
# 1. Use Chrome DevTools MCP to profile
# (Claude calls Chrome DevTools MCP tool internally)
# - Open page
# - Start performance recording
# - Reload page
# - Stop recording

# 2. Analyze metrics:
# - First Contentful Paint (FCP)
# - Largest Contentful Paint (LCP)
# - Total Blocking Time (TBT)
# - Cumulative Layout Shift (CLS)

# 3. Identify bottlenecks:
# - Large images not optimized
# - Blocking JavaScript
# - Unused CSS
# - Slow API calls

# 4. Suggest optimizations with evidence
```

### Pattern 4: Accessibility Verification

**Trigger:** User asks about accessibility, a11y, keyboard navigation, or screen readers

**Claude's autonomous workflow:**
```javascript
// 1. Use Stagehand to test keyboard navigation
await stagehand.act("press Tab to navigate through links");
await stagehand.act("press Enter on the first publication");

// 2. Use Playwright MCP to run axe-core
const axeResults = await page.evaluate(() => {
  return axe.run();
});

// 3. Analyze ARIA labels and roles
const ariaIssues = axeResults.violations.filter(v =>
  v.id.includes('aria')
);

// 4. Report violations with severity and remediation
```

---

## Configuration for Autonomous Activation

### MQ Studio CLAUDE.md Integration

Add this to `/home/ichardart/code/clients/moura_quayle/website-mq-studio/CLAUDE.md`:

```markdown
## Browser Vision Tools for Autonomous Testing

When working on MQ Studio, Claude Code should autonomously use browser vision tools:

### Automatic Triggers:

1. **Visual verification requests** → Playwright MCP
   - "How does X look?"
   - "Check the layout of Y"
   - "Take a screenshot of Z"

2. **Debugging requests** → Chrome DevTools MCP
   - "Why isn't X working?"
   - "Debug the console errors"
   - "Profile the performance"

3. **Interaction testing** → Stagehand
   - "Test the X form"
   - "Verify clicking Y does Z"
   - "Check all navigation links work"

### Required Environment:

- Dev server running: `npm run dev` (http://localhost:3100)
- Environment variables loaded: ANTHROPIC_API_KEY for Stagehand
- Playwright MCP: Available in Claude Desktop
- Chrome DevTools MCP: Available in Claude Desktop
- Stagehand: Installed in project dependencies

### Examples of Autonomous Usage:

**Example 1: Visual Design Check**
```
User: "Make sure the hero section follows our design system"

Claude autonomously:
1. Checks if dev server is running (npm run dev)
2. Uses Playwright MCP to screenshot hero at localhost:3100
3. Analyzes colors (Rice Paper #FDFCF8, Ink Black #1A1A1A, Moura Teal #00A8A8)
4. Verifies typography (Montserrat headings, Lora body)
5. Checks spacing (8px base rhythm)
6. Reports: "✅ Hero section follows design system" + screenshot
```

**Example 2: Interactive Test**
```
User: "Test that users can play audio in the Musings section"

Claude autonomously:
1. Creates Stagehand test script
2. Runs: npm run test:stagehand
3. Stagehand AI finds play button (no selector needed)
4. Clicks play button
5. Verifies audio element starts playing
6. Takes screenshot showing playing state
7. Reports: "✅ Audio player works correctly" + screenshot
```

**Example 3: Performance Debug**
```
User: "The Publications page loads slowly"

Claude autonomously:
1. Uses Chrome DevTools MCP to profile /publications
2. Identifies: Large PDF thumbnails not lazy-loaded
3. Measures: 3.2s LCP (should be <2.5s)
4. Suggests: Add loading="lazy" to thumbnails
5. Implements fix
6. Re-profiles: 1.8s LCP ✅
7. Reports improvement with before/after metrics
```
```

---

## Test Scripts for Autonomous Invocation

### Stagehand Test Template

Create: `tests/stagehand/template.test.js`

```javascript
/**
 * Template for Claude to autonomously generate Stagehand tests
 *
 * Usage pattern:
 * 1. Claude identifies need for interaction testing
 * 2. Claude generates test based on this template
 * 3. Claude runs: npm run test:stagehand
 * 4. Claude analyzes results
 */

const { Stagehand } = require('@browserbasehq/stagehand');
const { expect } = require('@playwright/test');

describe('Auto-generated test: [COMPONENT_NAME]', () => {
  let stagehand;

  beforeAll(async () => {
    stagehand = new Stagehand({
      env: 'LOCAL',
      verbose: 1,
      debugDom: true,
    });
    await stagehand.init();
  });

  afterAll(async () => {
    await stagehand?.close();
  });

  test('[TEST_DESCRIPTION]', async () => {
    // Navigate
    await stagehand.page.goto('http://localhost:3100[PATH]');

    // AI-powered interaction (natural language)
    await stagehand.act("[ACTION_IN_NATURAL_LANGUAGE]");

    // Visual verification
    const screenshot = await stagehand.page.screenshot({
      path: `./tests/stagehand/screenshots/[TEST_NAME].png`,
      fullPage: true,
    });

    // Assertion
    const element = await stagehand.page.$('[EXPECTED_ELEMENT]');
    expect(element).toBeTruthy();

    // Extract data if needed
    const extractedData = await stagehand.extract({
      instruction: "Extract [WHAT_TO_EXTRACT]",
    });

    console.log('Test results:', extractedData);
  });
});
```

### Quick Visual Check Script

Create: `scripts/visual-check.js` (for Claude's autonomous use)

```javascript
#!/usr/bin/env node

/**
 * Quick visual verification script for Claude Code autonomous usage
 *
 * Usage: node scripts/visual-check.js <url> <viewport>
 * Example: node scripts/visual-check.js /about mobile
 */

const { chromium } = require('@playwright/test');

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

async function visualCheck(path = '/', viewport = 'desktop') {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORTS[viewport],
  });

  const page = await context.newPage();

  try {
    const url = `http://localhost:3100${path}`;
    console.log(`📸 Capturing ${viewport} screenshot of ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });

    const screenshotPath = `./screenshots/${viewport}-${path.replace(/\//g, '-') || 'home'}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved: ${screenshotPath}`);

    // Extract key visual metrics
    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      imageCount: document.querySelectorAll('img').length,
      linkCount: document.querySelectorAll('a').length,
    }));

    console.log('Page metrics:', metrics);

    return { screenshot: screenshotPath, metrics };
  } finally {
    await browser.close();
  }
}

// CLI invocation
const [,, path, viewport] = process.argv;
visualCheck(path, viewport).catch(console.error);
```

---

## Enabling Autonomous Browser Vision

### Step 1: Ensure Dev Server is Running

Claude should check and start if needed:

```bash
# Check if dev server is running
curl -s http://localhost:3100 > /dev/null && echo "✅ Dev server running" || npm run dev &
```

### Step 2: Environment Variables

Stagehand requires ANTHROPIC_API_KEY:

```bash
# Claude should verify before using Stagehand
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  Stagehand requires ANTHROPIC_API_KEY"
  echo "Run: ./scripts/setup-env.sh"
  exit 1
fi
```

### Step 3: MCP Tools Availability

Claude Desktop must be restarted after adding Playwright MCP:

```
⚠️  USER ACTION REQUIRED:
1. Restart Claude Desktop to load Playwright MCP
2. Verify in Claude Desktop: "I can now use Playwright MCP"
```

---

## Testing the Integration

### Manual Test (for user to verify)

```bash
# Test Playwright MCP (in Claude Desktop)
# Say: "Take a screenshot of https://example.com"

# Test Stagehand (in MQ Studio)
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npm run dev &
npm run test:stagehand

# Test Chrome DevTools MCP (in Claude Desktop)
# Say: "Open Chrome DevTools on localhost:3100 and show console logs"
```

### Autonomous Test (Claude should do this)

```javascript
// Claude's self-test workflow
async function testBrowserVisionIntegration() {
  // Test 1: Playwright MCP
  console.log('Testing Playwright MCP...');
  // Call Playwright MCP tool to screenshot example.com

  // Test 2: Chrome DevTools MCP
  console.log('Testing Chrome DevTools MCP...');
  // Call Chrome DevTools MCP to get console logs

  // Test 3: Stagehand
  console.log('Testing Stagehand...');
  // Run: npm run test:stagehand

  console.log('✅ All browser vision tools operational');
}
```

---

## Troubleshooting for Autonomous Operation

### Issue: "Playwright MCP not found"
**Claude's autonomous fix:**
```bash
# Verify installation
test -f /home/ichardart/code/node_modules/@playwright/mcp/index.js && echo "✅ Found" || npm install @playwright/mcp
```

### Issue: "Chrome DevTools MCP timeout"
**Claude's autonomous fix:**
```bash
# Check Xvfb is running
pgrep Xvfb > /dev/null || Xvfb :99 -screen 0 1920x1080x24 &
sleep 2

# Verify Chrome
google-chrome --version
```

### Issue: "Stagehand missing ANTHROPIC_API_KEY"
**Claude's autonomous fix:**
```bash
# Guide user to set up env
echo "⚠️  Run: ./scripts/setup-env.sh to configure environment"
echo "Or manually set ANTHROPIC_API_KEY in .env"
```

---

## Summary: Autonomous Usage Checklist

When Claude Code works on MQ Studio, it should autonomously:

- ✅ Check if dev server is running (start if needed)
- ✅ Choose appropriate tool (Playwright MCP / Chrome DevTools / Stagehand)
- ✅ Execute visual verification or testing
- ✅ Analyze screenshots and metrics
- ✅ Report findings with visual evidence
- ✅ Suggest fixes based on visual analysis
- ✅ Re-test after implementing fixes

**No manual intervention required** - Claude should handle the entire workflow autonomously.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Status:** Ready for Autonomous Use
