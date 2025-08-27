#!/usr/bin/env node

/**
 * TeamX Playwright Automation Test Runner
 * Runs browser automation tests for the TeamX website
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('../mcp-config/teamx-playwright-config.js');

class TeamXTestRunner {
  constructor() {
    this.browsers = [];
    this.results = [];
    this.screenshotsDir = path.join(__dirname, '..', 'screenshots');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async runTest(browserName = 'chromium', scenarioName = 'fullSiteNavigation') {
    console.log(`🚀 Starting test: ${scenarioName} on ${browserName}`);
    
    const browserConfig = config.browsers[browserName];
    const scenario = config.scenarios[scenarioName];
    const baseUrl = config.baseUrls.development;
    
    let browser, context, page;
    
    try {
      // Launch browser
      const launchOptions = {
        headless: browserConfig.headless,
        slowMo: config.automation.slowMo
      };
      
      browser = await this.getBrowser(browserName).launch(launchOptions);
      context = await browser.newContext({
        viewport: browserConfig.viewport,
        userAgent: browserConfig.userAgent
      });
      
      page = await context.newPage();
      
      // Set timeouts
      page.setDefaultTimeout(config.automation.waitTimeout);
      page.setDefaultNavigationTimeout(config.automation.navigationTimeout);
      
      console.log(`📄 Running scenario: ${scenarioName}`);
      
      // Execute scenario steps
      for (const step of scenario) {
        await this.executeStep(page, step, baseUrl);
      }
      
      console.log(`✅ Test completed successfully: ${scenarioName} on ${browserName}`);
      this.results.push({
        browser: browserName,
        scenario: scenarioName,
        status: 'passed',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Test failed: ${scenarioName} on ${browserName}`, error.message);
      this.results.push({
        browser: browserName,
        scenario: scenarioName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async executeStep(page, step, baseUrl) {
    console.log(`  🔄 Executing: ${step.action}`);
    
    switch (step.action) {
      case 'goto':
        await page.goto(`${baseUrl}${step.path}`);
        break;
        
      case 'click':
        await page.click(step.selector);
        break;
        
      case 'fill':
        await page.fill(step.selector, step.value);
        break;
        
      case 'waitForSelector':
        await page.waitForSelector(step.selector);
        break;
        
      case 'screenshot':
        const screenshotPath = path.join(this.screenshotsDir, `${step.name}-${Date.now()}.png`);
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        console.log(`    📸 Screenshot saved: ${screenshotPath}`);
        break;
        
      default:
        console.warn(`    ⚠️  Unknown action: ${step.action}`);
    }
    
    // Small delay between steps
    await page.waitForTimeout(500);
  }

  getBrowser(browserName) {
    switch (browserName) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  async runAllTests() {
    const browsers = ['chromium', 'firefox', 'webkit'];
    const scenarios = ['fullSiteNavigation', 'contactFormTest'];
    
    console.log('🎭 TeamX Playwright Test Suite Starting...\n');
    
    for (const browser of browsers) {
      for (const scenario of scenarios) {
        await this.runTest(browser, scenario);
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${this.results.length}\n`);
    
    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  - ${r.scenario} on ${r.browser}: ${r.error}`);
        });
    }
    
    // Save results to file
    const resultsPath = path.join(__dirname, '..', 'screenshots', 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`📋 Detailed results saved to: ${resultsPath}`);
  }
}

// Main execution
async function main() {
  const testRunner = new TeamXTestRunner();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const browser = args[0] || 'chromium';
  const scenario = args[1] || 'fullSiteNavigation';
  
  if (args.includes('--all')) {
    await testRunner.runAllTests();
  } else {
    await testRunner.runTest(browser, scenario);
    testRunner.printResults();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TeamXTestRunner;