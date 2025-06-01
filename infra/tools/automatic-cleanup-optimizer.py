#!/usr/bin/env python3
"""
🧹 Automatic IDP Cleanup and Optimization System
Reduces clutter, eliminates duplicates, and optimizes infrastructure artifacts
"""

import os
import shutil
import json
import datetime
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set

class IDPCleanupOptimizer:
    def __init__(self):
        self.code_root = Path("/home/ichardart/code")
        self.infra_path = self.code_root / "infra"
        self.tools_path = self.infra_path / "tools"
        self.logs_path = self.infra_path / "logs"
        self.cleanup_log = self.logs_path / f"cleanup-{datetime.datetime.now().strftime('%Y%m%d')}.log"
        
        # Cleanup rules and thresholds
        self.cleanup_rules = {
            "log_retention_days": 30,
            "mcp_status_retention_hours": 24,
            "temp_file_age_hours": 2,
            "deprecated_tool_age_days": 90,
            "duplicate_threshold": 0.95,  # 95% similarity
            "enable_git_archive": True,
            "archive_valuable_logs": True,
            "archive_branch": "archive-logs"
        }
        
        self.cleanup_stats = {
            "files_removed": 0,
            "bytes_freed": 0,
            "duplicates_resolved": 0,
            "tools_deprecated": 0
        }
    
    def log_action(self, action: str, details: str = ""):
        """Log cleanup actions"""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {action}: {details}\n"
        
        with open(self.cleanup_log, 'a') as f:
            f.write(log_entry)
        
        print(f"🧹 {action}: {details}")
    
    def get_file_size(self, file_path: Path) -> int:
        """Get file size in bytes"""
        try:
            return file_path.stat().st_size
        except:
            return 0
    
    def get_file_hash(self, file_path: Path) -> str:
        """Get file content hash for duplicate detection"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def archive_valuable_logs(self, log_files_to_archive: List[Path]):
        """Archive valuable logs to Git before deletion"""
        if not self.cleanup_rules.get("enable_git_archive", False):
            return
        
        try:
            import subprocess
            archive_dir = self.code_root / "archives" / "logs"
            archive_dir.mkdir(parents=True, exist_ok=True)
            
            for log_file in log_files_to_archive:
                if self.is_valuable_log(log_file):
                    archive_path = archive_dir / log_file.name
                    shutil.copy2(log_file, archive_path)
                    self.log_action("ARCHIVED_LOG", f"{log_file.name} → archives/logs/")
            
            # Commit archives if any files were archived
            if any(archive_dir.glob("*")):
                self.commit_archives()
        except Exception as e:
            self.log_action("ARCHIVE_ERROR", f"Failed to archive logs: {e}")
    
    def is_valuable_log(self, log_file: Path) -> bool:
        """Determine if a log file contains valuable information worth archiving"""
        valuable_patterns = [
            "verification-", "governance-", "security-", "transformation-",
            "error", "fail", "critical", "alert", "incident"
        ]
        
        file_content_check = False
        try:
            if log_file.suffix == ".json" and log_file.stat().st_size > 100:
                with open(log_file, 'r') as f:
                    content = f.read(500)  # Check first 500 chars
                    file_content_check = any(pattern in content.lower() for pattern in valuable_patterns)
        except:
            pass
        
        name_check = any(pattern in log_file.name.lower() for pattern in valuable_patterns)
        return name_check or file_content_check
    
    def commit_archives(self):
        """Commit archived logs to Git"""
        try:
            import subprocess
            os.chdir(self.code_root)
            
            # Add archived files
            subprocess.run(["git", "add", "archives/"], check=False)
            
            # Commit with timestamp
            commit_msg = f"Archive logs: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
            result = subprocess.run(["git", "commit", "-m", commit_msg], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_action("GIT_ARCHIVE", "Successfully committed archived logs")
            else:
                self.log_action("GIT_ARCHIVE", f"No new archives to commit: {result.stdout}")
                
        except Exception as e:
            self.log_action("GIT_ERROR", f"Failed to commit archives: {e}")
    
    def cleanup_old_logs(self):
        """Remove old log files based on retention policies"""
        self.log_action("CLEANUP_LOGS", "Starting log cleanup")
        
        logs_to_archive = []
        
        if not self.logs_path.exists():
            return
        
        now = datetime.datetime.now()
        retention_cutoff = now - datetime.timedelta(days=self.cleanup_rules["log_retention_days"])
        mcp_retention_cutoff = now - datetime.timedelta(hours=self.cleanup_rules["mcp_status_retention_hours"])
        
        # Check both .log and .json files (MCP status files are .json)
        for pattern in ["*.log", "*.json"]:
            for log_file in self.logs_path.glob(pattern):
                try:
                    file_mtime = datetime.datetime.fromtimestamp(log_file.stat().st_mtime)
                    file_size = self.get_file_size(log_file)
                    
                    should_remove = False
                    reason = ""
                    
                    # Special handling for MCP status logs (very aggressive cleanup)
                    if "mcp-status-" in log_file.name:
                        if file_mtime < mcp_retention_cutoff:
                            should_remove = True
                            reason = f"MCP status log older than {self.cleanup_rules['mcp_status_retention_hours']} hours"
                
                    # General log retention
                    elif file_mtime < retention_cutoff:
                        should_remove = True
                        reason = f"Log older than {self.cleanup_rules['log_retention_days']} days"
                    
                    if should_remove:
                        # Archive valuable logs before deletion
                        if self.cleanup_rules.get("archive_valuable_logs", False):
                            logs_to_archive.append(log_file)
                        
                        self.cleanup_stats["files_removed"] += 1
                        self.cleanup_stats["bytes_freed"] += file_size
                        log_file.unlink()
                        self.log_action("REMOVED_LOG", f"{log_file.name} ({file_size} bytes) - {reason}")
                        
                except Exception as e:
                    self.log_action("ERROR", f"Failed to process {log_file}: {e}")
        
        # Archive collected valuable logs
        if logs_to_archive and self.cleanup_rules.get("archive_valuable_logs", False):
            self.archive_valuable_logs(logs_to_archive)
    
    def cleanup_temp_files(self):
        """Remove temporary files"""
        self.log_action("CLEANUP_TEMP", "Starting temporary file cleanup")
        
        temp_patterns = [
            "/tmp/verification_*.metadata",
            "/tmp/governance_*.tmp",
            "/tmp/*_agent_context.tmp",
            str(self.infra_path / "*.tmp"),
            str(self.code_root / ".agent_context_summary.tmp")
        ]
        
        cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=self.cleanup_rules["temp_file_age_hours"])
        
        for pattern in temp_patterns:
            import glob
            for temp_file in glob.glob(pattern):
                temp_path = Path(temp_file)
                if temp_path.exists():
                    try:
                        file_mtime = datetime.datetime.fromtimestamp(temp_path.stat().st_mtime)
                        if file_mtime < cutoff_time:
                            file_size = self.get_file_size(temp_path)
                            temp_path.unlink()
                            self.cleanup_stats["files_removed"] += 1
                            self.cleanup_stats["bytes_freed"] += file_size
                            self.log_action("REMOVED_TEMP", f"{temp_file} ({file_size} bytes)")
                    except Exception as e:
                        self.log_action("ERROR", f"Failed to remove temp file {temp_file}: {e}")
    
    def find_duplicate_tools(self) -> Dict[str, List[Path]]:
        """Find duplicate tools based on content similarity"""
        self.log_action("DUPLICATE_SCAN", "Scanning for duplicate tools")
        
        tool_hashes = defaultdict(list)
        
        for tool_file in self.tools_path.glob("*.py"):
            if tool_file.name.startswith('.'):
                continue
                
            file_hash = self.get_file_hash(tool_file)
            if file_hash:
                tool_hashes[file_hash].append(tool_file)
        
        for tool_file in self.tools_path.glob("*.sh"):
            if tool_file.name.startswith('.'):
                continue
                
            file_hash = self.get_file_hash(tool_file)
            if file_hash:
                tool_hashes[file_hash].append(tool_file)
        
        # Find actual duplicates
        duplicates = {hash_val: files for hash_val, files in tool_hashes.items() if len(files) > 1}
        
        return duplicates
    
    def resolve_duplicates(self, duplicates: Dict[str, List[Path]]):
        """Resolve duplicate tools by keeping the most recent/appropriate version"""
        for file_hash, duplicate_files in duplicates.items():
            if len(duplicate_files) <= 1:
                continue
            
            # Sort by modification time, keep the newest
            sorted_files = sorted(duplicate_files, key=lambda f: f.stat().st_mtime, reverse=True)
            keep_file = sorted_files[0]
            remove_files = sorted_files[1:]
            
            self.log_action("DUPLICATE_FOUND", f"Hash {file_hash[:8]}: keeping {keep_file.name}, removing {len(remove_files)} duplicates")
            
            for remove_file in remove_files:
                try:
                    # Move to deprecated instead of deleting
                    deprecated_dir = self.tools_path / "deprecated"
                    deprecated_dir.mkdir(exist_ok=True)
                    
                    new_name = f"{remove_file.stem}_duplicate_{datetime.datetime.now().strftime('%Y%m%d')}{remove_file.suffix}"
                    destination = deprecated_dir / new_name
                    
                    shutil.move(str(remove_file), str(destination))
                    
                    file_size = self.get_file_size(destination)
                    self.cleanup_stats["duplicates_resolved"] += 1
                    self.cleanup_stats["bytes_freed"] += file_size
                    
                    self.log_action("MOVED_DUPLICATE", f"{remove_file.name} → deprecated/{new_name}")
                    
                except Exception as e:
                    self.log_action("ERROR", f"Failed to move duplicate {remove_file}: {e}")
    
    def cleanup_deprecated_tools(self):
        """Remove very old deprecated tools"""
        deprecated_dir = self.tools_path / "deprecated"
        if not deprecated_dir.exists():
            return
        
        self.log_action("CLEANUP_DEPRECATED", "Cleaning up old deprecated tools")
        
        cutoff_time = datetime.datetime.now() - datetime.timedelta(days=self.cleanup_rules["deprecated_tool_age_days"])
        
        for deprecated_file in deprecated_dir.iterdir():
            if deprecated_file.is_file():
                try:
                    file_mtime = datetime.datetime.fromtimestamp(deprecated_file.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        file_size = self.get_file_size(deprecated_file)
                        deprecated_file.unlink()
                        
                        self.cleanup_stats["files_removed"] += 1
                        self.cleanup_stats["bytes_freed"] += file_size
                        self.cleanup_stats["tools_deprecated"] += 1
                        
                        self.log_action("REMOVED_DEPRECATED", f"{deprecated_file.name} ({file_size} bytes)")
                        
                except Exception as e:
                    self.log_action("ERROR", f"Failed to remove deprecated tool {deprecated_file}: {e}")
    
    def optimize_log_structure(self):
        """Optimize log file structure and organization"""
        self.log_action("OPTIMIZE_LOGS", "Optimizing log structure")
        
        # Group logs by date and type
        log_groups = defaultdict(list)
        
        for log_file in self.logs_path.glob("*.log"):
            if log_file.name.startswith("mcp-status-"):
                # Extract date from MCP status logs
                parts = log_file.name.split("-")
                if len(parts) >= 3:
                    date_part = parts[2].split(".")[0]
                    log_groups[f"mcp-status-{date_part}"].append(log_file)
        
        # Consolidate logs if there are too many for a single date
        for group_key, log_files in log_groups.items():
            if len(log_files) > 100:  # Too many individual logs
                self.log_action("CONSOLIDATE_LOGS", f"Consolidating {len(log_files)} logs for {group_key}")
                # This would implement log consolidation logic
                # For now, just log the opportunity
    
    def generate_cleanup_report(self) -> Dict:
        """Generate cleanup report"""
        report = {
            "timestamp": datetime.datetime.now().isoformat(),
            "stats": self.cleanup_stats,
            "recommendations": []
        }
        
        # Add recommendations based on findings
        if self.cleanup_stats["files_removed"] > 100:
            report["recommendations"].append("High file removal count - consider adjusting retention policies")
        
        if self.cleanup_stats["duplicates_resolved"] > 5:
            report["recommendations"].append("Many duplicates found - review tool creation processes")
        
        if self.cleanup_stats["bytes_freed"] > 100 * 1024 * 1024:  # 100MB
            report["recommendations"].append("Significant space freed - schedule more frequent cleanups")
        
        return report
    
    def run_full_cleanup(self) -> Dict:
        """Run complete cleanup and optimization"""
        self.log_action("CLEANUP_START", "Starting full IDP cleanup and optimization")
        
        # Step 1: Clean up old logs (biggest impact)
        self.cleanup_old_logs()
        
        # Step 2: Remove temporary files
        self.cleanup_temp_files()
        
        # Step 3: Find and resolve duplicate tools
        duplicates = self.find_duplicate_tools()
        if duplicates:
            self.resolve_duplicates(duplicates)
        
        # Step 4: Clean up very old deprecated tools
        self.cleanup_deprecated_tools()
        
        # Step 5: Optimize log structure
        self.optimize_log_structure()
        
        # Generate report
        report = self.generate_cleanup_report()
        
        self.log_action("CLEANUP_COMPLETE", 
                       f"Removed {self.cleanup_stats['files_removed']} files, "
                       f"freed {self.cleanup_stats['bytes_freed'] / 1024 / 1024:.1f}MB, "
                       f"resolved {self.cleanup_stats['duplicates_resolved']} duplicates")
        
        return report

def main():
    """Main execution"""
    print("🧹 Starting IDP Automatic Cleanup and Optimization")
    
    optimizer = IDPCleanupOptimizer()
    report = optimizer.run_full_cleanup()
    
    # Save report
    report_file = optimizer.infra_path / "logs" / f"cleanup-report-{datetime.datetime.now().strftime('%Y%m%d')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Cleanup Complete!")
    print(f"📊 Files removed: {report['stats']['files_removed']}")
    print(f"💾 Space freed: {report['stats']['bytes_freed'] / 1024 / 1024:.1f}MB")
    print(f"🔄 Duplicates resolved: {report['stats']['duplicates_resolved']}")
    print(f"📝 Report saved: {report_file}")
    
    return report

if __name__ == "__main__":
    main()