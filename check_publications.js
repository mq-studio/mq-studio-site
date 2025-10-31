const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('[START] Loading publications page...');
  
  // Navigate to publications page
  await page.goto("http://localhost:3102/gallery/publications", {
    waitUntil: 'networkidle'
  });
  
  console.log('[LOADED] Page loaded');
  
  // Wait a bit for any data fetches
  await page.waitForTimeout(1500);
  
  // Take screenshot
  await page.screenshot({ path: "/tmp/publications_page.png", fullPage: false });
  console.log('[SCREENSHOT] Saved to /tmp/publications_page.png');
  
  // Get page content for inspection
  const html = await page.content();
  const hasSkeletons = html.includes('animate-pulse');
  const hasPublications = html.includes('publication-card');
  const cardCount = (html.match(/publication-card/g) || []).length;
  
  console.log('[ANALYSIS]');
  console.log('Has skeleton loaders: ' + hasSkeletons);
  console.log('Has publication cards: ' + hasPublications);
  console.log('Publication card count: ' + cardCount);
  
  // Check for loading state
  const loadingState = html.includes('loading') && html.includes('true');
  console.log('Page shows loading state: ' + loadingState);
  
  await browser.close();
  console.log('[DONE]');
})();
