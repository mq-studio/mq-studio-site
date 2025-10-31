const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewportSize({ width: 1920, height: 1080 });

  // Navigate to publications page
  await page.goto("http://localhost:3102/gallery/publications", {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(2000);

  // Get page HTML
  const html = await page.content();

  // Check for various elements
  const tests = [
    ['Publications Archive', html.includes('Publications Archive')],
    ['animated skeleton', html.includes('animate-pulse')],
    ['publication-card class', html.includes('publication-card')],
    ['Title element (h2)', html.match(/<h2[^>]*>([^<]*)<\/h2>/g) ? true : false],
    ['Publication grid', html.includes('publications-grid')],
    ['No publications text', html.includes('No publications found')],
  ];

  console.log('[PAGE CONTENT ANALYSIS]');
  tests.forEach(([test, result]) => {
    console.log(test + ': ' + result);
  });

  // Find all divs with specific patterns
  const gridMatch = html.match(/class="[^"]*publications-grid[^"]*"/);
  if (gridMatch) {
    console.log('\n[FOUND GRID]');
    console.log(gridMatch[0]);
  }

  // Check for React root and what's rendered
  const mainContent = html.match(/<section[^>]*class="[^"]*px-6 pb-16[^"]*"[^>]*>[\s\S]*?<\/section>/);
  if (mainContent) {
    const content = mainContent[0].substring(0, 500);
    console.log('\n[PUBLICATIONS SECTION]');
    console.log(content);
  }

  await browser.close();
})();
