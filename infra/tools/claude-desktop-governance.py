#!/usr/bin/env python3
"""
Claude Desktop Governance Integration
Provides IDP governance awareness for Claude Desktop sessions
"""

import os
import json
import datetime
import subprocess
from pathlib import Path


class ClaudeDesktopGovernance:
    def __init__(self):
        self.claude_config_path = Path("/home/ichardart/.claude/config.json")
        self.infra_path = Path("/home/ichardart/code/infra")
        self.governance_path = self.infra_path / "idp-governance"
        self.memory_path = self.infra_path / "data/memory"
        self.logs_path = self.infra_path / "logs"
        
        # Ensure directories exist
        self.memory_path.mkdir(parents=True, exist_ok=True)
        self.logs_path.mkdir(parents=True, exist_ok=True)
        
        # Governance-compliant servers mapping
        self.governance_compliant_servers = {
            "fetch": {
                "name": "fetch-mcp-governance",
                "risk_level": "Low",
                "status": "compliant",
                "description": "HTTP requests & web content"
            },
            "weather": {
                "name": "weather-mcp",
                "risk_level": "Low", 
                "status": "compliant",
                "description": "Weather data retrieval"
            }
        }
        
        # Risk classification for external servers
        self.server_risk_assessment = {
            "github": {"risk": "Medium", "compliance": "requires_token", "value": "High"},
            "gdrive": {"risk": "Medium", "compliance": "requires_oauth", "value": "High"},
            "e2b": {"risk": "High", "compliance": "requires_api_key", "value": "High"},
            "memory": {"risk": "Medium", "compliance": "compliant", "value": "High"},
            "postgres": {"risk": "High", "compliance": "requires_config", "value": "Medium"},
            "slack": {"risk": "Medium", "compliance": "requires_tokens", "value": "Medium"},
            "filesystem": {"risk": "High", "compliance": "security_risk", "value": "Low"},
            "puppeteer": {"risk": "Critical", "compliance": "security_risk", "value": "Low"},
            "context7": {"risk": "Medium", "compliance": "external_dependency", "value": "Medium"}
        }

    def analyze_claude_desktop_config(self):
        """Analyze Claude Desktop configuration for governance compliance"""
        if not self.claude_config_path.exists():
            return {"error": "Claude Desktop config not found"}
        
        try:
            with open(self.claude_config_path, 'r') as f:
                config = json.load(f)
            
            analysis = {
                "timestamp": datetime.datetime.now().isoformat(),
                "total_servers": 0,
                "governance_compliant": [],
                "security_risks": [],
                "requires_setup": [],
                "governance_score": 0,
                "recommendations": []
            }
            
            mcp_servers = config.get("mcpServers", {})
            analysis["total_servers"] = len(mcp_servers)
            
            for server_name, server_config in mcp_servers.items():
                risk_info = self.server_risk_assessment.get(server_name, {
                    "risk": "Unknown", 
                    "compliance": "unknown", 
                    "value": "Unknown"
                })
                
                server_analysis = {
                    "name": server_name,
                    "risk_level": risk_info["risk"],
                    "compliance_status": risk_info["compliance"],
                    "business_value": risk_info["value"],
                    "command": server_config.get("command", ""),
                    "has_env_vars": len(server_config.get("env", {})) > 0
                }
                
                # Classify based on compliance status
                if risk_info["compliance"] == "security_risk":
                    analysis["security_risks"].append(server_analysis)
                elif risk_info["compliance"] in ["requires_token", "requires_oauth", "requires_api_key", "requires_config"]:
                    analysis["requires_setup"].append(server_analysis)
                elif risk_info["compliance"] in ["compliant", "external_dependency"]:
                    analysis["governance_compliant"].append(server_analysis)
                else:
                    analysis["requires_setup"].append(server_analysis)
            
            # Calculate governance score
            total = analysis["total_servers"]
            if total > 0:
                compliant = len(analysis["governance_compliant"])
                risks = len(analysis["security_risks"])
                # Score: compliant servers add points, security risks subtract heavily
                analysis["governance_score"] = max(0, int(((compliant - (risks * 2)) / total) * 100))
            
            # Generate recommendations
            if analysis["security_risks"]:
                analysis["recommendations"].append({
                    "priority": "CRITICAL",
                    "action": "Remove high-risk MCP servers",
                    "details": f"Remove {len(analysis['security_risks'])} security risk servers: {', '.join([s['name'] for s in analysis['security_risks']])}"
                })
            
            if analysis["requires_setup"]:
                analysis["recommendations"].append({
                    "priority": "HIGH", 
                    "action": "Complete API key/token setup",
                    "details": f"Configure {len(analysis['requires_setup'])} servers requiring setup"
                })
            
            return analysis
            
        except Exception as e:
            return {"error": f"Failed to analyze config: {str(e)}"}

    def generate_governance_context(self):
        """Generate comprehensive governance context for Claude Desktop"""
        
        # Analyze current configuration
        config_analysis = self.analyze_claude_desktop_config()
        
        # Infrastructure status
        infrastructure_status = {
            "mcp_server_hub": self.infra_path.joinpath("mcp-server-hub").exists(),
            "a2a_protocol": self.infra_path.joinpath("A2A").exists(),
            "governance_framework": self.governance_path.exists(),
            "security_tooling": self.infra_path.joinpath("security-tooling").exists()
        }
        
        # Generate context
        context = {
            "session_type": "Claude Desktop",
            "governance_framework": {
                "status": "ACTIVE",
                "mode": "ENFORCED",
                "last_updated": datetime.datetime.now().isoformat()
            },
            "workspace": {
                "path": "/home/ichardart/code",
                "type": "IDP Multi-Agent Platform"
            },
            "mcp_configuration": config_analysis,
            "infrastructure": infrastructure_status,
            "security_posture": {
                "governance_score": config_analysis.get("governance_score", 0),
                "security_risks_count": len(config_analysis.get("security_risks", [])),
                "compliance_level": self._determine_compliance_level(config_analysis)
            },
            "current_priorities": [
                "Validate MCP server governance compliance",
                "Complete API key setup for valuable external integrations", 
                "Remove security risk servers",
                "Maintain security-by-design principles"
            ]
        }
        
        return context

    def _determine_compliance_level(self, analysis):
        """Determine overall compliance level"""
        if analysis.get("governance_score", 0) >= 80:
            return "EXCELLENT"
        elif analysis.get("governance_score", 0) >= 60:
            return "GOOD"
        elif analysis.get("governance_score", 0) >= 40:
            return "NEEDS_IMPROVEMENT"
        else:
            return "NON_COMPLIANT"

    def create_governance_summary(self):
        """Create a governance summary for display"""
        context = self.generate_governance_context()
        config_analysis = context["mcp_configuration"]
        
        summary = f"""
🏛️ IDP GOVERNANCE STATUS - CLAUDE DESKTOP
==========================================

📊 MCP Configuration Analysis:
• Total Servers: {config_analysis.get('total_servers', 0)}
• Governance Score: {config_analysis.get('governance_score', 0)}/100
• Compliance Level: {context['security_posture']['compliance_level']}

🛠️ Server Classification:
• ✅ Governance Compliant: {len(config_analysis.get('governance_compliant', []))}
• ⚠️ Requires Setup: {len(config_analysis.get('requires_setup', []))}
• 🚨 Security Risks: {len(config_analysis.get('security_risks', []))}

🌐 Infrastructure Status:
• MCP Server Hub: {'✅ Available' if context['infrastructure']['mcp_server_hub'] else '❌ Missing'}
• A2A Protocol: {'✅ Complete' if context['infrastructure']['a2a_protocol'] else '❌ Missing'}
• Governance Framework: {'✅ Active' if context['infrastructure']['governance_framework'] else '❌ Missing'}
• Security Tooling: {'✅ Configured' if context['infrastructure']['security_tooling'] else '❌ Missing'}
"""

        # Add security risks details
        if config_analysis.get("security_risks"):
            summary += "\n🚨 IMMEDIATE SECURITY RISKS:\n"
            for risk in config_analysis["security_risks"]:
                summary += f"   • {risk['name']} (Risk: {risk['risk_level']})\n"

        # Add recommendations
        if config_analysis.get("recommendations"):
            summary += "\n🔧 RECOMMENDED ACTIONS:\n"
            for rec in config_analysis["recommendations"]:
                summary += f"   {rec['priority']}: {rec['action']}\n"

        # Add quick reference
        summary += """
📚 Quick Reference:
• Governance Framework: /home/ichardart/code/infra/idp-governance/
• MCP Registry: /home/ichardart/code/infra/mcp-registry.md
• Status Tools: /home/ichardart/code/infra/tools/
• Claude Desktop Config: /home/ichardart/.claude/config.json

🎯 Current Focus: Multi-Agent Platform with Security-by-Design
"""

        return summary

    def save_governance_context(self):
        """Save governance context to memory for persistence"""
        context = self.generate_governance_context()
        
        # Save to memory file
        memory_file = self.memory_path / "claude-desktop-governance.json"
        with open(memory_file, 'w') as f:
            json.dump(context, f, indent=2)
        
        # Save summary for quick reference
        summary = self.create_governance_summary()
        summary_file = self.memory_path / "claude-desktop-summary.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)
        
        # Log the session
        log_file = self.logs_path / "claude-desktop-governance.log"
        with open(log_file, 'a') as f:
            f.write(f"{datetime.datetime.now().isoformat()} - Governance context generated\n")
        
        return {
            "context_file": str(memory_file),
            "summary_file": str(summary_file),
            "governance_score": context["security_posture"]["governance_score"]
        }

    def generate_compliance_recommendations(self):
        """Generate detailed compliance recommendations"""
        config_analysis = self.analyze_claude_desktop_config()
        
        recommendations = []
        
        # Security risks
        for risk in config_analysis.get("security_risks", []):
            recommendations.append({
                "priority": "CRITICAL",
                "category": "Security Risk",
                "server": risk["name"],
                "action": "Remove from configuration",
                "reason": f"Server poses {risk['risk_level']} security risk",
                "command": f"Edit /home/ichardart/.claude/config.json and remove '{risk['name']}' section"
            })
        
        # Setup requirements
        setup_servers = config_analysis.get("requires_setup", [])
        high_value_setup = [s for s in setup_servers if s.get("business_value") == "High"]
        
        for server in high_value_setup:
            recommendations.append({
                "priority": "HIGH",
                "category": "Configuration Required",
                "server": server["name"],
                "action": "Complete API key/token setup",
                "reason": f"High-value server requiring {server['compliance_status']}",
                "command": f"Configure environment variables for {server['name']}"
            })
        
        return recommendations

    def run_governance_check(self):
        """Run complete governance check for Claude Desktop"""
        print("🏛️ Claude Desktop IDP Governance Check")
        print("======================================")
        
        # Generate and save context
        result = self.save_governance_context()
        
        # Display summary
        summary = self.create_governance_summary()
        print(summary)
        
        # Show detailed recommendations if needed
        recommendations = self.generate_compliance_recommendations()
        if recommendations:
            print("\n📋 DETAILED RECOMMENDATIONS:")
            print("============================")
            for i, rec in enumerate(recommendations, 1):
                print(f"{i}. {rec['priority']}: {rec['action']}")
                print(f"   Server: {rec['server']}")
                print(f"   Reason: {rec['reason']}")
                print(f"   Command: {rec['command']}")
                print()
        
        return result


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Claude Desktop IDP Governance Integration")
    parser.add_argument("--summary", action="store_true", help="Show governance summary only")
    parser.add_argument("--context", action="store_true", help="Generate and save governance context")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    governance = ClaudeDesktopGovernance()
    
    if args.summary:
        summary = governance.create_governance_summary()
        print(summary)
    elif args.context:
        result = governance.save_governance_context()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"✅ Governance context saved: {result['context_file']}")
            print(f"📊 Governance score: {result['governance_score']}/100")
    else:
        governance.run_governance_check()


if __name__ == "__main__":
    main()