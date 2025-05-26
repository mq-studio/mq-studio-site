#!/usr/bin/env python3
"""
Governance Auto-Refresh System
Provides multiple triggers for governance context updates
"""

import os
import json
import subprocess
import datetime
from pathlib import Path


class GovernanceAutoRefresh:
    """Manages automatic governance context refresh triggers"""
    
    def __init__(self):
        self.infra_path = Path("/home/ichardart/code/infra")
        self.tools_path = self.infra_path / "tools"
        self.memory_path = self.infra_path / "data/memory"
        
    def refresh_claude_code_context(self):
        """Refresh Claude Code governance context"""
        try:
            # Run MCP status checker to update CLAUDE.md
            status_checker = self.tools_path / "mcp-status-checker.py"
            if status_checker.exists():
                result = subprocess.run([
                    "python3", str(status_checker)
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    return {"success": True, "message": "Claude Code context refreshed"}
                else:
                    return {"success": False, "error": result.stderr}
            else:
                return {"success": False, "error": "Status checker not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def refresh_claude_desktop_context(self):
        """Refresh Claude Desktop governance context"""
        try:
            # Run Claude Desktop governance analyzer
            desktop_analyzer = self.tools_path / "claude-desktop-governance.py"
            if desktop_analyzer.exists():
                result = subprocess.run([
                    "python3", str(desktop_analyzer), "--context"
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    return {"success": True, "message": "Claude Desktop context refreshed"}
                else:
                    return {"success": False, "error": result.stderr}
            else:
                return {"success": False, "error": "Desktop analyzer not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def refresh_all_contexts(self):
        """Refresh all Claude client contexts"""
        results = {
            "timestamp": datetime.datetime.now().isoformat(),
            "claude_code": self.refresh_claude_code_context(),
            "claude_desktop": self.refresh_claude_desktop_context()
        }
        
        # Update memory with refresh status
        self.update_refresh_memory(results)
        
        return results
    
    def update_refresh_memory(self, results):
        """Update memory with refresh results"""
        try:
            memory_file = self.memory_path / "governance-refresh-status.json"
            self.memory_path.mkdir(parents=True, exist_ok=True)
            
            # Load existing memory
            memory = {"refresh_history": []}
            if memory_file.exists():
                with open(memory_file, 'r') as f:
                    memory = json.load(f)
            
            # Add current refresh
            memory["refresh_history"].append(results)
            memory["last_refresh"] = results
            
            # Keep only last 20 refreshes
            memory["refresh_history"] = memory["refresh_history"][-20:]
            
            with open(memory_file, 'w') as f:
                json.dump(memory, f, indent=2)
                
        except Exception as e:
            print(f"Warning: Could not update refresh memory: {e}")
    
    def create_git_hooks(self):
        """Create Git hooks for automatic governance refresh"""
        git_dir = Path("/home/ichardart/code/.git")
        if not git_dir.exists():
            return {"success": False, "error": "Not a git repository"}
        
        hooks_dir = git_dir / "hooks"
        hooks_dir.mkdir(exist_ok=True)
        
        # Post-commit hook
        post_commit_hook = hooks_dir / "post-commit"
        post_commit_content = f"""#!/bin/bash
# Auto-refresh governance context after commits

GOVERNANCE_REFRESH="{self.tools_path}/governance-auto-refresh.py"

if [ -f "$GOVERNANCE_REFRESH" ]; then
    echo "🔄 Refreshing governance context after commit..."
    python3 "$GOVERNANCE_REFRESH" --refresh-all
fi
"""
        
        with open(post_commit_hook, 'w') as f:
            f.write(post_commit_content)
        
        os.chmod(post_commit_hook, 0o755)
        
        # Pre-push hook
        pre_push_hook = hooks_dir / "pre-push"
        pre_push_content = f"""#!/bin/bash
# Refresh governance context before push

GOVERNANCE_REFRESH="{self.tools_path}/governance-auto-refresh.py"

if [ -f "$GOVERNANCE_REFRESH" ]; then
    echo "🔄 Refreshing governance context before push..."
    python3 "$GOVERNANCE_REFRESH" --refresh-all
fi
"""
        
        with open(pre_push_hook, 'w') as f:
            f.write(pre_push_content)
        
        os.chmod(pre_push_hook, 0o755)
        
        return {
            "success": True, 
            "message": "Git hooks created",
            "hooks": ["post-commit", "pre-push"]
        }
    
    def create_cron_job(self):
        """Create cron job for periodic governance refresh"""
        cron_command = f"*/15 * * * * python3 {self.tools_path}/governance-auto-refresh.py --refresh-all >/dev/null 2>&1"
        
        try:
            # Get current crontab
            result = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
            current_crontab = result.stdout if result.returncode == 0 else ""
            
            # Check if our job already exists
            if "governance-auto-refresh.py" in current_crontab:
                return {"success": True, "message": "Cron job already exists"}
            
            # Add our job
            new_crontab = current_crontab + f"\n{cron_command}\n"
            
            # Set new crontab
            process = subprocess.Popen(["crontab", "-"], stdin=subprocess.PIPE, text=True)
            process.communicate(input=new_crontab)
            
            if process.returncode == 0:
                return {"success": True, "message": "Cron job created (every 15 minutes)"}
            else:
                return {"success": False, "error": "Failed to set crontab"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def create_systemd_timer(self):
        """Create systemd timer for governance refresh (alternative to cron)"""
        try:
            service_content = f"""[Unit]
Description=IDP Governance Context Refresh
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 {self.tools_path}/governance-auto-refresh.py --refresh-all
User={os.getenv('USER', 'ichardart')}
Environment=HOME={os.getenv('HOME', '/home/ichardart')}
"""
            
            timer_content = """[Unit]
Description=Run IDP Governance Refresh every 15 minutes
Requires=governance-refresh.service

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
"""
            
            # Note: This would require sudo permissions to install
            # For now, just return the content that could be used
            return {
                "success": True,
                "message": "Systemd timer content generated",
                "service_content": service_content,
                "timer_content": timer_content,
                "note": "Manual installation required with sudo permissions"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def setup_all_triggers(self):
        """Setup all available governance refresh triggers"""
        results = {
            "timestamp": datetime.datetime.now().isoformat(),
            "git_hooks": self.create_git_hooks(),
            "cron_job": self.create_cron_job(),
            "systemd_timer": self.create_systemd_timer()
        }
        
        return results


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Governance Auto-Refresh System")
    parser.add_argument("--refresh-all", action="store_true", help="Refresh all client contexts")
    parser.add_argument("--refresh-claude-code", action="store_true", help="Refresh Claude Code context")
    parser.add_argument("--refresh-claude-desktop", action="store_true", help="Refresh Claude Desktop context")
    parser.add_argument("--setup-triggers", action="store_true", help="Setup automatic refresh triggers")
    parser.add_argument("--git-hooks", action="store_true", help="Create Git hooks")
    parser.add_argument("--cron", action="store_true", help="Setup cron job")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    refresh_system = GovernanceAutoRefresh()
    
    if args.refresh_all:
        result = refresh_system.refresh_all_contexts()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print("🔄 Governance Context Refresh Results:")
            for client, status in result.items():
                if client == "timestamp":
                    continue
                success = "✅" if status.get("success") else "❌"
                message = status.get("message", status.get("error", "Unknown"))
                print(f"  {client}: {success} {message}")
    
    elif args.refresh_claude_code:
        result = refresh_system.refresh_claude_code_context()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            status = "✅" if result["success"] else "❌"
            print(f"Claude Code: {status} {result.get('message', result.get('error'))}")
    
    elif args.refresh_claude_desktop:
        result = refresh_system.refresh_claude_desktop_context()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            status = "✅" if result["success"] else "❌"
            print(f"Claude Desktop: {status} {result.get('message', result.get('error'))}")
    
    elif args.setup_triggers:
        result = refresh_system.setup_all_triggers()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print("🔧 Setting up governance refresh triggers:")
            for trigger, status in result.items():
                if trigger == "timestamp":
                    continue
                success = "✅" if status.get("success") else "❌"
                message = status.get("message", status.get("error", "Unknown"))
                print(f"  {trigger}: {success} {message}")
    
    elif args.git_hooks:
        result = refresh_system.create_git_hooks()
        status = "✅" if result["success"] else "❌"
        print(f"Git hooks: {status} {result.get('message', result.get('error'))}")
    
    elif args.cron:
        result = refresh_system.create_cron_job()
        status = "✅" if result["success"] else "❌"
        print(f"Cron job: {status} {result.get('message', result.get('error'))}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()