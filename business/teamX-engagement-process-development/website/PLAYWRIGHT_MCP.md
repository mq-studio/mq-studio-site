# TeamX Playwright MCP Integration

## Overview

The Microsoft Playwright MCP (Model Context Protocol) server has been integrated into the TeamX website project to provide browser automation capabilities. This integration enables Claude Code and other MCP clients to perform automated browser testing, screenshot capture, and website analysis.

## Installation & Setup

### Dependencies Installed

- `@playwright/mcp@latest` - Microsoft Playwright MCP server
- `@modelcontextprotocol/sdk` - MCP SDK for integration
- `playwright` - Playwright browser automation library

### Browser Support

All major browsers are installed and configured:
- **Chromium** (default)
- **Firefox**
- **WebKit** (Safari engine)

## Configuration Files

### 1. MCP Server Configurations

#### `/mcp-config/playwright-server-config.json`
Multi-server configuration supporting different browser types and modes:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless", "false", "--viewport-size", "1920,1080"]
    },
    "playwright-headless": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless", "true", "--viewport-size", "1920,1080"]
    }
  }
}
```

#### `/mcp-config/claude-desktop-config.json`
Simplified configuration for Claude Desktop integration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless", "false", "--viewport-size", "1920,1080"],
      "env": {
        "NODE_ENV": "development",
        "TEAMX_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

#### `/mcp-config/teamx-playwright-config.js`
Comprehensive configuration for TeamX-specific automation scenarios including:
- Browser settings for all supported browsers
- Base URLs for different environments
- Page path definitions
- Automation settings and timeouts
- Predefined test scenarios

### 2. Integration with Claude Desktop

To use with Claude Desktop, copy the contents of `/mcp-config/claude-desktop-config.json` to your Claude Desktop configuration file:

**macOS/Linux:** `~/.config/claude-desktop/config.json`
**Windows:** `%APPDATA%\Claude Desktop\config.json`

## Available NPM Scripts

### MCP Server Scripts
```bash
# Start default Playwright MCP server
npm run playwright:mcp

# Start headless Playwright MCP server
npm run playwright:mcp-headless

# Start with Firefox browser
npm run playwright:mcp-firefox

# Start with WebKit browser
npm run playwright:mcp-webkit
```

### Automation Scripts
```bash
# Run comprehensive website tests
npm run playwright:test

# Generate screenshots of all pages
npm run playwright:screenshots

# Set up automation directories
npm run playwright:setup
```

## Automation Capabilities

### 1. Website Testing (`/automation/run-tests.js`)

Comprehensive testing framework that supports:

- **Multi-browser testing** (Chromium, Firefox, WebKit)
- **Navigation testing** across all pages
- **Contact form validation**
- **Screenshot capture** during tests
- **Automated reporting** with JSON and console output

**Usage Examples:**
```bash
# Run single test
node automation/run-tests.js chromium fullSiteNavigation

# Run all tests across all browsers
node automation/run-tests.js --all
```

**Available Test Scenarios:**
- `fullSiteNavigation` - Tests navigation through all main pages
- `contactFormTest` - Validates contact form functionality
- `roiCalculatorTest` - Tests ROI calculator interaction (if implemented)

### 2. Screenshot Generation (`/automation/take-screenshots.js`)

Automated screenshot capture system:

- **Full-page screenshots** of all website pages
- **Viewport screenshots** for above-the-fold content
- **HTML report generation** with organized gallery view
- **Responsive design testing** across different viewport sizes

**Usage Examples:**
```bash
# Generate screenshots for all pages
node automation/take-screenshots.js

# Include ROI calculator capture
node automation/take-screenshots.js --roi
```

**Output:**
- Screenshots saved to `/screenshots/teamx-screenshots-{date}/`
- HTML report: `screenshot-report.html`
- JSON results: `screenshot-results.json`

### 3. MCP Integration Examples (`/automation/mcp-integration-example.js`)

Demonstrates advanced Playwright MCP capabilities:

- **Comprehensive website analysis**
  - Page structure analysis
  - SEO metadata extraction
  - Element counting and validation
- **Navigation testing**
  - Link validation
  - Load time measurement
- **Responsive design testing**
  - Multi-viewport testing
  - Mobile menu validation
- **Performance analysis**
  - Load time measurement
  - Performance API integration

**Usage Examples:**
```bash
# Run complete website analysis
node automation/mcp-integration-example.js --analysis

# Test contact form
node automation/mcp-integration-example.js --contact-form

# Run both
node automation/mcp-integration-example.js --analysis --contact-form
```

## Claude Code Integration

### Using Playwright MCP with Claude Code

Once configured, Claude Code can use the Playwright MCP server to:

1. **Navigate and interact** with the TeamX website
2. **Capture screenshots** of specific pages or elements
3. **Test functionality** like forms and interactive components
4. **Analyze website structure** and performance
5. **Generate reports** on website health and usability

### Example Commands for Claude Code

```
"Take a screenshot of the TeamX homepage"
"Navigate to the services page and test the ROI calculator"
"Check if all navigation links work properly"
"Analyze the responsive design on mobile devices"
"Test the contact form but don't submit it"
```

## File Structure

```
website/
├── mcp-config/
│   ├── playwright-server-config.json
│   ├── claude-desktop-config.json
│   └── teamx-playwright-config.js
├── automation/
│   ├── run-tests.js
│   ├── take-screenshots.js
│   └── mcp-integration-example.js
├── screenshots/
│   └── (generated screenshots and reports)
└── PLAYWRIGHT_MCP.md
```

## Troubleshooting

### Common Issues

#### 1. System Dependencies Missing
If you see warnings about missing system dependencies:

```bash
# Install system dependencies (requires sudo)
sudo npx playwright install-deps

# Alternative for Ubuntu/Debian
sudo apt-get install libnspr4 libnss3
```

#### 2. Browser Not Found
If browsers aren't found:

```bash
# Reinstall browsers
npx playwright install
```

#### 3. Permission Issues
Ensure the automation scripts are executable:

```bash
chmod +x automation/*.js
```

### Environment Variables

Useful environment variables for configuration:

```bash
# Set base URL for testing
export TEAMX_BASE_URL=http://localhost:3000

# Set headless mode
export PLAYWRIGHT_HEADLESS=true

# Set browser
export PLAYWRIGHT_BROWSER=firefox
```

## Performance Considerations

### Resource Usage
- **Browser instances** use significant memory (~100-200MB per browser)
- **Screenshot generation** can be disk-intensive
- **Parallel testing** may impact system performance

### Optimization Tips
1. Use headless mode for CI/CD environments
2. Limit concurrent browser instances
3. Clean up old screenshot directories regularly
4. Use viewport screenshots instead of full-page when possible

## Security Considerations

### Data Protection
- Test data is never submitted to live forms
- Screenshots may contain sensitive information
- Browser storage is cleared between test sessions

### Network Security
- Automation is restricted to localhost by default
- Production URLs require explicit configuration
- No external data transmission without consent

## Integration Examples

### 1. Daily Health Check
```bash
#!/bin/bash
# Daily website health check
npm run playwright:test -- --all
npm run playwright:screenshots
```

### 2. Pre-deployment Testing
```bash
#!/bin/bash
# Run before deploying changes
npm run dev &
sleep 10
npm run playwright:test
kill %1
```

### 3. Responsive Design Validation
```javascript
// Custom viewport testing
const viewports = [
  { width: 320, height: 568 },  // iPhone SE
  { width: 768, height: 1024 }, // iPad
  { width: 1440, height: 900 }  // Desktop
];
```

## Future Enhancements

### Planned Features
- **A/B testing support** for different page variants
- **Performance regression testing** with baseline comparisons
- **Accessibility testing** integration
- **SEO analysis** with detailed reporting
- **Integration with CI/CD** pipelines

### MCP Server Extensions
- Custom TeamX-specific automation commands
- Integration with TeamX business logic testing
- Automated ROI calculator validation
- Client journey testing scenarios

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Playwright MCP documentation](https://github.com/microsoft/playwright-mcp)
3. Examine log files in the `/screenshots/` directory
4. Test with simpler scenarios first

## Version Information

- **Playwright MCP**: v0.0.35
- **Playwright**: v1.55.0
- **MCP SDK**: v1.17.4
- **Node.js**: 18+ required

---

*This integration provides a solid foundation for browser automation within the TeamX project. The modular design allows for easy extension and customization as needs evolve.*