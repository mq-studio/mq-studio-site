#!/usr/bin/env python3
"""
Governance Lifecycle Manager

Automated maintenance and cleanup for the governance framework.
Provides continuous health monitoring, deprecation management, and optimization.
"""
import os
import sys
import json
import sqlite3
import datetime
import hashlib
import shutil
import re
from pathlib import Path
from collections import defaultdict, Counter

class GovernanceLifecycleManager:
    def __init__(self, 
                 db_path="/home/ichardart/code/infra/data/idp-inventory.db",
                 tools_dir="/home/ichardart/code/infra/tools",
                 deprecated_dir="/home/ichardart/code/infra/tools/deprecated"):
        self.db_path = db_path
        self.tools_dir = tools_dir
        self.deprecated_dir = deprecated_dir
        self.lifecycle_log = os.path.join(tools_dir, "governance-lifecycle.log")
        
        # Ensure directories exist
        os.makedirs(deprecated_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.lifecycle_log), exist_ok=True)
    
    def log(self, message, level="INFO"):
        """Log lifecycle management activities."""
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f"[{timestamp}] {level}: {message}"
        
        print(log_entry)
        
        with open(self.lifecycle_log, 'a') as f:
            f.write(log_entry + "\n")
    
    def detect_deprecated_components(self):
        """Automatically detect components that should be deprecated."""
        deprecated_candidates = {
            "scripts": [],
            "data_files": [],
            "configs": [],
            "reasons": {}
        }
        
        # Define deprecation patterns
        deprecation_patterns = {
            # Scripts superseded by integrated system
            "standalone_mapping": {
                "patterns": ["map-governance-artifacts", "validate-governance-mapping"],
                "superseded_by": "integrated-governance-inventory.py",
                "reason": "Replaced by integrated Dynamic Inventory system"
            },
            "standalone_optimization": {
                "patterns": ["optimize-governance-structure", "rollback-governance-optimization"],
                "superseded_by": "Dynamic Inventory MCP tools",
                "reason": "Optimization now handled via MCP server tools"
            },
            "temporary_exports": {
                "patterns": ["governance_artifacts_*.json", "governance_optimization_*.md"],
                "superseded_by": "SQLite database queries",
                "reason": "Data now stored in persistent SQLite database"
            }
        }
        
        # Check tools directory for deprecated scripts
        for root, dirs, files in os.walk(self.tools_dir):
            # Skip deprecated directory itself
            if "deprecated" in root:
                continue
                
            for file in files:
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, self.tools_dir)
                
                for category, config in deprecation_patterns.items():
                    for pattern in config["patterns"]:
                        if re.search(pattern.replace("*", ".*"), file):
                            deprecated_candidates["scripts"].append({
                                "path": filepath,
                                "relative_path": relative_path,
                                "category": category,
                                "superseded_by": config["superseded_by"],
                                "reason": config["reason"],
                                "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
                            })
        
        # Check data directory for temporary files
        data_dirs = [
            "/home/ichardart/code/infra/data/memory",
            "/home/ichardart/code/infra/logs"
        ]
        
        for data_dir in data_dirs:
            if os.path.exists(data_dir):
                for root, dirs, files in os.walk(data_dir):
                    for file in files:
                        filepath = os.path.join(root, file)
                        
                        # Check for old governance exports
                        if re.search(r"governance_artifacts_.*\.json", file):
                            # Check if file is older than 7 days
                            file_age = datetime.datetime.now() - datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
                            if file_age.days > 7:
                                deprecated_candidates["data_files"].append({
                                    "path": filepath,
                                    "reason": "Temporary export older than 7 days, superseded by SQLite database",
                                    "age_days": file_age.days,
                                    "size_mb": os.path.getsize(filepath) / (1024*1024)
                                })
        
        return deprecated_candidates
    
    def analyze_governance_health(self):
        """Analyze overall governance framework health."""
        health_metrics = {
            "database_health": {},
            "script_redundancy": {},
            "pattern_efficiency": {},
            "storage_optimization": {},
            "recommendations": []
        }
        
        try:
            # Database health analysis
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check database size and efficiency
            cursor.execute("SELECT COUNT(*) FROM governance_artifacts")
            artifact_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM directories WHERE governance_artifacts_count > 0")
            gov_dir_count = cursor.fetchone()[0]
            
            # Check for stale data (not updated in 30 days)
            thirty_days_ago = (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat()
            cursor.execute("SELECT COUNT(*) FROM governance_artifacts WHERE last_analyzed < ?", (thirty_days_ago,))
            stale_artifacts = cursor.fetchone()[0]
            
            # Check confidence distribution
            cursor.execute("SELECT confidence_level, COUNT(*) FROM governance_artifacts GROUP BY confidence_level")
            confidence_dist = dict(cursor.fetchall())
            
            health_metrics["database_health"] = {
                "total_artifacts": artifact_count,
                "governance_directories": gov_dir_count,
                "stale_artifacts": stale_artifacts,
                "confidence_distribution": confidence_dist,
                "stale_percentage": (stale_artifacts / artifact_count * 100) if artifact_count > 0 else 0
            }
            
            # Generate recommendations
            if stale_artifacts > 0:
                health_metrics["recommendations"].append({
                    "type": "database_maintenance",
                    "priority": "medium",
                    "action": f"Re-analyze {stale_artifacts} stale governance artifacts",
                    "command": "python3 integrated-governance-inventory.py --update-stale"
                })
            
            low_confidence = confidence_dist.get('low', 0)
            if low_confidence > artifact_count * 0.2:  # More than 20% low confidence
                health_metrics["recommendations"].append({
                    "type": "pattern_improvement",
                    "priority": "high", 
                    "action": f"Improve classification patterns - {low_confidence} low-confidence artifacts",
                    "command": "python3 refine-governance-patterns.py"
                })
            
            conn.close()
            
        except Exception as e:
            health_metrics["database_health"]["error"] = str(e)
            health_metrics["recommendations"].append({
                "type": "database_repair",
                "priority": "critical",
                "action": "Database connection failed - investigate and repair",
                "error": str(e)
            })
        
        # Script redundancy analysis
        script_analysis = self.analyze_script_redundancy()
        health_metrics["script_redundancy"] = script_analysis
        
        # Storage optimization opportunities
        storage_analysis = self.analyze_storage_optimization()
        health_metrics["storage_optimization"] = storage_analysis
        
        return health_metrics
    
    def analyze_script_redundancy(self):
        """Analyze for redundant or unused scripts."""
        script_analysis = {
            "duplicate_functionality": [],
            "unused_scripts": [],
            "integration_opportunities": []
        }
        
        # Define functional categories
        function_patterns = {
            "mapping": ["map", "scan", "inventory", "analyze"],
            "validation": ["validate", "verify", "check", "test"],
            "optimization": ["optimize", "structure", "organize"],
            "monitoring": ["monitor", "watch", "track", "status"],
            "maintenance": ["cleanup", "clean", "maintain", "lifecycle"]
        }
        
        scripts_by_function = defaultdict(list)
        
        # Categorize scripts by function
        for root, dirs, files in os.walk(self.tools_dir):
            if "deprecated" in root:
                continue
                
            for file in files:
                if file.endswith(('.py', '.sh')):
                    filepath = os.path.join(root, file)
                    
                    for function, keywords in function_patterns.items():
                        if any(keyword in file.lower() for keyword in keywords):
                            scripts_by_function[function].append({
                                "path": filepath,
                                "name": file,
                                "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
                            })
        
        # Identify potential redundancy
        for function, scripts in scripts_by_function.items():
            if len(scripts) > 1:
                script_analysis["duplicate_functionality"].append({
                    "function": function,
                    "scripts": scripts,
                    "recommendation": f"Consider consolidating {len(scripts)} {function} scripts"
                })
        
        return script_analysis
    
    def analyze_storage_optimization(self):
        """Analyze storage optimization opportunities."""
        storage_analysis = {
            "large_files": [],
            "duplicate_data": [],
            "cleanup_opportunities": [],
            "total_savings_mb": 0
        }
        
        # Find large governance-related files
        governance_dirs = [
            "/home/ichardart/code/infra/data",
            "/home/ichardart/code/infra/logs",
            "/home/ichardart/code/infra/tools"
        ]
        
        for base_dir in governance_dirs:
            if os.path.exists(base_dir):
                for root, dirs, files in os.walk(base_dir):
                    for file in files:
                        filepath = os.path.join(root, file)
                        try:
                            size_mb = os.path.getsize(filepath) / (1024*1024)
                            
                            # Flag files larger than 5MB
                            if size_mb > 5:
                                storage_analysis["large_files"].append({
                                    "path": filepath,
                                    "size_mb": round(size_mb, 2),
                                    "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
                                })
                            
                            # Check for cleanup opportunities
                            if any(pattern in file for pattern in ["temp", "tmp", "backup", ".log"]):
                                file_age = datetime.datetime.now() - datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
                                if file_age.days > 30:  # Older than 30 days
                                    storage_analysis["cleanup_opportunities"].append({
                                        "path": filepath,
                                        "size_mb": round(size_mb, 2),
                                        "age_days": file_age.days,
                                        "type": "old_temporary_file"
                                    })
                                    storage_analysis["total_savings_mb"] += size_mb
                        except (OSError, IOError):
                            continue
        
        return storage_analysis
    
    def archive_deprecated_components(self, components, dry_run=False):
        """Archive deprecated components with safety checks."""
        archived = {"scripts": [], "data_files": [], "errors": []}
        
        if dry_run:
            self.log("DRY RUN: No files will actually be moved", "INFO")
        
        # Archive scripts
        for script in components.get("scripts", []):
            try:
                src_path = script["path"]
                filename = os.path.basename(src_path)
                dst_path = os.path.join(self.deprecated_dir, filename)
                
                if dry_run:
                    self.log(f"Would archive: {src_path} -> {dst_path}", "INFO")
                    archived["scripts"].append(script)
                else:
                    # Create backup before moving
                    if os.path.exists(src_path):
                        shutil.move(src_path, dst_path)
                        self.log(f"Archived script: {src_path} -> {dst_path}", "INFO")
                        archived["scripts"].append(script)
                    else:
                        self.log(f"Script not found: {src_path}", "WARNING")
                        
            except Exception as e:
                error_msg = f"Failed to archive {script['path']}: {str(e)}"
                self.log(error_msg, "ERROR")
                archived["errors"].append(error_msg)
        
        # Archive data files
        deprecated_data_dir = os.path.join(self.deprecated_dir, "data")
        os.makedirs(deprecated_data_dir, exist_ok=True)
        
        for data_file in components.get("data_files", []):
            try:
                src_path = data_file["path"]
                filename = os.path.basename(src_path)
                dst_path = os.path.join(deprecated_data_dir, filename)
                
                if dry_run:
                    self.log(f"Would archive: {src_path} -> {dst_path}", "INFO")
                    archived["data_files"].append(data_file)
                else:
                    if os.path.exists(src_path):
                        shutil.move(src_path, dst_path)
                        self.log(f"Archived data file: {src_path} -> {dst_path}", "INFO")
                        archived["data_files"].append(data_file)
                    else:
                        self.log(f"Data file not found: {src_path}", "WARNING")
                        
            except Exception as e:
                error_msg = f"Failed to archive {data_file['path']}: {str(e)}"
                self.log(error_msg, "ERROR")
                archived["errors"].append(error_msg)
        
        return archived
    
    def cleanup_stale_data(self, max_age_days=30, dry_run=False):
        """Clean up stale governance data."""
        cleanup_results = {
            "database_cleanup": {},
            "file_cleanup": {},
            "space_saved_mb": 0
        }
        
        try:
            # Database cleanup
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Find stale artifacts
            cutoff_date = (datetime.datetime.now() - datetime.timedelta(days=max_age_days)).isoformat()
            cursor.execute("SELECT COUNT(*) FROM governance_artifacts WHERE last_analyzed < ?", (cutoff_date,))
            stale_count = cursor.fetchone()[0]
            
            if stale_count > 0:
                if dry_run:
                    self.log(f"Would re-analyze {stale_count} stale artifacts", "INFO")
                else:
                    # Mark for re-analysis rather than deletion
                    cursor.execute("UPDATE governance_artifacts SET last_analyzed = ? WHERE last_analyzed < ?", 
                                 (datetime.datetime.now().isoformat(), cutoff_date))
                    conn.commit()
                    self.log(f"Marked {stale_count} artifacts for re-analysis", "INFO")
            
            cleanup_results["database_cleanup"]["stale_artifacts_processed"] = stale_count
            conn.close()
            
        except Exception as e:
            self.log(f"Database cleanup error: {str(e)}", "ERROR")
            cleanup_results["database_cleanup"]["error"] = str(e)
        
        return cleanup_results
    
    def generate_maintenance_report(self):
        """Generate comprehensive maintenance report."""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = f"/home/ichardart/code/infra/data/memory/governance_maintenance_report_{timestamp}.md"
        
        # Gather all analysis data
        deprecated_components = self.detect_deprecated_components()
        health_metrics = self.analyze_governance_health()
        
        with open(report_path, 'w') as f:
            f.write(f"# Governance Framework Maintenance Report\n\n")
            f.write(f"**Generated**: {datetime.datetime.now().isoformat()}\n")
            f.write(f"**Manager Version**: 1.0\n\n")
            
            # Executive Summary
            f.write("## Executive Summary\n\n")
            total_deprecated = len(deprecated_components["scripts"]) + len(deprecated_components["data_files"])
            f.write(f"- **Deprecated Components**: {total_deprecated} items identified\n")
            f.write(f"- **Database Health**: {health_metrics['database_health'].get('total_artifacts', 0)} artifacts tracked\n")
            f.write(f"- **Recommendations**: {len(health_metrics.get('recommendations', []))} action items\n\n")
            
            # Deprecated Components
            if total_deprecated > 0:
                f.write("## Deprecated Components\n\n")
                
                if deprecated_components["scripts"]:
                    f.write("### Scripts\n")
                    for script in deprecated_components["scripts"]:
                        f.write(f"- **{script['relative_path']}**\n")
                        f.write(f"  - Reason: {script['reason']}\n")
                        f.write(f"  - Superseded by: {script['superseded_by']}\n")
                        f.write(f"  - Last modified: {script['last_modified']}\n")
                    f.write("\n")
                
                if deprecated_components["data_files"]:
                    f.write("### Data Files\n")
                    for data_file in deprecated_components["data_files"]:
                        f.write(f"- **{os.path.basename(data_file['path'])}**\n")
                        f.write(f"  - Reason: {data_file['reason']}\n")
                        f.write(f"  - Age: {data_file['age_days']} days\n")
                        f.write(f"  - Size: {data_file['size_mb']:.1f} MB\n")
                    f.write("\n")
            
            # Health Metrics
            f.write("## Health Metrics\n\n")
            db_health = health_metrics.get("database_health", {})
            f.write(f"- **Total Artifacts**: {db_health.get('total_artifacts', 0)}\n")
            f.write(f"- **Governance Directories**: {db_health.get('governance_directories', 0)}\n")
            f.write(f"- **Stale Artifacts**: {db_health.get('stale_artifacts', 0)} ({db_health.get('stale_percentage', 0):.1f}%)\n")
            
            confidence_dist = db_health.get('confidence_distribution', {})
            f.write(f"- **Confidence Distribution**:\n")
            for level, count in confidence_dist.items():
                f.write(f"  - {level}: {count}\n")
            f.write("\n")
            
            # Recommendations
            recommendations = health_metrics.get("recommendations", [])
            if recommendations:
                f.write("## Recommendations\n\n")
                for i, rec in enumerate(recommendations, 1):
                    f.write(f"### {i}. {rec['action']}\n")
                    f.write(f"**Priority**: {rec['priority'].upper()}\n")
                    f.write(f"**Type**: {rec['type']}\n")
                    if 'command' in rec:
                        f.write(f"**Command**: `{rec['command']}`\n")
                    f.write("\n")
            
            # Storage Analysis
            storage = health_metrics.get("storage_optimization", {})
            if storage.get("cleanup_opportunities"):
                f.write("## Storage Optimization\n\n")
                f.write(f"**Potential Savings**: {storage.get('total_savings_mb', 0):.1f} MB\n\n")
                
                for opp in storage["cleanup_opportunities"][:10]:  # Show top 10
                    f.write(f"- **{os.path.basename(opp['path'])}**: {opp['size_mb']:.1f} MB ({opp['age_days']} days old)\n")
        
        self.log(f"Maintenance report generated: {report_path}", "INFO")
        return report_path
    
    def run_automated_maintenance(self, dry_run=False):
        """Run complete automated maintenance cycle."""
        self.log("Starting automated governance maintenance", "INFO")
        
        results = {
            "deprecated_components": None,
            "health_analysis": None,
            "archival_results": None,
            "cleanup_results": None,
            "report_path": None
        }
        
        try:
            # Step 1: Detect deprecated components
            self.log("Step 1: Detecting deprecated components", "INFO")
            deprecated_components = self.detect_deprecated_components()
            results["deprecated_components"] = deprecated_components
            
            total_deprecated = len(deprecated_components["scripts"]) + len(deprecated_components["data_files"])
            self.log(f"Found {total_deprecated} deprecated components", "INFO")
            
            # Step 2: Health analysis
            self.log("Step 2: Analyzing governance health", "INFO")
            health_metrics = self.analyze_governance_health()
            results["health_analysis"] = health_metrics
            
            # Step 3: Archive deprecated components
            if total_deprecated > 0:
                self.log("Step 3: Archiving deprecated components", "INFO")
                archival_results = self.archive_deprecated_components(deprecated_components, dry_run)
                results["archival_results"] = archival_results
                
                if not dry_run:
                    self.log(f"Archived {len(archival_results['scripts'])} scripts and {len(archival_results['data_files'])} data files", "INFO")
            
            # Step 4: Clean up stale data
            self.log("Step 4: Cleaning up stale data", "INFO")
            cleanup_results = self.cleanup_stale_data(dry_run=dry_run)
            results["cleanup_results"] = cleanup_results
            
            # Step 5: Generate maintenance report
            self.log("Step 5: Generating maintenance report", "INFO")
            report_path = self.generate_maintenance_report()
            results["report_path"] = report_path
            
            self.log("Automated governance maintenance completed successfully", "INFO")
            
        except Exception as e:
            self.log(f"Automated maintenance failed: {str(e)}", "ERROR")
            results["error"] = str(e)
        
        return results

def main():
    """Main execution function with CLI interface."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Governance Lifecycle Manager")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without executing")
    parser.add_argument("--detect-only", action="store_true", help="Only detect deprecated components")
    parser.add_argument("--health-only", action="store_true", help="Only analyze governance health")
    parser.add_argument("--report-only", action="store_true", help="Only generate maintenance report")
    parser.add_argument("--full-maintenance", action="store_true", help="Run complete maintenance cycle")
    
    args = parser.parse_args()
    
    manager = GovernanceLifecycleManager()
    
    if args.detect_only:
        print("🔍 Detecting deprecated components...")
        components = manager.detect_deprecated_components()
        total = len(components["scripts"]) + len(components["data_files"])
        print(f"Found {total} deprecated components")
        
        for script in components["scripts"]:
            print(f"📜 Script: {script['relative_path']} - {script['reason']}")
        
        for data_file in components["data_files"]:
            print(f"📁 Data: {os.path.basename(data_file['path'])} - {data_file['reason']}")
    
    elif args.health_only:
        print("🏥 Analyzing governance health...")
        health = manager.analyze_governance_health()
        db_health = health.get("database_health", {})
        
        print(f"Database: {db_health.get('total_artifacts', 0)} artifacts, {db_health.get('stale_artifacts', 0)} stale")
        print(f"Recommendations: {len(health.get('recommendations', []))}")
        
        for rec in health.get("recommendations", []):
            print(f"🎯 {rec['priority'].upper()}: {rec['action']}")
    
    elif args.report_only:
        print("📊 Generating maintenance report...")
        report_path = manager.generate_maintenance_report()
        print(f"Report saved: {report_path}")
    
    elif args.full_maintenance:
        print("🔄 Running full maintenance cycle...")
        results = manager.run_automated_maintenance(dry_run=args.dry_run)
        
        if results.get("error"):
            print(f"❌ Maintenance failed: {results['error']}")
        else:
            print("✅ Maintenance completed successfully")
            if results["report_path"]:
                print(f"📊 Report: {results['report_path']}")
    
    else:
        # Default: run detection and health analysis
        print("🏛️ Governance Lifecycle Manager")
        print("=" * 40)
        
        print("\n🔍 Detecting deprecated components...")
        components = manager.detect_deprecated_components()
        total = len(components["scripts"]) + len(components["data_files"])
        print(f"Found {total} deprecated components")
        
        print("\n🏥 Analyzing governance health...")
        health = manager.analyze_governance_health()
        recommendations = len(health.get("recommendations", []))
        print(f"Generated {recommendations} recommendations")
        
        print(f"\n🔄 Use --full-maintenance to run automated cleanup")
        print(f"📊 Use --report-only to generate detailed report")

if __name__ == "__main__":
    main()