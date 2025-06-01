#!/bin/bash
# 🔍 IDP Dynamic Inventory System Activation
# Activates the context-aware filesystem monitoring and inventory tracking
# Version: 1.0.0

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVENTORY_LOG="/home/ichardart/code/infra/logs/inventory-activation-$(date +%Y%m%d).log"
INVENTORY_DB="/home/ichardart/code/infra/data/idp-inventory.db"

# Logging functions
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $*" | tee -a "$INVENTORY_LOG"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$INVENTORY_LOG"
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*" | tee -a "$INVENTORY_LOG"
}

# Check and install dependencies
check_dependencies() {
    log_info "Checking inventory system dependencies"
    
    # Check for Python 3
    if ! command -v python3 >/dev/null 2>&1; then
        log_error "Python 3 not found"
        return 1
    fi
    
    # Check for required Python packages
    local required_packages=("watchdog" "sqlite3")
    local missing_packages=()
    
    for package in "${required_packages[@]}"; do
        if ! python3 -c "import $package" 2>/dev/null; then
            missing_packages+=("$package")
        fi
    done
    
    if [[ ${#missing_packages[@]} -gt 0 ]]; then
        log_info "Installing missing Python packages: ${missing_packages[*]}"
        if [[ " ${missing_packages[*]} " == *" watchdog "* ]]; then
            pip3 install watchdog
        fi
    fi
    
    log_success "Dependencies verified"
    return 0
}

# Initialize inventory database
init_inventory_database() {
    log_info "Initializing inventory database: $INVENTORY_DB"
    
    # Ensure data directory exists
    mkdir -p "$(dirname "$INVENTORY_DB")"
    
    # Create database schema
    python3 << EOF
import sqlite3
import os
from datetime import datetime

db_path = "$INVENTORY_DB"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create projects table
cursor.execute('''
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    governance_level TEXT,
    last_scan TIMESTAMP,
    file_count INTEGER,
    size_bytes INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Create files table
cursor.execute('''
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    extension TEXT,
    size_bytes INTEGER,
    modified_time TIMESTAMP,
    content_type TEXT,
    is_tracked BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
''')

# Create governance_status table
cursor.execute('''
CREATE TABLE IF NOT EXISTS governance_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    compliance_score INTEGER,
    verification_level TEXT,
    last_check TIMESTAMP,
    issues_count INTEGER,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
''')

# Create activity_log table
cursor.execute('''
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    event_type TEXT,
    file_path TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
''')

# Create indexes
cursor.execute('CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_files_path ON files(path)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_activity_project_id ON activity_log(project_id)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp)')

conn.commit()
conn.close()

print("Database initialized successfully")
EOF

    if [[ $? -eq 0 ]]; then
        log_success "Inventory database initialized"
    else
        log_error "Failed to initialize inventory database"
        return 1
    fi
    
    return 0
}

# Create filesystem watcher
create_filesystem_watcher() {
    log_info "Creating filesystem watcher service"
    
    cat > "/home/ichardart/code/infra/tools/filesystem-watcher.py" << 'EOF'
#!/usr/bin/env python3
"""
IDP Filesystem Watcher
Monitors governance-enabled directories for real-time inventory updates
"""

import os
import sys
import time
import sqlite3
import logging
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration
INVENTORY_DB = "/home/ichardart/code/infra/data/idp-inventory.db"
WATCH_PATHS = [
    "/home/ichardart/code",
    "/home/ichardart/idp-projects"
]
LOG_FILE = "/home/ichardart/code/infra/logs/filesystem-watcher.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

class IDPFileSystemEventHandler(FileSystemEventHandler):
    def __init__(self):
        self.db_path = INVENTORY_DB
        
    def get_project_id(self, file_path):
        """Get project ID for a file path"""
        path = Path(file_path)
        
        # Walk up directory tree to find project root
        for parent in [path] + list(path.parents):
            if (parent / '.idp_project_root').exists() or (parent / 'manifest.md').exists():
                return str(parent)
        
        # Default to nearest governed directory
        for watch_path in WATCH_PATHS:
            if file_path.startswith(watch_path):
                return watch_path
                
        return None
    
    def log_activity(self, event_type, file_path, description=""):
        """Log activity to database"""
        try:
            project_path = self.get_project_id(file_path)
            if not project_path:
                return
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get or create project
            cursor.execute(
                "SELECT id FROM projects WHERE path = ?", 
                (project_path,)
            )
            result = cursor.fetchone()
            
            if result:
                project_id = result[0]
            else:
                # Create new project entry
                project_name = os.path.basename(project_path)
                cursor.execute(
                    "INSERT INTO projects (path, name, type, governance_level, last_scan) VALUES (?, ?, ?, ?, ?)",
                    (project_path, project_name, "auto-detected", "federated", datetime.now())
                )
                project_id = cursor.lastrowid
            
            # Log activity
            cursor.execute(
                "INSERT INTO activity_log (project_id, event_type, file_path, description) VALUES (?, ?, ?, ?)",
                (project_id, event_type, file_path, description)
            )
            
            conn.commit()
            conn.close()
            
            logging.info(f"Logged {event_type}: {file_path}")
            
        except Exception as e:
            logging.error(f"Failed to log activity: {e}")
    
    def on_created(self, event):
        if not event.is_directory:
            self.log_activity("FILE_CREATED", event.src_path, "New file created")
    
    def on_deleted(self, event):
        if not event.is_directory:
            self.log_activity("FILE_DELETED", event.src_path, "File deleted")
    
    def on_modified(self, event):
        if not event.is_directory:
            # Avoid logging too frequently for the same file
            self.log_activity("FILE_MODIFIED", event.src_path, "File modified")
    
    def on_moved(self, event):
        if not event.is_directory:
            self.log_activity("FILE_MOVED", event.dest_path, f"Moved from {event.src_path}")

def main():
    logging.info("Starting IDP Filesystem Watcher")
    
    # Check database exists
    if not os.path.exists(INVENTORY_DB):
        logging.error(f"Inventory database not found: {INVENTORY_DB}")
        sys.exit(1)
    
    # Set up file system monitoring
    event_handler = IDPFileSystemEventHandler()
    observer = Observer()
    
    for watch_path in WATCH_PATHS:
        if os.path.exists(watch_path):
            observer.schedule(event_handler, watch_path, recursive=True)
            logging.info(f"Watching: {watch_path}")
    
    observer.start()
    logging.info("Filesystem watcher started")
    
    try:
        while True:
            time.sleep(60)  # Check every minute
            logging.debug("Filesystem watcher heartbeat")
    except KeyboardInterrupt:
        logging.info("Stopping filesystem watcher")
        observer.stop()
    
    observer.join()
    logging.info("Filesystem watcher stopped")

if __name__ == "__main__":
    main()
EOF

    chmod +x "/home/ichardart/code/infra/tools/filesystem-watcher.py"
    log_success "Created filesystem watcher service"
    
    return 0
}

# Create inventory query tools
create_inventory_tools() {
    log_info "Creating inventory query tools"
    
    cat > "/home/ichardart/code/infra/tools/query-inventory.py" << 'EOF'
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
EOF

    chmod +x "/home/ichardart/code/infra/tools/query-inventory.py"
    log_success "Created inventory query tools"
    
    return 0
}

# Start inventory services
start_inventory_services() {
    log_info "Starting inventory services"
    
    # Kill any existing watcher processes
    pkill -f "filesystem-watcher.py" 2>/dev/null || true
    
    # Start filesystem watcher in background
    nohup python3 "/home/ichardart/code/infra/tools/filesystem-watcher.py" > "/home/ichardart/code/infra/logs/filesystem-watcher-startup.log" 2>&1 &
    local watcher_pid=$!
    
    # Wait a moment and check if it started successfully
    sleep 3
    if kill -0 $watcher_pid 2>/dev/null; then
        log_success "Filesystem watcher started (PID: $watcher_pid)"
        echo $watcher_pid > "/home/ichardart/code/infra/data/filesystem-watcher.pid"
    else
        log_error "Filesystem watcher failed to start"
        return 1
    fi
    
    return 0
}

# Test inventory system
test_inventory_system() {
    log_info "Testing inventory system functionality"
    
    # Test 1: Database accessibility
    if ! python3 -c "import sqlite3; sqlite3.connect('$INVENTORY_DB').close()"; then
        log_error "Test failed: Database not accessible"
        return 1
    fi
    
    # Test 2: Query tools
    if ! python3 "/home/ichardart/code/infra/tools/query-inventory.py" projects >/dev/null 2>&1; then
        log_error "Test failed: Query tools not working"
        return 1
    fi
    
    # Test 3: Filesystem watcher running
    if [[ ! -f "/home/ichardart/code/infra/data/filesystem-watcher.pid" ]]; then
        log_error "Test failed: Filesystem watcher not running"
        return 1
    fi
    
    local watcher_pid=$(cat "/home/ichardart/code/infra/data/filesystem-watcher.pid")
    if ! kill -0 $watcher_pid 2>/dev/null; then
        log_error "Test failed: Filesystem watcher process not found"
        return 1
    fi
    
    log_success "All inventory system tests passed"
    return 0
}

# Main activation function
activate_inventory_system() {
    log_info "Activating IDP Dynamic Inventory System"
    
    # Step 1: Check dependencies
    if ! check_dependencies; then
        log_error "Dependency check failed"
        return 1
    fi
    
    # Step 2: Initialize database
    if ! init_inventory_database; then
        log_error "Database initialization failed"
        return 1
    fi
    
    # Step 3: Create filesystem watcher
    if ! create_filesystem_watcher; then
        log_error "Filesystem watcher creation failed"
        return 1
    fi
    
    # Step 4: Create inventory tools
    if ! create_inventory_tools; then
        log_error "Inventory tools creation failed"
        return 1
    fi
    
    # Step 5: Start services
    if ! start_inventory_services; then
        log_error "Service startup failed"
        return 1
    fi
    
    # Step 6: Test system
    if ! test_inventory_system; then
        log_error "System tests failed"
        return 1
    fi
    
    log_success "IDP Dynamic Inventory System activated successfully"
    log_info "Inventory database: $INVENTORY_DB"
    log_info "Query tool: /home/ichardart/code/infra/tools/query-inventory.py"
    log_info "Watcher logs: /home/ichardart/code/infra/logs/filesystem-watcher.log"
    
    return 0
}

# Usage information
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  activate    - Activate the inventory system (default)"
    echo "  status      - Check inventory system status"
    echo "  stop        - Stop inventory services"
    echo "  restart     - Restart inventory services"
}

# Main execution
case "${1:-activate}" in
    "activate")
        activate_inventory_system
        ;;
    "status")
        if [[ -f "/home/ichardart/code/infra/data/filesystem-watcher.pid" ]]; then
            local pid=$(cat "/home/ichardart/code/infra/data/filesystem-watcher.pid")
            if kill -0 $pid 2>/dev/null; then
                echo "Inventory system running (PID: $pid)"
            else
                echo "Inventory system not running (stale PID file)"
            fi
        else
            echo "Inventory system not running"
        fi
        ;;
    "stop")
        if [[ -f "/home/ichardart/code/infra/data/filesystem-watcher.pid" ]]; then
            local pid=$(cat "/home/ichardart/code/infra/data/filesystem-watcher.pid")
            kill $pid 2>/dev/null || true
            rm -f "/home/ichardart/code/infra/data/filesystem-watcher.pid"
            echo "Inventory system stopped"
        fi
        ;;
    "restart")
        $0 stop
        sleep 2
        $0 activate
        ;;
    *)
        usage
        exit 1
        ;;
esac