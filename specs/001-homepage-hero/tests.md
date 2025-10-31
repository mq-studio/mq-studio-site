# Homepage Hero Test Suite

## Overview

This test suite validates the Homepage Hero component against the acceptance checklist, providing automated assertions for SpecKit validation and Stagehand browser testing.

## SpecKit Check Integration

### Command Integration
```bash
npx speckit check --spec=001-homepage-hero
```

### Automated Validation Points

#### Core Concept Alignment
```javascript
// Test: MQ Studio branding
await expect(page.locator('[data-testid="hero-section"]')).toContainText('MQ Studio');

// Test: Ethos communication
await expect(page.locator('[data-testid="hero-tagline"]')).toContainText('Experiences, Experiments, Rough Drafts & Finished Works');

// Test: Triadic framework visibility
await expect(page.locator('[data-testid="thinking-pathway"]')).toBeVisible();
await expect(page.locator('[data-testid="feeling-pathway"]')).toBeVisible();
await expect(page.locator('[data-testid="doing-pathway"]')).toBeVisible();

// Test: Voice tone validation
const heroText = await page.locator('[data-testid="hero-content"]').textContent();
const invitationalPhrases = ['wondering', 'exploring', 'consider', 'conversation'];
const hasInvitationalTone = invitationalPhrases.some(phrase => heroText.toLowerCase().includes(phrase));
expect(hasInvitationalTone).toBe(true);
```

#### Functional Display
```javascript
// Test: Simultaneous three-element display
await expect(page.locator('[data-testid="current-artwork"]')).toBeVisible();
await expect(page.locator('[data-testid="recent-writing"]')).toBeVisible();
await expect(page.locator('[data-testid="today-reflection"]')).toBeVisible();

// Test: Functional links
await expect(page.locator('[data-testid="current-artwork"] a')).toHaveAttribute('href', /artworks/);
await expect(page.locator('[data-testid="recent-writing"] a')).toHaveAttribute('href', /(publications|musings)/);
await expect(page.locator('[data-testid="today-reflection"] a')).toHaveAttribute('href', /(about|musings)/);

// Test: Resonance feature
await expect(page.locator('[data-testid="featured-resonance"]')).toBeVisible();
```

#### Visual Design System
```javascript
// Test: Color system compliance
const primaryCTA = page.locator('[data-testid="primary-cta"]');
await expect(primaryCTA).toHaveCSS('background-color', 'rgb(0, 168, 168)'); // Moura Teal

const heroBackground = page.locator('[data-testid="hero-section"]');
await expect(heroBackground).toHaveCSS('background-color', 'rgb(253, 252, 248)'); // Rice Paper

// Test: Typography
const headings = page.locator('h1, h2, h3');
await expect(headings.first()).toHaveCSS('font-family', /Montserrat/);

const bodyText = page.locator('p');
await expect(bodyText.first()).toHaveCSS('font-family', /Lora/);

// Test: Contrast ratios (requires accessibility testing library)
const contrastResults = await page.evaluate(() => {
  // Custom contrast ratio validation logic
  return window.checkContrast();
});
expect(contrastResults.minRatio).toBeGreaterThanOrEqual(4.5);
```

#### Responsive Behavior
```javascript
// Test: Mobile layout adaptation
await page.setViewportSize({ width: 375, height: 667 }); // Mobile
await expect(page.locator('[data-testid="hero-section"]')).toHaveClass(/mobile-layout/);

// Test: Marginalia reflow
const marginalia = page.locator('[data-testid="david-marginalia"]');
await expect(marginalia).toHaveClass(/callout-block/); // Mobile style

// Test: Desktop layout
await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
await expect(marginalia).toHaveClass(/right-rail/); // Desktop style
```

#### David Integration
```javascript
// Test: Marginalia presence
await expect(page.locator('[data-testid="david-marginalia"]')).toBeVisible();

// Test: Attribution format
await expect(page.locator('[data-testid="david-marginalia"]')).toContainText('— David Fushtey');

// Test: Scholar Blue styling
const davidQuote = page.locator('[data-testid="david-marginalia"]');
await expect(davidQuote).toHaveCSS('color', 'rgb(44, 89, 133)'); // Scholar Blue

// Test: No separate David section
await expect(page.locator('[data-testid="david-section"]')).not.toBeVisible();
```

#### Accessibility
```javascript
// Test: Alt text quality
const artworkImage = page.locator('[data-testid="current-artwork"] img');
const altText = await artworkImage.getAttribute('alt');
expect(altText).not.toMatch(/^image|photo|picture/i); // Should describe intent, not appearance

// Test: Keyboard navigation
await page.keyboard.press('Tab');
await expect(page.locator(':focus')).toHaveCSS('outline-color', 'rgb(0, 168, 168)'); // Focus ring

// Test: ARIA labels
await expect(page.locator('[data-testid="hero-section"]')).toHaveAttribute('role', 'banner');
await expect(page.locator('[data-testid="thinking-pathway"]')).toHaveAttribute('aria-label', /thinking/i);

// Test: Audio controls (if present)
const audioPlayer = page.locator('[data-testid="audio-player"]');
if (await audioPlayer.isVisible()) {
  await expect(audioPlayer).toHaveAttribute('aria-describedby');
  await expect(page.locator('[data-testid="audio-transcript"]')).toBeVisible();
}
```

## Stagehand Integration

### Browser Test Configuration
```javascript
// tests/homepage-hero.test.js
const { test, expect } = require('@playwright/test');
const { Stagehand } = require('@browserbase/stagehand');

test.describe('Homepage Hero Acceptance Tests', () => {
  let stagehand;

  test.beforeEach(async ({ page }) => {
    stagehand = new Stagehand({ page });
    await page.goto('/');
  });

  test('✅ Core Concept Alignment', async ({ page }) => {
    // Living studio introduction
    await stagehand.waitForElement('[data-testid="hero-section"]');
    const heroContent = await stagehand.extract('[data-testid="hero-content"]');
    expect(heroContent.text).toMatch(/living studio|MQ Studio/i);

    // Ethos communication
    expect(heroContent.text).toMatch(/experiences.*experiments.*rough drafts.*finished works/i);

    // MQ Framework embodiment
    await stagehand.waitForElement('[data-testid="thinking-pathway"]');
    await stagehand.waitForElement('[data-testid="feeling-pathway"]');
    await stagehand.waitForElement('[data-testid="doing-pathway"]');

    // Voice tone validation
    const toneWords = ['wondering', 'exploring', 'grateful', 'uncertain', 'conversation'];
    const hasCorrectTone = toneWords.some(word => heroContent.text.toLowerCase().includes(word));
    expect(hasCorrectTone).toBe(true);
  });

  test('✅ Functional Display Requirements', async ({ page }) => {
    // Three simultaneous elements
    await stagehand.waitForElement('[data-testid="current-artwork"]');
    await stagehand.waitForElement('[data-testid="recent-writing"]');
    await stagehand.waitForElement('[data-testid="today-reflection"]');

    // Functional links
    await stagehand.click('[data-testid="current-artwork"] a');
    expect(page.url()).toMatch(/artworks/);
    await page.goBack();

    // Featured resonance
    await stagehand.waitForElement('[data-testid="featured-resonance"]');
    const resonanceText = await stagehand.extract('[data-testid="featured-resonance"]');
    expect(resonanceText.text).toMatch(/currently exploring|speaks to|reminds me/i);
  });

  test('✅ Visual & Design System Compliance', async ({ page }) => {
    // Color validation through computed styles
    const styles = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="hero-section"]');
      const cta = document.querySelector('[data-testid="primary-cta"]');
      return {
        heroBackground: getComputedStyle(hero).backgroundColor,
        ctaBackground: getComputedStyle(cta).backgroundColor
      };
    });

    expect(styles.heroBackground).toBe('rgb(253, 252, 248)'); // Rice Paper
    expect(styles.ctaBackground).toBe('rgb(0, 168, 168)'); // Moura Teal

    // Typography validation
    const fontCheck = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const body = document.querySelector('p');
      return {
        headingFont: getComputedStyle(heading).fontFamily,
        bodyFont: getComputedStyle(body).fontFamily
      };
    });

    expect(fontCheck.headingFont).toMatch(/Montserrat/);
    expect(fontCheck.bodyFont).toMatch(/Lora/);
  });

  test('✅ Mobile Responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Ensure triadic elements remain visible
    await stagehand.waitForElement('[data-testid="thinking-pathway"]');
    await stagehand.waitForElement('[data-testid="feeling-pathway"]');
    await stagehand.waitForElement('[data-testid="doing-pathway"]');

    // Marginalia reflow check
    const marginalia = await stagehand.extract('[data-testid="david-marginalia"]');
    expect(marginalia.isVisible).toBe(true);

    // Touch target validation
    const touchTargets = await page.$$('[data-testid*="pathway"] a');
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
  });

  test('✅ David Integration Validation', async ({ page }) => {
    // Marginalia presence
    await stagehand.waitForElement('[data-testid="david-marginalia"]');

    // Attribution format
    const marginalia = await stagehand.extract('[data-testid="david-marginalia"]');
    expect(marginalia.text).toMatch(/— David Fushtey/);

    // Integration, not separation
    const davidSection = await page.$('[data-testid="david-section"]');
    expect(davidSection).toBe(null);

    // Scholar Blue styling
    const davidQuoteStyle = await page.evaluate(() => {
      const quote = document.querySelector('[data-testid="david-marginalia"]');
      return getComputedStyle(quote).color;
    });
    expect(davidQuoteStyle).toBe('rgb(44, 89, 133)');
  });

  test('✅ Accessibility Compliance', async ({ page }) => {
    // Alt text quality
    const artworkImage = await stagehand.extract('[data-testid="current-artwork"] img');
    expect(artworkImage.alt).not.toMatch(/^(image|photo|picture)/i);
    expect(artworkImage.alt.length).toBeGreaterThan(10); // Descriptive, not generic

    // Keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveCSS('outline-color', 'rgb(0, 168, 168)');

    // Screen reader structure
    await expect(page.locator('[data-testid="hero-section"]')).toHaveAttribute('role', 'banner');

    // Audio accessibility (if present)
    const audioPlayer = page.locator('[data-testid="audio-player"]');
    if (await audioPlayer.isVisible()) {
      await expect(audioPlayer).toHaveAttribute('aria-describedby');
      await expect(page.locator('[data-testid="audio-transcript"]')).toBeVisible();
    }
  });
});
```

## Manual Testing Checklist

For QA validation beyond automated tests:

### User Experience Validation
- [ ] Hero feels like entering a living workspace, not viewing a portfolio
- [ ] Triadic pathways feel interconnected, not siloed
- [ ] Voice samples convey curiosity and invitation
- [ ] Marginalia enhances rather than distracts from main content
- [ ] Seasonal theming (if implemented) feels organic

### Cross-Browser Testing
- [ ] Chrome/Chromium latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Validation
- [ ] Hero loads within 2 seconds on 3G connection
- [ ] Images are optimized and progressive
- [ ] No layout shift during load
- [ ] Smooth transitions on interaction

## Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/hero-tests.yml
name: Homepage Hero Tests
on: [push, pull_request]
jobs:
  hero-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx speckit check --spec=001-homepage-hero
      - run: npx playwright test tests/homepage-hero.test.js
```

This comprehensive test suite ensures the Homepage Hero meets all acceptance criteria and maintains quality standards throughout development.