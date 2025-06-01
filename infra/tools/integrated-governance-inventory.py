#!/usr/bin/env python3
"""
Integrated Governance Inventory System

Extends the existing Dynamic Inventory to include comprehensive governance artifact
classification and mapping, integrating with existing SQLite database and MCP server.
"""
import os
import sys
import json
import re
import datetime
import hashlib
import sqlite3
import time
from collections import defaultdict
from pathlib import Path

class IntegratedGovernanceInventory:
    def __init__(self, 
                 config_path="/home/ichardart/code/infra/config/governance_mapping_config.json",
                 db_path="/home/ichardart/code/infra/data/idp-inventory.db"):
        self.config_path = config_path
        self.db_path = db_path
        self.config = self.load_config()
        self.init_database()
        
    def load_config(self):
        """Load governance classification configuration."""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                print(f"✅ Loaded governance config from {self.config_path}")
                return config
        except FileNotFoundError:
            print(f"⚠️ Governance config not found. Using basic patterns.")
            return self.create_basic_config()
    
    def create_basic_config(self):
        """Create basic governance configuration if none exists."""
        return {
            "governance_patterns": {
                "standards": {"patterns": ["standard", "policy", "guideline", "OPERATING_RULES"], "weight": 1.0},
                "validation": {"patterns": ["validation", "check", "audit", "compliance"], "weight": 1.0},
                "monitoring": {"patterns": ["monitor", "track", "log", "status"], "weight": 1.0},
                "automation": {"patterns": ["automation", "script", "workflow"], "weight": 1.0},
                "security": {"patterns": ["security", "auth", "credential"], "weight": 1.2},
                "templates": {"patterns": ["template", "boilerplate", "scaffold"], "weight": 1.0},
                "methodology": {"patterns": ["methodology", "framework", "process"], "weight": 1.0},
                "enforcement": {"patterns": ["enforce", "hook", "restrict"], "weight": 1.0},
                "planning": {"patterns": ["plan", "roadmap", "strategy"], "weight": 1.0},
                "roles": {"patterns": ["role", "responsibility", "assign"], "weight": 1.0}
            },
            "governance_directories": [
                "idp-governance", "governance", ".git/hooks", "standards", 
                "templates", "validation", "audits", "methodologies", "dev-env-docs"
            ],
            "content_scan_extensions": [".md", ".txt", ".json", ".yaml", ".yml", ".sh", ".py", ".js"],
            "exclusion_patterns": ["node_modules", ".git/objects", "__pycache__", "vendor", "dist", "build"],
            "confidence_thresholds": {"high": 0.8, "medium": 0.5, "low": 0.2}
        }
    
    def init_database(self):
        """Initialize database with governance extensions."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Add governance artifact table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS governance_artifacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path TEXT UNIQUE NOT NULL,
                    filename TEXT NOT NULL,
                    directory_path TEXT NOT NULL,
                    file_size INTEGER,
                    last_modified TIMESTAMP,
                    file_hash TEXT,
                    primary_classification TEXT,
                    all_classifications TEXT, -- JSON array
                    confidence_scores TEXT, -- JSON object
                    confidence_level TEXT,
                    special_handling TEXT, -- JSON object
                    content_summary TEXT,
                    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (directory_path) REFERENCES directories(path)
                )
            ''')
            
            # Add governance metadata to directories table if columns don't exist
            try:
                cursor.execute('ALTER TABLE directories ADD COLUMN governance_artifacts_count INTEGER DEFAULT 0')
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                cursor.execute('ALTER TABLE directories ADD COLUMN primary_governance_type TEXT')
            except sqlite3.OperationalError:
                pass  # Column already exists
                
            try:
                cursor.execute('ALTER TABLE directories ADD COLUMN governance_confidence_avg REAL')
            except sqlite3.OperationalError:
                pass  # Column already exists
                
            # Add project type classification columns
            try:
                cursor.execute('ALTER TABLE directories ADD COLUMN project_confidence REAL')
            except sqlite3.OperationalError:
                pass  # Column already exists
                
            try:
                cursor.execute('ALTER TABLE directories ADD COLUMN project_reasoning TEXT')
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            # Create indexes for performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_artifacts_classification ON governance_artifacts(primary_classification)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_artifacts_confidence ON governance_artifacts(confidence_level)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_artifacts_directory ON governance_artifacts(directory_path)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_artifacts_modified ON governance_artifacts(last_modified)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_directories_project_type ON directories(project_type)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_directories_project_confidence ON directories(project_confidence)')
            
            conn.commit()
            print("✅ Database initialized with governance extensions")
            
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
            conn.rollback()
        finally:
            conn.close()
    
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
                    category_score += weight * 0.7
                    pattern_matches += 1
                
                # Check filepath
                if re.search(pattern, filepath, re.IGNORECASE):
                    category_score += weight * 0.5
                    pattern_matches += 1
                
                # Check content if available
                if content and any(filepath.endswith(ext) for ext in self.config["content_scan_extensions"]):
                    content_matches = len(re.findall(pattern, content, re.IGNORECASE))
                    if content_matches > 0:
                        category_score += weight * 0.3 * min(content_matches, 3)
                        pattern_matches += 1
            
            # Bonus for multiple pattern matches
            if pattern_matches > 1:
                category_score *= 1.2
            
            scores[category] = category_score
            max_score = max(max_score, category_score)
        
        # Normalize scores
        if max_score > 0:
            for category in scores:
                scores[category] = scores[category] / max_score
        
        return dict(scores)
    
    def classify_governance_artifact(self, filepath, filename, content=None):
        """Classify governance artifact with confidence scoring."""
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
        """Handle special cases like git hooks and config files."""
        special_handling = {}
        
        # Git hooks handling
        if ".git/hooks" in filepath:
            special_handling["git_hook"] = True
            special_handling["preserve_location"] = True
            special_handling["notes"] = "Git hook must remain in original location for functionality"
        
        # Config files
        if any(pattern in filename.lower() for pattern in ["config", ".config", "settings", ".env"]):
            special_handling["config_file"] = True
            special_handling["track_versions"] = True
        
        # Manifest files
        if filename.lower() in ["manifest.md", "readme.md", "package.json"]:
            special_handling["project_manifest"] = True
            special_handling["high_importance"] = True
        
        return special_handling
    
    def classify_project_type(self, directory_path, files_in_dir, content_samples=None):
        """Classify project type based on directory location, files, and content."""
        if "project_type_patterns" not in self.config:
            return {"type": "unknown", "confidence": 0.0, "reasoning": "No project type patterns configured"}
        
        scores = {}
        reasoning = []
        
        for project_type, patterns in self.config["project_type_patterns"].items():
            score = 0.0
            type_reasoning = []
            
            # Check directory patterns
            for dir_pattern in patterns["directory_patterns"]:
                if dir_pattern.rstrip('/') in directory_path:
                    score += 0.6 * patterns["weight"]
                    type_reasoning.append(f"matches directory pattern: {dir_pattern}")
            
            # Check file patterns
            for file_pattern in patterns["file_patterns"]:
                for filename in files_in_dir:
                    if re.search(file_pattern, filename, re.IGNORECASE):
                        score += 0.3 * patterns["weight"]
                        type_reasoning.append(f"file '{filename}' matches pattern: {file_pattern}")
                        break
            
            # Check content patterns if available
            if content_samples:
                for content_pattern in patterns["content_patterns"]:
                    for content in content_samples:
                        if content and re.search(content_pattern, content, re.IGNORECASE):
                            score += 0.2 * patterns["weight"]
                            type_reasoning.append(f"content matches pattern: {content_pattern}")
                            break
            
            if score > 0:
                scores[project_type] = score
                reasoning.extend([f"{project_type}: {reason}" for reason in type_reasoning])
        
        if not scores:
            return {"type": "unknown", "confidence": 0.0, "reasoning": "No matching patterns found"}
        
        # Get highest scoring type
        best_type = max(scores.keys(), key=lambda k: scores[k])
        confidence = min(scores[best_type], 1.0)  # Cap at 1.0
        
        return {
            "type": best_type,
            "confidence": confidence,
            "all_scores": scores,
            "reasoning": reasoning
        }
    
    def calculate_file_hash(self, filepath):
        """Calculate SHA-256 hash of file contents."""
        try:
            with open(filepath, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except Exception:
            return None
    
    def extract_content_summary(self, filepath, content=None):
        """Extract brief content summary for governance context."""
        if not content:
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(1000)  # First 1KB
            except:
                return None
        
        # Extract first few meaningful lines
        lines = content.split('\n')[:5]
        summary_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and len(line) > 10:
                summary_lines.append(line[:100])  # First 100 chars
                if len(summary_lines) >= 2:
                    break
        
        return '. '.join(summary_lines) if summary_lines else None
    
    def is_governance_artifact(self, filepath, filename, content=None):
        """Determine if a file is a governance artifact."""
        # Skip excluded patterns
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
    
    def scan_and_populate_directory(self, directory_path):
        """Scan a directory and populate both directories and governance_artifacts tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        artifacts_found = 0
        directories_processed = 0
        
        try:
            print(f"🔍 Scanning directory: {directory_path}")
            
            for root, dirs, files in os.walk(directory_path):
                directories_processed += 1
                
                # Skip excluded directories
                dirs[:] = [d for d in dirs if not any(exclusion in os.path.join(root, d) for exclusion in self.config["exclusion_patterns"])]
                
                # Process directory entry
                rel_path = os.path.relpath(root, directory_path)
                if rel_path == '.':
                    rel_path = directory_path
                else:
                    rel_path = os.path.join(directory_path, rel_path)
                
                parent_path = os.path.dirname(rel_path) if rel_path != directory_path else None
                dir_name = os.path.basename(rel_path)
                
                try:
                    stat_info = os.stat(root)
                    last_modified = datetime.datetime.fromtimestamp(stat_info.st_mtime)
                    
                    # Insert or update directory
                    cursor.execute('''
                        INSERT OR REPLACE INTO directories 
                        (path, parent_path, name, last_modified, governance_score, project_type, activity_level, risk_level)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (rel_path, parent_path, dir_name, last_modified, 0, 'unknown', 'unknown', 'unknown'))
                    
                except Exception as e:
                    print(f"⚠️ Error processing directory {root}: {e}")
                    continue
                
                # Classify directory project type
                content_samples = []
                for file in files[:5]:  # Sample first 5 files for content
                    filepath = os.path.join(root, file)
                    if any(filepath.endswith(ext) for ext in self.config["content_scan_extensions"]):
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                content_samples.append(f.read(1000))  # First 1KB
                        except:
                            pass
                
                project_classification = self.classify_project_type(rel_path, files, content_samples)
                
                # Update directory with project type
                cursor.execute('''
                    UPDATE directories 
                    SET project_type = ?, project_confidence = ?, project_reasoning = ?
                    WHERE path = ?
                ''', (
                    project_classification["type"],
                    project_classification["confidence"],
                    json.dumps(project_classification.get("reasoning", [])),
                    rel_path
                ))
                
                # Process files in directory
                governance_artifacts_count = 0
                governance_types = []
                confidence_scores = []
                
                for file in files:
                    filepath = os.path.join(root, file)
                    
                    try:
                        # Skip very large files
                        if os.path.getsize(filepath) > 1_000_000:
                            continue
                        
                        # Read content for classification
                        content = None
                        if any(filepath.endswith(ext) for ext in self.config["content_scan_extensions"]):
                            try:
                                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                    content = f.read(10000)  # First 10KB
                            except:
                                pass
                        
                        # Check if it's a governance artifact
                        if self.is_governance_artifact(filepath, file, content):
                            classification_result = self.classify_governance_artifact(filepath, file, content)
                            special_handling = self.handle_special_cases(filepath, file)
                            content_summary = self.extract_content_summary(filepath, content)
                            
                            # Convert relative path
                            artifact_rel_path = os.path.relpath(filepath, '/home/ichardart')
                            
                            stat_info = os.stat(filepath)
                            
                            cursor.execute('''
                                INSERT OR REPLACE INTO governance_artifacts
                                (path, filename, directory_path, file_size, last_modified, file_hash,
                                 primary_classification, all_classifications, confidence_scores, 
                                 confidence_level, special_handling, content_summary, last_analyzed)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                artifact_rel_path,
                                file,
                                rel_path,
                                stat_info.st_size,
                                datetime.datetime.fromtimestamp(stat_info.st_mtime),
                                self.calculate_file_hash(filepath),
                                classification_result["primary_classification"],
                                json.dumps(classification_result["all_classifications"]),
                                json.dumps(classification_result["confidence_scores"]),
                                classification_result["confidence_level"],
                                json.dumps(special_handling),
                                content_summary,
                                datetime.datetime.now()
                            ))
                            
                            artifacts_found += 1
                            governance_artifacts_count += 1
                            governance_types.append(classification_result["primary_classification"])
                            
                            if classification_result["confidence_level"] in ["high", "medium", "low"]:
                                confidence_scores.append({
                                    "high": 3, "medium": 2, "low": 1
                                }[classification_result["confidence_level"]])
                    
                    except Exception as e:
                        print(f"⚠️ Error processing file {filepath}: {e}")
                        continue
                
                # Update directory with governance info
                primary_governance_type = max(set(governance_types), key=governance_types.count) if governance_types else None
                avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
                
                cursor.execute('''
                    UPDATE directories 
                    SET governance_artifacts_count = ?, 
                        primary_governance_type = ?,
                        governance_confidence_avg = ?
                    WHERE path = ?
                ''', (governance_artifacts_count, primary_governance_type, avg_confidence, rel_path))
                
                # Progress reporting
                if directories_processed % 100 == 0:
                    print(f"📊 Processed {directories_processed} directories, found {artifacts_found} governance artifacts...")
            
            conn.commit()
            print(f"✅ Scan complete: {artifacts_found} governance artifacts found in {directories_processed} directories")
            
            return {
                "artifacts_found": artifacts_found,
                "directories_processed": directories_processed
            }
            
        except Exception as e:
            print(f"❌ Error during scan: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def get_governance_summary(self):
        """Get summary of governance artifacts in the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Total counts
            cursor.execute('SELECT COUNT(*) FROM governance_artifacts')
            total_artifacts = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM directories WHERE governance_artifacts_count > 0')
            directories_with_governance = cursor.fetchone()[0]
            
            # Classification breakdown
            cursor.execute('''
                SELECT primary_classification, COUNT(*) 
                FROM governance_artifacts 
                GROUP BY primary_classification 
                ORDER BY COUNT(*) DESC
            ''')
            classification_counts = cursor.fetchall()
            
            # Confidence levels
            cursor.execute('''
                SELECT confidence_level, COUNT(*) 
                FROM governance_artifacts 
                GROUP BY confidence_level
            ''')
            confidence_counts = cursor.fetchall()
            
            # Top governance directories
            cursor.execute('''
                SELECT directory_path, governance_artifacts_count 
                FROM directories 
                WHERE governance_artifacts_count > 0 
                ORDER BY governance_artifacts_count DESC 
                LIMIT 10
            ''')
            top_directories = cursor.fetchall()
            
            return {
                "total_artifacts": total_artifacts,
                "directories_with_governance": directories_with_governance,
                "classification_counts": classification_counts,
                "confidence_counts": confidence_counts,
                "top_directories": top_directories
            }
            
        except Exception as e:
            print(f"❌ Error getting summary: {e}")
            return None
        finally:
            conn.close()
    
    def export_governance_data(self, output_path=None):
        """Export governance data for compatibility with existing tools."""
        if not output_path:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"/home/ichardart/code/infra/data/memory/integrated_governance_export_{timestamp}.json"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT path, filename, directory_path, file_size, last_modified,
                       primary_classification, all_classifications, confidence_scores,
                       confidence_level, special_handling, content_summary
                FROM governance_artifacts
                ORDER BY confidence_level DESC, primary_classification
            ''')
            
            artifacts = []
            for row in cursor.fetchall():
                artifact = {
                    "path": f"/home/ichardart/{row[0]}",
                    "filename": row[1],
                    "directory_path": row[2],
                    "size": row[3],
                    "last_modified": row[4],
                    "primary_classification": row[5],
                    "all_classifications": json.loads(row[6]) if row[6] else [],
                    "confidence_scores": json.loads(row[7]) if row[7] else {},
                    "confidence_level": row[8],
                    "special_handling": json.loads(row[9]) if row[9] else {},
                    "content_summary": row[10]
                }
                artifacts.append(artifact)
            
            export_data = {
                "version": "integrated_v1.0",
                "timestamp": datetime.datetime.now().isoformat(),
                "source": "integrated_governance_inventory",
                "database": self.db_path,
                "artifact_count": len(artifacts),
                "artifacts": artifacts,
                "summary": self.get_governance_summary()
            }
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2)
            
            print(f"✅ Governance data exported to: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Export error: {e}")
            return None
        finally:
            conn.close()
    
    def run_full_integration(self, root_dir="/home/ichardart"):
        """Run complete integration: scan, populate, and export."""
        print("🏛️ Integrated Governance Inventory System")
        print("=" * 50)
        print(f"📂 Root directory: {root_dir}")
        print(f"💾 Database: {self.db_path}")
        print(f"⚙️ Configuration: {self.config_path}")
        
        # Scan and populate
        print("\n🔍 Scanning and populating governance artifacts...")
        result = self.scan_and_populate_directory(root_dir)
        
        if result:
            print(f"\n📊 Summary:")
            print(f"   Governance artifacts: {result['artifacts_found']}")
            print(f"   Directories processed: {result['directories_processed']}")
            
            # Get detailed summary
            summary = self.get_governance_summary()
            if summary:
                print(f"\n📋 Governance Summary:")
                print(f"   Total artifacts: {summary['total_artifacts']}")
                print(f"   Directories with governance: {summary['directories_with_governance']}")
                
                print(f"\n🏷️ Top Classifications:")
                for classification, count in summary['classification_counts'][:5]:
                    print(f"   {classification}: {count}")
                
                print(f"\n📈 Confidence Levels:")
                for level, count in summary['confidence_counts']:
                    print(f"   {level}: {count}")
            
            # Export for compatibility
            export_path = self.export_governance_data()
            
            print(f"\n✅ Integration complete!")
            print(f"📄 Data available in SQLite database: {self.db_path}")
            print(f"📤 Export available at: {export_path}")
            
            return True
        else:
            print("❌ Integration failed")
            return False

def main():
    """Main execution function."""
    inventory = IntegratedGovernanceInventory()
    inventory.run_full_integration()

if __name__ == "__main__":
    main()