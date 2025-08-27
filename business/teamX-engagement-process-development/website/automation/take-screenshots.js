#!/usr/bin/env node

/**
 * TeamX Website Screenshot Generator
 * Captures screenshots of all major pages using Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('../mcp-config/teamx-playwright-config.js');

class TeamXScreenshotTaker {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '..', 'screenshots');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    
    // Create timestamped directory
    this.outputDir = path.join(this.screenshotsDir, `teamx-screenshots-${this.timestamp}`);
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async takeScreenshots(browserName = 'chromium') {
    console.log(`📸 Taking TeamX website screenshots with ${browserName}...`);
    
    const browserConfig = config.browsers[browserName];
    const baseUrl = config.baseUrls.development;
    const pages = config.pages;
    
    let browser, context, page;
    
    try {
      // Launch browser
      browser = await chromium.launch({
        headless: browserConfig.headless,
        slowMo: config.automation.slowMo
      });
      
      context = await browser.newContext({
        viewport: browserConfig.viewport,
        userAgent: browserConfig.userAgent
      });
      
      page = await context.newPage();
      page.setDefaultTimeout(config.automation.waitTimeout);
      
      // Take screenshots of all pages
      const results = [];
      
      for (const [pageName, pagePath] of Object.entries(pages)) {
        console.log(`  📄 Capturing: ${pageName} (${pagePath})`);
        
        try {
          await page.goto(`${baseUrl}${pagePath}`);
          
          // Wait for page to fully load
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000); // Extra wait for animations
          
          // Take full page screenshot
          const screenshotPath = path.join(this.outputDir, `${pageName}-full.png`);
          await page.screenshot({ 
            path: screenshotPath, 
            fullPage: true 
          });
          
          // Take viewport screenshot
          const viewportScreenshotPath = path.join(this.outputDir, `${pageName}-viewport.png`);
          await page.screenshot({ 
            path: viewportScreenshotPath, 
            fullPage: false 
          });
          
          results.push({
            page: pageName,
            path: pagePath,
            fullPageScreenshot: screenshotPath,
            viewportScreenshot: viewportScreenshotPath,
            status: 'success',
            timestamp: new Date().toISOString()
          });
          
          console.log(`    ✅ Screenshots saved for ${pageName}`);
          
        } catch (error) {
          console.error(`    ❌ Failed to capture ${pageName}: ${error.message}`);
          results.push({
            page: pageName,
            path: pagePath,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Generate HTML report
      await this.generateReport(results);
      
      console.log(`\n📊 Screenshot Summary:`);
      console.log(`  ✅ Successful: ${results.filter(r => r.status === 'success').length}`);
      console.log(`  ❌ Failed: ${results.filter(r => r.status === 'failed').length}`);
      console.log(`  📁 Output directory: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Screenshot process failed:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async generateReport(results) {
    const reportPath = path.join(this.outputDir, 'screenshot-report.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeamX Website Screenshots - ${this.timestamp}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .page-section { 
            margin-bottom: 40px;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .page-title { 
            font-size: 1.5em; 
            margin-bottom: 20px; 
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .screenshot-container { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
        }
        .screenshot-item { 
            text-align: center; 
        }
        .screenshot-item img { 
            max-width: 100%; 
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .screenshot-label { 
            margin-top: 10px; 
            font-weight: 600;
            color: #374151;
        }
        .error { 
            color: #dc2626; 
            background-color: #fef2f2; 
            padding: 15px; 
            border-radius: 4px;
            border-left: 4px solid #dc2626;
        }
        .success { color: #16a34a; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            background: #f3f4f6;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #1f2937;
        }
        @media (max-width: 768px) {
            .screenshot-container { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TeamX Website Screenshots</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${results.length}</div>
                    <div>Total Pages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number success">${results.filter(r => r.status === 'success').length}</div>
                    <div>Successful</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #dc2626;">${results.filter(r => r.status === 'failed').length}</div>
                    <div>Failed</div>
                </div>
            </div>
        </div>
        
        ${results.map(result => `
            <div class="page-section">
                <h2 class="page-title">${result.page.charAt(0).toUpperCase() + result.page.slice(1)} Page</h2>
                <p><strong>Path:</strong> ${result.path}</p>
                
                ${result.status === 'success' ? `
                    <div class="screenshot-container">
                        <div class="screenshot-item">
                            <img src="${path.basename(result.fullPageScreenshot)}" alt="${result.page} - Full Page">
                            <div class="screenshot-label">Full Page</div>
                        </div>
                        <div class="screenshot-item">
                            <img src="${path.basename(result.viewportScreenshot)}" alt="${result.page} - Viewport">
                            <div class="screenshot-label">Viewport</div>
                        </div>
                    </div>
                ` : `
                    <div class="error">
                        <strong>Error:</strong> ${result.error}
                    </div>
                `}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📋 HTML report generated: ${reportPath}`);
    
    // Also save JSON results
    const jsonPath = path.join(this.outputDir, 'screenshot-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  }

  async captureROICalculator() {
    console.log('🧮 Capturing ROI Calculator interaction...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
      await page.goto(`${config.baseUrls.development}/services`);
      await page.waitForLoadState('networkidle');
      
      // Look for ROI calculator or similar interactive elements
      const calculator = await page.locator('[data-testid="roi-calculator"], .roi-calculator, #roi-calculator').first();
      
      if (await calculator.count() > 0) {
        // Take before screenshot
        await page.screenshot({ 
          path: path.join(this.outputDir, 'roi-calculator-before.png'),
          fullPage: true 
        });
        
        // Interact with calculator if found
        // This would need to be customized based on actual implementation
        console.log('  📊 ROI Calculator found and captured');
      } else {
        console.log('  ℹ️  ROI Calculator not found - taking services page screenshot instead');
        await page.screenshot({ 
          path: path.join(this.outputDir, 'services-page-detailed.png'),
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.error('  ❌ ROI Calculator capture failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

// Main execution
async function main() {
  const screenshotTaker = new TeamXScreenshotTaker();
  
  const args = process.argv.slice(2);
  const browser = args[0] || 'chromium';
  
  await screenshotTaker.takeScreenshots(browser);
  
  if (args.includes('--roi')) {
    await screenshotTaker.captureROICalculator();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TeamXScreenshotTaker;