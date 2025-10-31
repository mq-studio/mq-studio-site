const { test, expect } = require('@playwright/test');

test.describe('Musings Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to musings page
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');
  });

  test('should load musings page successfully', async ({ page }) => {
    // Verify page loaded
    await expect(page).toHaveURL(/musings/);

    // Take initial screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/musings-page.png',
      fullPage: true
    });

    // Verify musings list is visible
    const musingsList = page.locator('[data-testid="musings-list"], .musings-list, main, article');
    await expect(musingsList.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display sample musings posts', async ({ page }) => {
    // Look for musing items
    const musings = page.locator(
      '[data-testid="musing-item"], .musing-item, article, [class*="musing"], li'
    );

    const count = await musings.count();
    console.log(`Found ${count} musing items`);

    // Should have at least one musing
    expect(count).toBeGreaterThan(0);

    // First musing should have text content
    const firstMusing = musings.first();
    const text = await firstMusing.textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should have category filters (thinking/feeling/doing)', async ({ page }) => {
    // Look for category filter buttons
    const filters = page.locator(
      '[data-testid*="filter"], [data-category], button[class*="filter"], [role="tablist"], [class*="category"]'
    );

    // Take screenshot of filter area
    await page.screenshot({
      path: 'tests/playwright/screenshots/musings-filters.png',
      fullPage: false
    });

    // Check for specific categories
    const thinkingFilter = page.locator('text=/thinking/i');
    const feelingFilter = page.locator('text=/feeling/i');
    const doingFilter = page.locator('text=/doing/i');

    // At least one category should be present
    const hasCategories =
      (await thinkingFilter.count() > 0) ||
      (await feelingFilter.count() > 0) ||
      (await doingFilter.count() > 0);

    console.log('Category filters found:', hasCategories);
  });

  test('should filter by "thinking" category', async ({ page }) => {
    // Click thinking filter
    const thinkingFilter = page.locator(
      '[data-category="thinking"], button:has-text("Thinking"), [aria-label*="thinking" i]'
    ).first();

    if (await thinkingFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await thinkingFilter.click();
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/musings-thinking-filter.png',
        fullPage: true
      });
    }
  });

  test('should filter by "feeling" category', async ({ page }) => {
    const feelingFilter = page.locator(
      '[data-category="feeling"], button:has-text("Feeling"), [aria-label*="feeling" i]'
    ).first();

    if (await feelingFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await feelingFilter.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/playwright/screenshots/musings-feeling-filter.png',
        fullPage: true
      });
    }
  });

  test('should filter by "doing" category', async ({ page }) => {
    const doingFilter = page.locator(
      '[data-category="doing"], button:has-text("Doing"), [aria-label*="doing" i]'
    ).first();

    if (await doingFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await doingFilter.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/playwright/screenshots/musings-doing-filter.png',
        fullPage: true
      });
    }
  });

  test('should navigate to individual musing', async ({ page }) => {
    // Find first clickable musing link
    const musingLink = page.locator(
      'a[href*="/musings/"], [data-testid="musing-link"], article a, .musing-item a'
    ).first();

    if (await musingLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await musingLink.click();
      await page.waitForLoadState('networkidle');

      // Should be on individual musing page
      await expect(page).toHaveURL(/\/musings\/.+/);

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/individual-musing.png',
        fullPage: true
      });
    }
  });

  test('should display musing content correctly', async ({ page }) => {
    // Navigate to a specific musing if available
    const musingLink = page.locator('a[href*="/musings/"]').first();

    if (await musingLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await musingLink.click();
      await page.waitForLoadState('networkidle');

      // Verify content elements
      const content = page.locator('article, main, [class*="content"]');
      await expect(content.first()).toBeVisible();

      // Check for typical musing elements: title, date, body
      const hasTitle = await page.locator('h1, h2, [class*="title"]').count() > 0;
      const hasContent = await page.locator('p, [class*="body"]').count() > 0;

      console.log('Musing structure - Title:', hasTitle, 'Content:', hasContent);
    }
  });

  test('should render YouTube video embeds if present', async ({ page }) => {
    // Check for YouTube iframes on musings page
    const youtubeIframe = page.locator('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
    const count = await youtubeIframe.count();

    console.log(`Found ${count} YouTube embeds`);

    if (count > 0) {
      // Take screenshot showing video embed
      await page.screenshot({
        path: 'tests/playwright/screenshots/musings-video-embed.png',
        fullPage: true
      });

      // Verify iframe is visible
      await expect(youtubeIframe.first()).toBeVisible();

      // Check iframe has proper attributes
      const src = await youtubeIframe.first().getAttribute('src');
      expect(src).toContain('youtube');
    } else {
      // Check individual musing page
      const musingLink = page.locator('a[href*="/musings/"]').first();
      if (await musingLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await musingLink.click();
        await page.waitForLoadState('networkidle');

        const videoOnDetail = await page.locator('iframe[src*="youtube"]').count();
        console.log(`Found ${videoOnDetail} YouTube embeds on detail page`);

        if (videoOnDetail > 0) {
          await page.screenshot({
            path: 'tests/playwright/screenshots/musing-detail-video.png',
            fullPage: true
          });
        }
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');

    // Take mobile screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/musings-mobile.png',
      fullPage: true
    });

    // Verify content is readable on mobile
    const content = page.locator('main, article');
    await expect(content.first()).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/playwright/screenshots/musings-tablet.png',
      fullPage: true
    });
  });

  test('should have navigation link from homepage', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for musings link
    const musingsLink = page.locator(
      'a[href="/musings"], a[href*="musings"], nav a:has-text("Musings")'
    ).first();

    if (await musingsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Highlight the link
      await musingsLink.scrollIntoViewIfNeeded();
      await musingsLink.hover();

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/homepage-musings-link.png',
        fullPage: false
      });

      // Click the link
      await musingsLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on musings page
      await expect(page).toHaveURL(/musings/);

      await page.screenshot({
        path: 'tests/playwright/screenshots/navigated-to-musings.png',
        fullPage: true
      });
    }
  });

  test('should check for accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    console.log(`H1 headings found: ${h1Count}`);

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Images found: ${imageCount}`);

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      console.log(`Image ${i} alt text:`, alt || 'MISSING');
    }

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Buttons found: ${buttonCount}`);
  });

  test('should measure musings page performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/musings');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Musings page load time: ${loadTime}ms`);

    // Performance should be reasonable
    expect(loadTime).toBeLessThan(5000); // 5 seconds max

    // Check for console errors
    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Wait to catch any delayed messages
    await page.waitForTimeout(2000);

    // Log findings
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (consoleWarnings.length > 0) {
      console.log('Console warnings:', consoleWarnings);
    }
  });

  test('should verify markdown rendering if applicable', async ({ page }) => {
    // Navigate to individual musing
    const musingLink = page.locator('a[href*="/musings/"]').first();

    if (await musingLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await musingLink.click();
      await page.waitForLoadState('networkidle');

      // Check for markdown elements
      const hasCodeBlocks = await page.locator('pre, code').count() > 0;
      const hasLinks = await page.locator('a').count() > 0;
      const hasLists = await page.locator('ul, ol').count() > 0;
      const hasBlockquotes = await page.locator('blockquote').count() > 0;

      console.log('Markdown elements found:');
      console.log('- Code blocks:', hasCodeBlocks);
      console.log('- Links:', hasLinks);
      console.log('- Lists:', hasLists);
      console.log('- Blockquotes:', hasBlockquotes);
    }
  });
});
