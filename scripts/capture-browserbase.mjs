#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Stagehand } from '@browserbasehq/stagehand';

// Load secrets from .env.local first (if present) then fallback to .env
const projectRoot = process.cwd();
const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.BROWSERBASE_API_KEY;
const projectId = process.env.BROWSERBASE_PROJECT_ID;
const targetUrl = process.env.MQ_STUDIO_URL;
const routesEnv = process.env.MQ_STUDIO_ROUTES;

if (!apiKey) {
  console.error('❌ Missing BROWSERBASE_API_KEY. Add it to .env.local or export it before running.');
  process.exit(1);
}

if (!targetUrl) {
  console.error('❌ Missing MQ_STUDIO_URL. Expose your dev server (Codespace, ngrok, etc.) and set the public URL.');
  process.exit(1);
}

const defaultRoutes = ['/', '/artworks', '/publications', '/musings'];
const outputDir = path.join(projectRoot, 'tmp');

function parseRoutes(value) {
  if (!value) {
    return defaultRoutes;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String);
    }
    console.warn('⚠️ MQ_STUDIO_ROUTES must be a non-empty JSON array. Falling back to defaults.');
  } catch (error) {
    console.warn('⚠️ Failed to parse MQ_STUDIO_ROUTES. Expecting a JSON array. Falling back to defaults.');
  }

  return defaultRoutes;
}

function slugForRoute(route) {
  if (!route || route === '/') {
    return 'home';
  }

  const normalized = route.replace(/^\/+/g, '').replace(/\/+$/g, '');
  const slug = normalized
    .replace(/\/+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');

  return slug || 'route';
}

function buildUrl(baseUrl, route) {
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  if (!route || route === '/') {
    return trimmedBase || '/';
  }

  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `${trimmedBase}${normalizedRoute}`;
}

const routes = parseRoutes(routesEnv);

async function capture() {
  console.log(`📸 Capturing ${routes.length} route(s) via Browserbase at ${targetUrl}...`);

  const stagehand = new Stagehand({
    apiKey,
    projectId,
    browser: 'chromium',
  });

  try {
    const page = await stagehand.newPage();
    fs.mkdirSync(outputDir, { recursive: true });

    for (const route of routes) {
      const url = buildUrl(targetUrl, route);
      const slug = slugForRoute(route);
      const screenshotPath = path.join(outputDir, `${slug}-browserbase.png`);

      console.log(`➡️ Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const buffer = await page.screenshot({ fullPage: true });
      fs.writeFileSync(screenshotPath, buffer);

      console.log(`✅ Screenshot saved to ${screenshotPath}`);
    }
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await stagehand.close();
  }
}

capture();
