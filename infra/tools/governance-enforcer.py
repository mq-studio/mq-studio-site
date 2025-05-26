#!/usr/bin/env python3
"""
🏛️ IDP GOVERNANCE ENFORCER
Active governance that PREVENTS violations, not just documents them
"""

import os
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

class GovernanceEnforcer:
    def __init__(self):
        self.root_path = Path("/home/ichardart/code")
        self.violations = []
        self.metrics = {
            "enforcement_runs": 0,
            "violations_blocked": 0,
            "compliance_score": 0
        }
    
    def enforce_mcp_compliance(self):
        """BLOCK non-compliant MCP servers from running"""
        print("🔒 ENFORCING MCP Server Compliance...")
        
        cline_config = Path.home() / ".vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
        
        if cline_config.exists():
            with open(cline_config) as f:
                config = json.load(f)
            
            high_risk_servers = [
                "browser-tools-mcp",
                "puppeteer", 
                "@modelcontextprotocol/server-sequential-thinking",
                "@modelcontextprotocol/server-puppeteer"
            ]
            
            violations_found = []
            for server in config.get("mcpServers", {}):
                if any(risk in server for risk in high_risk_servers):
                    violations_found.append(server)
            
            if violations_found:
                print(f"❌ BLOCKING: {len(violations_found)} high-risk MCP servers detected")
                print("   GOVERNANCE ACTION: Disabling non-compliant servers")
                
                # ACTIVELY REMOVE them from config
                compliant_servers = {k: v for k, v in config["mcpServers"].items() 
                                   if not any(risk in k for risk in high_risk_servers)}
                config["mcpServers"] = compliant_servers
                
                with open(cline_config, 'w') as f:
                    json.dump(config, f, indent=2)
                
                self.violations.append("MCP_COMPLIANCE_VIOLATION")
                return False
        
        return True
    
    def enforce_secrets_policy(self):
        """SCAN and BLOCK any secrets from being committed"""
        print("🔐 ENFORCING Secrets Policy...")
        
        try:
            result = subprocess.run(
                ["git", "diff", "--cached", "--name-only"], 
                cwd=self.root_path, capture_output=True, text=True
            )
            
            if result.returncode == 0 and result.stdout.strip():
                # Check staged files for secrets
                secret_patterns = ["password", "secret", "key", "token", "api_key"]
                for file_path in result.stdout.strip().split('\n'):
                    if file_path:
                        full_path = self.root_path / file_path
                        if full_path.exists() and full_path.is_file():
                            try:
                                with open(full_path, 'r', errors='ignore') as f:
                                    content = f.read().lower()
                                    for pattern in secret_patterns:
                                        if pattern in content:
                                            print(f"❌ SECRETS VIOLATION: {pattern} found in {file_path}")
                                            self.violations.append("SECRETS_POLICY_VIOLATION")
                                            return False
                            except:
                                continue
        except:
            pass
        
        return True
    
    def enforce_file_structure_governance(self):
        """ENFORCE proper file organization"""
        print("📁 ENFORCING File Structure Governance...")
        
        # Check for files that should be in proper locations
        misplaced_files = []
        
        for file_path in self.root_path.rglob("*"):
            if file_path.is_file():
                # Config files should be in proper locations
                if file_path.name.endswith('.config.js') and 'infra' not in str(file_path):
                    misplaced_files.append(str(file_path))
                
                # Log files outside logs directory
                if file_path.name.endswith('.log') and 'logs' not in str(file_path):
                    misplaced_files.append(str(file_path))
        
        if misplaced_files:
            print(f"❌ STRUCTURE VIOLATION: {len(misplaced_files)} misplaced files")
            for file_path in misplaced_files[:5]:  # Show first 5
                print(f"   {file_path}")
            self.violations.append("FILE_STRUCTURE_VIOLATION")
            return False
        
        return True
    
    def calculate_compliance_score(self):
        """Calculate actual compliance based on violations"""
        total_checks = 3  # Number of enforcement checks
        violations_count = len(self.violations)
        self.metrics["compliance_score"] = max(0, 100 - (violations_count * 25))
        return self.metrics["compliance_score"]
    
    def run_enforcement(self):
        """Execute all governance enforcement"""
        print("🏛️ RUNNING ACTIVE GOVERNANCE ENFORCEMENT")
        print("=" * 50)
        
        self.metrics["enforcement_runs"] += 1
        start_time = datetime.now()
        
        # Run all enforcement checks
        checks = [
            self.enforce_mcp_compliance(),
            self.enforce_secrets_policy(), 
            self.enforce_file_structure_governance()
        ]
        
        compliance_score = self.calculate_compliance_score()
        
        # Save enforcement metrics
        metrics_file = self.root_path / "infra/data/memory/governance-enforcement-metrics.json"
        self.metrics.update({
            "last_run": start_time.isoformat(),
            "violations_blocked": len(self.violations),
            "compliance_score": compliance_score
        })
        
        with open(metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        
        if all(checks):
            print(f"✅ GOVERNANCE COMPLIANT (Score: {compliance_score}%)")
            return True
        else:
            print(f"❌ GOVERNANCE VIOLATIONS DETECTED (Score: {compliance_score}%)")
            print(f"   Violations: {', '.join(self.violations)}")
            return False

if __name__ == "__main__":
    enforcer = GovernanceEnforcer()
    success = enforcer.run_enforcement()
    sys.exit(0 if success else 1)