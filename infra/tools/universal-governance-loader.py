#!/usr/bin/env python3
"""
Universal Governance Context Loader
Works with any Claude client by detecting the environment
"""

import os
import json
import sys
from pathlib import Path

class UniversalGovernanceLoader:
    def __init__(self):
        self.infra_path = Path("/home/ichardart/code/infra")
        self.memory_path = self.infra_path / "data/memory"
        
    def detect_claude_client(self):
        """Detect which Claude client is being used"""
        # Check for Claude Desktop
        if Path("/home/ichardart/.claude/config.json").exists():
            return "claude-desktop"
        
        # Check for Cline
        cline_config = Path("/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
        if cline_config.exists():
            return "cline"
        
        # Check for Claude Code environment variables
        if os.getenv("CLAUDE_CODE_SESSION") or os.getenv("ANTHROPIC_CLI"):
            return "claude-code"
        
        return "unknown"
    
    def load_governance_context(self):
        """Load appropriate governance context"""
        client = self.detect_claude_client()
        
        context = {
            "client": client,
            "governance_active": True,
            "idp_platform": "Multi-Agent with A2A Protocol",
            "security_mode": "enforced",
            "workspace": "/home/ichardart/code"
        }
        
        # Client-specific context
        if client == "claude-desktop":
            from claude_desktop_governance import ClaudeDesktopGovernance
            governance = ClaudeDesktopGovernance()
            context.update(governance.generate_governance_context())
        
        elif client == "cline":
            context["note"] = "Use governance-mcp tools for compliance checking"
            context["mcp_tools"] = [
                "get_governance_status",
                "check_mcp_compliance", 
                "get_security_posture"
            ]
        
        elif client == "claude-code":
            context["note"] = "Governance awareness loaded via CLAUDE.md and startup scripts"
            
        return context
    
    def display_governance_summary(self):
        """Display governance summary for the detected client"""
        client = self.detect_claude_client()
        
        print(f"🏛️ IDP Governance Active - {client.title()}")
        print("=" * 50)
        print()
        print("📋 Available via governance-mcp tools:")
        print("• get_governance_status - Overall framework status")
        print("• check_mcp_compliance - Validate MCP server compliance") 
        print("• get_security_posture - Security and risk assessment")
        print("• get_infrastructure_status - Platform component status")
        print()
        print("🔗 Key Resources:")
        print("• Framework: /home/ichardart/code/infra/idp-governance/")
        print("• Tools: /home/ichardart/code/infra/tools/")
        print("• Memory: /home/ichardart/code/infra/data/memory/")
        print()
        print("🎯 Platform: Multi-Agent IDP with Security-by-Design")

if __name__ == "__main__":
    loader = UniversalGovernanceLoader()
    
    if "--context" in sys.argv:
        context = loader.load_governance_context()
        print(json.dumps(context, indent=2))
    else:
        loader.display_governance_summary()
