#!/usr/bin/env python3
"""
IDP Governance Real-Time Synchronization System
Monitors governance artifacts and automatically updates context for all Claude clients
"""

import os
import json
import time
import datetime
import subprocess
import threading
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import hashlib


class GovernanceChangeHandler(FileSystemEventHandler):
    """Handles file system events for governance artifacts"""
    
    def __init__(self, sync_manager):
        self.sync_manager = sync_manager
        self.debounce_delay = 2  # seconds
        self.pending_changes = {}
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        file_path = event.src_path
        
        # Only monitor governance-related files
        if self._is_governance_file(file_path):
            self._debounced_change(file_path)
    
    def on_created(self, event):
        if not event.is_directory and self._is_governance_file(event.src_path):
            self._debounced_change(event.src_path)
    
    def on_deleted(self, event):
        if not event.is_directory and self._is_governance_file(event.src_path):
            self._debounced_change(event.src_path)
    
    def _is_governance_file(self, file_path):
        """Check if file is a governance artifact that should trigger updates"""
        governance_patterns = [
            '/idp-governance/',
            '/mcp-registry.md',
            '/mcp-servers/',
            '/mcp-config/',
            'CLAUDE.md',
            '/security-tooling/',
            'governance',
            'compliance',
            'mcp_settings.json',
            'config.json'
        ]
        
        # Exclude temporary/backup files
        if any(pattern in file_path for pattern in ['.tmp', '.backup', '.swp', '~']):
            return False
            
        return any(pattern in file_path for pattern in governance_patterns)
    
    def _debounced_change(self, file_path):
        """Debounce rapid file changes to avoid excessive updates"""
        # Cancel previous timer for this file
        if file_path in self.pending_changes:
            self.pending_changes[file_path].cancel()
        
        # Set new timer
        timer = threading.Timer(
            self.debounce_delay, 
            self.sync_manager.handle_governance_change, 
            [file_path]
        )
        self.pending_changes[file_path] = timer
        timer.start()


class GovernanceSynchronizationManager:
    """Manages real-time synchronization of governance context across all Claude clients"""
    
    def __init__(self):
        self.infra_path = Path("/home/ichardart/code/infra")
        self.governance_path = self.infra_path / "idp-governance"
        self.memory_path = self.infra_path / "data/memory"
        self.logs_path = self.infra_path / "logs"
        self.tools_path = self.infra_path / "tools"
        
        # Ensure directories exist
        self.memory_path.mkdir(parents=True, exist_ok=True)
        self.logs_path.mkdir(parents=True, exist_ok=True)
        
        # Track governance state
        self.governance_state_file = self.memory_path / "governance-sync-state.json"
        self.last_sync_time = None
        
        # Client configuration paths
        self.client_configs = {
            "claude_desktop": Path("/home/ichardart/.claude/config.json"),
            "claude_desktop_context": Path("/home/ichardart/.claude/governance-context.json"),
            "cline": Path("/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"),
            "claude_code": Path("/home/ichardart/code/CLAUDE.md"),
            "governance_memory": self.memory_path / "governance-state.json"
        }
        
        # Initialize state
        self.load_sync_state()
    
    def load_sync_state(self):
        """Load current synchronization state"""
        try:
            if self.governance_state_file.exists():
                with open(self.governance_state_file, 'r') as f:
                    state = json.load(f)
                self.last_sync_time = state.get("last_sync_time")
            else:
                self.create_initial_sync_state()
        except Exception as e:
            print(f"Warning: Could not load sync state: {e}")
            self.create_initial_sync_state()
    
    def create_initial_sync_state(self):
        """Create initial synchronization state"""
        state = {
            "last_sync_time": datetime.datetime.now().isoformat(),
            "sync_version": "1.0.0",
            "monitored_paths": [
                str(self.governance_path),
                str(self.infra_path / "mcp-servers"),
                str(self.infra_path / "mcp-config"),
                str(self.infra_path / "security-tooling"),
                "/home/ichardart/code/CLAUDE.md",
                "/home/ichardart/.claude/config.json",
                "/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
            ],
            "client_last_updates": {
                "claude_desktop": None,
                "cline": None,
                "claude_code": None
            }
        }
        
        with open(self.governance_state_file, 'w') as f:
            json.dump(state, f, indent=2)
        
        self.last_sync_time = state["last_sync_time"]
    
    def handle_governance_change(self, changed_file):
        """Handle a governance artifact change"""
        try:
            timestamp = datetime.datetime.now().isoformat()
            
            # Log the change
            log_message = f"{timestamp} - Governance change detected: {changed_file}"
            self.log_change(log_message)
            
            # Determine what type of change this is
            change_type = self.classify_change(changed_file)
            
            # Update governance context for all clients
            self.update_all_clients(changed_file, change_type, timestamp)
            
            # Update sync state
            self.update_sync_state(timestamp)
            
            print(f"🔄 Governance sync: {change_type} change in {Path(changed_file).name}")
            
        except Exception as e:
            error_msg = f"Error handling governance change: {e}"
            print(f"❌ {error_msg}")
            self.log_change(f"{datetime.datetime.now().isoformat()} - ERROR: {error_msg}")
    
    def classify_change(self, file_path):
        """Classify the type of governance change"""
        if "idp-governance" in file_path:
            if "IDP_GOVERNANCE_FRAMEWORK.md" in file_path:
                return "FRAMEWORK_UPDATE"
            elif "METRICS" in file_path.upper():
                return "METRICS_UPDATE"
            else:
                return "GOVERNANCE_POLICY"
        elif "mcp-servers" in file_path:
            return "MCP_SERVER_CHANGE"
        elif "mcp-config" in file_path or "config.json" in file_path:
            return "MCP_CONFIGURATION"
        elif "CLAUDE.md" in file_path:
            return "CLAUDE_CODE_CONTEXT"
        elif "security-tooling" in file_path:
            return "SECURITY_POLICY"
        else:
            return "GENERAL_GOVERNANCE"
    
    def update_all_clients(self, changed_file, change_type, timestamp):
        """Update governance context for all Claude clients"""
        
        # Update Claude Code (CLAUDE.md)
        self.update_claude_code_context(changed_file, change_type, timestamp)
        
        # Update Claude Desktop context
        self.update_claude_desktop_context(changed_file, change_type, timestamp)
        
        # Update Cline context (if needed)
        self.update_cline_context(changed_file, change_type, timestamp)
        
        # Update governance memory
        self.update_governance_memory(changed_file, change_type, timestamp)
        
        # Refresh MCP status
        self.refresh_mcp_status()
    
    def update_claude_code_context(self, changed_file, change_type, timestamp):
        """Update Claude Code governance awareness"""
        try:
            # Run MCP status checker to refresh CLAUDE.md
            status_checker = self.tools_path / "mcp-status-checker.py"
            if status_checker.exists():
                subprocess.run([
                    "python3", str(status_checker), "--no-update"
                ], capture_output=True, timeout=30)
            
            # Add change notification to CLAUDE.md
            claude_md_path = Path("/home/ichardart/code/CLAUDE.md")
            if claude_md_path.exists():
                with open(claude_md_path, 'r') as f:
                    content = f.read()
                
                # Add real-time update notice
                update_notice = f"""
## 🔄 REAL-TIME UPDATE ({timestamp})
**Change Detected**: {change_type} in {Path(changed_file).name}
**Auto-Sync**: Governance context automatically updated

"""
                
                # Insert after first heading
                lines = content.split('\n')
                updated_lines = []
                inserted = False
                
                for line in lines:
                    updated_lines.append(line)
                    if line.startswith('# ') and not inserted:
                        updated_lines.extend(update_notice.split('\n'))
                        inserted = True
                    elif line.startswith('## 🔄 REAL-TIME UPDATE'):
                        # Skip existing update notices
                        while updated_lines and not updated_lines[-1].startswith('##') and updated_lines[-1].strip():
                            updated_lines.pop()
                        break
                
                with open(claude_md_path, 'w') as f:
                    f.write('\n'.join(updated_lines))
            
        except Exception as e:
            print(f"Warning: Could not update Claude Code context: {e}")
    
    def update_claude_desktop_context(self, changed_file, change_type, timestamp):
        """Update Claude Desktop governance context"""
        try:
            context_file = self.client_configs["claude_desktop_context"]
            
            # Load existing context
            context = {}
            if context_file.exists():
                with open(context_file, 'r') as f:
                    context = json.load(f)
            
            # Update with change information
            context.update({
                "last_governance_change": {
                    "timestamp": timestamp,
                    "type": change_type,
                    "file": str(changed_file),
                    "auto_sync": True
                },
                "governance_framework": {
                    "status": "ACTIVE",
                    "mode": "ENFORCED", 
                    "last_updated": timestamp
                },
                "sync_status": "REAL_TIME_UPDATED"
            })
            
            # Save updated context
            with open(context_file, 'w') as f:
                json.dump(context, f, indent=2)
            
        except Exception as e:
            print(f"Warning: Could not update Claude Desktop context: {e}")
    
    def update_cline_context(self, changed_file, change_type, timestamp):
        """Update Cline governance context (via governance MCP server)"""
        try:
            # The governance MCP server will automatically reflect changes
            # when tools are called, so we just need to update memory
            pass
        except Exception as e:
            print(f"Warning: Could not update Cline context: {e}")
    
    def update_governance_memory(self, changed_file, change_type, timestamp):
        """Update central governance memory"""
        try:
            memory_file = self.client_configs["governance_memory"]
            
            # Load existing memory
            memory = {}
            if memory_file.exists():
                with open(memory_file, 'r') as f:
                    memory = json.load(f)
            
            # Update with change tracking
            if "change_history" not in memory:
                memory["change_history"] = []
            
            memory["change_history"].append({
                "timestamp": timestamp,
                "type": change_type,
                "file": str(changed_file),
                "sync_clients": ["claude_code", "claude_desktop", "cline"]
            })
            
            # Keep only last 50 changes
            memory["change_history"] = memory["change_history"][-50:]
            
            # Update last sync info
            memory["last_sync"] = {
                "timestamp": timestamp,
                "change_type": change_type
            }
            
            # Save updated memory
            with open(memory_file, 'w') as f:
                json.dump(memory, f, indent=2)
            
        except Exception as e:
            print(f"Warning: Could not update governance memory: {e}")
    
    def refresh_mcp_status(self):
        """Refresh MCP server status"""
        try:
            # Run status check in background
            status_checker = self.tools_path / "mcp-status-checker.py"
            if status_checker.exists():
                subprocess.Popen([
                    "python3", str(status_checker)
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            print(f"Warning: Could not refresh MCP status: {e}")
    
    def update_sync_state(self, timestamp):
        """Update synchronization state"""
        try:
            with open(self.governance_state_file, 'r') as f:
                state = json.load(f)
            
            state["last_sync_time"] = timestamp
            state["client_last_updates"] = {
                "claude_desktop": timestamp,
                "cline": timestamp,
                "claude_code": timestamp
            }
            
            with open(self.governance_state_file, 'w') as f:
                json.dump(state, f, indent=2)
            
            self.last_sync_time = timestamp
            
        except Exception as e:
            print(f"Warning: Could not update sync state: {e}")
    
    def log_change(self, message):
        """Log governance changes"""
        try:
            log_file = self.logs_path / "governance-sync.log"
            with open(log_file, 'a') as f:
                f.write(f"{message}\n")
        except Exception as e:
            print(f"Warning: Could not log change: {e}")
    
    def start_monitoring(self):
        """Start file system monitoring"""
        print("🔍 Starting IDP Governance Real-Time Synchronization")
        print("=" * 55)
        
        observer = Observer()
        handler = GovernanceChangeHandler(self)
        
        # Monitor key governance directories
        monitor_paths = [
            str(self.governance_path),
            str(self.infra_path / "mcp-servers"),
            str(self.infra_path / "mcp-config"),
            str(self.infra_path / "security-tooling"),
            "/home/ichardart/code",  # For CLAUDE.md
            "/home/ichardart/.claude",  # For Claude Desktop config
        ]
        
        for path in monitor_paths:
            if Path(path).exists():
                observer.schedule(handler, path, recursive=True)
                print(f"📁 Monitoring: {path}")
        
        # Monitor Cline config if it exists
        cline_dir = Path("/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings")
        if cline_dir.exists():
            observer.schedule(handler, str(cline_dir), recursive=False)
            print(f"📁 Monitoring: Cline configuration")
        
        observer.start()
        
        print("\n✅ Real-time governance synchronization active")
        print("🔄 All governance changes will automatically update Claude clients")
        print("📝 Press Ctrl+C to stop monitoring\n")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping governance synchronization...")
            observer.stop()
            
        observer.join()
        print("✅ Governance synchronization stopped")


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="IDP Governance Real-Time Synchronization")
    parser.add_argument("--daemon", action="store_true", help="Run as background daemon")
    parser.add_argument("--test", action="store_true", help="Test sync system")
    parser.add_argument("--status", action="store_true", help="Show sync status")
    
    args = parser.parse_args()
    
    sync_manager = GovernanceSynchronizationManager()
    
    if args.status:
        print("🔍 Governance Synchronization Status")
        print("=" * 40)
        print(f"Last sync: {sync_manager.last_sync_time}")
        print(f"State file: {sync_manager.governance_state_file}")
        for name, path in sync_manager.client_configs.items():
            exists = "✅" if path.exists() else "❌"
            print(f"{name}: {exists} {path}")
        
    elif args.test:
        print("🧪 Testing governance synchronization...")
        test_file = "/tmp/governance-test.txt"
        with open(test_file, 'w') as f:
            f.write("test change")
        sync_manager.handle_governance_change(test_file)
        os.remove(test_file)
        print("✅ Test completed")
        
    elif args.daemon:
        # Run as daemon (background process)
        print("🔄 Starting governance synchronization daemon...")
        sync_manager.start_monitoring()
        
    else:
        # Interactive monitoring
        sync_manager.start_monitoring()


if __name__ == "__main__":
    main()