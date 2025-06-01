#!/usr/bin/env python3
"""
E2B Browser Automation Setup Script
Configures secure browser automation environment
"""

import json
import os
import subprocess
import sys

def setup_e2b_browser():
    """Set up E2B browser automation environment"""
    
    print("🏗️  Setting up E2B Browser Automation...")
    
    # Check E2B API key
    config_path = "/home/ichardart/.claude/config.json"
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            
        e2b_key = config.get('mcpServers', {}).get('e2b', {}).get('env', {}).get('E2B_API_KEY')
        
        if e2b_key == "e2b-api-key-here":
            print("⚠️  E2B API key not configured")
            print("   Please visit https://e2b.dev to get your API key")
            print("   Then update /home/ichardart/.claude/config.json")
            return False
        elif e2b_key and e2b_key.startswith('e2b_'):
            print("✅ E2B API key configured")
        else:
            print("❌ Invalid E2B API key format")
            return False
            
    except Exception as e:
        print(f"❌ Error reading config: {e}")
        return False
    
    # Create browser automation scripts
    scripts = {
        "screenshot.py": """
from playwright.sync_api import sync_playwright
import base64

def take_screenshot(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        screenshot = page.screenshot()
        browser.close()
        return base64.b64encode(screenshot).decode()
""",
        
        "extract_content.py": """
from playwright.sync_api import sync_playwright

def extract_content(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        
        data = {
            'title': page.title(),
            'content': page.inner_text('body'),
            'links': [link.get_attribute('href') for link in page.query_selector_all('a[href]')]
        }
        
        browser.close()
        return data
""",
        
        "form_automation.py": """
from playwright.sync_api import sync_playwright

def automate_form(url, form_data):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        
        # Fill form fields
        for selector, value in form_data.items():
            page.fill(selector, value)
        
        # Optional: Submit form
        # page.click('button[type="submit"]')
        
        result = page.content()
        browser.close()
        return result
"""
    }
    
    # Write script files
    for filename, content in scripts.items():
        filepath = f"/home/ichardart/code/infra/browser-automation/{filename}"
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Created {filename}")
    
    print("\n🎉 E2B Browser Automation setup complete!")
    print("\n📋 Next steps:")
    print("1. Get E2B API key from https://e2b.dev")
    print("2. Update Claude Desktop config with your API key")
    print("3. Test with: python browser_test.py")
    
    return True

if __name__ == "__main__":
    setup_e2b_browser()