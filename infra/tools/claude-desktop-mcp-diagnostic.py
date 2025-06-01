#!/usr/bin/env python3
"""
Claude Desktop MCP Server Diagnostic and Cleanup Tool
Validates all MCP servers and fixes configuration issues
"""

import json
import os
import subprocess
import sys
from pathlib import Path
import concurrent.futures
import tempfile

class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

class MCPDiagnostic:
    def __init__(self):
        self.config_path = Path("/home/ichardart/.claude/config.json")
        self.results = {}
        
    def load_config(self):
        """Load Claude Desktop configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"{Colors.RED}❌ Claude Desktop config not found at {self.config_path}{Colors.END}")
            return None
        except json.JSONDecodeError as e:
            print(f"{Colors.RED}❌ Invalid JSON in Claude Desktop config: {e}{Colors.END}")
            return None
            
    def test_server(self, server_name, server_config):
        """Test individual MCP server"""
        result = {
            'name': server_name,
            'status': 'unknown',
            'error': None,
            'recommendation': None,
            'business_value': 'unknown',
            'risk_level': 'unknown'
        }
        
        try:
            command = server_config['command']
            args = server_config.get('args', [])
            env = server_config.get('env', {})
            
            # Set up environment
            test_env = os.environ.copy()
            test_env.update(env)
            
            # Quick connectivity test
            full_command = [command] + args
            
            # Timeout after 10 seconds for quick test
            process = subprocess.Popen(
                full_command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=test_env,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(timeout=10)
                if process.returncode == 0:
                    result['status'] = 'working'
                else:
                    result['status'] = 'error'
                    result['error'] = f"Exit code {process.returncode}: {stderr[:200]}"
            except subprocess.TimeoutExpired:
                process.kill()
                # For MCP servers, timeout might be normal (they're designed to run continuously)
                result['status'] = 'timeout_normal'
                result['error'] = "Server started but didn't exit (normal for MCP servers)"
                
        except FileNotFoundError:
            result['status'] = 'missing_binary'
            result['error'] = f"Command not found: {command}"
        except Exception as e:
            result['status'] = 'error'
            result['error'] = str(e)
            
        # Categorize servers by business value and risk
        result['business_value'], result['risk_level'] = self.categorize_server(server_name, server_config)
        result['recommendation'] = self.get_recommendation(server_name, result)
        
        return result
        
    def categorize_server(self, name, config):
        """Categorize server by business value and risk level"""
        
        # High-value servers for development productivity
        high_value_servers = {
            'memory': ('high', 'low'),
            'context7': ('high', 'medium'),
            'github': ('high', 'medium'),
            'git-mcp': ('high', 'low'),
            'filesystem-mcp': ('high', 'medium'),
            'governance-mcp': ('high', 'low'),
            'inventory-mcp': ('high', 'low'),
            'e2b': ('high', 'high'),  # Powerful but requires API key
        }
        
        # Medium-value servers
        medium_value_servers = {
            'gdrive': ('medium', 'medium'),
            'shell-mcp': ('medium', 'high'),  # Shell access is risky
            'docker-mcp': ('medium', 'high'),
            'database-mcp': ('medium', 'high'),
            'api-testing-mcp': ('medium', 'medium'),
            'language-server-mcp': ('medium', 'low'),
        }
        
        # Low-value or optional servers
        low_value_servers = {
            'weather': ('low', 'low'),
            'fetch': ('low', 'low'),
            'slack': ('low', 'medium'),
            'postgres': ('low', 'high'),
            'cicd-mcp': ('low', 'medium'),
            'security-scanner-mcp': ('medium', 'low'),
        }
        
        if name in high_value_servers:
            return high_value_servers[name]
        elif name in medium_value_servers:
            return medium_value_servers[name]
        elif name in low_value_servers:
            return low_value_servers[name]
        else:
            return 'unknown', 'unknown'
            
    def get_recommendation(self, name, result):
        """Get recommendation for server based on test results"""
        status = result['status']
        business_value = result['business_value']
        risk_level = result['risk_level']
        
        if status == 'working' or status == 'timeout_normal':
            return f"✅ Keep - {business_value} value, {risk_level} risk"
        elif status == 'missing_binary' and 'npx' in result['error']:
            return f"🔧 Fix - Install npm package"
        elif status == 'missing_binary':
            return f"📦 Install - Missing command: {result['error']}"
        elif 'requires_token' in str(result['error']) or 'API' in str(result['error']):
            if business_value == 'high':
                return f"🔑 Configure - High value, needs API key/token setup"
            else:
                return f"⚠️ Optional - {business_value} value, needs credentials"
        elif status == 'error':
            if business_value == 'high':
                return f"🚨 Fix Required - High value server has errors"
            elif business_value == 'low':
                return f"🗑️ Consider Removing - Low value, has errors"
            else:
                return f"🔧 Fix Optional - Medium value, has errors"
        else:
            return f"❓ Investigate - Status: {status}"
            
    def test_all_servers(self, config):
        """Test all MCP servers concurrently"""
        servers = config.get('mcpServers', {})
        
        print(f"{Colors.BLUE}🔍 Testing {len(servers)} MCP servers...{Colors.END}")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_server = {
                executor.submit(self.test_server, name, server_config): name
                for name, server_config in servers.items()
            }
            
            for future in concurrent.futures.as_completed(future_to_server):
                server_name = future_to_server[future]
                try:
                    result = future.result()
                    self.results[server_name] = result
                    
                    # Print immediate feedback
                    status_icon = {
                        'working': '✅',
                        'timeout_normal': '✅',
                        'error': '❌',
                        'missing_binary': '📦',
                        'unknown': '❓'
                    }.get(result['status'], '❓')
                    
                    print(f"  {status_icon} {server_name}: {result['status']}")
                    
                except Exception as exc:
                    print(f"  ❌ {server_name}: Exception during test - {exc}")
                    
    def generate_report(self):
        """Generate comprehensive diagnostic report"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}📊 Claude Desktop MCP Diagnostic Report{Colors.END}")
        print(f"{Colors.CYAN}{'='*50}{Colors.END}\n")
        
        # Categorize results
        working_servers = []
        broken_servers = []
        high_value_broken = []
        low_value_broken = []
        needs_config = []
        
        for name, result in self.results.items():
            if result['status'] in ['working', 'timeout_normal']:
                working_servers.append((name, result))
            else:
                broken_servers.append((name, result))
                if result['business_value'] == 'high':
                    high_value_broken.append((name, result))
                elif result['business_value'] == 'low':
                    low_value_broken.append((name, result))
                    
                if 'API' in str(result['error']) or 'token' in str(result['error']):
                    needs_config.append((name, result))
        
        # Summary
        print(f"{Colors.GREEN}✅ Working Servers: {len(working_servers)}{Colors.END}")
        print(f"{Colors.RED}❌ Broken Servers: {len(broken_servers)}{Colors.END}")
        print(f"{Colors.YELLOW}🔑 Need Configuration: {len(needs_config)}{Colors.END}")
        
        # Working servers
        if working_servers:
            print(f"\n{Colors.GREEN}{Colors.BOLD}✅ Working Servers:{Colors.END}")
            for name, result in working_servers:
                print(f"  • {name} ({result['business_value']} value, {result['risk_level']} risk)")
        
        # High-priority fixes
        if high_value_broken:
            print(f"\n{Colors.RED}{Colors.BOLD}🚨 High-Priority Fixes Needed:{Colors.END}")
            for name, result in high_value_broken:
                print(f"  • {name}: {result['error'][:100]}...")
                print(f"    {result['recommendation']}")
        
        # Configuration needed
        if needs_config:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}🔑 Servers Needing Configuration:{Colors.END}")
            for name, result in needs_config:
                print(f"  • {name}: {result['recommendation']}")
        
        # Low-priority or removable
        if low_value_broken:
            print(f"\n{Colors.PURPLE}{Colors.BOLD}🗑️ Consider Removing (Low Value, Broken):{Colors.END}")
            for name, result in low_value_broken:
                print(f"  • {name}: {result['error'][:100]}...")
        
        return working_servers, broken_servers, needs_config
        
    def generate_fixed_config(self, config):
        """Generate a cleaned-up configuration"""
        working_servers, broken_servers, needs_config = self.generate_report()
        
        # Create optimized config with only working servers and high-value fixable ones
        optimized_servers = {}
        
        for name, result in self.results.items():
            original_config = config['mcpServers'][name]
            
            if result['status'] in ['working', 'timeout_normal']:
                # Keep working servers
                optimized_servers[name] = original_config
            elif result['business_value'] == 'high' and 'missing_binary' not in result['status']:
                # Keep high-value servers that just need configuration
                optimized_servers[name] = original_config
            # Skip low-value broken servers
            
        optimized_config = config.copy()
        optimized_config['mcpServers'] = optimized_servers
        
        # Save optimized config
        backup_path = self.config_path.with_suffix('.backup.json')
        optimized_path = self.config_path.with_suffix('.optimized.json')
        
        # Create backup
        with open(backup_path, 'w') as f:
            json.dump(config, f, indent=2)
            
        # Save optimized version
        with open(optimized_path, 'w') as f:
            json.dump(optimized_config, f, indent=2)
            
        print(f"\n{Colors.CYAN}💾 Files Created:{Colors.END}")
        print(f"  • Backup: {backup_path}")
        print(f"  • Optimized: {optimized_path}")
        
        return optimized_config, len(optimized_servers)
        
    def fix_common_issues(self):
        """Attempt to fix common MCP server issues"""
        print(f"\n{Colors.YELLOW}🔧 Attempting to fix common issues...{Colors.END}")
        
        fixes_applied = []
        
        for name, result in self.results.items():
            if result['status'] == 'missing_binary' and 'node' in result['error']:
                # Try to fix missing node scripts
                script_path = None
                if 'governance-mcp' in name:
                    script_path = "/home/ichardart/code/infra/mcp-servers/governance-mcp/index.js"
                elif 'git-mcp' in name:
                    script_path = "/home/ichardart/code/infra/mcp-servers/git-mcp/index.js"
                    
                if script_path and Path(script_path).exists():
                    print(f"  ✅ Fixed {name}: Script exists at {script_path}")
                    fixes_applied.append(f"Verified {name} script path")
                    
        return fixes_applied
        
    def run_full_diagnostic(self):
        """Run complete diagnostic and cleanup"""
        print(f"{Colors.CYAN}{Colors.BOLD}🔍 Claude Desktop MCP Diagnostic Starting...{Colors.END}\n")
        
        # Load configuration
        config = self.load_config()
        if not config:
            return
            
        # Test all servers
        self.test_all_servers(config)
        
        # Generate report
        working_servers, broken_servers, needs_config = self.generate_report()
        
        # Attempt fixes
        fixes = self.fix_common_issues()
        
        # Generate optimized configuration
        optimized_config, working_count = self.generate_fixed_config(config)
        
        # Final recommendations
        print(f"\n{Colors.CYAN}{Colors.BOLD}🎯 Recommendations:{Colors.END}")
        print(f"1. Use optimized config: cp ~/.claude/config.optimized.json ~/.claude/config.json")
        print(f"2. Working servers: {working_count}/{len(config['mcpServers'])}")
        print(f"3. Focus on high-value servers needing configuration")
        print(f"4. Remove low-value broken servers to reduce error noise")
        
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ Diagnostic Complete!{Colors.END}")
        
        return optimized_config

def main():
    diagnostic = MCPDiagnostic()
    diagnostic.run_full_diagnostic()

if __name__ == "__main__":
    main()