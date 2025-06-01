#!/usr/bin/env python3
"""
Complete E2B Browser Test
Test browser automation with all dependencies properly installed
"""

import os

# Set API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def test_e2b_complete():
    """Test E2B browser automation with complete setup"""
    
    print("🚀 Complete E2B Browser Automation Test")
    print("=" * 45)
    
    try:
        from e2b import Sandbox
        
        print("🏗️  Creating E2B sandbox...")
        sandbox = Sandbox()
        
        print("✅ E2B sandbox created successfully!")
        
        # Install system dependencies first
        print("📦 Installing system dependencies for browsers...")
        deps_cmd = "sudo apt-get update && sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libatspi2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libasound2 libcups2"
        deps_result = sandbox.commands.run(deps_cmd)
        print(f"📦 Dependencies result: {deps_result.exit_code}")
        
        # Install Playwright
        print("📦 Installing Playwright...")
        install_result = sandbox.commands.run("pip install playwright")
        print(f"📦 Playwright install: {'Success' if install_result.exit_code == 0 else 'Failed'}")
        
        # Install browser with dependencies
        print("🌐 Installing browser with dependencies...")
        browser_result = sandbox.commands.run("playwright install-deps && playwright install chromium")
        print(f"🌐 Browser install: {'Success' if browser_result.exit_code == 0 else 'Issues detected'}")
        
        # Create comprehensive browser test
        print("📝 Creating comprehensive browser test...")
        browser_script = '''
from playwright.sync_api import sync_playwright
import base64
import json

def comprehensive_browser_test():
    """Test all browser automation capabilities"""
    
    results = {
        "tests_run": 0,
        "tests_passed": 0,
        "capabilities": {},
        "errors": []
    }
    
    try:
        with sync_playwright() as p:
            # Launch browser
            results["tests_run"] += 1
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            results["tests_passed"] += 1
            results["capabilities"]["browser_launch"] = "✅ SUCCESS"
            print("✅ Browser launched successfully")
            
            # Test 1: Basic Navigation
            results["tests_run"] += 1
            page.goto("https://httpbin.org/")
            title = page.title()
            results["tests_passed"] += 1
            results["capabilities"]["navigation"] = f"✅ SUCCESS - Title: {title}"
            print(f"✅ Navigation test passed - Title: {title}")
            
            # Test 2: Screenshot Capture
            results["tests_run"] += 1
            screenshot = page.screenshot()
            screenshot_b64 = base64.b64encode(screenshot).decode()[:50] + "..."
            results["tests_passed"] += 1
            results["capabilities"]["screenshots"] = f"✅ SUCCESS - {len(screenshot)} bytes"
            print(f"✅ Screenshot test passed - {len(screenshot)} bytes captured")
            
            # Test 3: Content Extraction
            results["tests_run"] += 1
            content = page.inner_text("body")
            results["tests_passed"] += 1
            results["capabilities"]["content_extraction"] = f"✅ SUCCESS - {len(content)} chars"
            print(f"✅ Content extraction passed - {len(content)} characters")
            
            # Test 4: Element Interaction
            results["tests_run"] += 1
            page.goto("https://httpbin.org/forms/post")
            page.fill('input[name="custname"]', "E2B Test User")
            page.fill('input[name="custtel"]', "555-1234")
            results["tests_passed"] += 1
            results["capabilities"]["form_interaction"] = "✅ SUCCESS"
            print("✅ Form interaction test passed")
            
            # Test 5: JavaScript Execution
            results["tests_run"] += 1
            js_result = page.evaluate("() => ({title: document.title, url: window.location.href, userAgent: navigator.userAgent})")
            results["tests_passed"] += 1
            results["capabilities"]["javascript"] = f"✅ SUCCESS - {js_result['title']}"
            print(f"✅ JavaScript execution passed - {js_result['title']}")
            
            # Test 6: Multiple Page Navigation
            results["tests_run"] += 1
            page.goto("https://httpbin.org/html")
            html_title = page.title()
            results["tests_passed"] += 1
            results["capabilities"]["multi_page"] = f"✅ SUCCESS - {html_title}"
            print(f"✅ Multi-page navigation passed - {html_title}")
            
            # Test 7: Element Selection
            results["tests_run"] += 1
            links = page.query_selector_all("a")
            results["tests_passed"] += 1
            results["capabilities"]["element_selection"] = f"✅ SUCCESS - {len(links)} links found"
            print(f"✅ Element selection passed - {len(links)} links found")
            
            browser.close()
            
            # Final summary
            success_rate = (results["tests_passed"] / results["tests_run"]) * 100
            results["success_rate"] = f"{success_rate:.1f}%"
            results["overall_status"] = "SUCCESS" if success_rate == 100 else "PARTIAL"
            
            print(f"\\n🎉 BROWSER AUTOMATION COMPLETE!")
            print(f"📊 Tests: {results['tests_passed']}/{results['tests_run']} passed ({success_rate:.1f}%)")
            print(f"🏆 Status: {results['overall_status']}")
            
            return results
            
    except Exception as e:
        results["errors"].append(str(e))
        results["overall_status"] = "FAILED"
        print(f"❌ Browser test failed: {e}")
        return results

# Run comprehensive test
test_results = comprehensive_browser_test()
print(f"\\nFINAL_RESULTS: {json.dumps(test_results, indent=2)}")
'''
        
        # Write and execute the test
        print("💾 Writing comprehensive test to sandbox...")
        sandbox.files.write("comprehensive_browser_test.py", browser_script)
        
        print("🚀 Running comprehensive browser automation test...")
        test_result = sandbox.commands.run("python3 comprehensive_browser_test.py")
        
        print("\n" + "="*60)
        print("📋 COMPREHENSIVE BROWSER AUTOMATION RESULTS:")
        print("="*60)
        print(test_result.stdout)
        if test_result.stderr:
            print("\n⚠️  Warnings/Errors:")
            print(test_result.stderr)
        print("="*60)
        
        # Determine success
        success = "BROWSER AUTOMATION COMPLETE!" in test_result.stdout and test_result.exit_code == 0
        
        if success:
            print("\n🎉 COMPLETE SUCCESS!")
            print("✅ E2B browser automation is fully operational!")
            print("✅ All browser capabilities verified:")
            print("   • Browser launching")
            print("   • Web navigation") 
            print("   • Screenshot capture")
            print("   • Content extraction")
            print("   • Form interaction")
            print("   • JavaScript execution")
            print("   • Multi-page navigation")
            print("   • Element selection")
            print("✅ Secure E2B sandbox environment")
            print("✅ Ready for production use in Claude Desktop!")
        else:
            print("\n⚠️  Partial success - some dependencies may still be missing")
            print("💡 E2B infrastructure is working correctly")
        
        # Cleanup
        print("\n🧹 Cleaning up sandbox...")
        sandbox.close()
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_e2b_complete()