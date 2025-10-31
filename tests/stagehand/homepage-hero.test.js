/**
 * Stagehand E2E Test: Homepage Hero Section
 * 
 * Tests the acceptance criteria from specs/001-homepage-hero-section/spec.md
 * using natural language assertions
 */

const { Stagehand } = require('@browserbasehq/stagehand');
const { expect } = require('@playwright/test');

// Load environment variables
require('dotenv').config();

describe('Homepage Hero Section', () => {
  let stagehand;
  let page;

  beforeAll(async () => {
    // Initialize Stagehand with Claude
    stagehand = new Stagehand({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: process.env.ANTHROPIC_MODEL_NAME || 'claude-sonnet-4',
      headless: process.env.CI === 'true', // Headless in CI, headed locally
    });
    
    await stagehand.init();
    page = stagehand.page;
  });

  afterAll(async () => {
    await stagehand.close();
  });

  beforeEach(async () => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Hero section displays on homepage load', async () => {
    // Use Stagehand's observe to check for hero section
    const heroSection = await stagehand.observe('Is there a prominent hero section visible at the top of the page?');
    expect(heroSection).toBeTruthy();
  });

  test('Latest content item appears as featured', async () => {
    // Extract information about featured content
    const featuredContent = await stagehand.extract({
      instruction: 'Find the featured content in the hero section and extract its details',
      schema: {
        title: 'string',
        type: 'string', // Should be Artwork, Publication, or Musing
        hasPreview: 'boolean',
        hasLink: 'boolean'
      }
    });

    expect(featuredContent.title).toBeDefined();
    expect(['Artwork', 'Publication', 'Musing']).toContain(featuredContent.type);
    expect(featuredContent.hasPreview).toBe(true);
  });

  test('Three entry points are clearly visible and labeled', async () => {
    // Extract the three themed entry points
    const entryPoints = await stagehand.extract({
      instruction: 'Find the three themed entry points (Thinking, Feeling, Doing) and extract their information',
      schema: {
        thinking: {
          visible: 'boolean',
          hasDescription: 'boolean',
          clickable: 'boolean'
        },
        feeling: {
          visible: 'boolean',
          hasDescription: 'boolean',
          clickable: 'boolean'
        },
        doing: {
          visible: 'boolean',
          hasDescription: 'boolean',
          clickable: 'boolean'
        }
      }
    });

    // Verify all three entry points
    expect(entryPoints.thinking.visible).toBe(true);
    expect(entryPoints.feeling.visible).toBe(true);
    expect(entryPoints.doing.visible).toBe(true);
    
    // Each should have descriptions
    expect(entryPoints.thinking.hasDescription).toBe(true);
    expect(entryPoints.feeling.hasDescription).toBe(true);
    expect(entryPoints.doing.hasDescription).toBe(true);
  });

  test('All navigation links work correctly', async () => {
    // Test Thinking link
    await stagehand.act({
      action: 'click',
      element: 'The Thinking entry point link'
    });
    await page.waitForLoadState('networkidle');
    
    const onThinkingPage = await stagehand.observe('Are we on a page showing governance papers or intellectual work?');
    expect(onThinkingPage).toBe(true);
    
    // Go back to test other links
    await page.goBack();
    
    // Test Feeling link
    await stagehand.act({
      action: 'click',
      element: 'The Feeling entry point link'
    });
    await page.waitForLoadState('networkidle');
    
    const onFeelingPage = await stagehand.observe('Are we on a page showing watercolours or artistic expressions?');
    expect(onFeelingPage).toBe(true);
    
    // Go back
    await page.goBack();
    
    // Test Doing link
    await stagehand.act({
      action: 'click',
      element: 'The Doing entry point link'
    });
    await page.waitForLoadState('networkidle');
    
    const onDoingPage = await stagehand.observe('Are we on a page showing calligraphy or creative practice?');
    expect(onDoingPage).toBe(true);
  });

  test('Section is responsive across devices', async () => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopLayout = await stagehand.observe('Is the hero section properly displayed on desktop with all elements visible?');
    expect(desktopLayout).toBe(true);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletLayout = await stagehand.observe('Is the hero section properly displayed on tablet with appropriate layout adjustments?');
    expect(tabletLayout).toBe(true);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileLayout = await stagehand.observe('Is the hero section properly displayed on mobile with stacked layout?');
    expect(mobileLayout).toBe(true);
  });

  test('Keyboard navigation works for all interactive elements', async () => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    const firstElementFocused = await stagehand.observe('Is there a visible focus indicator on an interactive element?');
    expect(firstElementFocused).toBe(true);
    
    // Continue tabbing and verify we can reach all three entry points
    let reachedAllEntryPoints = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      reachedAllEntryPoints = await stagehand.observe(
        'Have we tabbed through all three entry points (Thinking, Feeling, Doing) with visible focus indicators?'
      );
      if (reachedAllEntryPoints) break;
    }
    
    expect(reachedAllEntryPoints).toBe(true);
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    const navigatedViaKeyboard = await stagehand.observe('Did pressing Enter navigate to a new page?');
    expect(navigatedViaKeyboard).toBe(true);
  });

  test('Screen readers can understand the section structure', async () => {
    // Check for proper ARIA labels and semantic HTML
    const accessibilityInfo = await stagehand.extract({
      instruction: 'Check if the hero section has proper accessibility attributes for screen readers',
      schema: {
        hasAriaLabels: 'boolean',
        hasSemanticHTML: 'boolean',
        hasAltTextForImages: 'boolean',
        hasDescriptiveLinks: 'boolean'
      }
    });
    
    expect(accessibilityInfo.hasAriaLabels).toBe(true);
    expect(accessibilityInfo.hasSemanticHTML).toBe(true);
    expect(accessibilityInfo.hasAltTextForImages).toBe(true);
    expect(accessibilityInfo.hasDescriptiveLinks).toBe(true);
  });
});