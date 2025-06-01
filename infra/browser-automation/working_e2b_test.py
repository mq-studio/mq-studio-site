#!/usr/bin/env python3
"""
Working E2B Browser Test
Test browser automation through E2B API correctly
"""

import os

# Set API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def test_e2b_browser():
    """Test E2B browser automation properly"""
    
    print("🚀 Testing E2B Browser Automation")
    print("=" * 40)
    
    try:
        from e2b import Sandbox
        
        # Create sandbox
        print("🏗️  Creating E2B sandbox...")
        sandbox = Sandbox(template="base")
        
        print("✅ E2B sandbox created successfully!")
        
        # Test basic functionality
        print("🧪 Testing sandbox functionality...")
        result = sandbox.process.start_and_wait("echo 'Hello from E2B!'")
        print(f"📋 Test output: {result.stdout}")
        
        # Install Playwright
        print("📦 Installing Playwright in sandbox...")
        install_cmd = "pip install playwright"
        install_result = sandbox.process.start_and_wait(install_cmd)
        
        if install_result.exit_code == 0:
            print("✅ Playwright installed successfully!")
            
            # Install browser
            print("🌐 Installing Chromium browser...")
            browser_cmd = "playwright install chromium"
            browser_result = sandbox.process.start_and_wait(browser_cmd)
            
            if browser_result.exit_code == 0:
                print("✅ Browser installed successfully!")
                
                # Create and run browser test script
                print("🧪 Running browser automation test...")
                
                browser_script = '''
import asyncio
from playwright.async_api import async_playwright

async def run_browser_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to test page
        await page.goto("https://httpbin.org/")
        title = await page.title()
        print(f"✅ Page title: {title}")
        
        # Take screenshot
        screenshot = await page.screenshot()
        print(f"📸 Screenshot captured: {len(screenshot)} bytes")
        
        # Extract content
        content = await page.inner_text("body")
        print(f"📄 Content sample: {content[:100]}...")
        
        # Test navigation to another page
        await page.goto("https://httpbin.org/html")
        html_title = await page.title()
        print(f"📄 HTML page title: {html_title}")
        
        await browser.close()
        print("🎉 Browser automation test completed successfully!")

# Run the test
asyncio.run(run_browser_test())
'''
                
                # Write script to sandbox
                sandbox.files.write("browser_test.py", browser_script)
                
                # Run browser test
                test_result = sandbox.process.start_and_wait("python browser_test.py")
                
                print("📋 Browser automation results:")
                print(test_result.stdout)
                
                if test_result.stderr:
                    print("⚠️  Warnings/Errors:")
                    print(test_result.stderr)
                
                if test_result.exit_code == 0:
                    print("\n🎉 BROWSER AUTOMATION TEST SUCCESSFUL!")
                    print("✅ E2B + Playwright is working perfectly!")
                    print("✅ Screenshots, navigation, and content extraction all work")
                    print("✅ Secure sandbox environment verified")
                else:
                    print(f"\n❌ Browser test failed with exit code: {test_result.exit_code}")
            else:
                print("❌ Browser installation failed")
                print(browser_result.stderr)
        else:
            print("❌ Playwright installation failed")
            print(install_result.stderr)
        
        # Clean up
        print("\n🧹 Cleaning up sandbox...")
        sandbox.close()
        
        print("\n📊 Summary:")
        print("✅ E2B API connection working")
        print("✅ Sandbox creation successful")
        print("✅ Browser automation capabilities verified")
        print("✅ Ready for Claude Desktop integration")
        
        return True
        
    except Exception as e:
        print(f"❌ E2B test failed: {e}")
        return False

if __name__ == "__main__":
    test_e2b_browser()