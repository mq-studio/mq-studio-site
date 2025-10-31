const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../tmp');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test('Capture MQ Studio homepage hero', async ({ page }) => {
  await page.goto(process.env.MQ_STUDIO_URL || 'http://localhost:3100', {
    waitUntil: 'networkidle',
  });

  await page.waitForTimeout(1000); // allow fonts/animations to settle

  const filePath = path.join(SCREENSHOT_DIR, 'hero.png');
  await page.screenshot({ path: filePath, fullPage: true });

  console.log(`Screenshot saved to ${filePath}`);
});
