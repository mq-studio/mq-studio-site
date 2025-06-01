#!/usr/bin/env python3
"""
E2B Browser Automation Test Script
Secure browser automation using E2B sandboxes with Playwright
"""

import asyncio
import base64
from datetime import datetime
import os
import sys

def test_browser_automation():
    """
    Test browser automation capabilities in E2B sandbox.
    This replaces the removed puppeteer MCP server functionality.
    """
    
    # Check if we're running in E2B
    if not os.getenv('E2B_SANDBOX'):
        print("⚠️  This script is designed to run in E2B sandbox")
        print("   Use the E2B MCP server to execute this script")
        return
    
    print("🚀 Starting secure browser automation test...")
    
    try:
        # Import Playwright (will be installed in E2B sandbox)
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            print("📱 Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Test navigation
            print("🌐 Navigating to test page...")
            page.goto("https://httpbin.org/")
            
            # Test screenshot functionality
            print("📸 Taking screenshot...")
            screenshot = page.screenshot()
            screenshot_b64 = base64.b64encode(screenshot).decode()
            
            # Test page content extraction
            print("📄 Extracting page content...")
            title = page.title()
            content = page.inner_text("body")[:200] + "..."
            
            # Test form interaction (safe test site)
            print("🔍 Testing form interaction...")
            page.goto("https://httpbin.org/forms/post")
            page.fill('input[name="custname"]', "Test User")
            page.fill('input[name="custtel"]', "123-456-7890")
            
            # Test JavaScript execution
            print("⚡ Testing JavaScript execution...")
            result = page.evaluate("() => ({ url: window.location.href, userAgent: navigator.userAgent })")
            
            browser.close()
            
            # Return results
            results = {
                "timestamp": datetime.now().isoformat(),
                "status": "success",
                "capabilities": {
                    "navigation": "✅ Working",
                    "screenshots": "✅ Working", 
                    "content_extraction": "✅ Working",
                    "form_interaction": "✅ Working",
                    "javascript_execution": "✅ Working"
                },
                "test_data": {
                    "page_title": title,
                    "content_sample": content,
                    "screenshot_size": len(screenshot),
                    "js_result": result
                },
                "security": {
                    "sandbox": "E2B isolated environment",
                    "governance": "IDP compliant",
                    "risk_level": "Low"
                }
            }
            
            print("\n🎉 Browser automation test completed successfully!")
            print(f"📊 Results: {results}")
            return results
            
    except ImportError:
        print("❌ Playwright not installed in sandbox")
        print("   Installing Playwright...")
        os.system("pip install playwright")
        os.system("playwright install chromium")
        print("   Please run the test again")
        return {"status": "needs_retry", "message": "Playwright installed"}
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    test_browser_automation()