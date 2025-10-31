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
  await page.screenshot({ path: "/tmp/publications_page_final.png", fullPage: false });
  console.log('[SCREENSHOT] Saved to /tmp/publications_page_final.png');
  
  // Get page content for inspection
  const html = await page.content();
  const hasCards = html.includes('publication-card');
  const cardMatches = html.match(/publication-card--/g) || [];
  const cardCount = cardMatches.length;
  const titles = (html.match(/<h2[^>]*>[^<]*<\/h2>/g) || []).length;
  
  console.log('[ANALYSIS]');
  console.log('Has publication-card class: ' + hasCards);
  console.log('Publication card elements: ' + cardCount);
  console.log('Title elements found: ' + titles);
  
  await browser.close();
  console.log('[DONE]');
})();
