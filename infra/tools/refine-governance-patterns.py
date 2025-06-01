#!/usr/bin/env python3
"""
Governance Pattern Refinement Tool

Helps iteratively improve governance artifact classification patterns
by analyzing low-confidence results and suggesting pattern updates.
"""
import os
import sys
import json
import re
import datetime
from collections import defaultdict, Counter

class PatternRefiner:
    def __init__(self, config_path="/home/ichardart/code/infra/config/governance_mapping_config.json"):
        self.config_path = config_path
        self.config = self.load_config()
        
    def load_config(self):
        """Load current configuration."""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Configuration file not found: {self.config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in config file: {e}")
            sys.exit(1)
    
    def load_mapping_results(self, mapping_file=None):
        """Load the most recent mapping results."""
        if not mapping_file:
            data_dir = "/home/ichardart/code/infra/data/memory"
            mapping_files = [f for f in os.listdir(data_dir) if f.startswith("governance_artifacts_v2_") and f.endswith(".json")]
            
            if not mapping_files:
                mapping_files = [f for f in os.listdir(data_dir) if f.startswith("governance_artifacts_") and f.endswith(".json")]
            
            if not mapping_files:
                print("❌ No governance mapping files found.")
                print("Please run the mapping script first.")
                sys.exit(1)
            
            most_recent = sorted(mapping_files)[-1]
            mapping_file = os.path.join(data_dir, most_recent)
        
        try:
            with open(mapping_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading mapping results: {e}")
            sys.exit(1)
    
    def analyze_low_confidence_artifacts(self, mapping_data):
        """Analyze artifacts with low confidence scores."""
        low_confidence_artifacts = []
        unclassified_artifacts = []
        
        for artifact in mapping_data.get("artifacts", []):
            confidence_level = artifact.get("confidence_level", "unknown")
            primary_classification = artifact.get("primary_classification", "unclassified")
            
            if confidence_level == "low" or primary_classification == "unclassified":
                if primary_classification == "unclassified":
                    unclassified_artifacts.append(artifact)
                else:
                    low_confidence_artifacts.append(artifact)
        
        return low_confidence_artifacts, unclassified_artifacts
    
    def extract_common_patterns(self, artifacts):
        """Extract common patterns from artifact names and paths."""
        patterns = {
            "filename_patterns": Counter(),
            "path_patterns": Counter(),
            "extension_patterns": Counter(),
            "word_patterns": Counter()
        }
        
        for artifact in artifacts:
            filename = artifact["filename"].lower()
            filepath = artifact["path"].lower()
            
            # Extract filename patterns
            base_name = os.path.splitext(filename)[0]
            extension = os.path.splitext(filename)[1]
            
            # Common filename words
            words = re.findall(r'\w+', base_name)
            for word in words:
                if len(word) > 2:  # Skip very short words
                    patterns["word_patterns"][word] += 1
            
            # Path segments
            path_segments = filepath.split('/')
            for segment in path_segments:
                if segment and len(segment) > 2:
                    patterns["path_patterns"][segment] += 1
            
            # Extensions
            if extension:
                patterns["extension_patterns"][extension] += 1
            
            # Common filename patterns
            if '_' in base_name:
                patterns["filename_patterns"]['contains_underscore'] += 1
            if '-' in base_name:
                patterns["filename_patterns"]['contains_dash'] += 1
            if 'config' in base_name:
                patterns["filename_patterns"]['contains_config'] += 1
            if 'test' in base_name:
                patterns["filename_patterns"]['contains_test'] += 1
        
        return patterns
    
    def suggest_pattern_improvements(self, low_confidence_artifacts, unclassified_artifacts):
        """Suggest improvements to classification patterns."""
        suggestions = {
            "new_patterns": defaultdict(list),
            "pattern_weights": {},
            "new_categories": []
        }
        
        # Analyze unclassified artifacts
        if unclassified_artifacts:
            unclassified_patterns = self.extract_common_patterns(unclassified_artifacts)
            
            # Suggest new patterns based on common words
            common_words = unclassified_patterns["word_patterns"].most_common(20)
            
            for word, count in common_words:
                if count >= 3:  # Appear in at least 3 artifacts
                    # Try to categorize the word
                    category = self.categorize_word(word)
                    if category:
                        suggestions["new_patterns"][category].append({
                            "pattern": word,
                            "frequency": count,
                            "confidence": "suggested",
                            "source": "unclassified_analysis"
                        })
        
        # Analyze low confidence artifacts
        if low_confidence_artifacts:
            low_conf_patterns = self.extract_common_patterns(low_confidence_artifacts)
            
            # Group by current classification
            by_classification = defaultdict(list)
            for artifact in low_confidence_artifacts:
                by_classification[artifact["primary_classification"]].append(artifact)
            
            # Suggest pattern weights adjustments
            for classification, artifacts in by_classification.items():
                if len(artifacts) >= 5:  # Significant number of low-confidence items
                    classification_patterns = self.extract_common_patterns(artifacts)
                    
                    # Suggest increasing weight for this classification
                    current_weight = self.config["governance_patterns"].get(classification, {}).get("weight", 1.0)
                    suggested_weight = min(current_weight + 0.2, 2.0)  # Cap at 2.0
                    
                    suggestions["pattern_weights"][classification] = {
                        "current": current_weight,
                        "suggested": suggested_weight,
                        "reason": f"High number of low-confidence items ({len(artifacts)})"
                    }
        
        return suggestions
    
    def categorize_word(self, word):
        """Attempt to categorize a word into governance categories."""
        category_keywords = {
            "standards": ["standard", "policy", "rule", "guideline", "spec", "requirement"],
            "validation": ["validate", "verify", "check", "test", "audit", "lint", "compliance"],
            "monitoring": ["monitor", "watch", "track", "log", "report", "status", "health"],
            "automation": ["auto", "script", "workflow", "pipeline", "deploy", "build"],
            "security": ["security", "auth", "credential", "secret", "token", "cert", "key"],
            "templates": ["template", "scaffold", "boilerplate", "sample", "example"],
            "methodology": ["method", "process", "procedure", "framework", "protocol"],
            "enforcement": ["enforce", "hook", "restrict", "require", "mandatory"],
            "planning": ["plan", "roadmap", "strategy", "vision", "goal", "objective"],
            "roles": ["role", "responsibility", "assign", "actor", "agent", "user"]
        }
        
        word_lower = word.lower()
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in word_lower or word_lower in keyword:
                    return category
        
        return None
    
    def generate_refinement_report(self, mapping_data, suggestions):
        """Generate a comprehensive refinement report."""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/home/ichardart/code/infra/data/memory/pattern_refinement_report_{timestamp}.md"
        
        total_artifacts = len(mapping_data.get("artifacts", []))
        low_confidence_count = len([a for a in mapping_data.get("artifacts", []) if a.get("confidence_level") == "low"])
        unclassified_count = len([a for a in mapping_data.get("artifacts", []) if a.get("primary_classification") == "unclassified"])
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(f"# Governance Pattern Refinement Report\n\n")
            f.write(f"**Generated**: {datetime.datetime.now().isoformat()}\n")
            f.write(f"**Configuration**: {self.config_path}\n\n")
            
            f.write("## Analysis Summary\n\n")
            f.write(f"- **Total Artifacts**: {total_artifacts}\n")
            f.write(f"- **Low Confidence**: {low_confidence_count} ({low_confidence_count/total_artifacts*100:.1f}%)\n")
            f.write(f"- **Unclassified**: {unclassified_count} ({unclassified_count/total_artifacts*100:.1f}%)\n\n")
            
            # Current pattern analysis
            f.write("## Current Pattern Performance\n\n")
            classification_counts = defaultdict(int)
            confidence_by_classification = defaultdict(list)
            
            for artifact in mapping_data.get("artifacts", []):
                classification = artifact.get("primary_classification", "unclassified")
                confidence = artifact.get("confidence_level", "unknown")
                
                classification_counts[classification] += 1
                confidence_by_classification[classification].append(confidence)
            
            for classification, count in sorted(classification_counts.items(), key=lambda x: x[1], reverse=True):
                confidences = confidence_by_classification[classification]
                high_conf = confidences.count("high")
                medium_conf = confidences.count("medium")
                low_conf = confidences.count("low")
                
                f.write(f"- **{classification}**: {count} artifacts\n")
                f.write(f"  - High confidence: {high_conf} ({high_conf/count*100:.1f}%)\n")
                f.write(f"  - Medium confidence: {medium_conf} ({medium_conf/count*100:.1f}%)\n")
                f.write(f"  - Low confidence: {low_conf} ({low_conf/count*100:.1f}%)\n")
            
            # Suggested improvements
            f.write("\n## Suggested Pattern Improvements\n\n")
            
            if suggestions["new_patterns"]:
                f.write("### New Patterns to Add\n\n")
                for category, patterns in suggestions["new_patterns"].items():
                    f.write(f"#### {category.title()}\n\n")
                    for pattern_info in patterns:
                        f.write(f"- **Pattern**: `{pattern_info['pattern']}`\n")
                        f.write(f"  - Frequency: {pattern_info['frequency']} artifacts\n")
                        f.write(f"  - Source: {pattern_info['source']}\n")
                    f.write("\n")
            
            if suggestions["pattern_weights"]:
                f.write("### Pattern Weight Adjustments\n\n")
                for classification, weight_info in suggestions["pattern_weights"].items():
                    f.write(f"- **{classification}**:\n")
                    f.write(f"  - Current weight: {weight_info['current']}\n")
                    f.write(f"  - Suggested weight: {weight_info['suggested']}\n")
                    f.write(f"  - Reason: {weight_info['reason']}\n")
                f.write("\n")
            
            # Implementation instructions
            f.write("## Implementation Instructions\n\n")
            f.write("To apply these suggestions:\n\n")
            f.write("1. **Review the suggestions** carefully\n")
            f.write("2. **Edit the configuration file** manually:\n")
            f.write(f"   ```bash\n")
            f.write(f"   vim {self.config_path}\n")
            f.write(f"   ```\n")
            f.write("3. **Add new patterns** to the appropriate categories\n")
            f.write("4. **Adjust pattern weights** as recommended\n")
            f.write("5. **Re-run the mapping** to see improvements:\n")
            f.write("   ```bash\n")
            f.write("   python3 /home/ichardart/code/infra/tools/map-governance-artifacts-v2.py\n")
            f.write("   ```\n")
            f.write("6. **Compare results** and iterate as needed\n\n")
            
            # Sample configuration updates
            if suggestions["new_patterns"] or suggestions["pattern_weights"]:
                f.write("## Sample Configuration Updates\n\n")
                f.write("```json\n")
                f.write("{\n")
                f.write('  "governance_patterns": {\n')
                
                # Show existing categories with updates
                for category, config in self.config["governance_patterns"].items():
                    f.write(f'    "{category}": {{\n')
                    
                    # Current patterns
                    current_patterns = config.get("patterns", [])
                    
                    # Add suggested patterns
                    if category in suggestions["new_patterns"]:
                        for pattern_info in suggestions["new_patterns"][category]:
                            if pattern_info["pattern"] not in current_patterns:
                                current_patterns.append(pattern_info["pattern"])
                    
                    f.write(f'      "patterns": {json.dumps(current_patterns, indent=6)[:-1].replace("      ", "        ")}\n      ],\n')
                    
                    # Update weight if suggested
                    if category in suggestions["pattern_weights"]:
                        suggested_weight = suggestions["pattern_weights"][category]["suggested"]
                        f.write(f'      "weight": {suggested_weight},\n')
                    else:
                        f.write(f'      "weight": {config.get("weight", 1.0)},\n')
                    
                    f.write(f'      "description": "{config.get("description", "")}"\n')
                    f.write('    },\n')
                
                f.write('  }\n')
                f.write("}\n")
                f.write("```\n\n")
        
        return report_file
    
    def run_analysis(self, mapping_file=None):
        """Run the complete pattern refinement analysis."""
        print("🔍 Governance Pattern Refinement Tool")
        print("=" * 40)
        
        # Load data
        print("📊 Loading mapping results...")
        mapping_data = self.load_mapping_results(mapping_file)
        
        # Analyze artifacts
        print("🔍 Analyzing low-confidence artifacts...")
        low_confidence_artifacts, unclassified_artifacts = self.analyze_low_confidence_artifacts(mapping_data)
        
        print(f"   Low confidence: {len(low_confidence_artifacts)} artifacts")
        print(f"   Unclassified: {len(unclassified_artifacts)} artifacts")
        
        # Generate suggestions
        print("💡 Generating improvement suggestions...")
        suggestions = self.suggest_pattern_improvements(low_confidence_artifacts, unclassified_artifacts)
        
        # Generate report
        print("📄 Generating refinement report...")
        report_file = self.generate_refinement_report(mapping_data, suggestions)
        
        print(f"✅ Pattern refinement analysis complete!")
        print(f"📋 Report saved to: {report_file}")
        
        # Show quick summary
        print(f"\n📊 Quick Summary:")
        total_new_patterns = sum(len(patterns) for patterns in suggestions["new_patterns"].values())
        weight_adjustments = len(suggestions["pattern_weights"])
        
        print(f"   New patterns suggested: {total_new_patterns}")
        print(f"   Weight adjustments suggested: {weight_adjustments}")
        
        if total_new_patterns > 0 or weight_adjustments > 0:
            print(f"\n🔧 Next Steps:")
            print(f"   1. Review the report: cat {report_file}")
            print(f"   2. Update configuration: vim {self.config_path}")
            print(f"   3. Re-run mapping to test improvements")
        else:
            print(f"\n✅ Current patterns seem well-tuned!")
            print(f"   Consider reviewing the report for minor optimizations.")

def main():
    """Main execution function."""
    refiner = PatternRefiner()
    refiner.run_analysis()

if __name__ == "__main__":
    main()