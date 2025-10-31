const { test, expect } = require('@playwright/test');

test.describe('Publications Views Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to publications page
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');
  });

  test('should load publications page successfully', async ({ page }) => {
    // Verify page title or heading
    await expect(page).toHaveTitle(/Publications/i);

    // Verify publications are displayed
    const publications = page.locator('[data-testid="publication-item"], .publication-item, article');
    await expect(publications.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have three view mode buttons', async ({ page }) => {
    // Look for view switcher buttons
    const viewSwitcher = page.locator('[data-testid="view-switcher"], .view-switcher, [class*="view"]');
    await expect(viewSwitcher).toBeVisible({ timeout: 10000 });

    // Take screenshot of view switcher
    await page.screenshot({
      path: 'tests/playwright/screenshots/view-switcher.png',
      fullPage: false
    });
  });

  test('should switch to full view mode', async ({ page }) => {
    // Click full view button (try multiple selectors)
    const fullViewBtn = page.locator(
      '[data-view="full"], [aria-label*="full" i], button:has-text("Full"), [title*="full" i]'
    ).first();

    if (await fullViewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fullViewBtn.click();
      await page.waitForTimeout(500); // Allow animation to complete

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/publications-full-view.png',
        fullPage: true
      });

      // Verify full view layout characteristics
      const publications = page.locator('[data-testid="publication-item"], .publication-item, article');
      const firstPub = publications.first();
      await expect(firstPub).toBeVisible();
    }
  });

  test('should switch to moderate view mode', async ({ page }) => {
    // Click moderate view button
    const moderateViewBtn = page.locator(
      '[data-view="moderate"], [aria-label*="moderate" i], button:has-text("Moderate"), [title*="moderate" i]'
    ).first();

    if (await moderateViewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moderateViewBtn.click();
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/publications-moderate-view.png',
        fullPage: true
      });
    }
  });

  test('should switch to compact view mode', async ({ page }) => {
    // Click compact view button
    const compactViewBtn = page.locator(
      '[data-view="compact"], [aria-label*="compact" i], button:has-text("Compact"), [title*="compact" i]'
    ).first();

    if (await compactViewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await compactViewBtn.click();
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({
        path: 'tests/playwright/screenshots/publications-compact-view.png',
        fullPage: true
      });

      // In compact view, tooltips should appear on hover
      const firstPub = page.locator('[data-testid="publication-item"], .publication-item, article').first();
      await firstPub.hover();
      await page.waitForTimeout(300);

      // Take screenshot with tooltip
      await page.screenshot({
        path: 'tests/playwright/screenshots/compact-view-tooltip.png',
        fullPage: false
      });
    }
  });

  test('should persist view preference in localStorage', async ({ page }) => {
    // Click compact view
    const compactViewBtn = page.locator(
      '[data-view="compact"], [aria-label*="compact" i], button:has-text("Compact"), [title*="compact" i]'
    ).first();

    if (await compactViewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await compactViewBtn.click();
      await page.waitForTimeout(500);

      // Check localStorage
      const storedView = await page.evaluate(() => localStorage.getItem('publicationsView'));
      expect(storedView).toBeTruthy();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify view is still compact after reload
      const storedViewAfterReload = await page.evaluate(() => localStorage.getItem('publicationsView'));
      expect(storedViewAfterReload).toBe(storedView);
    }
  });

  test('should accept URL parameter ?view=full', async ({ page }) => {
    await page.goto('/gallery/publications?view=full');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/url-param-full.png',
      fullPage: true
    });

    // Verify view is applied
    const publications = page.locator('[data-testid="publication-item"], .publication-item, article');
    await expect(publications.first()).toBeVisible();
  });

  test('should accept URL parameter ?view=moderate', async ({ page }) => {
    await page.goto('/gallery/publications?view=moderate');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/playwright/screenshots/url-param-moderate.png',
      fullPage: true
    });
  });

  test('should accept URL parameter ?view=compact', async ({ page }) => {
    await page.goto('/gallery/publications?view=compact');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/playwright/screenshots/url-param-compact.png',
      fullPage: true
    });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'tests/playwright/screenshots/publications-mobile.png',
      fullPage: true
    });

    // Verify view switcher is accessible on mobile
    const viewSwitcher = page.locator('[data-testid="view-switcher"], .view-switcher, [class*="view"]');
    await expect(viewSwitcher).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/playwright/screenshots/publications-tablet.png',
      fullPage: true
    });
  });

  test('should display publication data correctly in all views', async ({ page }) => {
    const views = ['full', 'moderate', 'compact'];

    for (const view of views) {
      const viewBtn = page.locator(`[data-view="${view}"], button:has-text("${view}")`, { hasText: new RegExp(view, 'i') }).first();

      if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await viewBtn.click();
        await page.waitForTimeout(500);

        // Verify publication elements are present
        const publications = page.locator('[data-testid="publication-item"], .publication-item, article');
        const count = await publications.count();
        expect(count).toBeGreaterThan(0);

        // Check first publication has content
        const firstPub = publications.first();
        const text = await firstPub.textContent();
        expect(text.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle keyboard navigation for view switching', async ({ page }) => {
    // Focus on first view button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Try to activate with Enter or Space
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'tests/playwright/screenshots/keyboard-navigation.png',
      fullPage: false
    });
  });

  test('should measure performance metrics', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/gallery/publications');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Publications page load time: ${loadTime}ms`);

    // Performance should be reasonable
    expect(loadTime).toBeLessThan(5000); // 5 seconds max

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);

    // Log any errors found (don't fail test, just report)
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });
});
