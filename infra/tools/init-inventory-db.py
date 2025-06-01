#!/usr/bin/env python3
"""
Initialize the dynamic IDP inventory database system.
Creates SQLite database with optimized schema for real-time inventory management.
"""

import sqlite3
import os
import json
from datetime import datetime
from pathlib import Path

# Database configuration
DB_PATH = "/home/ichardart/code/infra/data/idp-inventory.db"
CACHE_PATH = "/home/ichardart/code/infra/data/inventory-cache.json"

def init_database():
    """Initialize SQLite database with optimized schema"""
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Core inventory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS directories (
            path TEXT PRIMARY KEY,
            parent_path TEXT,
            name TEXT,
            last_modified TIMESTAMP,
            governance_score INTEGER DEFAULT 0,
            project_type TEXT,
            activity_level TEXT,
            risk_level TEXT DEFAULT 'unknown',
            dependencies TEXT, -- JSON array
            metadata TEXT,     -- JSON object for extensibility
            last_analyzed TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Change tracking for audit trail
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            change_type TEXT NOT NULL, -- CREATE, DELETE, MODIFY, ANALYZE
            old_values TEXT,           -- JSON of previous state
            new_values TEXT,           -- JSON of new state  
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            trigger_source TEXT,       -- watcher, git-hook, manual, agent
            session_id TEXT           -- For grouping related changes
        )
    ''')
    
    # Dependency mapping for impact analysis
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS directory_dependencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_path TEXT NOT NULL,
            target_path TEXT NOT NULL,
            dependency_type TEXT,      -- import, reference, config, data
            strength INTEGER DEFAULT 1, -- 1=weak, 5=critical
            last_verified TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(source_path, target_path, dependency_type)
        )
    ''')
    
    # Performance indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_path ON directories(path)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_parent ON directories(parent_path)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_activity ON directories(activity_level)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_governance ON directories(governance_score)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_risk ON directories(risk_level)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_changes_path ON inventory_changes(path)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_changes_time ON inventory_changes(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_deps_source ON directory_dependencies(source_path)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_deps_target ON directory_dependencies(target_path)')
    
    # System metadata table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_metadata (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Initialize system metadata
    cursor.execute('''
        INSERT OR REPLACE INTO system_metadata (key, value) VALUES 
        ('db_version', '1.0'),
        ('last_full_scan', ?),
        ('total_directories', '0'),
        ('system_status', 'initialized')
    ''', (datetime.now().isoformat(),))
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database initialized: {DB_PATH}")
    return True

def import_existing_analysis():
    """Import data from existing idp-directory-analyzer output"""
    
    # Look for recent analysis files
    analysis_files = []
    logs_dir = Path("/home/ichardart/code/infra/logs")
    
    if logs_dir.exists():
        analysis_files = list(logs_dir.glob("idp-analysis-*.json"))
        analysis_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not analysis_files:
        print("⚠️ No existing analysis files found. Database initialized empty.")
        return False
    
    latest_file = analysis_files[0]
    print(f"📊 Importing from: {latest_file}")
    
    try:
        with open(latest_file, 'r') as f:
            data = json.load(f)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        imported_count = 0
        
        # Import directory data from analysis
        if 'directories' in data:
            for dir_info in data['directories']:
                cursor.execute('''
                    INSERT OR REPLACE INTO directories 
                    (path, parent_path, name, governance_score, project_type, 
                     activity_level, risk_level, metadata, last_analyzed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    dir_info.get('path', ''),
                    str(Path(dir_info.get('path', '')).parent),
                    Path(dir_info.get('path', '')).name,
                    dir_info.get('governance_score', 0),
                    dir_info.get('project_type', 'unknown'),
                    dir_info.get('activity_level', 'unknown'),
                    dir_info.get('risk_level', 'unknown'),
                    json.dumps(dir_info),
                    datetime.now().isoformat()
                ))
                imported_count += 1
        
        # Update system metadata
        cursor.execute('''
            UPDATE system_metadata 
            SET value = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE key = 'total_directories'
        ''', (str(imported_count),))
        
        cursor.execute('''
            UPDATE system_metadata 
            SET value = 'populated', updated_at = CURRENT_TIMESTAMP 
            WHERE key = 'system_status'
        ''')
        
        # Log the import operation
        cursor.execute('''
            INSERT INTO inventory_changes 
            (path, change_type, new_values, trigger_source, session_id)
            VALUES (?, ?, ?, ?, ?)
        ''', ('/', 'INITIALIZE', json.dumps({'imported_count': imported_count}), 
              'import', 'init_' + datetime.now().strftime('%Y%m%d_%H%M%S')))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Imported {imported_count} directories from existing analysis")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def create_cache():
    """Create initial JSON cache for fast access"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get summary statistics
    cursor.execute('SELECT COUNT(*) FROM directories')
    total_dirs = cursor.fetchone()[0]
    
    cursor.execute('SELECT activity_level, COUNT(*) FROM directories GROUP BY activity_level')
    activity_stats = dict(cursor.fetchall())
    
    cursor.execute('SELECT risk_level, COUNT(*) FROM directories GROUP BY risk_level')
    risk_stats = dict(cursor.fetchall())
    
    cursor.execute('SELECT AVG(governance_score) FROM directories WHERE governance_score > 0')
    avg_governance = cursor.fetchone()[0] or 0
    
    cache_data = {
        'last_updated': datetime.now().isoformat(),
        'statistics': {
            'total_directories': total_dirs,
            'activity_levels': activity_stats,
            'risk_levels': risk_stats,
            'average_governance_score': round(avg_governance, 1)
        },
        'status': 'initialized',
        'db_path': DB_PATH
    }
    
    with open(CACHE_PATH, 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    conn.close()
    print(f"✅ Cache created: {CACHE_PATH}")

def main():
    """Initialize the complete dynamic inventory system"""
    
    print("🏗️ DYNAMIC IDP INVENTORY INITIALIZATION")
    print("=====================================")
    
    # Step 1: Initialize database
    print("\n📋 Step 1: Initializing database...")
    if init_database():
        print("   Database schema created successfully")
    else:
        print("   ❌ Database initialization failed")
        return False
    
    # Step 2: Import existing data  
    print("\n📊 Step 2: Importing existing analysis...")
    if import_existing_analysis():
        print("   Historical data imported successfully")
    else:
        print("   ⚠️ No historical data imported (starting fresh)")
    
    # Step 3: Create cache
    print("\n🔄 Step 3: Creating performance cache...")
    create_cache()
    
    print("\n✅ DYNAMIC INVENTORY SYSTEM READY")
    print("=================================")
    print(f"Database: {DB_PATH}")
    print(f"Cache: {CACHE_PATH}")
    print("\nNext steps:")
    print("1. Run filesystem watcher: python3 filesystem-watcher.py")
    print("2. Start MCP server: node inventory-mcp-server/")
    print("3. Test agent integration: inventory-cli.py status")
    
    return True

if __name__ == "__main__":
    main()