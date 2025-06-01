#!/usr/bin/env python3
"""
Example E2B Browser Automation Usage
Show how to use E2B for common browser automation tasks
"""

import os
import base64

# Set your API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def take_screenshot(url):
    """Take a screenshot of a website"""
    from e2b import Sandbox
    
    with Sandbox() as sandbox:
        # Install dependencies
        sandbox.commands.run("pip install playwright")
        sandbox.commands.run("playwright install chromium")
        
        # Create screenshot script
        script = f'''
from playwright.sync_api import sync_playwright
import base64

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("{url}")
    screenshot = page.screenshot()
    browser.close()
    
    # Save as base64
    screenshot_b64 = base64.b64encode(screenshot).decode()
    print(f"SCREENSHOT_DATA:{screenshot_b64}")
'''
        
        sandbox.files.write("screenshot.py", script)
        result = sandbox.commands.run("python3 screenshot.py")
        
        # Extract screenshot data
        if "SCREENSHOT_DATA:" in result.stdout:
            screenshot_data = result.stdout.split("SCREENSHOT_DATA:")[1].strip()
            return screenshot_data
        
        return None

def extract_content(url):
    """Extract text content from a website"""
    from e2b import Sandbox
    
    with Sandbox() as sandbox:
        sandbox.commands.run("pip install playwright")
        sandbox.commands.run("playwright install chromium")
        
        script = f'''
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("{url}")
    
    title = page.title()
    content = page.inner_text("body")
    links = [link.get_attribute("href") for link in page.query_selector_all("a[href]")]
    
    browser.close()
    
    print(f"TITLE:{title}")
    print(f"CONTENT_LENGTH:{len(content)}")
    print(f"LINKS_COUNT:{len(links)}")
    print(f"CONTENT:{content[:500]}...")
'''
        
        sandbox.files.write("extract.py", script)
        result = sandbox.commands.run("python3 extract.py")
        return result.stdout

def fill_form(url, form_data):
    """Fill out a form on a website"""
    from e2b import Sandbox
    
    with Sandbox() as sandbox:
        sandbox.commands.run("pip install playwright")
        sandbox.commands.run("playwright install chromium")
        
        # Convert form_data dict to script
        form_fields = ""
        for selector, value in form_data.items():
            form_fields += f'    page.fill("{selector}", "{value}")\\n'
        
        script = f'''
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("{url}")
    
    # Fill form fields
{form_fields}
    
    # Optional: Take screenshot of filled form
    screenshot = page.screenshot()
    
    browser.close()
    print("FORM_FILLED:SUCCESS")
'''
        
        sandbox.files.write("fill_form.py", script)
        result = sandbox.commands.run("python3 fill_form.py")
        return "SUCCESS" in result.stdout

# Example usage
if __name__ == "__main__":
    print("🚀 E2B Browser Automation Examples")
    print("=" * 40)
    
    # Example 1: Take screenshot
    print("📸 Taking screenshot...")
    # screenshot = take_screenshot("https://example.com")
    # print(f"Screenshot captured: {len(screenshot) if screenshot else 0} chars")
    
    # Example 2: Extract content
    print("📄 Extracting content...")
    # content = extract_content("https://example.com")
    # print(f"Content extracted: {content[:200]}...")
    
    # Example 3: Fill form
    print("📝 Filling form...")
    # form_data = {
    #     'input[name="email"]': 'test@example.com',
    #     'input[name="name"]': 'Test User'
    # }
    # success = fill_form("https://example.com/contact", form_data)
    # print(f"Form filled: {success}")
    
    print("💡 Uncomment the examples above to test!")
    print("⚠️  Note: Each example creates a new sandbox and takes ~30-60 seconds")