#!/usr/bin/env python3
"""
Simple IDP Inventory Tracker
Basic inventory system without external dependencies
"""

import os
import sys
import sqlite3
import json
from datetime import datetime
from pathlib import Path

INVENTORY_DB = "/home/ichardart/code/infra/data/idp-inventory.db"

def scan_projects():
    """Scan for projects and update inventory"""
    watch_paths = [
        "/home/ichardart/code",
        "/home/ichardart/idp-projects"
    ]
    
    conn = sqlite3.connect(INVENTORY_DB)
    cursor = conn.cursor()
    
    for base_path in watch_paths:
        if not os.path.exists(base_path):
            continue
            
        for root, dirs, files in os.walk(base_path):
            # Skip deep node_modules scanning
            if 'node_modules' in root and root.count('node_modules') > 1:
                continue
                
            # Check for project markers
            project_markers = ['.idp_project_root', 'manifest.md', 'package.json', 'go.mod']
            has_marker = any(os.path.exists(os.path.join(root, marker)) for marker in project_markers)
            
            if has_marker:
                project_name = os.path.basename(root)
                file_count = len(files)
                
                # Calculate directory size
                total_size = 0
                for file in files:
                    try:
                        total_size += os.path.getsize(os.path.join(root, file))
                    except:
                        pass
                
                # Determine project type
                project_type = "unknown"
                if os.path.exists(os.path.join(root, 'package.json')):
                    project_type = "nodejs"
                elif os.path.exists(os.path.join(root, 'go.mod')):
                    project_type = "golang"
                elif os.path.exists(os.path.join(root, '.idp_project_root')):
                    project_type = "idp_project"
                
                # Determine governance level
                governance_level = "basic"
                if os.path.exists(os.path.join(root, '.governance')):
                    governance_level = "federated"
                elif root.startswith("/home/ichardart/code"):
                    governance_level = "core"
                
                # Insert or update project
                cursor.execute("""
                    INSERT OR REPLACE INTO projects 
                    (path, name, type, governance_level, last_scan, file_count, size_bytes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (root, project_name, project_type, governance_level, datetime.now(), file_count, total_size))
                
                print(f"Tracked: {project_name} ({project_type}, {governance_level})")
    
    conn.commit()
    conn.close()
    print("Project scan complete")

def get_context(path):
    """Get project context for a path"""
    conn = sqlite3.connect(INVENTORY_DB)
    cursor = conn.cursor()
    
    # Find closest project
    cursor.execute("""
        SELECT path, name, type, governance_level, file_count, size_bytes
        FROM projects
        WHERE ? LIKE path || '%'
        ORDER BY LENGTH(path) DESC
        LIMIT 1
    """, (path,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            'project_path': result[0],
            'project_name': result[1],
            'project_type': result[2],
            'governance_level': result[3],
            'file_count': result[4],
            'size_bytes': result[5]
        }
    return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "scan":
            scan_projects()
        elif sys.argv[1] == "context" and len(sys.argv) > 2:
            context = get_context(sys.argv[2])
            print(json.dumps(context, indent=2))
    else:
        scan_projects()