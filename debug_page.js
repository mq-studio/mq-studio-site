const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type ? msg.type() : 'log';
    consoleLogs.push('[' + type.toUpperCase() + '] ' + msg.text());
    console.log('CONSOLE: ' + msg.text());
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR: ' + err.message);
  });

  // Navigate to publications page
  await page.goto("http://localhost:3102/gallery/publications", {
    waitUntil: 'networkidle'
  });

  console.log('[LOADED] Page loaded');

  // Wait longer for data fetches
  await page.waitForTimeout(3000);

  // Get page HTML to check component state
  const html = await page.content();
  const hasLoading = html.includes('animate-pulse');

  console.log('\n[STATE ANALYSIS]');
  console.log('Loading state visible: ' + hasLoading);
  console.log('\n[CONSOLE LOGS]');
  consoleLogs.forEach(log => console.log('  ' + log));

  await browser.close();
})();
