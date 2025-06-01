#!/usr/bin/env python3
"""
Quick E2B Browser Test
Test browser automation through E2B API directly
"""

import json
import os

# Set API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def test_e2b_direct():
    """Test E2B browser automation directly"""
    
    print("🚀 Testing E2B Browser Automation")
    print("=" * 40)
    
    try:
        # Try to import E2B
        print("📦 Installing E2B Python SDK...")
        os.system("pip install e2b --quiet")
        
        print("🔌 Testing E2B connection...")
        from e2b import Sandbox
        
        # Create sandbox
        print("🏗️  Creating E2B sandbox...")
        sandbox = Sandbox(template="base")
        
        print("✅ E2B sandbox created successfully!")
        print(f"📊 Sandbox ID: {sandbox.id}")
        
        # Install Playwright in sandbox
        print("📦 Installing Playwright in sandbox...")
        install_result = sandbox.process.start_and_wait("pip install playwright")
        print(f"   Install result: {install_result.exit_code}")
        
        if install_result.exit_code == 0:
            print("📦 Installing browser binaries...")
            browser_install = sandbox.process.start_and_wait("playwright install chromium")
            print(f"   Browser install result: {browser_install.exit_code}")
            
            if browser_install.exit_code == 0:
                # Test browser automation
                print("🌐 Running browser automation test...")
                
                browser_script = '''
from playwright.sync_api import sync_playwright
import base64

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Test navigation
    page.goto("https://httpbin.org/")
    title = page.title()
    print(f"Page title: {title}")
    
    # Test screenshot
    screenshot = page.screenshot()
    print(f"Screenshot size: {len(screenshot)} bytes")
    
    # Test content extraction
    content = page.inner_text("body")[:200]
    print(f"Content sample: {content}...")
    
    browser.close()
    print("Browser automation test completed successfully!")
'''
                
                # Write and run script
                sandbox.files.write("browser_test.py", browser_script)
                result = sandbox.process.start_and_wait("python browser_test.py")
                
                print("📋 Browser test output:")
                print(result.stdout)
                if result.stderr:
                    print("⚠️  Errors:")
                    print(result.stderr)
                
                if result.exit_code == 0:
                    print("🎉 Browser automation test SUCCESSFUL!")
                else:
                    print(f"❌ Browser test failed with exit code: {result.exit_code}")
            else:
                print("❌ Browser installation failed")
        else:
            print("❌ Playwright installation failed")
        
        # Clean up
        print("🧹 Cleaning up sandbox...")
        sandbox.close()
        
        return True
        
    except ImportError:
        print("❌ E2B SDK not available")
        print("   Install with: pip install e2b")
        return False
    except Exception as e:
        print(f"❌ E2B test failed: {e}")
        return False

if __name__ == "__main__":
    test_e2b_direct()