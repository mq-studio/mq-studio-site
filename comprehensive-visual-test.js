const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3100';
const SCREENSHOT_DIR = '/tmp/mq-website-testing';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  issues: []
};

function logTest(name, status, details = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${name}`);
  console.log(`STATUS: ${status}`);
  if (details.description) console.log(`DESCRIPTION: ${details.description}`);
  if (details.issues) {
    console.log(`ISSUES FOUND:`);
    details.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  console.log(`${'='.repeat(60)}\n`);

  testResults.tests.push({ name, status, ...details });
  if (details.issues) {
    testResults.issues.push(...details.issues.map(i => ({ test: name, issue: i })));
  }
}

async function checkElementExists(page, selector, name) {
  const element = await page.locator(selector).first();
  const exists = await element.count() > 0;
  if (exists) {
    const isVisible = await element.isVisible().catch(() => false);
    return { exists: true, visible: isVisible };
  }
  return { exists: false, visible: false };
}

async function getColorValue(page, selector, property = 'color') {
  try {
    const element = await page.locator(selector).first();
    const color = await element.evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop);
    }, property);
    return color;
  } catch (error) {
    return null;
  }
}

(async () => {
  console.log('Starting MQ Studio Visual Testing Suite...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshot Directory: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ========================================
    // TEST 1: HOMEPAGE TESTING
    // ========================================
    logTest('Homepage Testing', 'RUNNING', { description: 'Testing homepage layout, colors, and elements' });

    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Take full-page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-homepage-full.png'),
      fullPage: true
    });

    const issues = [];

    // Check header
    const headerCheck = await checkElementExists(page, 'header', 'Header');
    if (!headerCheck.exists) issues.push('Header element not found');

    // Check for "MQ STUDIO" text
    const headerText = await page.textContent('header').catch(() => '');
    if (!headerText.includes('MQ STUDIO')) {
      issues.push('Header does not contain "MQ STUDIO" text');
    }

    // Check for watercolor texture overlay (canvas with low opacity)
    const canvasCheck = await page.locator('canvas').count();
    console.log(`Canvas elements found: ${canvasCheck}`);

    if (canvasCheck > 0) {
      const canvasOpacity = await page.locator('canvas').first().evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      console.log(`Canvas opacity: ${canvasOpacity}`);
      if (parseFloat(canvasOpacity) > 0.05) {
        issues.push(`Watercolor canvas opacity is ${canvasOpacity} (expected ~0.03)`);
      }
    } else {
      issues.push('Watercolor texture canvas not found');
    }

    // Check for Feeling section with magenta color
    const feelingSection = await page.locator('text=Feeling').first();
    if (await feelingSection.count() > 0) {
      await feelingSection.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02-homepage-feeling-section.png')
      });

      // Check for magenta color (#D33479)
      const sectionColor = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const magentaElements = elements.filter(el => {
          const style = window.getComputedStyle(el);
          const color = style.color || style.backgroundColor || '';
          return color.includes('211, 52, 121') || // rgb(211, 52, 121)
                 color.toLowerCase().includes('#d33479');
        });
        return magentaElements.length > 0;
      });

      if (!sectionColor) {
        issues.push('Magenta color (#D33479) not found in Feeling section');
      }
    } else {
      issues.push('Feeling section not found');
    }

    // Check navigation links
    const navLinks = ['Artworks', 'Publications', 'Search'];
    for (const link of navLinks) {
      const linkExists = await checkElementExists(page, `a:has-text("${link}")`, link);
      if (!linkExists.exists) {
        issues.push(`Navigation link "${link}" not found`);
      }
    }

    // Check for three sections: Feeling, Thinking, Doing
    const sections = ['Feeling', 'Thinking', 'Doing'];
    for (const section of sections) {
      const sectionExists = await page.locator(`text=${section}`).count() > 0;
      if (!sectionExists) {
        issues.push(`"${section}" section not found`);
      }
    }

    // Check Recent Additions section
    const recentAdditions = await checkElementExists(page, 'text=Recent', 'Recent Additions');
    if (!recentAdditions.exists) {
      console.log('Note: "Recent Additions" section not found (may use different text)');
    }

    logTest('Homepage Testing', issues.length > 0 ? 'ISSUES FOUND' : 'PASSED', { issues });

    // ========================================
    // TEST 2: ARTWORK GALLERY TESTING
    // ========================================
    logTest('Artwork Gallery Testing', 'RUNNING', { description: 'Testing artwork gallery, filters, and display' });

    await page.goto(`${BASE_URL}/gallery/artworks`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for content to load

    const artworkIssues = [];

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-gallery-artworks-all.png'),
      fullPage: true
    });

    // Count artwork cards
    const artworkCards = await page.locator('[data-testid*="artwork"], .artwork-card, article, [class*="card"]').count();
    console.log(`Artwork cards found: ${artworkCards}`);

    if (artworkCards === 0) {
      artworkIssues.push('No artwork cards found on gallery page');
    }

    // Test Watercolour filter
    const watercolourFilter = await page.locator('button:has-text("Watercolour"), [role="button"]:has-text("Watercolour")').first();
    if (await watercolourFilter.count() > 0) {
      await watercolourFilter.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '04-gallery-artworks-watercolour-filter.png'),
        fullPage: true
      });
    } else {
      console.log('Note: Watercolour filter button not found');
    }

    // Test Shufa filter
    await page.goto(`${BASE_URL}/gallery/artworks`, { waitUntil: 'networkidle' });
    const shufaFilter = await page.locator('button:has-text("Shufa"), [role="button"]:has-text("Shufa")').first();
    if (await shufaFilter.count() > 0) {
      await shufaFilter.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '05-gallery-artworks-shufa-filter.png'),
        fullPage: true
      });
    } else {
      console.log('Note: Shufa filter button not found');
    }

    // Try to click on an artwork (if any exist)
    await page.goto(`${BASE_URL}/gallery/artworks`, { waitUntil: 'networkidle' });
    const firstArtwork = await page.locator('a[href*="/gallery/artworks/"], [data-testid*="artwork"] a').first();
    if (await firstArtwork.count() > 0) {
      await firstArtwork.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '06-gallery-artwork-detail.png'),
        fullPage: true
      });
    } else {
      artworkIssues.push('No clickable artwork links found');
    }

    logTest('Artwork Gallery Testing', artworkIssues.length > 0 ? 'ISSUES FOUND' : 'PASSED', {
      artworkCount: artworkCards,
      issues: artworkIssues
    });

    // ========================================
    // TEST 3: PUBLICATIONS GALLERY TESTING
    // ========================================
    logTest('Publications Gallery Testing', 'RUNNING', { description: 'Testing publications list and details' });

    await page.goto(`${BASE_URL}/gallery/publications`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const pubIssues = [];

    // Take screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-gallery-publications-all.png'),
      fullPage: true
    });

    // Check for publication elements
    const publications = await page.locator('article, [data-testid*="publication"], .publication-card').count();
    console.log(`Publications found: ${publications}`);

    if (publications === 0) {
      pubIssues.push('No publications found on gallery page');
    }

    // Check for expected fields (title, authors, abstract, etc.)
    const hasTitle = await page.locator('h2, h3, [class*="title"]').count() > 0;
    const hasAuthors = await page.locator('text=/Author|authors/i').count() > 0;
    const hasAbstract = await page.locator('text=/Abstract|abstract/i').count() > 0;

    if (!hasTitle) pubIssues.push('Publication titles not found');
    if (!hasAuthors && publications > 0) console.log('Note: Author information may not be displayed prominently');
    if (!hasAbstract && publications > 0) console.log('Note: Abstract text may not be displayed prominently');

    // Test Academic filter
    const academicFilter = await page.locator('button:has-text("Academic"), [role="button"]:has-text("Academic")').first();
    if (await academicFilter.count() > 0) {
      await academicFilter.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '08-gallery-publications-academic-filter.png'),
        fullPage: true
      });
    } else {
      console.log('Note: Academic filter button not found');
    }

    // Try to click on a publication detail link
    await page.goto(`${BASE_URL}/gallery/publications`, { waitUntil: 'networkidle' });
    const firstPub = await page.locator('a[href*="/gallery/publications/"]').first();
    if (await firstPub.count() > 0) {
      await firstPub.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '09-gallery-publication-detail.png'),
        fullPage: true
      });
    } else {
      console.log('Note: No clickable publication detail links found');
    }

    logTest('Publications Gallery Testing', pubIssues.length > 0 ? 'ISSUES FOUND' : 'PASSED', {
      publicationCount: publications,
      issues: pubIssues
    });

    // ========================================
    // TEST 4: SEARCH TESTING
    // ========================================
    logTest('Search Testing', 'RUNNING', { description: 'Testing search functionality' });

    await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const searchIssues = [];

    // Take screenshot of search page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-search-page.png'),
      fullPage: true
    });

    // Find search input
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i], input[name="search"]').first();

    if (await searchInput.count() > 0) {
      // Type search query
      await searchInput.fill('landscape');
      await page.waitForTimeout(500);

      // Take screenshot showing autocomplete
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '11-search-autocomplete.png')
      });

      // Submit search
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);

      // Take screenshot of results
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '12-search-results.png'),
        fullPage: true
      });

      // Check if results are displayed
      const resultsCount = await page.locator('article, [data-testid*="result"], .search-result').count();
      console.log(`Search results found: ${resultsCount}`);

      if (resultsCount === 0) {
        console.log('Note: No search results found for "landscape" query');
      }
    } else {
      searchIssues.push('Search input field not found');
    }

    logTest('Search Testing', searchIssues.length > 0 ? 'ISSUES FOUND' : 'PASSED', { issues: searchIssues });

    // ========================================
    // TEST 5: RESPONSIVE TESTING
    // ========================================
    logTest('Responsive Testing', 'RUNNING', { description: 'Testing responsive layouts at different viewports' });

    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    const responsiveIssues = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `13-responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`),
        fullPage: true
      });

      // Check for horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        responsiveIssues.push(`Horizontal scroll detected at ${viewport.name} (${viewport.width}px)`);
      }

      console.log(`${viewport.name} (${viewport.width}x${viewport.height}): ${hasHorizontalScroll ? 'HAS HORIZONTAL SCROLL' : 'OK'}`);
    }

    logTest('Responsive Testing', responsiveIssues.length > 0 ? 'ISSUES FOUND' : 'PASSED', { issues: responsiveIssues });

    // ========================================
    // TEST 6: COLOR AND VISUAL ELEMENTS
    // ========================================
    logTest('Color and Visual Elements Testing', 'RUNNING', { description: 'Verifying colors and visual design' });

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const colorIssues = [];

    // Check for specific colors in the page
    const colorResults = await page.evaluate(() => {
      const results = {
        magenta: false,
        blue: false,
        teal: false,
        watercolorTexture: false
      };

      // Check all elements for colors
      const elements = Array.from(document.querySelectorAll('*'));

      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const color = style.color || '';
        const bgColor = style.backgroundColor || '';
        const borderColor = style.borderColor || '';

        // Magenta #D33479 = rgb(211, 52, 121)
        if (color.includes('211, 52, 121') || bgColor.includes('211, 52, 121') || borderColor.includes('211, 52, 121')) {
          results.magenta = true;
        }

        // Check for teal/blue colors (approximate ranges)
        if (color.includes('44, 168, 168') || bgColor.includes('44, 168, 168')) {
          results.teal = true;
        }

        if (color.includes('44, 89, 133') || bgColor.includes('44, 89, 133')) {
          results.blue = true;
        }
      }

      // Check for canvas element (watercolor texture)
      results.watercolorTexture = document.querySelector('canvas') !== null;

      return results;
    });

    console.log('Color check results:', colorResults);

    if (!colorResults.magenta) {
      colorIssues.push('Magenta color (#D33479) not detected on page');
    }
    if (!colorResults.watercolorTexture) {
      colorIssues.push('Watercolor texture canvas not found');
    }

    // Take a screenshot highlighting sections
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '14-color-verification.png'),
      fullPage: true
    });

    logTest('Color and Visual Elements Testing', colorIssues.length > 0 ? 'ISSUES FOUND' : 'PASSED', {
      colorsFound: colorResults,
      issues: colorIssues
    });

    await page.close();

  } catch (error) {
    console.error('Error during testing:', error);
    testResults.tests.push({
      name: 'Test Suite Execution',
      status: 'ERROR',
      error: error.message
    });
  } finally {
    await browser.close();
  }

  // ========================================
  // GENERATE SUMMARY REPORT
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.tests.filter(t => t.status === 'PASSED').length}`);
  console.log(`Issues Found: ${testResults.tests.filter(t => t.status === 'ISSUES FOUND').length}`);
  console.log(`Errors: ${testResults.tests.filter(t => t.status === 'ERROR').length}`);
  console.log(`\nTotal Issues: ${testResults.issues.length}`);

  if (testResults.issues.length > 0) {
    console.log('\nISSUES SUMMARY:');
    testResults.issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.test}] ${issue.issue}`);
    });
  }

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(60));

  // Save JSON report
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'test-report.json'),
    JSON.stringify(testResults, null, 2)
  );

  console.log('\nTest report saved to: ' + path.join(SCREENSHOT_DIR, 'test-report.json'));

  process.exit(testResults.issues.length > 0 ? 1 : 0);
})();
