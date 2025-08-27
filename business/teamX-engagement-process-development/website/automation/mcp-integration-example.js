#!/usr/bin/env node

/**
 * TeamX Playwright MCP Integration Example
 * Demonstrates how to use Playwright MCP with Claude Code for TeamX website automation
 */

const { chromium } = require('playwright');
const config = require('../mcp-config/teamx-playwright-config.js');

class MCPPlaywrightExample {
  constructor() {
    this.baseUrl = config.baseUrls.development;
  }

  /**
   * Example: Comprehensive website analysis
   * This demonstrates what Claude Code could do with Playwright MCP
   */
  async performWebsiteAnalysis() {
    console.log('🔍 Starting comprehensive TeamX website analysis...');
    
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slower for demonstration
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to homepage
      console.log('📍 Navigating to homepage...');
      await page.goto(this.baseUrl);
      await page.waitForLoadState('networkidle');
      
      // Analyze page structure
      const analysis = await this.analyzePage(page);
      console.log('📊 Homepage Analysis:', analysis);
      
      // Test navigation
      console.log('🧭 Testing navigation...');
      const navigationResults = await this.testNavigation(page);
      console.log('🔗 Navigation Test Results:', navigationResults);
      
      // Test responsive design
      console.log('📱 Testing responsive design...');
      const responsiveResults = await this.testResponsiveDesign(page);
      console.log('📐 Responsive Design Results:', responsiveResults);
      
      // Test performance
      console.log('⚡ Testing performance...');
      const performanceResults = await this.testPerformance(page);
      console.log('🏃 Performance Results:', performanceResults);
      
      return {
        analysis,
        navigationResults,
        responsiveResults,
        performanceResults,
        timestamp: new Date().toISOString()
      };
      
    } finally {
      await browser.close();
    }
  }

  async analyzePage(page) {
    const title = await page.title();
    const url = page.url();
    
    // Count different element types
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const links = await page.locator('a').count();
    const images = await page.locator('img').count();
    const buttons = await page.locator('button').count();
    const forms = await page.locator('form').count();
    
    // Check for key elements
    const hasHeader = await page.locator('header').count() > 0;
    const hasFooter = await page.locator('footer').count() > 0;
    const hasNav = await page.locator('nav').count() > 0;
    
    // Check for meta tags
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    const metaKeywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    
    return {
      title,
      url,
      elementCounts: {
        headings,
        links,
        images,
        buttons,
        forms
      },
      structure: {
        hasHeader,
        hasFooter,
        hasNav
      },
      seo: {
        metaDescription,
        metaKeywords
      }
    };
  }

  async testNavigation(page) {
    const results = [];
    
    const navigationLinks = [
      { name: 'About', selector: '[href="/about"]' },
      { name: 'Services', selector: '[href="/services"]' },
      { name: 'Process', selector: '[href="/process"]' },
      { name: 'Contact', selector: '[href="/contact"]' }
    ];
    
    for (const link of navigationLinks) {
      try {
        console.log(`  🔗 Testing navigation to ${link.name}...`);
        
        // Click the link
        await page.click(link.selector);
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the correct page
        const currentUrl = page.url();
        const title = await page.title();
        
        results.push({
          name: link.name,
          selector: link.selector,
          success: true,
          url: currentUrl,
          title,
          loadTime: await this.measureLoadTime(page)
        });
        
        // Go back to homepage
        await page.goto(this.baseUrl);
        await page.waitForLoadState('networkidle');
        
      } catch (error) {
        results.push({
          name: link.name,
          selector: link.selector,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async testResponsiveDesign(page) {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if mobile menu exists for smaller screens
      const hasMobileMenu = viewport.width < 768 ? 
        await page.locator('.mobile-menu, [data-testid="mobile-menu"]').count() > 0 : 
        null;
      
      // Check if content is visible
      const headerVisible = await page.locator('header').isVisible();
      const contentVisible = await page.locator('main').isVisible();
      
      results.push({
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        hasMobileMenu,
        headerVisible,
        contentVisible,
        timestamp: new Date().toISOString()
      });
    }
    
    // Reset to default viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    return results;
  }

  async testPerformance(page) {
    console.log('  ⚡ Measuring page load performance...');
    
    const startTime = Date.now();
    await page.goto(this.baseUrl);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics if available
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')[0];
      return entries ? {
        domContentLoaded: entries.domContentLoadedEventEnd - entries.navigationStart,
        loadComplete: entries.loadEventEnd - entries.navigationStart,
        domInteractive: entries.domInteractive - entries.navigationStart
      } : null;
    });
    
    return {
      totalLoadTime: loadTime,
      performanceEntries,
      timestamp: new Date().toISOString()
    };
  }

  async measureLoadTime(page) {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  /**
   * Example: Contact form testing
   */
  async testContactForm() {
    console.log('📝 Testing contact form...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(`${this.baseUrl}/contact`);
      await page.waitForLoadState('networkidle');
      
      // Fill out form
      const testData = {
        name: 'Playwright Test User',
        email: 'playwright-test@example.com',
        company: 'Test Company',
        message: 'This is a test message from Playwright automation testing.'
      };
      
      // Look for common form field selectors
      const nameField = page.locator('input[name="name"], input[id="name"], #contact-name');
      const emailField = page.locator('input[name="email"], input[id="email"], #contact-email');
      const companyField = page.locator('input[name="company"], input[id="company"], #contact-company');
      const messageField = page.locator('textarea[name="message"], textarea[id="message"], #contact-message');
      
      if (await nameField.count() > 0) {
        await nameField.first().fill(testData.name);
        console.log('  ✅ Name field filled');
      }
      
      if (await emailField.count() > 0) {
        await emailField.first().fill(testData.email);
        console.log('  ✅ Email field filled');
      }
      
      if (await companyField.count() > 0) {
        await companyField.first().fill(testData.company);
        console.log('  ✅ Company field filled');
      }
      
      if (await messageField.count() > 0) {
        await messageField.first().fill(testData.message);
        console.log('  ✅ Message field filled');
      }
      
      // Take screenshot of filled form
      await page.screenshot({ 
        path: './screenshots/contact-form-filled.png',
        fullPage: true 
      });
      console.log('  📸 Screenshot taken: contact-form-filled.png');
      
      // Note: We don't actually submit the form to avoid sending test data
      console.log('  ℹ️  Form validation complete (submission skipped)');
      
      return {
        success: true,
        fieldsFound: {
          name: await nameField.count() > 0,
          email: await emailField.count() > 0,
          company: await companyField.count() > 0,
          message: await messageField.count() > 0
        },
        testData
      };
      
    } catch (error) {
      console.error('  ❌ Contact form test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await browser.close();
    }
  }
}

// Example usage and CLI
async function main() {
  const example = new MCPPlaywrightExample();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--analysis')) {
    const results = await example.performWebsiteAnalysis();
    console.log('\n🎯 Complete Analysis Results:');
    console.log(JSON.stringify(results, null, 2));
  }
  
  if (args.includes('--contact-form')) {
    const results = await example.testContactForm();
    console.log('\n📝 Contact Form Test Results:');
    console.log(JSON.stringify(results, null, 2));
  }
  
  if (args.length === 0) {
    console.log('🎭 TeamX Playwright MCP Integration Examples');
    console.log('\nAvailable options:');
    console.log('  --analysis      Run comprehensive website analysis');
    console.log('  --contact-form  Test the contact form');
    console.log('\nExample usage:');
    console.log('  node automation/mcp-integration-example.js --analysis');
    console.log('  node automation/mcp-integration-example.js --contact-form');
    console.log('  node automation/mcp-integration-example.js --analysis --contact-form');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPPlaywrightExample;