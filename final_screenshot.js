const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });

  // Navigate
  await page.goto("http://localhost:3102/gallery/publications", {
    waitUntil: 'networkidle'
  });

  // Wait for data to load
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: "/tmp/publications_fixed.png", fullPage: false });
  console.log('Screenshot saved to /tmp/publications_fixed.png');

  // Check content
  const html = await page.content();
  const hasCards = html.includes('publication-card');
  const cardMatches = html.match(/publication-card--/g) || [];

  console.log('Has publication-card: ' + hasCards);
  console.log('Card count: ' + cardMatches.length);

  await browser.close();
})();
