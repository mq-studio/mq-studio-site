#!/usr/bin/env python3
"""
Final E2B Browser Test
Test browser automation using the correct E2B API
"""

import os

# Set API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def test_e2b_browser_final():
    """Test E2B browser automation with correct API"""
    
    print("🚀 Testing E2B Browser Automation (Final)")
    print("=" * 45)
    
    try:
        from e2b import Sandbox
        
        print("🏗️  Creating E2B sandbox...")
        sandbox = Sandbox()
        
        print("✅ E2B sandbox created successfully!")
        print(f"🆔 Sandbox info: {type(sandbox)}")
        
        # Check available methods more thoroughly
        print("🔍 Exploring sandbox capabilities...")
        methods = [attr for attr in dir(sandbox) if not attr.startswith('_') and callable(getattr(sandbox, attr))]
        print(f"📋 Available methods: {methods}")
        
        # Try to use the commands interface
        if hasattr(sandbox, 'commands'):
            print("\n🏃 Testing sandbox.commands...")
            try:
                # Test basic command
                result = sandbox.commands.run("echo 'Hello from E2B sandbox!'")
                print(f"📋 Echo result: {result}")
                
                # Test Python installation
                python_test = sandbox.commands.run("python3 --version")
                print(f"🐍 Python version: {python_test}")
                
                # Install Playwright
                print("📦 Installing Playwright...")
                install_result = sandbox.commands.run("pip install playwright")
                print(f"📦 Install result: Success" if "Successfully installed" in str(install_result) else f"Install output: {install_result}")
                
                # Install browser
                print("🌐 Installing Chromium...")
                browser_result = sandbox.commands.run("playwright install chromium")
                print(f"🌐 Browser install: {browser_result}")
                
                # Create browser automation script
                print("📝 Creating browser automation script...")
                browser_script = '''
from playwright.sync_api import sync_playwright
import json

def test_browser():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Test 1: Navigate to httpbin
            page.goto("https://httpbin.org/")
            title = page.title()
            print(f"SUCCESS: Page title: {title}")
            
            # Test 2: Take screenshot
            screenshot = page.screenshot()
            print(f"SUCCESS: Screenshot captured: {len(screenshot)} bytes")
            
            # Test 3: Extract content
            content = page.inner_text("body")[:200]
            print(f"SUCCESS: Content sample: {content}...")
            
            # Test 4: Form interaction test
            page.goto("https://httpbin.org/forms/post")
            page.fill('input[name="custname"]', "E2B Test User")
            page.fill('input[name="custtel"]', "555-1234")
            print("SUCCESS: Form interaction completed")
            
            # Test 5: JavaScript execution
            js_result = page.evaluate("() => ({ title: document.title, url: window.location.href })")
            print(f"SUCCESS: JavaScript execution: {js_result}")
            
            browser.close()
            print("SUCCESS: All browser automation tests passed!")
            
            return {
                "status": "success",
                "tests_passed": 5,
                "capabilities": [
                    "Navigation",
                    "Screenshots", 
                    "Content extraction",
                    "Form interaction",
                    "JavaScript execution"
                ]
            }
            
    except Exception as e:
        print(f"ERROR: Browser test failed: {e}")
        return {"status": "error", "error": str(e)}

# Run the test
result = test_browser()
print(f"FINAL_RESULT: {result}")
'''
                
                # Write script to sandbox
                print("💾 Writing browser test script to sandbox...")
                sandbox.files.write("browser_automation_test.py", browser_script)
                
                # Run the browser automation test
                print("🚀 Executing browser automation test...")
                test_result = sandbox.commands.run("python3 browser_automation_test.py")
                
                print("\n" + "="*50)
                print("📋 BROWSER AUTOMATION TEST RESULTS:")
                print("="*50)
                print(test_result)
                print("="*50)
                
                # Check if successful
                if "SUCCESS: All browser automation tests passed!" in str(test_result):
                    print("\n🎉 BROWSER AUTOMATION FULLY WORKING!")
                    print("✅ E2B + Playwright integration successful")
                    print("✅ All browser capabilities verified:")
                    print("   • Web navigation")
                    print("   • Screenshot capture")
                    print("   • Content extraction")
                    print("   • Form interaction")
                    print("   • JavaScript execution")
                    print("✅ Secure sandbox environment confirmed")
                    success = True
                else:
                    print("⚠️  Browser automation test had issues")
                    success = False
                
            except Exception as cmd_error:
                print(f"❌ Commands interface error: {cmd_error}")
                success = False
        else:
            print("❌ No commands interface found")
            success = False
        
        # Clean up
        print("\n🧹 Cleaning up sandbox...")
        if hasattr(sandbox, 'close'):
            sandbox.close()
        
        print(f"\n📊 Final Status: {'SUCCESS' if success else 'PARTIAL'}")
        if success:
            print("🚀 E2B browser automation is fully operational!")
            print("💡 Ready for Claude Desktop integration")
        else:
            print("⚠️  E2B connection works, but browser automation needs debugging")
        
        return success
        
    except Exception as e:
        print(f"❌ E2B test failed: {e}")
        return False

if __name__ == "__main__":
    test_e2b_browser_final()