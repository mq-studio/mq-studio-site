#!/usr/bin/env node

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const BASE_URL = process.env.MQ_STUDIO_URL || 'http://localhost:3100';

const PAGES = [
  { slug: '/', name: 'home-hero.png' },
  { slug: '/artworks', name: 'artworks.png' },
  { slug: '/publications', name: 'publications.png' },
  { slug: '/musings', name: 'musings.png' },
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const launchBrowser = async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  for (const { slug, name } of PAGES) {
    const url = `${BASE_URL}${slug}`;
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(750);
    const filePath = path.join(OUTPUT_DIR, name);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved ${filePath}`);
  }

  await browser.close();
};

launchBrowser().catch((err) => {
  console.error(err);
  process.exit(1);
});
