/**
 * TeamX Playwright MCP Configuration
 * Browser automation settings for TeamX website testing
 */

module.exports = {
  // Browser configurations
  browsers: {
    chromium: {
      headless: false,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'TeamX-Playwright-Bot/1.0'
    },
    firefox: {
      headless: false,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'TeamX-Playwright-Bot/1.0'
    },
    webkit: {
      headless: false,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'TeamX-Playwright-Bot/1.0'
    }
  },

  // Base URLs for different environments
  baseUrls: {
    development: 'http://localhost:3000',
    staging: 'https://staging.teamx.healthcare',
    production: 'https://teamx.healthcare'
  },

  // Test page paths
  pages: {
    home: '/',
    about: '/about',
    services: '/services',
    process: '/process',
    frameworks: '/frameworks',
    caseStudies: '/case-studies',
    team: '/team',
    resources: '/resources',
    contact: '/contact',
    investors: '/investors'
  },

  // Automation settings
  automation: {
    waitTimeout: 30000,
    navigationTimeout: 30000,
    screenshotPath: './screenshots',
    recordVideo: false,
    slowMo: 100 // Add delay between actions for better visibility
  },

  // Test scenarios
  scenarios: {
    fullSiteNavigation: [
      { action: 'goto', path: '/' },
      { action: 'screenshot', name: 'homepage' },
      { action: 'click', selector: '[href="/about"]' },
      { action: 'screenshot', name: 'about-page' },
      { action: 'click', selector: '[href="/services"]' },
      { action: 'screenshot', name: 'services-page' },
      { action: 'click', selector: '[href="/process"]' },
      { action: 'screenshot', name: 'process-page' },
      { action: 'click', selector: '[href="/contact"]' },
      { action: 'screenshot', name: 'contact-page' }
    ],
    roiCalculatorTest: [
      { action: 'goto', path: '/services' },
      { action: 'waitForSelector', selector: '[data-testid="roi-calculator"]' },
      { action: 'fill', selector: 'input[name="revenue"]', value: '1000000' },
      { action: 'fill', selector: 'input[name="employees"]', value: '50' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'screenshot', name: 'roi-results' }
    ],
    contactFormTest: [
      { action: 'goto', path: '/contact' },
      { action: 'fill', selector: 'input[name="name"]', value: 'Test User' },
      { action: 'fill', selector: 'input[name="email"]', value: 'test@example.com' },
      { action: 'fill', selector: 'input[name="company"]', value: 'Test Company' },
      { action: 'fill', selector: 'textarea[name="message"]', value: 'This is a test message from Playwright automation.' },
      { action: 'screenshot', name: 'contact-form-filled' }
    ]
  }
};