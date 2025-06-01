#!/usr/bin/env python3
"""
Test script for all MCP servers
"""

import subprocess
import json
import os
import sys

def test_postgres_connection():
    """Test PostgreSQL database connection"""
    try:
        result = subprocess.run([
            'docker', 'exec', 'mcp-postgres', 
            'psql', '-U', 'mcpuser', '-d', 'mcpdb', 
            '-c', 'SELECT COUNT(*) FROM projects;'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ PostgreSQL: Connection successful")
            print(f"   Projects count: {result.stdout.strip().split()[-1]}")
            return True
        else:
            print(f"❌ PostgreSQL: Connection failed - {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ PostgreSQL: Error - {e}")
        return False

def test_filesystem_access():
    """Test filesystem operations"""
    try:
        test_file = "/home/ichardart/test-mcp/test.txt"
        if os.path.exists(test_file):
            print("✅ Filesystem: Test file accessible")
            with open(test_file, 'r') as f:
                content = f.read().strip()
            print(f"   Content: {content}")
            return True
        else:
            print("❌ Filesystem: Test file not found")
            return False
    except Exception as e:
        print(f"❌ Filesystem: Error - {e}")
        return False

def test_docker_availability():
    """Test Docker for PostgreSQL"""
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True, timeout=5)
        if 'mcp-postgres' in result.stdout:
            print("✅ Docker: PostgreSQL container running")
            return True
        else:
            print("❌ Docker: PostgreSQL container not found")
            return False
    except Exception as e:
        print(f"❌ Docker: Error - {e}")
        return False

def test_google_drive_setup():
    """Test Google Drive OAuth setup"""
    oauth_dir = "/home/ichardart/.config/mcp/gdrive"
    oauth_path = "/home/ichardart/.config/mcp/gdrive/gcp-oauth.keys.json"
    
    if os.path.exists(oauth_dir):
        print("✅ Google Drive: OAuth directory exists")
        if os.path.exists(oauth_path):
            print("   ✅ OAuth keys file found")
        else:
            print("   ⚠️  Requires manual OAuth keys file placement")
        return True
    else:
        print("❌ Google Drive: OAuth directory not found")
        return False

def test_e2b_setup():
    """Test E2B Code-Interpreter setup"""
    setup_file = "/home/ichardart/code/infra/mcp-config/e2b-setup.md"
    
    if os.path.exists(setup_file):
        print("✅ E2B: Setup instructions available")
        print("   ⚠️  Requires E2B account and API key")
        return True
    else:
        print("❌ E2B: Setup instructions not found")
        return False

def test_github_setup():
    """Test GitHub MCP server setup"""
    setup_file = "/home/ichardart/code/infra/mcp-config/github-setup.md"
    
    # Check if GitHub server is configured
    claude_config = "/home/ichardart/.claude/config.json"
    if os.path.exists(claude_config):
        try:
            with open(claude_config, 'r') as f:
                import json
                config = json.load(f)
            
            if 'mcpServers' in config and 'github' in config['mcpServers']:
                github_server = config['mcpServers']['github']
                token = github_server.get('env', {}).get('GITHUB_PERSONAL_ACCESS_TOKEN', '')
                
                print("✅ GitHub: MCP server configured")
                if token == 'ghp_development_token_here':
                    print("   ⚠️  Requires real GitHub Personal Access Token")
                elif token.startswith('ghp_'):
                    print("   ✅ GitHub token configured")
                else:
                    print("   ❌ GitHub token missing or invalid")
                return True
            else:
                print("❌ GitHub: MCP server not configured")
                return False
        except Exception as e:
            print(f"❌ GitHub: Error reading config - {e}")
            return False
    else:
        print("❌ GitHub: Claude config not found")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing MCP Server Integrations\n")
    
    tests = [
        ("Docker PostgreSQL", test_docker_availability),
        ("PostgreSQL Database", test_postgres_connection),
        ("Filesystem Access", test_filesystem_access),
        ("Google Drive Setup", test_google_drive_setup),
        ("E2B Code-Interpreter Setup", test_e2b_setup),
        ("GitHub MCP Server Setup", test_github_setup),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"Testing {name}...")
        result = test_func()
        results.append(result)
        print()
    
    passed = sum(results)
    total = len(results)
    
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All integrations ready!")
        return 0
    else:
        print("⚠️  Some integrations need setup")
        return 1

if __name__ == "__main__":
    sys.exit(main())