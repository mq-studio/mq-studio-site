# E2B Browser Automation

Secure browser automation using E2B sandboxes to replace the removed puppeteer MCP server.

## Security Benefits
- ✅ **Isolated Execution**: Runs in E2B Firecracker microVMs
- ✅ **No Host Access**: Cannot access local filesystem or network
- ✅ **Governance Compliant**: Monitored by IDP governance framework
- ✅ **Automatic Cleanup**: Resources auto-destroyed after execution

## Capabilities
- Web navigation and screenshots
- Form interaction and data extraction
- JavaScript execution in browser context
- Multi-browser support (Chromium, Firefox, Safari)

## Setup Requirements

### 1. E2B API Key
Sign up at https://e2b.dev and get your API key:
```bash
# Add to Claude Desktop config
"E2B_API_KEY": "e2b_your_actual_api_key_here"
```

### 2. Test Browser Automation
```python
# Example usage through E2B MCP server
import browser_test
results = browser_test.test_browser_automation()
```

## Features Comparison

| Feature | Removed Puppeteer MCP | E2B Browser Automation |
|---------|----------------------|------------------------|
| Security | ❌ Local system access | ✅ Sandboxed execution |
| Screenshots | ✅ | ✅ |
| Form Interaction | ✅ | ✅ |
| JavaScript Execution | ✅ | ✅ |
| Network Isolation | ❌ | ✅ |
| Governance Compliance | ❌ | ✅ |

## Usage Examples

### Take Screenshot
```python
screenshot = page.screenshot()
screenshot_b64 = base64.b64encode(screenshot).decode()
```

### Extract Content
```python
title = page.title()
content = page.inner_text("body")
```

### Form Interaction
```python
page.fill('input[name="email"]', "user@example.com")
page.click('button[type="submit"]')
```

### JavaScript Execution
```python
result = page.evaluate("() => document.title")
```

This solution provides equivalent functionality to the removed puppeteer MCP server while maintaining security and governance compliance.