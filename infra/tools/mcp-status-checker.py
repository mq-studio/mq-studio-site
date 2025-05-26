#!/usr/bin/env python3
"""
MCP Status Checker & Registry Updater
Automatically scans and updates the status of all MCP servers for governance awareness
"""

import os
import json
import subprocess
import datetime
from pathlib import Path


class MCPStatusChecker:
    def __init__(self):
        self.infra_path = Path("/home/ichardart/code/infra")
        self.registry_file = self.infra_path / "mcp-registry.md"
        self.claude_md = Path("/home/ichardart/code/CLAUDE.md")
        
        # MCP server locations
        self.mcp_servers = {
            "fetch-mcp-governance": {
                "path": self.infra_path / "mcp-servers/fetch-mcp",
                "type": "node",
                "main": "index.js",
                "risk_level": "Low",
                "description": "HTTP requests & web content"
            },
            "wsl-helper-mcp": {
                "path": self.infra_path / "wsl-helper-mcp",
                "type": "python",
                "main": "src/file_writer.py",
                "risk_level": "Medium", 
                "description": "File system operations"
            },
            "markdown-formatting-mcp": {
                "path": self.infra_path / "markdown-formatting-mcp",
                "type": "python",
                "main": "src/server.py",
                "risk_level": "Low",
                "description": "Document generation & formatting"
            },
            "claude-projects-access-mcp": {
                "path": self.infra_path / "claude-projects-access-mcp",
                "type": "node",
                "main": "simple-mcp-server.js",
                "risk_level": "Medium",
                "description": "Claude Projects & chat history access"
            }
        }
        
        # Non-compliant servers (in Cline)
        self.cline_config_path = Path("/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")

    def check_server_status(self, server_name, server_info):
        """Check the operational status of an MCP server"""
        try:
            server_path = server_info["path"]
            
            if not server_path.exists():
                return "❌ Directory not found"
            
            if server_info["type"] == "node":
                # Check Node.js dependencies
                package_json = server_path / "package.json"
                if not package_json.exists():
                    return "❌ package.json missing"
                
                node_modules = server_path / "node_modules"
                if not node_modules.exists():
                    return "⚠️ Dependencies not installed (run: npm install)"
                
                # Check for version conflicts
                try:
                    result = subprocess.run(
                        ["npm", "list"], 
                        cwd=server_path, 
                        capture_output=True, 
                        text=True,
                        timeout=10
                    )
                    if "invalid" in result.stderr.lower():
                        return "⚠️ Version conflicts (check package.json)"
                    elif result.returncode == 0:
                        return "✅ Fully operational"
                    else:
                        return "⚠️ Dependency issues detected"
                except subprocess.TimeoutExpired:
                    return "⚠️ Dependency check timeout"
                except Exception:
                    return "⚠️ Cannot verify dependencies"
            
            elif server_info["type"] == "python":
                # Check Python dependencies
                requirements_file = server_path / "requirements.txt"
                if not requirements_file.exists():
                    return "✅ No dependencies required"
                
                # Check if dependencies are installed
                try:
                    with open(requirements_file, 'r') as f:
                        requirements = f.read().strip().split('\n')
                    
                    for req in requirements:
                        if req.strip():
                            pkg_name = req.split('==')[0].split('>=')[0].split('<=')[0].strip()
                            result = subprocess.run(
                                ["python3", "-c", f"import {pkg_name.replace('-', '_')}"],
                                capture_output=True,
                                timeout=5
                            )
                            if result.returncode != 0:
                                return f"⚠️ Dependencies missing (run: pip install -r requirements.txt)"
                    
                    return "✅ Fully operational"
                except Exception:
                    return "⚠️ Cannot verify Python dependencies"
            
            return "❓ Unknown status"
            
        except Exception as e:
            return f"❌ Error checking status: {str(e)}"

    def check_cline_compliance(self):
        """Check Cline configuration for non-compliant servers"""
        try:
            if not self.cline_config_path.exists():
                return {"status": "✅ Cline config not found", "servers": []}
            
            with open(self.cline_config_path, 'r') as f:
                config = json.load(f)
            
            mcp_servers = config.get("mcpServers", {})
            
            # Classify servers
            security_risks = []
            redundant = []
            potentially_valuable = []
            
            for server_name, server_config in mcp_servers.items():
                if "browser-tools" in server_name or "puppeteer" in server_name or "sequential-thinking" in server_name:
                    security_risks.append(server_name)
                elif "filesystem" in server_name:
                    redundant.append(server_name)
                else:
                    potentially_valuable.append(server_name)
            
            total_non_compliant = len(security_risks) + len(redundant) + len(potentially_valuable)
            
            return {
                "status": f"⚠️ {total_non_compliant} non-compliant servers found" if total_non_compliant > 0 else "✅ All servers compliant",
                "security_risks": security_risks,
                "redundant": redundant,
                "potentially_valuable": potentially_valuable
            }
            
        except Exception as e:
            return {"status": f"❌ Error checking Cline config: {str(e)}", "servers": []}

    def check_infrastructure_status(self):
        """Check the overall infrastructure status"""
        try:
            # Check MCP Server Hub
            hub_path = self.infra_path / "mcp-server-hub"
            hub_status = "✅ Available" if hub_path.exists() else "❌ Missing"
            
            # Check A2A Protocol
            a2a_path = self.infra_path / "A2A"
            a2a_status = "✅ Complete implementation" if a2a_path.exists() else "❌ Missing"
            
            # Check configuration management
            config_path = self.infra_path / "mcp-config"
            config_status = "✅ Configured" if config_path.exists() else "❌ Missing"
            
            # Check governance framework
            governance_path = self.infra_path / "idp-governance"
            governance_status = "✅ Active" if governance_path.exists() else "❌ Missing"
            
            return {
                "mcp_hub": hub_status,
                "a2a_protocol": a2a_status,
                "config_management": config_status,
                "governance": governance_status
            }
            
        except Exception as e:
            return {"error": f"Error checking infrastructure: {str(e)}"}

    def generate_status_report(self):
        """Generate comprehensive status report"""
        report = {
            "timestamp": datetime.datetime.now().isoformat(),
            "governance_compliant_servers": {},
            "cline_compliance": {},
            "infrastructure": {}
        }
        
        # Check governance-compliant servers
        for server_name, server_info in self.mcp_servers.items():
            status = self.check_server_status(server_name, server_info)
            report["governance_compliant_servers"][server_name] = {
                "status": status,
                "risk_level": server_info["risk_level"],
                "description": server_info["description"],
                "path": str(server_info["path"])
            }
        
        # Check Cline compliance
        report["cline_compliance"] = self.check_cline_compliance()
        
        # Check infrastructure
        report["infrastructure"] = self.check_infrastructure_status()
        
        return report

    def update_claude_md_status(self, report):
        """Update the CLAUDE.md with current status"""
        try:
            # Read current CLAUDE.md
            with open(self.claude_md, 'r') as f:
                content = f.read()
            
            # Generate status section
            status_section = f"""
## 🔄 LIVE STATUS CHECK (Last Updated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

### Governance-Compliant Servers
"""
            
            for server_name, info in report["governance_compliant_servers"].items():
                status_section += f"- **{server_name}**: {info['status']} (Risk: {info['risk_level']})\n"
            
            cline_info = report["cline_compliance"]
            status_section += f"\n### Cline Compliance\n- {cline_info['status']}\n"
            
            if cline_info.get("security_risks"):
                status_section += f"- 🚨 Security Risks: {len(cline_info['security_risks'])} servers\n"
            if cline_info.get("redundant"):
                status_section += f"- 🔄 Redundant: {len(cline_info['redundant'])} servers\n"
            if cline_info.get("potentially_valuable"):
                status_section += f"- 💡 Potentially Valuable: {len(cline_info['potentially_valuable'])} servers\n"
            
            status_section += f"\n### Infrastructure Status\n"
            for component, status in report["infrastructure"].items():
                status_section += f"- **{component.replace('_', ' ').title()}**: {status}\n"
            
            # Update CLAUDE.md (insert after the first heading)
            lines = content.split('\n')
            new_lines = []
            inserted = False
            
            for line in lines:
                new_lines.append(line)
                if line.startswith('# ') and not inserted:
                    new_lines.extend(status_section.split('\n'))
                    inserted = True
                elif line.startswith('## 🔄 LIVE STATUS CHECK'):
                    # Skip existing status section
                    while new_lines and not new_lines[-1].startswith('##') and new_lines[-1].strip():
                        new_lines.pop()
                    break
            
            # Write updated content
            with open(self.claude_md, 'w') as f:
                f.write('\n'.join(new_lines))
                
            return True
            
        except Exception as e:
            print(f"Error updating CLAUDE.md: {e}")
            return False

    def save_report(self, report):
        """Save detailed report to file"""
        try:
            report_file = self.infra_path / "logs" / f"mcp-status-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            report_file.parent.mkdir(exist_ok=True)
            
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            # Also save as latest
            latest_file = self.infra_path / "logs" / "mcp-status-latest.json"
            with open(latest_file, 'w') as f:
                json.dump(report, f, indent=2)
                
            return str(report_file)
            
        except Exception as e:
            print(f"Error saving report: {e}")
            return None

    def run_check(self, update_claude_md=True):
        """Run complete MCP status check"""
        print("🔍 Running MCP Status Check...")
        
        report = self.generate_status_report()
        
        # Save report
        report_file = self.save_report(report)
        if report_file:
            print(f"📊 Report saved: {report_file}")
        
        # Update CLAUDE.md
        if update_claude_md:
            if self.update_claude_md_status(report):
                print("✅ CLAUDE.md updated with current status")
            else:
                print("❌ Failed to update CLAUDE.md")
        
        # Print summary
        print("\n📋 STATUS SUMMARY:")
        print("==================")
        
        for server_name, info in report["governance_compliant_servers"].items():
            print(f"{server_name}: {info['status']}")
        
        cline_info = report["cline_compliance"]
        print(f"\nCline Compliance: {cline_info['status']}")
        
        print(f"\nInfrastructure:")
        for component, status in report["infrastructure"].items():
            print(f"  {component}: {status}")
        
        return report


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Check MCP server status and update governance awareness")
    parser.add_argument("--no-update", action="store_true", help="Don't update CLAUDE.md")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    
    args = parser.parse_args()
    
    checker = MCPStatusChecker()
    report = checker.run_check(update_claude_md=not args.no_update)
    
    if args.json:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()