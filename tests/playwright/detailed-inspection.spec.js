const { test, expect } = require('@playwright/test');

test.describe('Detailed Feature Inspection', () => {
  test('inspect publications page DOM structure', async ({ page }) => {
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');

    // Get full page HTML snapshot
    const htmlContent = await page.content();

    // Log key findings
    console.log('\n=== PUBLICATIONS PAGE INSPECTION ===\n');

    // Check for view switcher
    const viewSwitcherHTML = await page.locator('button[data-view], [class*="ViewSwitcher"], .view-').innerHTML().catch(() => null);
    console.log('View Switcher HTML:', viewSwitcherHTML?.substring(0, 500));

    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`\nTotal buttons found: ${buttons.length}`);

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const btn = buttons[i];
      const text = await btn.textContent();
      const classes = await btn.getAttribute('class');
      const dataView = await btn.getAttribute('data-view');
      console.log(`Button ${i}: "${text?.trim()}" | class="${classes}" | data-view="${dataView}"`);
    }

    // Check localStorage
    const viewPreference = await page.evaluate(() => {
      return {
        publicationsView: localStorage.getItem('publicationsView'),
        allKeys: Object.keys(localStorage)
      };
    });
    console.log('\nLocalStorage:', viewPreference);

    // Take detailed screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/detailed-publications-structure.png',
      fullPage: true
    });

    // Get main content area
    const mainContent = page.locator('main, [role="main"]');
    const mainHTML = await mainContent.innerHTML().catch(() => 'Not found');
    console.log('\nMain content (first 1000 chars):', mainHTML.substring(0, 1000));
  });

  test('inspect musings page DOM structure', async ({ page }) => {
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');

    console.log('\n=== MUSINGS PAGE INSPECTION ===\n');

    // Check page structure
    const h1 = await page.locator('h1').textContent().catch(() => 'No H1');
    console.log('H1 heading:', h1);

    // Find all links
    const links = await page.locator('a[href*="/musings/"]').all();
    console.log(`\nMusings links found: ${links.length}`);

    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const link = links[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Link ${i}: ${href} - "${text?.substring(0, 50)}"`);
    }

    // Check for category filters
    const categoryButtons = await page.locator('button').all();
    console.log(`\nTotal buttons on musings page: ${categoryButtons.length}`);

    for (let i = 0; i < categoryButtons.length; i++) {
      const btn = categoryButtons[i];
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      const dataCategory = await btn.getAttribute('data-category');
      console.log(`Button ${i}: "${text?.trim()}" | aria-label="${ariaLabel}" | data-category="${dataCategory}"`);
    }

    // Check for musing items
    const articles = await page.locator('article, [class*="musing"]').all();
    console.log(`\nArticle/musing elements: ${articles.length}`);

    // Take screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/detailed-musings-structure.png',
      fullPage: true
    });

    // Get first musing details
    if (articles.length > 0) {
      const firstArticle = articles[0];
      const articleHTML = await firstArticle.innerHTML();
      console.log('\nFirst article HTML (first 800 chars):', articleHTML.substring(0, 800));
    }
  });

  test('test view switcher interactions step-by-step', async ({ page }) => {
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');

    console.log('\n=== VIEW SWITCHER INTERACTION TEST ===\n');

    // Find view buttons by various methods
    const possibleSelectors = [
      'button[data-view="full"]',
      'button[data-view="moderate"]',
      'button[data-view="compact"]',
      'button[aria-label*="full"]',
      'button[aria-label*="moderate"]',
      'button[aria-label*="compact"]',
      'button:has-text("Full")',
      'button:has-text("Moderate")',
      'button:has-text("Compact")',
      '[role="radiogroup"] button',
      '[role="group"] button'
    ];

    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);

        const elem = page.locator(selector).first();
        const text = await elem.textContent().catch(() => '');
        const ariaLabel = await elem.getAttribute('aria-label').catch(() => null);
        console.log(`  Text: "${text?.trim()}", ARIA: "${ariaLabel}"`);
      }
    }

    // Try to interact with view switcher
    const fullBtn = page.locator('button[data-view="full"], button[aria-label*="Full"]').first();
    const moderateBtn = page.locator('button[data-view="moderate"], button[aria-label*="Moderate"]').first();
    const compactBtn = page.locator('button[data-view="compact"], button[aria-label*="Compact"]').first();

    // Test each button
    for (const [name, btn] of [['Full', fullBtn], ['Moderate', moderateBtn], ['Compact', compactBtn]]) {
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`\n${name} view button is visible, clicking...`);

        await btn.click();
        await page.waitForTimeout(300);

        const localStorage = await page.evaluate(() => window.localStorage.getItem('publicationsView'));
        console.log(`After clicking ${name}: localStorage = "${localStorage}"`);

        // Take screenshot
        await page.screenshot({
          path: `tests/playwright/screenshots/view-${name.toLowerCase()}-clicked.png`,
          fullPage: true
        });
      } else {
        console.log(`${name} view button NOT found or not visible`);
      }
    }
  });

  test('inspect individual musing page', async ({ page }) => {
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');

    console.log('\n=== INDIVIDUAL MUSING PAGE TEST ===\n');

    // Get all musing links
    const links = await page.locator('a[href*="/musings/"]').all();

    if (links.length > 0) {
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      console.log(`Navigating to first musing: ${href}`);

      await firstLink.click();
      await page.waitForLoadState('networkidle');

      const currentURL = page.url();
      console.log(`Current URL: ${currentURL}`);

      // Check for video
      const videoIframe = await page.locator('iframe[src*="youtube"]').count();
      console.log(`YouTube iframes found: ${videoIframe}`);

      // Get page content structure
      const h1 = await page.locator('h1').textContent().catch(() => 'No H1');
      const h2Count = await page.locator('h2').count();
      const pCount = await page.locator('p').count();

      console.log(`H1: "${h1}"`);
      console.log(`H2 count: ${h2Count}`);
      console.log(`Paragraph count: ${pCount}`);

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/individual-musing-detailed.png',
        fullPage: true
      });

      // Get main content
      const mainContent = await page.locator('main, article').first().innerHTML().catch(() => '');
      console.log('\nMain content (first 1000 chars):', mainContent.substring(0, 1000));
    } else {
      console.log('No musing links found to navigate to');
    }
  });

  test('check console messages and errors', async ({ page }) => {
    const messages = {
      log: [],
      warn: [],
      error: []
    };

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'log') messages.log.push(text);
      if (type === 'warning') messages.warn.push(text);
      if (type === 'error') messages.error.push(text);
    });

    // Visit publications page
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== PUBLICATIONS PAGE CONSOLE ===');
    console.log('Logs:', messages.log);
    console.log('Warnings:', messages.warn);
    console.log('Errors:', messages.error);

    // Reset and visit musings
    messages.log = [];
    messages.warn = [];
    messages.error = [];

    await page.goto('/musings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== MUSINGS PAGE CONSOLE ===');
    console.log('Logs:', messages.log);
    console.log('Warnings:', messages.warn);
    console.log('Errors:', messages.error);
  });

  test('performance and network analysis', async ({ page }) => {
    console.log('\n=== PERFORMANCE ANALYSIS ===\n');

    // Publications page
    const pubStart = Date.now();
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');
    const pubLoadTime = Date.now() - pubStart;

    const pubMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart
      };
    });

    console.log('Publications Page:');
    console.log(`  Total load time: ${pubLoadTime}ms`);
    console.log(`  DOM Content Loaded: ${pubMetrics.domContentLoaded}ms`);
    console.log(`  Load Complete: ${pubMetrics.loadComplete}ms`);
    console.log(`  DOM Interactive: ${pubMetrics.domInteractive}ms`);

    // Musings page
    const musStart = Date.now();
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');
    const musLoadTime = Date.now() - musStart;

    const musMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart
      };
    });

    console.log('\nMusings Page:');
    console.log(`  Total load time: ${musLoadTime}ms`);
    console.log(`  DOM Content Loaded: ${musMetrics.domContentLoaded}ms`);
    console.log(`  Load Complete: ${musMetrics.loadComplete}ms`);
    console.log(`  DOM Interactive: ${musMetrics.domInteractive}ms`);
  });
});
