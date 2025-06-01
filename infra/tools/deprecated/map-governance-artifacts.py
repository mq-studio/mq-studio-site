#!/usr/bin/env python3
"""
Map all governance artifacts across the IDP
"""

import os
import json
from pathlib import Path
from datetime import datetime

class GovernanceArtifactMapper:
    def __init__(self):
        self.home_path = Path("/home/ichardart")
        self.governance_artifacts = []
        self.governance_keywords = [
            'governance', 'compliance', 'audit', 'manifest', 'rules', 'policy',
            'framework', 'standard', 'checklist', 'validation', 'enforcement',
            'monitoring', 'tracking', 'bmad', 'methodology', 'idp-governance'
        ]
        
    def scan_directory(self, path, depth=0, max_depth=10):
        """Recursively scan for governance artifacts"""
        if depth > max_depth:
            return
            
        try:
            for item in Path(path).iterdir():
                if item.is_file():
                    # Check filename for governance keywords
                    filename_lower = item.name.lower()
                    if any(keyword in filename_lower for keyword in self.governance_keywords):
                        self.add_governance_artifact(item)
                    # Check specific important files
                    elif item.name in ['CLAUDE.md', 'README.md', 'OPERATING_RULES.md']:
                        self.add_governance_artifact(item)
                elif item.is_dir() and not item.name.startswith('.'):
                    # Check directory name
                    dirname_lower = item.name.lower()
                    if any(keyword in dirname_lower for keyword in self.governance_keywords):
                        self.add_governance_artifact(item, is_dir=True)
                    # Recurse into directory
                    if item.name not in ['node_modules', 'venv', '.git', '__pycache__', 'dist']:
                        self.scan_directory(item, depth + 1, max_depth)
        except PermissionError:
            pass
            
    def add_governance_artifact(self, path, is_dir=False):
        """Add a governance artifact to our map"""
        rel_path = path.relative_to(self.home_path)
        
        # Categorize the artifact
        category = self.categorize_artifact(path)
        
        artifact = {
            'path': str(path),
            'relative_path': str(rel_path),
            'name': path.name,
            'is_directory': is_dir,
            'category': category,
            'size': path.stat().st_size if path.is_file() else 0,
            'modified': datetime.fromtimestamp(path.stat().st_mtime).isoformat()
        }
        
        self.governance_artifacts.append(artifact)
        
    def categorize_artifact(self, path):
        """Categorize governance artifact by type"""
        path_str = str(path).lower()
        
        if 'idp-governance' in path_str:
            if 'methodologies' in path_str:
                return 'methodology'
            elif 'validation' in path_str:
                return 'validation'
            elif 'planning' in path_str:
                return 'planning'
            elif 'audit' in path_str:
                return 'audit'
            elif 'feedback' in path_str:
                return 'feedback'
            elif 'metrics' in path_str:
                return 'metrics'
            else:
                return 'governance-general'
        elif 'mcp' in path_str and ('governance' in path_str or 'registry' in path_str):
            return 'mcp-governance'
        elif 'security' in path_str and 'tooling' in path_str:
            return 'security-governance'
        elif 'tools' in path_str and 'governance' in path_str:
            return 'governance-tooling'
        elif 'manifest' in path_str:
            return 'manifest'
        elif 'operating_rules' in path_str or 'rules' in path_str:
            return 'rules-policy'
        elif 'checklist' in path_str:
            return 'checklist'
        elif 'standard' in path_str:
            return 'standard'
        elif 'framework' in path_str:
            return 'framework'
        elif 'claude.md' in path_str:
            return 'ai-context'
        else:
            return 'governance-other'
            
    def generate_report(self):
        """Generate comprehensive governance artifact report"""
        print("🔍 Scanning for governance artifacts...")
        
        # Scan key directories
        scan_paths = [
            self.home_path / 'code',
            self.home_path / 'idp-projects',
            self.home_path / '.mcp',
            self.home_path / '.claude'
        ]
        
        for scan_path in scan_paths:
            if scan_path.exists():
                self.scan_directory(scan_path)
                
        # Organize by category
        categories = {}
        for artifact in self.governance_artifacts:
            category = artifact['category']
            if category not in categories:
                categories[category] = []
            categories[category].append(artifact)
            
        # Generate report
        report = {
            'generated': datetime.now().isoformat(),
            'total_artifacts': len(self.governance_artifacts),
            'categories': {cat: len(items) for cat, items in categories.items()},
            'artifacts_by_category': categories,
            'key_files': {
                'claude_context': [],
                'manifests': [],
                'rules_policies': [],
                'governance_tools': [],
                'methodologies': []
            }
        }
        
        # Identify key files
        for artifact in self.governance_artifacts:
            if artifact['category'] == 'ai-context':
                report['key_files']['claude_context'].append(artifact['path'])
            elif artifact['category'] == 'manifest':
                report['key_files']['manifests'].append(artifact['path'])
            elif artifact['category'] == 'rules-policy':
                report['key_files']['rules_policies'].append(artifact['path'])
            elif artifact['category'] == 'governance-tooling':
                report['key_files']['governance_tools'].append(artifact['path'])
            elif artifact['category'] == 'methodology':
                report['key_files']['methodologies'].append(artifact['path'])
                
        # Save report
        report_path = self.home_path / 'code/infra/data/memory/governance-artifact-map.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        # Print summary
        print(f"\n📊 GOVERNANCE ARTIFACT MAP")
        print("=" * 50)
        print(f"Total artifacts found: {report['total_artifacts']}")
        print(f"\nBy Category:")
        for cat, count in sorted(report['categories'].items()):
            print(f"  {cat}: {count}")
            
        print(f"\n✅ Full report saved to: {report_path}")
        
        return report

if __name__ == "__main__":
    mapper = GovernanceArtifactMapper()
    mapper.generate_report()
