#!/usr/bin/env python3
"""
🏛️ IDP Directory Structure Analyzer
Comprehensive analysis of /home/ichardart/ to inform governance scope decisions
"""

import os
import json
import stat
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import subprocess

class IDPDirectoryAnalyzer:
    def __init__(self):
        self.root_path = Path("/home/ichardart")
        self.analysis = {
            "scan_timestamp": datetime.now(timezone.utc).isoformat(),
            "total_directories": 0,
            "total_files": 0,
            "total_size_bytes": 0,
            "categorized_analysis": {
                "governance_critical": [],
                "active_projects": [],
                "inactive_redundant": [],
                "configuration_data": [],
                "development_artifacts": []
            },
            "detailed_inventory": []
        }
        
    def get_file_stats(self, path):
        """Get comprehensive file/directory statistics"""
        try:
            stat_info = path.stat()
            return {
                "size_bytes": stat_info.st_size,
                "created": datetime.fromtimestamp(stat_info.st_ctime, tz=timezone.utc).isoformat(),
                "modified": datetime.fromtimestamp(stat_info.st_mtime, tz=timezone.utc).isoformat(),
                "accessed": datetime.fromtimestamp(stat_info.st_atime, tz=timezone.utc).isoformat(),
                "permissions": oct(stat_info.st_mode)[-3:],
                "is_executable": bool(stat_info.st_mode & stat.S_IEXEC),
                "is_symlink": path.is_symlink()
            }
        except (OSError, PermissionError):
            return None

    def get_git_info(self, path):
        """Check if directory is a git repository and get info"""
        git_dir = path / ".git"
        if git_dir.exists():
            try:
                # Get recent activity
                result = subprocess.run(
                    ["git", "log", "-1", "--format=%ci"], 
                    cwd=path, capture_output=True, text=True
                )
                last_commit = result.stdout.strip() if result.returncode == 0 else None
                
                # Check if repo has changes
                result = subprocess.run(
                    ["git", "status", "--porcelain"], 
                    cwd=path, capture_output=True, text=True
                )
                has_changes = bool(result.stdout.strip()) if result.returncode == 0 else False
                
                # Get branch info
                result = subprocess.run(
                    ["git", "branch", "--show-current"], 
                    cwd=path, capture_output=True, text=True
                )
                current_branch = result.stdout.strip() if result.returncode == 0 else None
                
                return {
                    "is_git_repo": True,
                    "last_commit": last_commit,
                    "has_uncommitted_changes": has_changes,
                    "current_branch": current_branch
                }
            except:
                return {"is_git_repo": True, "error": "Could not analyze git repo"}
        return {"is_git_repo": False}

    def analyze_directory_purpose(self, path, stats, git_info):
        """Analyze what purpose a directory serves in the IDP"""
        path_str = str(path)
        relative_path = str(path.relative_to(self.root_path))
        
        # Check for specific indicators
        indicators = {
            "has_manifest": (path / "manifest.md").exists(),
            "has_readme": any((path / name).exists() for name in ["README.md", "readme.md", "README.txt"]),
            "has_package_json": (path / "package.json").exists(),
            "has_requirements_txt": (path / "requirements.txt").exists(),
            "has_dockerfile": any((path / name).exists() for name in ["Dockerfile", "docker-compose.yml"]),
            "has_governance": any((path / name).exists() for name in ["governance.md", "GOVERNANCE.md", ".governance"]),
            "has_dotfiles": any(child.name.startswith('.') for child in path.iterdir() if child.is_file()),
            "file_count": len([f for f in path.rglob("*") if f.is_file()]) if path.is_dir() else 0
        }
        
        # Calculate age-based activity
        days_since_modified = (datetime.now(timezone.utc) - datetime.fromisoformat(stats["modified"])).days
        days_since_accessed = (datetime.now(timezone.utc) - datetime.fromisoformat(stats["accessed"])).days
        
        # Categorization logic
        category = self.categorize_directory(relative_path, stats, git_info, indicators, days_since_modified, days_since_accessed)
        
        return {
            "path": path_str,
            "relative_path": relative_path,
            "category": category,
            "stats": stats,
            "git_info": git_info,
            "indicators": indicators,
            "days_since_modified": days_since_modified,
            "days_since_accessed": days_since_accessed,
            "analysis": self.get_detailed_analysis(relative_path, indicators, git_info, days_since_modified)
        }

    def categorize_directory(self, relative_path, stats, git_info, indicators, days_modified, days_accessed):
        """Categorize directory based on analysis"""
        
        # Governance Critical
        if any([
            "code" in relative_path and relative_path.count("/") <= 1,
            "governance" in relative_path.lower(),
            ".claude" in relative_path,
            ".mcp" in relative_path,
            indicators["has_governance"],
            indicators["has_manifest"] and git_info["is_git_repo"]
        ]):
            return "governance_critical"
        
        # Active Projects (git repos with recent activity or uncommitted changes)
        if git_info["is_git_repo"] and (days_modified <= 30 or git_info.get("has_uncommitted_changes", False)):
            return "active_projects"
        
        # Configuration/Data (dotfiles, config directories)
        if any([
            relative_path.startswith("."),
            "config" in relative_path.lower(),
            indicators["has_dotfiles"],
            relative_path in ["bin", "templates"]
        ]):
            return "configuration_data"
        
        # Development Artifacts (node_modules, build dirs, caches)
        if any([
            "node_modules" in relative_path,
            "cache" in relative_path.lower(),
            ".cache" in relative_path,
            "build" in relative_path.lower(),
            "dist" in relative_path.lower(),
            "__pycache__" in relative_path
        ]):
            return "development_artifacts"
        
        # Inactive/Redundant (old, unused, or empty)
        if any([
            days_modified > 90 and days_accessed > 30,
            indicators["file_count"] == 0,
            git_info["is_git_repo"] and days_modified > 180,
            "backup" in relative_path.lower(),
            "old" in relative_path.lower(),
            "temp" in relative_path.lower()
        ]):
            return "inactive_redundant"
        
        # Default to active projects if uncertain
        return "active_projects"

    def get_detailed_analysis(self, relative_path, indicators, git_info, days_modified):
        """Provide detailed analysis and recommendations"""
        recommendations = []
        
        if indicators["has_manifest"] and not indicators["has_governance"]:
            recommendations.append("Consider adding governance documentation")
        
        if git_info["is_git_repo"] and git_info.get("has_uncommitted_changes"):
            recommendations.append("Has uncommitted changes - needs attention")
        
        if days_modified > 180:
            recommendations.append("Not modified in 6+ months - evaluate if still needed")
        
        if indicators["file_count"] > 1000:
            recommendations.append("Large directory - may need cleanup or archival")
        
        if indicators["file_count"] == 0:
            recommendations.append("Empty directory - candidate for removal")
        
        return {
            "recommendations": recommendations,
            "governance_readiness": self.assess_governance_readiness(indicators, git_info),
            "cleanup_priority": self.assess_cleanup_priority(days_modified, indicators)
        }

    def assess_governance_readiness(self, indicators, git_info):
        """Assess how ready a directory is for governance inclusion"""
        score = 0
        
        if indicators["has_manifest"]: score += 3
        if indicators["has_readme"]: score += 2
        if git_info["is_git_repo"]: score += 2
        if indicators["has_governance"]: score += 3
        if indicators["has_package_json"] or indicators["has_requirements_txt"]: score += 1
        
        if score >= 6: return "high"
        elif score >= 3: return "medium"
        else: return "low"

    def assess_cleanup_priority(self, days_modified, indicators):
        """Assess cleanup priority"""
        if days_modified > 365: return "high"
        elif days_modified > 180: return "medium"
        elif indicators["file_count"] == 0: return "high"
        else: return "low"

    def scan_directory_structure(self):
        """Scan the entire directory structure"""
        print("🔍 Scanning /home/ichardart/ directory structure...")
        
        for root, dirs, files in os.walk(self.root_path):
            root_path = Path(root)
            
            # Skip certain directories to avoid permission issues
            if any(skip in str(root_path) for skip in [".cache/", ".npm/", "node_modules/"]):
                continue
            
            self.analysis["total_directories"] += len(dirs)
            self.analysis["total_files"] += len(files)
            
            # Analyze each directory
            try:
                stats = self.get_file_stats(root_path)
                if stats:
                    git_info = self.get_git_info(root_path)
                    dir_analysis = self.analyze_directory_purpose(root_path, stats, git_info)
                    
                    # Add to appropriate category
                    category = dir_analysis["category"]
                    self.analysis["categorized_analysis"][category].append({
                        "path": dir_analysis["relative_path"],
                        "size_mb": round(stats["size_bytes"] / (1024*1024), 2),
                        "days_since_modified": dir_analysis["days_since_modified"],
                        "governance_readiness": dir_analysis["analysis"]["governance_readiness"],
                        "cleanup_priority": dir_analysis["analysis"]["cleanup_priority"],
                        "recommendations": dir_analysis["analysis"]["recommendations"]
                    })
                    
                    # Add to detailed inventory
                    self.analysis["detailed_inventory"].append(dir_analysis)
                    
                    self.analysis["total_size_bytes"] += stats["size_bytes"]
                    
            except (PermissionError, OSError):
                continue

    def generate_summary_report(self):
        """Generate summary analysis report"""
        total_size_gb = self.analysis["total_size_bytes"] / (1024**3)
        
        summary = {
            "overview": {
                "total_directories_scanned": len(self.analysis["detailed_inventory"]),
                "total_size_gb": round(total_size_gb, 2),
                "governance_critical_dirs": len(self.analysis["categorized_analysis"]["governance_critical"]),
                "active_project_dirs": len(self.analysis["categorized_analysis"]["active_projects"]),
                "cleanup_candidates": len(self.analysis["categorized_analysis"]["inactive_redundant"]),
                "development_artifacts": len(self.analysis["categorized_analysis"]["development_artifacts"])
            },
            "governance_expansion_candidates": [
                item for item in self.analysis["categorized_analysis"]["active_projects"]
                if item["governance_readiness"] in ["high", "medium"]
            ],
            "cleanup_recommendations": [
                item for item in self.analysis["categorized_analysis"]["inactive_redundant"]
                if item["cleanup_priority"] == "high"
            ],
            "governance_critical_status": self.analysis["categorized_analysis"]["governance_critical"]
        }
        
        return summary

    def save_analysis(self):
        """Save complete analysis to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save complete analysis
        analysis_file = self.root_path / "code" / "infra" / "data" / "memory" / f"idp_directory_analysis_{timestamp}.json"
        with open(analysis_file, 'w') as f:
            json.dump(self.analysis, f, indent=2)
        
        # Save summary report
        summary = self.generate_summary_report()
        summary_file = self.root_path / "code" / f"IDP_DIRECTORY_ANALYSIS_SUMMARY_{timestamp}.md"
        
        with open(summary_file, 'w') as f:
            f.write(f"# IDP Directory Analysis Summary\n\n")
            f.write(f"**Generated**: {self.analysis['scan_timestamp']}\n\n")
            
            f.write("## Overview\n")
            for key, value in summary["overview"].items():
                f.write(f"- **{key.replace('_', ' ').title()}**: {value}\n")
            
            f.write("\n## Governance Expansion Candidates\n")
            for item in summary["governance_expansion_candidates"]:
                f.write(f"- `{item['path']}` (Readiness: {item['governance_readiness']})\n")
                for rec in item['recommendations']:
                    f.write(f"  - {rec}\n")
            
            f.write("\n## High-Priority Cleanup Candidates\n")
            for item in summary["cleanup_recommendations"]:
                f.write(f"- `{item['path']}` ({item['days_since_modified']} days old)\n")
                for rec in item['recommendations']:
                    f.write(f"  - {rec}\n")
            
            f.write("\n## Governance-Critical Directories\n")
            for item in summary["governance_critical_status"]:
                f.write(f"- `{item['path']}` (Size: {item['size_mb']}MB)\n")
        
        return analysis_file, summary_file

    def run_analysis(self):
        """Run complete directory analysis"""
        print("🏛️ Starting IDP Directory Analysis...")
        self.scan_directory_structure()
        analysis_file, summary_file = self.save_analysis()
        
        print(f"✅ Analysis complete!")
        print(f"📊 Detailed analysis: {analysis_file}")
        print(f"📋 Summary report: {summary_file}")
        
        # Print quick summary
        summary = self.generate_summary_report()
        print(f"\n📈 Quick Summary:")
        print(f"   Governance Critical: {summary['overview']['governance_critical_dirs']} dirs")
        print(f"   Active Projects: {summary['overview']['active_project_dirs']} dirs")
        print(f"   Cleanup Candidates: {summary['overview']['cleanup_candidates']} dirs")
        print(f"   Total Size: {summary['overview']['total_size_gb']} GB")
        
        return summary_file

if __name__ == "__main__":
    analyzer = IDPDirectoryAnalyzer()
    analyzer.run_analysis()