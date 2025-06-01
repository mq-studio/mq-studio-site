#!/usr/bin/env python3
"""
IDP Inventory Query Tool
Provides real-time inventory information for agents and users
"""

import sqlite3
import sys
import json
from datetime import datetime, timedelta

INVENTORY_DB = "/home/ichardart/code/infra/data/idp-inventory.db"

def get_projects():
    """Get all tracked projects"""
    conn = sqlite3.connect(INVENTORY_DB)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT p.path, p.name, p.type, p.governance_level, p.file_count, 
               g.compliance_score, g.verification_level, g.status
        FROM projects p
        LEFT JOIN governance_status g ON p.id = g.project_id
        WHERE p.is_active = 1
        ORDER BY p.name
    """)
    
    projects = []
    for row in cursor.fetchall():
        projects.append({
            'path': row[0],
            'name': row[1],
            'type': row[2],
            'governance_level': row[3],
            'file_count': row[4],
            'compliance_score': row[5],
            'verification_level': row[6],
            'status': row[7]
        })
    
    conn.close()
    return projects

def get_recent_activity(hours=24):
    """Get recent filesystem activity"""
    conn = sqlite3.connect(INVENTORY_DB)
    cursor = conn.cursor()
    
    since = datetime.now() - timedelta(hours=hours)
    
    cursor.execute("""
        SELECT a.timestamp, a.event_type, a.file_path, a.description, p.name
        FROM activity_log a
        JOIN projects p ON a.project_id = p.id
        WHERE a.timestamp > ?
        ORDER BY a.timestamp DESC
        LIMIT 100
    """, (since,))
    
    activities = []
    for row in cursor.fetchall():
        activities.append({
            'timestamp': row[0],
            'event_type': row[1],
            'file_path': row[2],
            'description': row[3],
            'project_name': row[4]
        })
    
    conn.close()
    return activities

def get_project_context(path):
    """Get detailed context for a specific project path"""
    conn = sqlite3.connect(INVENTORY_DB)
    cursor = conn.cursor()
    
    # Find project containing this path
    cursor.execute("""
        SELECT id, path, name, type, governance_level, file_count, size_bytes
        FROM projects
        WHERE ? LIKE path || '%'
        ORDER BY LENGTH(path) DESC
        LIMIT 1
    """, (path,))
    
    result = cursor.fetchone()
    if not result:
        conn.close()
        return None
    
    project_id, project_path, name, ptype, governance_level, file_count, size_bytes = result
    
    # Get governance status
    cursor.execute("""
        SELECT compliance_score, verification_level, last_check, issues_count, status
        FROM governance_status
        WHERE project_id = ?
        ORDER BY last_check DESC
        LIMIT 1
    """, (project_id,))
    
    governance_row = cursor.fetchone()
    governance = {}
    if governance_row:
        governance = {
            'compliance_score': governance_row[0],
            'verification_level': governance_row[1],
            'last_check': governance_row[2],
            'issues_count': governance_row[3],
            'status': governance_row[4]
        }
    
    # Get recent activity
    cursor.execute("""
        SELECT timestamp, event_type, file_path, description
        FROM activity_log
        WHERE project_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
    """, (project_id,))
    
    recent_activity = []
    for row in cursor.fetchall():
        recent_activity.append({
            'timestamp': row[0],
            'event_type': row[1],
            'file_path': row[2],
            'description': row[3]
        })
    
    conn.close()
    
    return {
        'project': {
            'id': project_id,
            'path': project_path,
            'name': name,
            'type': ptype,
            'governance_level': governance_level,
            'file_count': file_count,
            'size_bytes': size_bytes
        },
        'governance': governance,
        'recent_activity': recent_activity
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: query-inventory.py <command> [args]")
        print("Commands:")
        print("  projects              - List all projects")
        print("  activity [hours]      - Recent activity (default: 24 hours)")
        print("  context <path>        - Project context for path")
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "projects":
            projects = get_projects()
            print(json.dumps(projects, indent=2))
        
        elif command == "activity":
            hours = int(sys.argv[2]) if len(sys.argv) > 2 else 24
            activity = get_recent_activity(hours)
            print(json.dumps(activity, indent=2))
        
        elif command == "context":
            if len(sys.argv) < 3:
                print("Error: path required for context command")
                sys.exit(1)
            path = sys.argv[2]
            context = get_project_context(path)
            if context:
                print(json.dumps(context, indent=2))
            else:
                print(json.dumps({"error": "No project found for path"}))
        
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
