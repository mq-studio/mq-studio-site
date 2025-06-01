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
