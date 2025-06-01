#!/usr/bin/env python3
"""
🏛️ Governance Structure Validator
Validates the optimized governance structure and ensures all components are working
"""

import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

class GovernanceValidator:
    def __init__(self):
        self.home_path = Path("/home/ichardart")
        self.unified_gov = self.home_path / "idp-governance"
        self.validation_results = {
            "timestamp": datetime.now().isoformat(),
            "checks": {},
            "overall_status": "PENDING"
        }
        
    def check_unified_structure(self):
        """Validate the unified governance directory structure exists"""
        print("🔍 Checking unified governance structure...")
        
        required_dirs = [
            "core",
            "projects",
            "projects/code",
            "projects/idp-projects",
            "tools",
            "monitoring",
            "monitoring/logs",
            "monitoring/metrics",
            "monitoring/reports",
            "methodologies",
            "archives"
        ]
        
        missing_dirs = []
        for dir_name in required_dirs:
            dir_path = self.unified_gov / dir_name
            if not dir_path.exists():
                missing_dirs.append(str(dir_path))
                
        if missing_dirs:
            self.validation_results["checks"]["unified_structure"] = {
                "status": "FAIL",
                "message": f"Missing directories: {missing_dirs}"
            }
            return False
        else:
            self.validation_results["checks"]["unified_structure"] = {
                "status": "PASS",
                "message": "All required directories present"
            }
            return True
            
    def check_core_files(self):
        """Validate core governance files are present"""
        print("📋 Checking core governance files...")
        
        core_files = {
            "core/framework.md": "Main governance framework",
            "core/operating-rules.md": "Operating rules",
            "README.md": "Unified governance documentation"
        }
        
        missing_files = []
        for file_path, description in core_files.items():
            full_path = self.unified_gov / file_path
            if not full_path.exists():
                missing_files.append(f"{file_path} ({description})")
                
        if missing_files:
            self.validation_results["checks"]["core_files"] = {
                "status": "FAIL",
                "message": f"Missing files: {missing_files}"
            }
            return False
        else:
            self.validation_results["checks"]["core_files"] = {
                "status": "PASS",
                "message": "All core files present"
            }
            return True
            
    def check_governance_markers(self):
        """Validate governance markers in project directories"""
        print("🏷️ Checking governance markers...")
        
        marker_locations = [
            self.home_path / "code" / ".governance",
            self.home_path / "idp-projects" / ".governance"
        ]
        
        valid_markers = []
        invalid_markers = []
        
        for marker_path in marker_locations:
            if marker_path.exists():
                try:
                    with open(marker_path, 'r') as f:
                        content = f.read()
                    if "governance_root: /home/ichardart/idp-governance" in content:
                        valid_markers.append(str(marker_path))
                    else:
                        invalid_markers.append(f"{marker_path} (incorrect root)")
                except Exception as e:
                    invalid_markers.append(f"{marker_path} (read error: {e})")
            else:
                invalid_markers.append(f"{marker_path} (missing)")
                
        if invalid_markers:
            self.validation_results["checks"]["governance_markers"] = {
                "status": "FAIL",
                "message": f"Invalid markers: {invalid_markers}"
            }
            return False
        else:
            self.validation_results["checks"]["governance_markers"] = {
                "status": "PASS",
                "message": f"Valid markers: {len(valid_markers)}"
            }
            return True
            
    def check_tool_references(self):
        """Validate governance tools reference new structure"""
        print("🔧 Checking tool references...")
        
        tools_dir = self.unified_gov / "tools"
        if not tools_dir.exists():
            self.validation_results["checks"]["tool_references"] = {
                "status": "SKIP",
                "message": "Tools directory not found"
            }
            return True
            
        old_references = [
            "/code/infra/idp-governance",
            "/idp-projects/idp-governance"
        ]
        
        tools_with_old_refs = []
        
        for tool_file in tools_dir.glob("*.{sh,py}"):
            try:
                with open(tool_file, 'r') as f:
                    content = f.read()
                for old_ref in old_references:
                    if old_ref in content and "archives" not in content:
                        tools_with_old_refs.append(f"{tool_file.name} (contains {old_ref})")
                        break
            except Exception as e:
                pass
                
        if tools_with_old_refs:
            self.validation_results["checks"]["tool_references"] = {
                "status": "WARN",
                "message": f"Tools with old references: {tools_with_old_refs}"
            }
            return True  # Warning, not failure
        else:
            self.validation_results["checks"]["tool_references"] = {
                "status": "PASS",
                "message": "All tools reference new structure"
            }
            return True
            
    def check_monitoring_config(self):
        """Validate monitoring configuration"""
        print("📊 Checking monitoring configuration...")
        
        config_path = self.unified_gov / "monitoring" / "config.json"
        
        if not config_path.exists():
            self.validation_results["checks"]["monitoring_config"] = {
                "status": "FAIL",
                "message": "Monitoring config not found"
            }
            return False
            
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                
            required_paths = [
                "/home/ichardart/code",
                "/home/ichardart/idp-projects",
                "/home/ichardart/idp-governance"
            ]
            
            missing_paths = []
            for path in required_paths:
                if path not in config.get("monitored_paths", []):
                    missing_paths.append(path)
                    
            if missing_paths:
                self.validation_results["checks"]["monitoring_config"] = {
                    "status": "WARN",
                    "message": f"Missing monitored paths: {missing_paths}"
                }
                return True
            else:
                self.validation_results["checks"]["monitoring_config"] = {
                    "status": "PASS",
                    "message": "All required paths monitored"
                }
                return True
                
        except Exception as e:
            self.validation_results["checks"]["monitoring_config"] = {
                "status": "FAIL",
                "message": f"Config parse error: {e}"
            }
            return False
            
    def check_symlinks(self):
        """Validate backward compatibility symlinks"""
        print("🔗 Checking backward compatibility symlinks...")
        
        symlinks = [
            (self.home_path / "code" / "infra" / "idp-governance-unified", self.unified_gov),
            (self.home_path / "idp-projects" / "idp-governance-unified", self.unified_gov)
        ]
        
        broken_links = []
        
        for link_path, target in symlinks:
            if link_path.exists():
                if link_path.is_symlink():
                    if link_path.resolve() != target:
                        broken_links.append(f"{link_path} (wrong target)")
                else:
                    broken_links.append(f"{link_path} (not a symlink)")
            else:
                broken_links.append(f"{link_path} (missing)")
                
        if broken_links:
            self.validation_results["checks"]["symlinks"] = {
                "status": "WARN",
                "message": f"Issues with symlinks: {broken_links}"
            }
            return True
        else:
            self.validation_results["checks"]["symlinks"] = {
                "status": "PASS",
                "message": "Backward compatibility maintained"
            }
            return True
            
    def generate_report(self):
        """Generate validation report"""
        
        # Determine overall status
        failed_checks = [k for k, v in self.validation_results["checks"].items() 
                        if v["status"] == "FAIL"]
        warned_checks = [k for k, v in self.validation_results["checks"].items() 
                        if v["status"] == "WARN"]
        
        if failed_checks:
            self.validation_results["overall_status"] = "FAIL"
        elif warned_checks:
            self.validation_results["overall_status"] = "PASS_WITH_WARNINGS"
        else:
            self.validation_results["overall_status"] = "PASS"
            
        # Save JSON report
        report_dir = self.unified_gov / "monitoring" / "reports"
        if report_dir.exists():
            report_path = report_dir / f"validation-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(report_path, 'w') as f:
                json.dump(self.validation_results, f, indent=2)
                
        # Print summary
        print("\n📊 VALIDATION SUMMARY")
        print("=" * 50)
        
        for check_name, result in self.validation_results["checks"].items():
            status_icon = {
                "PASS": "✅",
                "FAIL": "❌",
                "WARN": "⚠️",
                "SKIP": "⏭️"
            }.get(result["status"], "❓")
            
            print(f"{status_icon} {check_name}: {result['message']}")
            
        print("\n🏛️ OVERALL STATUS:", self.validation_results["overall_status"])
        
        if self.validation_results["overall_status"] == "FAIL":
            print("\n❌ Governance optimization validation FAILED")
            print("Please review the errors above and re-run optimization if needed.")
        elif self.validation_results["overall_status"] == "PASS_WITH_WARNINGS":
            print("\n⚠️ Governance optimization validation PASSED with warnings")
            print("The structure is functional but some improvements are recommended.")
        else:
            print("\n✅ Governance optimization validation PASSED")
            print("The unified governance structure is fully operational!")
            
    def run_validation(self):
        """Run all validation checks"""
        print("🏛️ VALIDATING GOVERNANCE OPTIMIZATION")
        print("=" * 50)
        
        # Check if unified governance exists
        if not self.unified_gov.exists():
            print(f"❌ Unified governance directory not found: {self.unified_gov}")
            print("Please run optimize-governance-structure.sh first.")
            return
            
        # Run all checks
        self.check_unified_structure()
        self.check_core_files()
        self.check_governance_markers()
        self.check_tool_references()
        self.check_monitoring_config()
        self.check_symlinks()
        
        # Generate report
        self.generate_report()
        

if __name__ == "__main__":
    validator = GovernanceValidator()
    validator.run_validation()
