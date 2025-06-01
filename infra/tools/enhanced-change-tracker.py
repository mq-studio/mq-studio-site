#!/usr/bin/env python3
"""
🔄 Enhanced IDP Change Tracker
Automatic detection and documentation of infrastructure transformations
"""

import os
import json
import subprocess
import datetime
import hashlib
from pathlib import Path
from typing import Dict, List, Any

class IDPChangeTracker:
    def __init__(self):
        self.code_root = Path("/home/ichardart/code")
        self.infra_path = self.code_root / "infra"
        self.state_file = self.infra_path / "data" / "change-tracker-state.json"
        self.claude_md = self.code_root / "CLAUDE.md"
        self.manifest_md = self.code_root / "manifest.md"
        
        # Ensure state directory exists
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load previous state
        self.previous_state = self.load_state()
        
    def load_state(self) -> Dict:
        """Load previous infrastructure state"""
        if self.state_file.exists():
            try:
                with open(self.state_file) as f:
                    return json.load(f)
            except:
                pass
        return {
            "last_scan": None,
            "tool_checksums": {},
            "config_checksums": {},
            "protocol_checksums": {},
            "infrastructure_version": "1.0.0"
        }
    
    def save_state(self, state: Dict):
        """Save current infrastructure state"""
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)
    
    def get_file_checksum(self, file_path: Path) -> str:
        """Get MD5 checksum of file"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def scan_infrastructure_tools(self) -> Dict:
        """Scan for changes in infrastructure tools"""
        tools_dir = self.infra_path / "tools"
        current_tools = {}
        
        if tools_dir.exists():
            for tool_file in tools_dir.glob("*.py"):
                current_tools[tool_file.name] = self.get_file_checksum(tool_file)
            for tool_file in tools_dir.glob("*.sh"):
                current_tools[tool_file.name] = self.get_file_checksum(tool_file)
        
        return current_tools
    
    def scan_configuration_files(self) -> Dict:
        """Scan for changes in configuration files"""
        config_dir = self.infra_path / "config"
        current_configs = {}
        
        if config_dir.exists():
            for config_file in config_dir.glob("*.yaml"):
                current_configs[config_file.name] = self.get_file_checksum(config_file)
            for config_file in config_dir.glob("*.yml"):
                current_configs[config_file.name] = self.get_file_checksum(config_file)
            for config_file in config_dir.glob("*.json"):
                current_configs[config_file.name] = self.get_file_checksum(config_file)
        
        return current_configs
    
    def scan_protocol_files(self) -> Dict:
        """Scan for changes in protocol files"""
        protocols_dir = self.infra_path / "protocols"
        current_protocols = {}
        
        if protocols_dir.exists():
            for protocol_file in protocols_dir.glob("*.md"):
                current_protocols[protocol_file.name] = self.get_file_checksum(protocol_file)
        
        return current_protocols
    
    def detect_new_tools(self, current_tools: Dict, previous_tools: Dict) -> List[str]:
        """Detect newly created tools"""
        return [tool for tool in current_tools if tool not in previous_tools]
    
    def detect_modified_tools(self, current_tools: Dict, previous_tools: Dict) -> List[str]:
        """Detect modified tools"""
        modified = []
        for tool, checksum in current_tools.items():
            if tool in previous_tools and previous_tools[tool] != checksum:
                modified.append(tool)
        return modified
    
    def detect_major_changes(self, new_tools: List[str], modified_tools: List[str], 
                           new_configs: List[str], new_protocols: List[str]) -> Dict:
        """Detect if this represents a major infrastructure change"""
        change_indicators = {
            "new_verification_engine": any("verification" in tool for tool in new_tools),
            "new_governance_tools": any("governance" in tool for tool in new_tools),
            "new_inventory_system": any("inventory" in tool for tool in new_tools),
            "new_agent_protocols": any("agent" in protocol for protocol in new_protocols),
            "new_verification_profiles": any("verification" in config for config in new_configs),
            "scope_expansion": any("scope" in tool or "extend" in tool for tool in new_tools)
        }
        
        major_change_count = sum(change_indicators.values())
        is_major_transformation = major_change_count >= 3
        
        return {
            "is_major_transformation": is_major_transformation,
            "change_count": major_change_count,
            "indicators": change_indicators
        }
    
    def generate_change_summary(self, changes: Dict) -> str:
        """Generate human-readable change summary"""
        summary_parts = []
        
        if changes.get("new_tools"):
            summary_parts.append(f"🔧 **New Tools**: {', '.join(changes['new_tools'])}")
        
        if changes.get("modified_tools"):
            summary_parts.append(f"🔄 **Modified Tools**: {', '.join(changes['modified_tools'])}")
        
        if changes.get("new_configs"):
            summary_parts.append(f"⚙️ **New Configurations**: {', '.join(changes['new_configs'])}")
        
        if changes.get("new_protocols"):
            summary_parts.append(f"📋 **New Protocols**: {', '.join(changes['new_protocols'])}")
        
        if changes.get("major_analysis", {}).get("is_major_transformation"):
            summary_parts.insert(0, "🚀 **MAJOR INFRASTRUCTURE TRANSFORMATION DETECTED**")
        
        return "\n".join(summary_parts)
    
    def update_claude_md(self, changes: Dict):
        """Update CLAUDE.md with infrastructure changes"""
        if not changes.get("major_analysis", {}).get("is_major_transformation"):
            return  # Only update for major changes
        
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Read current CLAUDE.md
        if self.claude_md.exists():
            with open(self.claude_md) as f:
                content = f.read()
            
            # Look for the status check section to update timestamp
            updated_content = content
            
            # Add change tracking section if major transformation
            change_section = f"""
## 🔄 AUTOMATIC CHANGE DETECTION (Last Updated: {timestamp})

### Recent Infrastructure Changes Detected
{self.generate_change_summary(changes)}

**Change Analysis**: {changes.get('major_analysis', {}).get('change_count', 0)} major indicators detected
**Transformation Level**: {'MAJOR' if changes.get('major_analysis', {}).get('is_major_transformation') else 'MINOR'}

"""
            
            # Insert change detection section after the first heading
            lines = updated_content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('## ') and i > 0:
                    lines.insert(i, change_section)
                    break
            
            # Write updated content
            with open(self.claude_md, 'w') as f:
                f.write('\n'.join(lines))
    
    def update_manifest_md(self, changes: Dict):
        """Update manifest.md with infrastructure changes"""
        if not changes.get("major_analysis", {}).get("is_major_transformation"):
            return  # Only update for major changes
        
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        if self.manifest_md.exists():
            with open(self.manifest_md) as f:
                content = f.read()
            
            # Update the "Last Updated" timestamp
            updated_content = content.replace(
                "## Last Updated\n2025-05-28 10:25:00",
                f"## Last Updated\n{timestamp} - **AUTOMATIC CHANGE DETECTION**"
            )
            
            # Add automated change tracking entry
            change_entry = f"""
## 🤖 Automated Change Detection ({timestamp})
{self.generate_change_summary(changes)}

**Detection Method**: Automatic infrastructure scanning
**Change Scope**: {'Major Transformation' if changes.get('major_analysis', {}).get('is_major_transformation') else 'Minor Updates'}

"""
            
            # Insert after the key infrastructure changes section
            lines = updated_content.split('\n')
            for i, line in enumerate(lines):
                if "## Previous Infrastructure Evolution" in line:
                    lines.insert(i, change_entry)
                    break
            
            with open(self.manifest_md, 'w') as f:
                f.write('\n'.join(lines))
    
    def log_changes(self, changes: Dict):
        """Log changes to governance log"""
        log_file = self.infra_path / "logs" / f"automatic-change-tracking-{datetime.datetime.now().strftime('%Y%m%d')}.log"
        
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] CHANGE_DETECTED: {json.dumps(changes, indent=2)}\n"
        
        with open(log_file, 'a') as f:
            f.write(log_entry)
    
    def run_change_detection(self) -> Dict:
        """Run complete change detection and documentation update"""
        print("🔍 Running IDP Change Detection...")
        
        # Scan current state
        current_tools = self.scan_infrastructure_tools()
        current_configs = self.scan_configuration_files()
        current_protocols = self.scan_protocol_files()
        
        # Detect changes
        new_tools = self.detect_new_tools(current_tools, self.previous_state.get("tool_checksums", {}))
        modified_tools = self.detect_modified_tools(current_tools, self.previous_state.get("tool_checksums", {}))
        new_configs = self.detect_new_tools(current_configs, self.previous_state.get("config_checksums", {}))
        new_protocols = self.detect_new_tools(current_protocols, self.previous_state.get("protocol_checksums", {}))
        
        # Analyze for major changes
        major_analysis = self.detect_major_changes(new_tools, modified_tools, new_configs, new_protocols)
        
        changes = {
            "timestamp": datetime.datetime.now().isoformat(),
            "new_tools": new_tools,
            "modified_tools": modified_tools,
            "new_configs": new_configs,
            "new_protocols": new_protocols,
            "major_analysis": major_analysis
        }
        
        # Update documentation if major changes detected
        if major_analysis.get("is_major_transformation"):
            print("🚀 Major transformation detected - updating documentation")
            self.update_claude_md(changes)
            self.update_manifest_md(changes)
        elif new_tools or modified_tools or new_configs or new_protocols:
            print("🔄 Minor changes detected - logging only")
        else:
            print("✅ No significant changes detected")
        
        # Log all changes
        if new_tools or modified_tools or new_configs or new_protocols:
            self.log_changes(changes)
        
        # Save current state
        new_state = {
            "last_scan": datetime.datetime.now().isoformat(),
            "tool_checksums": current_tools,
            "config_checksums": current_configs,
            "protocol_checksums": current_protocols,
            "infrastructure_version": "2.0.0" if major_analysis.get("is_major_transformation") else self.previous_state.get("infrastructure_version", "1.0.0")
        }
        self.save_state(new_state)
        
        return changes

def main():
    """Main execution"""
    tracker = IDPChangeTracker()
    changes = tracker.run_change_detection()
    
    # Print summary
    if changes.get("major_analysis", {}).get("is_major_transformation"):
        print("\n🚀 MAJOR INFRASTRUCTURE TRANSFORMATION DETECTED")
        print("📝 Documentation automatically updated")
    
    return changes

if __name__ == "__main__":
    main()