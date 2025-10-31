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

  await page.waitForTimeout(2000);

  // Get page HTML
  const html = await page.content();

  // Get the first 2000 characters
  console.log('[PAGE START]');
  console.log(html.substring(0, 1500));

  console.log('\n[PAGE TITLE]');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (titleMatch) {
    console.log(titleMatch[1]);
  }

  // Check what's in body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]{0,1000})/);
  if (bodyMatch) {
    console.log('\n[BODY START]');
    console.log(bodyMatch[1]);
  }

  await browser.close();
})();
