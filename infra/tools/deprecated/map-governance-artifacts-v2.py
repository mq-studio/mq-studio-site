#!/usr/bin/env python3
"""
Comprehensive Governance Artifact Mapper v2.0

This script performs deep analysis of the entire directory structure to identify,
classify, and map governance artifacts based on content and context.

Enhanced with:
- External configuration management
- Confidence scoring
- Iterative pattern refinement support
- Git hooks special handling
"""
import os
import sys
import json
import re
import datetime
import hashlib
from collections import defaultdict
import sqlite3
import subprocess

class GovernanceMapper:
    def __init__(self, config_path="/home/ichardart/code/infra/config/governance_mapping_config.json"):
        self.config_path = config_path
        self.config = self.load_config()
        
    def load_config(self):
        """Load configuration from external file, creating defaults if needed."""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                print(f"✅ Loaded configuration from {self.config_path}")
                return config
        except FileNotFoundError:
            print(f"⚠️ Configuration file not found. Creating default at {self.config_path}")
            return self.create_default_config()
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in config file: {e}")
            print("Creating backup and using defaults...")
            backup_path = f"{self.config_path}.backup.{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(self.config_path, backup_path)
            return self.create_default_config()
    
    def create_default_config(self):
        """Create default configuration file."""
        config = {
            "version": "2.0",
            "created": datetime.datetime.now().isoformat(),
            "governance_patterns": {
                "standards": {
                    "patterns": ["standard", "STD-\\d+", "policy", "guideline", "IDP-STD", "OPERATING_RULES", "directive"],
                    "weight": 1.0,
                    "description": "Governance standards, policies, and formal guidelines"
                },
                "templates": {
                    "patterns": ["template", "boilerplate", "scaffold", "PROJECT_TEMPLATE", "manifest-standard"],
                    "weight": 1.0,
                    "description": "Project templates and structural boilerplates"
                },
                "validation": {
                    "patterns": ["validation", "verify", "check", "audit", "compliance", "governance-check"],
                    "weight": 1.0,
                    "description": "Validation frameworks and compliance checking tools"
                },
                "methodology": {
                    "patterns": ["methodology", "method", "process", "procedure", "framework", "BMAD", "OSAA"],
                    "weight": 1.0,
                    "description": "Development methodologies and process frameworks"
                },
                "monitoring": {
                    "patterns": ["monitor", "track", "log", "report", "metrics", "status-checker", "watcher"],
                    "weight": 1.0,
                    "description": "Monitoring, tracking, and reporting tools"
                },
                "enforcement": {
                    "patterns": ["enforce", "hook", "pre-commit", "restrict", "require", "git.*hooks"],
                    "weight": 1.0,
                    "description": "Governance enforcement mechanisms"
                },
                "planning": {
                    "patterns": ["plan", "roadmap", "strategy", "vision", "backlog", "ACTION-PLAN"],
                    "weight": 1.0,
                    "description": "Planning and strategic documents"
                },
                "roles": {
                    "patterns": ["role", "responsibility", "RACI", "assign", "actor", "agent.*instructions"],
                    "weight": 1.0,
                    "description": "Role definitions and responsibility assignments"
                },
                "automation": {
                    "patterns": ["automation", "auto", "script", "workflow", "AUTOMATION_PROTOCOL"],
                    "weight": 1.0,
                    "description": "Automation scripts and workflow definitions"
                },
                "security": {
                    "patterns": ["security", "secrets", "auth", "credential", "1password", "bitwarden"],
                    "weight": 1.2,
                    "description": "Security-related governance artifacts"
                }
            },
            "governance_directories": [
                "idp-governance",
                "governance",
                ".git/hooks",
                "standards",
                "templates",
                "validation",
                "audits",
                "methodologies",
                "dev-env-docs",
                "infra/tools"
            ],
            "content_scan_extensions": [
                ".md", ".txt", ".json", ".yaml", ".yml", ".sh", ".py", ".js", 
                ".html", ".css", ".config", ".ini", ".conf", ".xml", ".toml"
            ],
            "exclusion_patterns": [
                "node_modules",
                ".git/objects",
                ".git/refs",
                "__pycache__",
                ".vscode",
                "vendor",
                "dist",
                "build"
            ],
            "confidence_thresholds": {
                "high": 0.8,
                "medium": 0.5,
                "low": 0.2
            },
            "special_handling": {
                "git_hooks": {
                    "preserve_location": True,
                    "create_registry": True,
                    "patterns": ["pre-commit", "post-commit", "pre-push", "post-receive"]
                },
                "config_files": {
                    "track_versions": True,
                    "patterns": ["config", ".config", "settings", ".env"]
                }
            }
        }
        
        # Ensure config directory exists
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        
        # Write config file
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Created default configuration at {self.config_path}")
        return config

    def calculate_confidence_score(self, filepath, filename, content=None):
        """Calculate confidence score for governance classification."""
        scores = defaultdict(float)
        max_score = 0
        
        for category, config in self.config["governance_patterns"].items():
            category_score = 0
            pattern_matches = 0
            
            for pattern in config["patterns"]:
                weight = config.get("weight", 1.0)
                
                # Check filename
                if re.search(pattern, filename, re.IGNORECASE):
                    category_score += weight * 0.7  # Filename match is strong indicator
                    pattern_matches += 1
                
                # Check filepath
                if re.search(pattern, filepath, re.IGNORECASE):
                    category_score += weight * 0.5  # Path match is moderate indicator
                    pattern_matches += 1
                
                # Check content if available
                if content and any(filepath.endswith(ext) for ext in self.config["content_scan_extensions"]):
                    content_matches = len(re.findall(pattern, content, re.IGNORECASE))
                    if content_matches > 0:
                        # Multiple content matches increase confidence
                        category_score += weight * 0.3 * min(content_matches, 3)  # Cap at 3 matches
                        pattern_matches += 1
            
            # Bonus for multiple pattern matches in same category
            if pattern_matches > 1:
                category_score *= 1.2
            
            scores[category] = category_score
            max_score = max(max_score, category_score)
        
        # Normalize scores
        if max_score > 0:
            for category in scores:
                scores[category] = scores[category] / max_score
        
        return dict(scores)

    def is_governance_file(self, filepath, filename, content=None):
        """Determine if a file is governance-related based on configuration."""
        # Check exclusion patterns first
        for exclusion in self.config["exclusion_patterns"]:
            if exclusion in filepath:
                return False
        
        # Check governance directories
        for gov_dir in self.config["governance_directories"]:
            if gov_dir in filepath:
                return True
        
        # Check confidence scores
        confidence_scores = self.calculate_confidence_score(filepath, filename, content)
        max_confidence = max(confidence_scores.values()) if confidence_scores else 0
        
        return max_confidence >= self.config["confidence_thresholds"]["low"]

    def classify_governance_artifact(self, filepath, filename, content=None):
        """Classify the governance artifact by type based on confidence scores."""
        confidence_scores = self.calculate_confidence_score(filepath, filename, content)
        
        if not confidence_scores:
            return {
                "primary_classification": "unclassified",
                "all_classifications": ["unclassified"],
                "confidence_scores": {},
                "confidence_level": "none"
            }
        
        # Sort by confidence score
        sorted_classifications = sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Determine confidence level
        max_confidence = sorted_classifications[0][1]
        if max_confidence >= self.config["confidence_thresholds"]["high"]:
            confidence_level = "high"
        elif max_confidence >= self.config["confidence_thresholds"]["medium"]:
            confidence_level = "medium"
        else:
            confidence_level = "low"
        
        # Get all classifications above low threshold
        low_threshold = self.config["confidence_thresholds"]["low"]
        valid_classifications = [cat for cat, score in sorted_classifications if score >= low_threshold]
        
        return {
            "primary_classification": sorted_classifications[0][0] if sorted_classifications else "unclassified",
            "all_classifications": valid_classifications if valid_classifications else ["unclassified"],
            "confidence_scores": confidence_scores,
            "confidence_level": confidence_level
        }

    def handle_special_cases(self, filepath, filename):
        """Handle special cases like git hooks."""
        special_handling = {}
        
        # Git hooks handling
        if ".git/hooks" in filepath and any(pattern in filename for pattern in self.config["special_handling"]["git_hooks"]["patterns"]):
            special_handling["git_hook"] = True
            special_handling["preserve_location"] = True
            special_handling["notes"] = "Git hook must remain in original location for functionality"
        
        # Config files handling
        if any(pattern in filename.lower() for pattern in self.config["special_handling"]["config_files"]["patterns"]):
            special_handling["config_file"] = True
            special_handling["track_versions"] = True
        
        return special_handling

    def calculate_file_hash(self, filepath):
        """Calculate SHA-256 hash of file contents."""
        try:
            with open(filepath, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except Exception:
            return None

    def scan_directory(self, root_dir):
        """Recursively scan directory for governance artifacts."""
        artifacts = []
        file_count = 0
        directory_count = 0
        
        print(f"🔍 Scanning directory: {root_dir}")
        
        for root, dirs, files in os.walk(root_dir):
            directory_count += 1
            
            # Skip excluded directories
            dirs[:] = [d for d in dirs if not any(exclusion in os.path.join(root, d) for exclusion in self.config["exclusion_patterns"])]
            
            for file in files:
                file_count += 1
                filepath = os.path.join(root, file)
                
                # Skip binary files and very large files
                try:
                    file_size = os.path.getsize(filepath)
                    if file_size > 1_000_000:  # Skip files > 1MB
                        continue
                    
                    # Read file content for text files to enable content-based classification
                    content = None
                    if any(filepath.endswith(ext) for ext in self.config["content_scan_extensions"]):
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read(10000)  # Read first 10KB for classification
                        except:
                            pass
                    
                    if self.is_governance_file(filepath, file, content):
                        classification_result = self.classify_governance_artifact(filepath, file, content)
                        special_handling = self.handle_special_cases(filepath, file)
                        
                        file_info = {
                            "path": filepath,
                            "filename": file,
                            "size": file_size,
                            "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat(),
                            "primary_classification": classification_result["primary_classification"],
                            "all_classifications": classification_result["all_classifications"],
                            "confidence_scores": classification_result["confidence_scores"],
                            "confidence_level": classification_result["confidence_level"],
                            "hash": self.calculate_file_hash(filepath),
                            "special_handling": special_handling
                        }
                        artifacts.append(file_info)
                        
                        # Print progress for large scans
                        if len(artifacts) % 100 == 0:
                            print(f"📊 Found {len(artifacts)} governance artifacts so far...")
                except Exception as e:
                    print(f"⚠️ Error processing {filepath}: {str(e)}")
            
            # Print directory scan progress
            if directory_count % 1000 == 0:
                print(f"📂 Scanned {directory_count} directories, {file_count} files...")
        
        return artifacts

    def find_relationships(self, artifacts):
        """Find relationships between governance artifacts."""
        relationships = []
        
        # Group artifacts by classification
        classification_map = defaultdict(list)
        for artifact in artifacts:
            for classification in artifact["all_classifications"]:
                classification_map[classification].append(artifact)
        
        # Find references between files
        for i, artifact1 in enumerate(artifacts):
            for j, artifact2 in enumerate(artifacts[i+1:], i+1):
                relationship_types = []
                
                # Check if files are in the same directory
                if os.path.dirname(artifact1["path"]) == os.path.dirname(artifact2["path"]):
                    relationship_types.append("same_directory")
                
                # Check if files have the same primary classification
                if artifact1["primary_classification"] == artifact2["primary_classification"]:
                    relationship_types.append("same_primary_classification")
                
                # Check if files have overlapping classifications
                common_classifications = set(artifact1["all_classifications"]) & set(artifact2["all_classifications"])
                if common_classifications:
                    relationship_types.append("overlapping_classifications")
                
                # Check for naming similarities
                name1 = os.path.splitext(artifact1["filename"])[0].lower()
                name2 = os.path.splitext(artifact2["filename"])[0].lower()
                if name1 in name2 or name2 in name1:
                    relationship_types.append("similar_names")
                
                if relationship_types:
                    relationships.append({
                        "source": artifact1["path"],
                        "target": artifact2["path"],
                        "types": relationship_types,
                        "common_classifications": list(common_classifications) if common_classifications else []
                    })
        
        return relationships

    def analyze_coverage(self, root_dir, artifacts):
        """Analyze governance coverage across the directory structure."""
        directory_counts = defaultdict(int)
        
        # Count directories at each level
        for root, dirs, files in os.walk(root_dir):
            # Skip excluded directories
            if any(exclusion in root for exclusion in self.config["exclusion_patterns"]):
                continue
            
            rel_path = os.path.relpath(root, root_dir)
            if rel_path == '.':
                continue
            
            # Count directories at each depth level
            depth = len(rel_path.split(os.sep))
            directory_counts[depth] += 1
        
        # Count artifacts at each level
        artifact_counts = defaultdict(int)
        for artifact in artifacts:
            rel_path = os.path.relpath(os.path.dirname(artifact["path"]), root_dir)
            depth = len(rel_path.split(os.sep))
            artifact_counts[depth] += 1
        
        # Calculate coverage percentage at each level
        coverage = {}
        for depth in directory_counts:
            if directory_counts[depth] > 0:
                coverage[depth] = {
                    "directories": directory_counts[depth],
                    "artifacts": artifact_counts.get(depth, 0),
                    "coverage_percentage": (artifact_counts.get(depth, 0) / directory_counts[depth]) * 100
                }
        
        return coverage

    def save_results(self, artifacts, relationships, coverage, root_dir):
        """Save results to files."""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Ensure data directory exists
        data_dir = "/home/ichardart/code/infra/data/memory"
        os.makedirs(data_dir, exist_ok=True)
        
        # Save detailed JSON results
        output_file = f"{data_dir}/governance_artifacts_v2_{timestamp}.json"
        
        result = {
            "version": "2.0",
            "timestamp": datetime.datetime.now().isoformat(),
            "config_used": self.config_path,
            "root_directory": root_dir,
            "artifact_count": len(artifacts),
            "relationship_count": len(relationships),
            "artifacts": artifacts,
            "relationships": relationships,
            "coverage": coverage,
            "confidence_summary": self.generate_confidence_summary(artifacts)
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        # Generate summary report
        summary_file = f"{data_dir}/governance_artifacts_summary_v2_{timestamp}.md"
        self.generate_summary_report(artifacts, relationships, coverage, summary_file, timestamp)
        
        return output_file, summary_file

    def generate_confidence_summary(self, artifacts):
        """Generate confidence score summary."""
        confidence_counts = defaultdict(int)
        classification_confidence = defaultdict(list)
        
        for artifact in artifacts:
            confidence_counts[artifact["confidence_level"]] += 1
            classification_confidence[artifact["primary_classification"]].append(artifact["confidence_level"])
        
        # Calculate average confidence by classification
        classification_avg_confidence = {}
        for classification, levels in classification_confidence.items():
            level_scores = {"high": 3, "medium": 2, "low": 1, "none": 0}
            avg_score = sum(level_scores[level] for level in levels) / len(levels)
            classification_avg_confidence[classification] = avg_score
        
        return {
            "confidence_counts": dict(confidence_counts),
            "classification_avg_confidence": classification_avg_confidence
        }

    def generate_summary_report(self, artifacts, relationships, coverage, summary_file, timestamp):
        """Generate comprehensive summary report."""
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"# Governance Artifact Mapping Summary v2.0\n\n")
            f.write(f"**Generated**: {datetime.datetime.now().isoformat()}\n")
            f.write(f"**Configuration**: {self.config_path}\n\n")
            
            f.write("## Overview\n")
            f.write(f"- **Total Governance Artifacts**: {len(artifacts)}\n")
            f.write(f"- **Relationships Identified**: {len(relationships)}\n")
            f.write(f"- **Configuration Version**: {self.config.get('version', 'unknown')}\n\n")
            
            # Confidence analysis
            confidence_summary = self.generate_confidence_summary(artifacts)
            f.write("## Confidence Analysis\n")
            for level, count in confidence_summary["confidence_counts"].items():
                f.write(f"- **{level.title()} Confidence**: {count} artifacts\n")
            f.write("\n")
            
            # Classification breakdown
            f.write("## Classification Breakdown\n")
            classification_counts = defaultdict(int)
            for artifact in artifacts:
                classification_counts[artifact["primary_classification"]] += 1
            
            for classification, count in sorted(classification_counts.items(), key=lambda x: x[1], reverse=True):
                avg_confidence = confidence_summary["classification_avg_confidence"].get(classification, 0)
                f.write(f"- **{classification}**: {count} artifacts (avg confidence: {avg_confidence:.2f}/3.0)\n")
            
            # Special handling summary
            f.write("\n## Special Handling Required\n")
            special_counts = defaultdict(int)
            for artifact in artifacts:
                if artifact.get("special_handling"):
                    for special_type in artifact["special_handling"]:
                        special_counts[special_type] += 1
            
            if special_counts:
                for special_type, count in special_counts.items():
                    f.write(f"- **{special_type}**: {count} artifacts\n")
            else:
                f.write("- No special handling required\n")
            
            # Directory coverage
            f.write("\n## Directory Coverage\n")
            for depth, data in sorted(coverage.items()):
                f.write(f"- **Depth {depth}**: {data['coverage_percentage']:.2f}% coverage ({data['artifacts']} artifacts in {data['directories']} directories)\n")
            
            # Top governance directories
            f.write("\n## Top Governance Directories\n")
            directory_counts = defaultdict(int)
            for artifact in artifacts:
                directory = os.path.dirname(artifact["path"])
                directory_counts[directory] += 1
            
            for directory, count in sorted(directory_counts.items(), key=lambda x: x[1], reverse=True)[:20]:
                f.write(f"- **{directory}**: {count} artifacts\n")
            
            # Low confidence items for review
            f.write("\n## Items Requiring Review (Low Confidence)\n")
            low_confidence_items = [a for a in artifacts if a["confidence_level"] == "low"]
            for item in low_confidence_items[:10]:  # Show first 10
                f.write(f"- **{item['path']}** (classified as: {item['primary_classification']})\n")
            
            if len(low_confidence_items) > 10:
                f.write(f"- ... and {len(low_confidence_items) - 10} more items\n")

    def run_mapping(self, root_dir="/home/ichardart"):
        """Main execution function."""
        print("🏛️ Comprehensive Governance Artifact Mapper v2.0")
        print("=" * 50)
        print(f"📂 Root directory: {root_dir}")
        print(f"⚙️ Configuration: {self.config_path}")
        
        # Scan for governance artifacts
        print("\n🔍 Scanning for governance artifacts...")
        artifacts = self.scan_directory(root_dir)
        print(f"✅ Found {len(artifacts)} governance artifacts")
        
        # Find relationships between artifacts
        print("\n🔗 Analyzing relationships between artifacts...")
        relationships = self.find_relationships(artifacts)
        print(f"✅ Identified {len(relationships)} relationships")
        
        # Analyze governance coverage
        print("\n📊 Analyzing governance coverage...")
        coverage = self.analyze_coverage(root_dir, artifacts)
        
        # Save results
        print("\n💾 Saving results...")
        output_file, summary_file = self.save_results(artifacts, relationships, coverage, root_dir)
        
        print(f"✅ Results saved to {output_file}")
        print(f"✅ Summary report saved to {summary_file}")
        print("\n🎉 Analysis complete!")
        
        # Print quick summary
        confidence_summary = self.generate_confidence_summary(artifacts)
        print(f"\n📋 Quick Summary:")
        print(f"   Total artifacts: {len(artifacts)}")
        print(f"   High confidence: {confidence_summary['confidence_counts'].get('high', 0)}")
        print(f"   Medium confidence: {confidence_summary['confidence_counts'].get('medium', 0)}")
        print(f"   Low confidence: {confidence_summary['confidence_counts'].get('low', 0)}")
        print(f"   Relationships: {len(relationships)}")

def main():
    """Main execution function."""
    mapper = GovernanceMapper()
    mapper.run_mapping()

if __name__ == "__main__":
    main()