
import os
import sys

# Set E2B API key from environment
api_key = os.getenv("E2B_API_KEY")
if not api_key:
    print("❌ E2B_API_KEY environment variable not set")
    sys.exit(1)

print("🚀 Starting E2B browser automation test...")

try:
    # Install playwright if not available
    print("📦 Installing Playwright...")
    os.system("pip install playwright")
    os.system("playwright install chromium")
    
    # Import and test Playwright
    from playwright.sync_api import sync_playwright
    
    print("🌐 Testing browser automation...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Test navigation
        page.goto("https://httpbin.org/")
        title = page.title()
        print(f"📄 Page title: {title}")
        
        # Test screenshot
        screenshot = page.screenshot()
        print(f"📸 Screenshot captured: {len(screenshot)} bytes")
        
        # Test content extraction
        content_sample = page.inner_text("body")[:100] + "..."
        print(f"📝 Content sample: {content_sample}")
        
        browser.close()
        print("✅ Browser automation test successful!")
        
except ImportError:
    print("⚠️  Playwright not available in this environment")
    print("   This is expected - Playwright will be installed in E2B sandbox")
except Exception as e:
    print(f"❌ Browser automation test failed: {e}")
