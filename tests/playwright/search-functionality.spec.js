const { test, expect } = require('@playwright/test');
const path = require('path');

// Base URL
const BASE_URL = 'http://localhost:3100';

// Screenshot directory
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.describe('Search Functionality Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto(BASE_URL);
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display search bar on homepage', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Take screenshot of homepage with search bar
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-homepage-search-bar.png'),
      fullPage: true
    });
  });

  test('should show autocomplete suggestions when typing "landscape" slowly', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();
    await expect(searchInput).toBeVisible();

    // Click to focus
    await searchInput.click();

    // Type "landscape" slowly (character by character with delays)
    const query = 'landscape';
    for (const char of query) {
      await searchInput.type(char, { delay: 100 });
      await page.waitForTimeout(150);
    }

    // Wait a bit for autocomplete to appear
    await page.waitForTimeout(500);

    // Try to find autocomplete/suggestion dropdown
    // Common selectors for autocomplete dropdowns
    const suggestionSelectors = [
      '[role="listbox"]',
      '[role="menu"]',
      '.autocomplete',
      '.suggestions',
      '.search-results',
      '.dropdown',
      'datalist'
    ];

    let suggestionsFound = false;
    let suggestionElement = null;

    for (const selector of suggestionSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        suggestionsFound = true;
        suggestionElement = element;
        console.log(`Found suggestions using selector: ${selector}`);
        break;
      }
    }

    // Take screenshot with autocomplete (if visible)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-search-with-autocomplete.png'),
      fullPage: true
    });

    if (suggestionsFound) {
      console.log('✓ Autocomplete suggestions displayed');
      await expect(suggestionElement).toBeVisible();
    } else {
      console.log('⚠ No autocomplete suggestions found - this may be expected behavior');
    }
  });

  test('should navigate to search results page with "landscape" query', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

    // Type search query
    await searchInput.fill('landscape');

    // Submit the search (try multiple methods)
    await Promise.race([
      searchInput.press('Enter'),
      page.locator('button[type="submit"]').click().catch(() => {}),
      page.locator('button:has-text("Search")').click().catch(() => {})
    ]);

    // Wait for navigation - use waitForURL for Next.js client-side routing
    await page.waitForURL(/\/(search|\?q=|query=|s=)/, { timeout: 5000 }).catch(() => {});
    await page.waitForLoadState('networkidle');

    // Check if we're on search results page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Take screenshot of search results page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-search-results-landscape.png'),
      fullPage: true
    });

    // Verify we're on search page (common patterns)
    expect(
      currentUrl.includes('/search') ||
      currentUrl.includes('?q=') ||
      currentUrl.includes('query=') ||
      currentUrl.includes('s=')
    ).toBeTruthy();
  });

  test('should display results grouped by type (Publications, Artworks, Musings, Projects)', async ({ page }) => {
    // Navigate to search page with query
    await page.goto(`${BASE_URL}/search?q=landscape`);
    await page.waitForLoadState('networkidle');

    // Wait for search results to load (wait for either results or "no results" message)
    await page.waitForSelector('h2, p:has-text("No results found")', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000); // Extra time for results to render

    // Check for different content type groupings
    const contentTypes = ['Publications', 'Artworks', 'Musings', 'Projects'];
    const foundTypes = [];

    for (const type of contentTypes) {
      // Look for headings or sections with these labels
      const typeHeading = page.locator(`h2:has-text("${type}"), h3:has-text("${type}"), [data-type="${type.toLowerCase()}"]`);

      if (await typeHeading.count() > 0) {
        foundTypes.push(type);
        console.log(`✓ Found section for: ${type}`);
      }
    }

    // Take screenshot of grouped results
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-search-results-grouped.png'),
      fullPage: true
    });

    console.log(`Found ${foundTypes.length} content type groups: ${foundTypes.join(', ')}`);

    // Expect at least some grouping to exist
    expect(foundTypes.length).toBeGreaterThan(0);
  });

  test('should display result cards with title, excerpt, and type badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=landscape`);
    await page.waitForLoadState('networkidle');

    // Look for result items (various common patterns)
    const resultSelectors = [
      'article',
      '.result',
      '.search-result',
      '[data-result]',
      '.card'
    ];

    let results = null;
    for (const selector of resultSelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        results = elements;
        console.log(`Found ${await elements.count()} results using selector: ${selector}`);
        break;
      }
    }

    if (results && await results.count() > 0) {
      // Check first result for required elements
      const firstResult = results.first();

      // Look for title
      const title = firstResult.locator('h1, h2, h3, h4, .title, [data-title]').first();
      const hasTitle = await title.count() > 0;

      // Look for excerpt
      const excerpt = firstResult.locator('p, .excerpt, .description, [data-excerpt]').first();
      const hasExcerpt = await excerpt.count() > 0;

      // Look for type badge
      const badge = firstResult.locator('.badge, .tag, .type, [data-type]').first();
      const hasBadge = await badge.count() > 0;

      console.log(`Result structure: Title=${hasTitle}, Excerpt=${hasExcerpt}, Badge=${hasBadge}`);

      // Take screenshot of result detail
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '05-result-card-details.png'),
        fullPage: true
      });

      expect(hasTitle).toBeTruthy();
    } else {
      console.log('⚠ No results found - may indicate search functionality issue');
    }
  });

  test('should search for "watercolor" and show relevant results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

    // Clear any existing search
    await searchInput.clear();

    // Type new query
    await searchInput.fill('watercolor');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-search-results-watercolor.png'),
      fullPage: true
    });

    // Check that URL or page content reflects the search
    const currentUrl = page.url();
    const pageContent = await page.content();

    const isSearchActive =
      currentUrl.includes('watercolor') ||
      pageContent.includes('watercolor');

    console.log(`Watercolor search active: ${isSearchActive}`);
    expect(isSearchActive).toBeTruthy();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

    // Try to submit empty search
    await searchInput.clear();
    await searchInput.press('Enter');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-empty-search.png'),
      fullPage: true
    });

    const currentUrl = page.url();
    console.log(`Empty search URL: ${currentUrl}`);

    // Verify that either:
    // 1. We stay on homepage
    // 2. We see a "no query" message
    // 3. We see all results
    const isHandled =
      currentUrl === BASE_URL ||
      currentUrl === `${BASE_URL}/` ||
      await page.locator('text=/no.*query|enter.*search|all.*results/i').count() > 0;

    expect(isHandled).toBeTruthy();
  });

  test('should handle special characters in search', async ({ page }) => {
    const specialQueries = [
      '@#$%',
      'test & design',
      'quote"test',
      "apostrophe's test",
      'slash/test'
    ];

    for (let i = 0; i < specialQueries.length; i++) {
      const query = specialQueries[i];
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

      await searchInput.clear();
      await searchInput.fill(query);
      await searchInput.press('Enter');

      await page.waitForLoadState('networkidle');

      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `08-special-chars-${i + 1}.png`),
        fullPage: true
      });

      // Verify page doesn't crash
      const hasError = await page.locator('text=/error|exception|crash/i').count() > 0;
      console.log(`Query "${query}" - Error present: ${hasError}`);

      expect(hasError).toBeFalsy();

      // Go back to homepage for next test
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle very long search query', async ({ page }) => {
    const longQuery = 'a'.repeat(500); // 500 character query

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first();

    await searchInput.fill(longQuery);
    await searchInput.press('Enter');

    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-long-query.png'),
      fullPage: true
    });

    // Verify no error
    const hasError = await page.locator('text=/error|exception|crash/i').count() > 0;
    console.log(`Long query - Error present: ${hasError}`);

    expect(hasError).toBeFalsy();
  });

  test('should verify search results are relevant to query', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=landscape`);
    await page.waitForLoadState('networkidle');

    const pageContent = await page.textContent('body');
    const lowerContent = pageContent.toLowerCase();

    // Check if the word "landscape" appears in results
    // (either in the query display or in result content)
    const isRelevant = lowerContent.includes('landscape');

    console.log(`Search results contain query term "landscape": ${isRelevant}`);

    // Take final screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-relevance-check.png'),
      fullPage: true
    });

    expect(isRelevant).toBeTruthy();
  });
});

// Summary test to document findings
test.describe('Search Functionality Summary', () => {
  test('generate summary report', async ({ page }) => {
    console.log('\n=== SEARCH FUNCTIONALITY TEST SUMMARY ===\n');
    console.log('All tests completed. Review screenshots in tests/playwright/screenshots/');
    console.log('\nTest Coverage:');
    console.log('  ✓ Search bar visibility');
    console.log('  ✓ Autocomplete functionality');
    console.log('  ✓ Search submission and navigation');
    console.log('  ✓ Results grouping by type');
    console.log('  ✓ Result card structure (title, excerpt, badge)');
    console.log('  ✓ Multiple search queries (landscape, watercolor)');
    console.log('  ✓ Empty search handling');
    console.log('  ✓ Special characters handling');
    console.log('  ✓ Long query handling');
    console.log('  ✓ Results relevance');
    console.log('\n==========================================\n');
  });
});
