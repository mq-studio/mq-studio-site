# Browser Vision Examples for Claude Desktop
**Using bash_tool + Playwright (Works Immediately)**

---

## Overview

While waiting for Playwright MCP and Chrome DevTools MCP to appear in Claude Desktop, you can use browser vision **right now** via Claude Desktop's built-in `bash_tool` (Linux Container Tools).

**How it works:**
1. Claude Desktop has bash_tool capability
2. bash_tool can execute commands in WSL2
3. Playwright is already installed in MQ Studio
4. Claude can write and execute Playwright scripts on the fly

---

## Example 1: Basic Screenshot

**Ask Claude Desktop:**
```
Take a screenshot of the MQ Studio homepage at localhost:3100
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100");
  await page.screenshot({ path: "homepage-screenshot.png", fullPage: true });
  await browser.close();
  console.log("Screenshot saved to homepage-screenshot.png");
})();
'
```

---

## Example 2: Mobile Viewport Screenshot

**Ask Claude Desktop:**
```
Take a mobile screenshot of localhost:3100 (iPhone 13 Pro viewport)
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium, devices } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(devices["iPhone 13 Pro"]);
  const page = await context.newPage();
  await page.goto("http://localhost:3100");
  await page.screenshot({ path: "mobile-screenshot.png", fullPage: true });
  await browser.close();
  console.log("Mobile screenshot saved");
})();
'
```

---

## Example 3: Test Navigation

**Ask Claude Desktop:**
```
Test clicking the Publications menu item and take a screenshot of the result
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100");

  // Click Publications menu
  await page.click("a[href=\"/publications\"]");
  await page.waitForLoadState("networkidle");

  await page.screenshot({ path: "publications-page.png", fullPage: true });
  await browser.close();
  console.log("Navigation test complete");
})();
'
```

---

## Example 4: Capture Console Logs

**Ask Claude Desktop:**
```
Load localhost:3100 and show me any console errors or warnings
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const messages = [];
  page.on("console", msg => {
    messages.push({ type: msg.type(), text: msg.text() });
  });

  await page.goto("http://localhost:3100");
  await page.waitForLoadState("networkidle");

  console.log("Console messages:");
  messages.forEach(m => console.log(`[${m.type}] ${m.text}`));

  await browser.close();
})();
'
```

---

## Example 5: Test Responsive Layouts

**Ask Claude Desktop:**
```
Test the homepage layout at desktop, tablet, and mobile viewports
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const viewports = [
    { name: "desktop", width: 1920, height: 1080 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:3100");
    await page.screenshot({
      path: `homepage-${vp.name}.png`,
      fullPage: true
    });
    console.log(`Screenshot saved: homepage-${vp.name}.png`);
  }

  await browser.close();
})();
'
```

---

## Example 6: Test Form Interaction

**Ask Claude Desktop:**
```
Test the search functionality on localhost:3100
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100");

  // Fill search input
  await page.fill("input[type=\"search\"]", "landscape architecture");
  await page.screenshot({ path: "search-filled.png" });

  // Submit search
  await page.press("input[type=\"search\"]", "Enter");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "search-results.png", fullPage: true });

  console.log("Search test complete");
  await browser.close();
})();
'
```

---

## Example 7: Performance Testing

**Ask Claude Desktop:**
```
Measure page load time for localhost:3100
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const startTime = Date.now();
  await page.goto("http://localhost:3100");
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - startTime;

  console.log(`Page load time: ${loadTime}ms`);

  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const perf = performance.timing;
    return {
      domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
      fullyLoaded: perf.loadEventEnd - perf.navigationStart
    };
  });

  console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
  console.log(`Fully Loaded: ${metrics.fullyLoaded}ms`);

  await browser.close();
})();
'
```

---

## Example 8: Accessibility Testing

**Ask Claude Desktop:**
```
Check for accessibility issues on localhost:3100
```

**Claude will use bash_tool to run:**
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3100");

  // Check for common accessibility issues
  const issues = await page.evaluate(() => {
    const results = [];

    // Check for images without alt text
    document.querySelectorAll("img:not([alt])").forEach(img => {
      results.push(`Missing alt text: ${img.src}`);
    });

    // Check for headings order
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    // (add heading order validation logic)

    return results;
  });

  console.log("Accessibility issues found:");
  issues.forEach(issue => console.log(`- ${issue}`));

  await browser.close();
})();
'
```

---

## Tips for Using bash_tool with Playwright

### 1. Always specify working directory
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
```

### 2. Use single-line Node.js execution
```bash
node -e 'YOUR_SCRIPT_HERE'
```

### 3. Escape quotes properly
- Use double quotes for outer shell command
- Use escaped double quotes `\"` inside JavaScript

### 4. Save screenshots to project directory
```javascript
await page.screenshot({ path: "test-screenshot.png" });
```
Screenshots save to: `/home/ichardart/code/clients/moura_quayle/website-mq-studio/`

### 5. Use async IIFE pattern
```javascript
(async () => {
  // Your Playwright code here
})();
```

---

## Natural Language Commands

You can ask Claude Desktop in natural language, and it will translate to the appropriate bash_tool + Playwright command:

| What You Ask | What Claude Does |
|--------------|-----------------|
| "Screenshot the homepage" | Launches Playwright, captures full page screenshot |
| "Test on mobile" | Uses device emulation, captures mobile screenshot |
| "Click the menu" | Executes click action, waits for result |
| "Check console errors" | Captures console logs, filters for errors |
| "Test form submission" | Fills form, submits, captures result |
| "Measure load time" | Uses Performance API, reports metrics |

---

## Advantages of bash_tool Method

✅ **Works immediately** - No MCP server configuration needed
✅ **Uses subscription credits** - No separate API billing
✅ **Full Playwright power** - All Playwright features available
✅ **Natural language** - Ask in plain English, Claude translates
✅ **Already installed** - Playwright is in MQ Studio dependencies

---

## When MCP Servers Are Working

Once Playwright MCP and Chrome DevTools MCP appear in Claude Desktop, you can use simpler commands:

**With MCP servers:**
```
"Take a screenshot of localhost:3100"
```

**With bash_tool (current method):**
```
"Use Playwright to take a screenshot of localhost:3100"
```

Both achieve the same result - MCP servers are just slightly more convenient!

---

**Recommendation:** Start using bash_tool method now for immediate browser vision capability!
