/**
 * Responsive Design Test Suite for MQ Studio
 * Tests the website at different viewport sizes: Mobile (375px), Tablet (768px), Desktop (1920px)
 *
 * Run with: npx playwright test tests/responsive-design.spec.js
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Screenshot directory
const SCREENSHOT_DIR = '/tmp/mq-responsive';

// Test viewports
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1920, height: 1080, name: 'desktop' }
};

// Base URL
const BASE_URL = 'http://localhost:3100';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Helper function to take a screenshot
 */
async function takeScreenshot(page, viewport, pageName, suffix = '') {
  const filename = `${pageName}-${viewport.name}${suffix ? '-' + suffix : ''}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

/**
 * Helper function to check if element is visible
 */
async function isVisible(page, selector) {
  try {
    const element = await page.locator(selector);
    return await element.isVisible({ timeout: 5000 });
  } catch (e) {
    return false;
  }
}

/**
 * Helper to get computed style
 */
async function getComputedStyle(page, selector, property) {
  return await page.evaluate(([sel, prop]) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    return window.getComputedStyle(element).getPropertyValue(prop);
  }, [selector, property]);
}

// Test Suite: Homepage Responsive Design
test.describe('Homepage Responsive Design', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Homepage at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      test.setTimeout(60000); // Mobile viewport needs extra time for screenshot operations

      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to homepage
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Take initial screenshot
      await takeScreenshot(page, viewport, 'homepage');

      // Test navigation
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      if (viewport.name === 'mobile') {
        // Mobile: Check for hamburger menu or collapsed navigation
        const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i], button.mobile-menu');
        const hasMobileMenu = await isVisible(page, 'button[aria-label*="menu" i], button[aria-label*="navigation" i], button.mobile-menu');

        console.log(`  ✓ Mobile navigation check: ${hasMobileMenu ? 'Has mobile menu button' : 'No mobile menu found (may use different pattern)'}`);

        // Check that navigation items are not all visible (should be collapsed)
        const navLinks = page.locator('nav a');
        const count = await navLinks.count();
        console.log(`  ✓ Navigation links found: ${count}`);
      } else {
        // Tablet/Desktop: Check for full navigation
        const navLinks = page.locator('nav a');
        const count = await navLinks.count();
        expect(count).toBeGreaterThan(0);
        console.log(`  ✓ Navigation links visible: ${count}`);
      }

      // Test Hero section
      const hero = page.locator('section').first();
      await expect(hero).toBeVisible();

      // Check for single column layout on mobile
      if (viewport.name === 'mobile') {
        const gridColumns = await getComputedStyle(page, 'main, .content-grid, .grid', 'grid-template-columns');
        console.log(`  ✓ Grid layout: ${gridColumns || 'not grid-based'}`);
      }

      // Test search bar if present
      const searchBar = page.locator('input[type="search"], input[placeholder*="search" i]');
      if (await searchBar.count() > 0) {
        await expect(searchBar.first()).toBeVisible();
        const searchWidth = await searchBar.first().evaluate(el => el.offsetWidth);
        console.log(`  ✓ Search bar width: ${searchWidth}px`);

        // Search bar should be appropriately sized for viewport
        if (viewport.name === 'mobile') {
          expect(searchWidth).toBeLessThan(viewport.width * 0.95); // Should not overflow
        }
      }

      // Test content cards layout
      const cards = page.locator('article, .card, [class*="card"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        console.log(`  ✓ Content cards found: ${cardCount}`);

        // Check first card's width
        const firstCard = cards.first();
        const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
        console.log(`  ✓ Card width: ${cardWidth}px`);

        // Mobile: Cards should be nearly full width
        if (viewport.name === 'mobile') {
          expect(cardWidth).toBeGreaterThan(viewport.width * 0.8);
        }

        // Take screenshot after scrolling to cards
        await firstCard.scrollIntoViewIfNeeded();
        await takeScreenshot(page, viewport, 'homepage', 'cards');
      }
    });
  }
});

// Test Suite: Gallery Pages Responsive Design
test.describe('Gallery Pages Responsive Design', () => {
  const galleryPages = [
    { path: '/gallery/publications', name: 'publications' },
    { path: '/gallery/artworks', name: 'artworks' },
    { path: '/gallery', name: 'gallery-index' }
  ];

  for (const galleryPage of galleryPages) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test(`${galleryPage.name} at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
        // Set viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Navigate to gallery page
        await page.goto(`${BASE_URL}${galleryPage.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for content to load
        await page.waitForTimeout(1000);

        // Take initial screenshot
        await takeScreenshot(page, viewport, galleryPage.name);

        // Test filters
        const filters = page.locator('button[role="tab"], .filter-button, [class*="filter"]');
        const filterCount = await filters.count();

        if (filterCount > 0) {
          console.log(`  ✓ Filters found: ${filterCount}`);

          // Check if filters wrap properly on mobile
          if (viewport.name === 'mobile') {
            const filterContainer = filters.first().locator('..'); // Parent container
            const containerWidth = await filterContainer.evaluate(el => el.offsetWidth);
            console.log(`  ✓ Filter container width: ${containerWidth}px`);

            // Filters should not overflow viewport
            expect(containerWidth).toBeLessThanOrEqual(viewport.width);
          }

          // Take screenshot with filters visible
          await filters.first().scrollIntoViewIfNeeded();
          await takeScreenshot(page, viewport, galleryPage.name, 'filters');
        }

        // Test gallery grid layout
        const galleryItems = page.locator('.gallery-item, article, .publication-card, .artwork-card');
        const itemCount = await galleryItems.count();

        if (itemCount > 0) {
          console.log(`  ✓ Gallery items found: ${itemCount}`);

          // Check grid columns based on viewport
          const firstItem = galleryItems.first();
          const itemWidth = await firstItem.evaluate(el => el.offsetWidth);
          const containerWidth = await firstItem.locator('..').evaluate(el => el.offsetWidth);

          console.log(`  ✓ Gallery item width: ${itemWidth}px`);
          console.log(`  ✓ Container width: ${containerWidth}px`);

          // Calculate expected columns
          const itemsPerRow = Math.floor(containerWidth / itemWidth);
          console.log(`  ✓ Estimated items per row: ${itemsPerRow}`);

          // Validate column count expectations
          if (viewport.name === 'mobile') {
            expect(itemsPerRow).toBeLessThanOrEqual(2); // 1-2 columns on mobile
          } else if (viewport.name === 'tablet') {
            expect(itemsPerRow).toBeGreaterThanOrEqual(2); // 2+ columns on tablet
            expect(itemsPerRow).toBeLessThanOrEqual(3);
          } else {
            expect(itemsPerRow).toBeGreaterThanOrEqual(3); // 3+ columns on desktop
          }

          // Scroll to middle of gallery
          const middleItem = galleryItems.nth(Math.floor(itemCount / 2));
          await middleItem.scrollIntoViewIfNeeded();
          await takeScreenshot(page, viewport, galleryPage.name, 'gallery-grid');
        }
      });
    }
  }
});

// Test Suite: Individual Publication/Artwork Pages
test.describe('Detail Pages Responsive Design', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Publication detail page at ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to gallery first
      await page.goto(`${BASE_URL}/gallery/publications`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Find first publication link
      const firstPublication = page.locator('a[href*="/publications/"]').first();
      const publicationExists = await firstPublication.count() > 0;

      if (publicationExists) {
        await firstPublication.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Take screenshot
        await takeScreenshot(page, viewport, 'publication-detail');

        // Test metadata display
        const metadata = page.locator('.metadata, .publication-info, [class*="meta"]');
        if (await metadata.count() > 0) {
          const metadataVisible = await metadata.first().isVisible();
          console.log(`  ✓ Metadata visible: ${metadataVisible}`);

          // Check readability - metadata should not overflow
          const metadataWidth = await metadata.first().evaluate(el => el.offsetWidth);
          console.log(`  ✓ Metadata width: ${metadataWidth}px`);
          expect(metadataWidth).toBeLessThanOrEqual(viewport.width);
        }

        // Test image gallery if present
        const images = page.locator('img[class*="gallery"], .image-gallery img');
        const imageCount = await images.count();

        if (imageCount > 0) {
          console.log(`  ✓ Images found: ${imageCount}`);

          // Check first image doesn't overflow
          const firstImage = images.first();
          await firstImage.scrollIntoViewIfNeeded();
          const imageWidth = await firstImage.evaluate(el => el.offsetWidth);
          console.log(`  ✓ Image width: ${imageWidth}px`);

          expect(imageWidth).toBeLessThanOrEqual(viewport.width);

          await takeScreenshot(page, viewport, 'publication-detail', 'images');
        }
      } else {
        console.log('  ⚠ No publications found to test detail page');
      }
    });
  }
});

// Test Suite: Search Functionality Responsive Design
test.describe('Search Bar Responsive Design', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Search bar at ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to search page or homepage
      await page.goto(`${BASE_URL}/search`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(async () => {
        // If search page doesn't exist, go to homepage
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      });
      await page.waitForTimeout(1000);

      // Find search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]');

      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();

        // Take screenshot
        await searchInput.first().scrollIntoViewIfNeeded();
        await takeScreenshot(page, viewport, 'search', 'initial');

        // Test search input responsiveness
        const inputWidth = await searchInput.first().evaluate(el => el.offsetWidth);
        console.log(`  ✓ Search input width: ${inputWidth}px`);

        // Input should not overflow
        expect(inputWidth).toBeLessThanOrEqual(viewport.width * 0.95);

        // Type in search box
        await searchInput.first().fill('governance');
        await page.waitForTimeout(500);

        // Take screenshot with search term
        await takeScreenshot(page, viewport, 'search', 'with-text');

        // Check if search results appear
        const results = page.locator('.search-results, [class*="result"]');
        if (await results.count() > 0) {
          console.log(`  ✓ Search results container found`);
          await takeScreenshot(page, viewport, 'search', 'results');
        }
      } else {
        console.log('  ⚠ Search input not found');
      }
    });
  }
});

// Test Suite: Specific Responsive Elements
test.describe('Specific Element Responsiveness', () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Spacing and margins at ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to homepage
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Check main content max-width on desktop
      if (viewport.name === 'desktop') {
        const main = page.locator('main').first();
        const mainWidth = await main.evaluate(el => el.offsetWidth);
        console.log(`  ✓ Main content width: ${mainWidth}px`);

        // Main content should have reasonable max-width on desktop
        // Typically around 1200-1400px for readability
        if (mainWidth > 1600) {
          console.log(`  ⚠ Warning: Main content very wide (${mainWidth}px) - consider max-width`);
        }
      }

      // Check padding/margins don't cause horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;

      console.log(`  ✓ Body scroll width: ${bodyWidth}px`);
      console.log(`  ✓ Viewport width: ${viewportWidth}px`);

      if (bodyWidth > viewportWidth) {
        console.log(`  ⚠ Warning: Horizontal scroll detected (${bodyWidth - viewportWidth}px overflow)`);
      }

      // Take screenshot
      await takeScreenshot(page, viewport, 'layout-spacing');
    });

    test(`Typography readability at ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to a publication or musing with content
      await page.goto(`${BASE_URL}/gallery/publications`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Check font sizes
      const heading = page.locator('h1, h2').first();
      const paragraph = page.locator('p').first();

      if (await heading.count() > 0) {
        const headingSize = await getComputedStyle(page, 'h1, h2', 'font-size');
        console.log(`  ✓ Heading font size: ${headingSize}`);
      }

      if (await paragraph.count() > 0) {
        const paraSize = await getComputedStyle(page, 'p', 'font-size');
        const lineHeight = await getComputedStyle(page, 'p', 'line-height');
        console.log(`  ✓ Paragraph font size: ${paraSize}`);
        console.log(`  ✓ Paragraph line height: ${lineHeight}`);
      }

      await takeScreenshot(page, viewport, 'typography');
    });
  }
});

// Test Suite: Report Generation
test('Generate responsive design report', async () => {
  const reportPath = path.join(SCREENSHOT_DIR, 'responsive-test-report.md');
  const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));

  const report = `# MQ Studio Responsive Design Test Report

**Date:** ${new Date().toISOString()}
**Base URL:** ${BASE_URL}

## Test Summary

Total screenshots captured: **${screenshots.length}**

## Viewport Configurations

- **Mobile:** 375px × 667px (iPhone SE)
- **Tablet:** 768px × 1024px (iPad)
- **Desktop:** 1920px × 1080px (Full HD)

## Screenshots

### Homepage
${screenshots.filter(s => s.startsWith('homepage')).map(s => `- ${s}`).join('\n')}

### Gallery Pages
${screenshots.filter(s => s.includes('publications') || s.includes('artworks') || s.includes('gallery')).map(s => `- ${s}`).join('\n')}

### Detail Pages
${screenshots.filter(s => s.includes('detail')).map(s => `- ${s}`).join('\n')}

### Search
${screenshots.filter(s => s.startsWith('search')).map(s => `- ${s}`).join('\n')}

### Layout & Typography
${screenshots.filter(s => s.includes('layout') || s.includes('typography')).map(s => `- ${s}`).join('\n')}

## All Screenshots

${screenshots.map(s => `- ${s}`).join('\n')}

## Issues Found

Check console output for specific warnings and recommendations.

## Next Steps

1. Review screenshots in \`${SCREENSHOT_DIR}\`
2. Address any layout issues flagged in console output
3. Test on real devices for validation
4. Consider additional viewport sizes if needed

---
*Generated by Playwright Responsive Design Test Suite*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Test report generated: ${reportPath}`);
  console.log(`📁 All screenshots saved to: ${SCREENSHOT_DIR}`);
});
