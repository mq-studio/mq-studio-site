#!/bin/bash
# Universal Governance Optimization Rollback Script
# Works with any backup created by optimization scripts

set -e

# Configuration
FORCE=false
VERBOSE=false

# Parse command line arguments
while getopts "fvh" opt; do
    case $opt in
        f) FORCE=true ;;
        v) VERBOSE=true ;;
        h) 
            echo "Universal Governance Optimization Rollback"
            echo ""
            echo "Usage: $0 [OPTIONS] [BACKUP_DIRECTORY]"
            echo ""
            echo "Options:"
            echo "  -f    Force rollback without confirmation prompts"
            echo "  -v    Verbose output"
            echo "  -h    Show this help message"
            echo ""
            echo "Arguments:"
            echo "  BACKUP_DIRECTORY    Path to backup directory (optional - will auto-detect latest)"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Auto-detect latest backup"
            echo "  $0 /path/to/backup                   # Use specific backup"
            echo "  $0 -f                                # Force rollback latest backup"
            echo "  $0 -v /path/to/backup                # Verbose rollback specific backup"
            exit 0
            ;;
        \?) 
            echo "Invalid option: -$OPTARG" >&2
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

shift $((OPTIND-1))

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - [VERBOSE] $1"
    fi
}

echo "🔄 Universal Governance Optimization Rollback"
echo "============================================="

# Determine backup directory
if [ -n "$1" ]; then
    BACKUP_DIR="$1"
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "❌ Error: Specified backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    log "Using specified backup: $BACKUP_DIR"
else
    # Auto-detect latest backup
    BACKUP_ROOT="/home/ichardart/code/infra/data/backups"
    if [ ! -d "$BACKUP_ROOT" ]; then
        echo "❌ Error: Backup root directory not found: $BACKUP_ROOT"
        echo "No backups available for rollback."
        exit 1
    fi
    
    BACKUP_DIR=$(ls -td "$BACKUP_ROOT"/governance_optimization_* 2>/dev/null | head -1)
    if [ -z "$BACKUP_DIR" ]; then
        echo "❌ Error: No governance optimization backups found in $BACKUP_ROOT"
        echo "Available backups:"
        ls -la "$BACKUP_ROOT" 2>/dev/null || echo "  (none)"
        exit 1
    fi
    
    log "Auto-detected latest backup: $BACKUP_DIR"
fi

# Validate backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory not accessible: $BACKUP_DIR"
    exit 1
fi

# Count files in backup
BACKUP_FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
log "Backup contains $BACKUP_FILE_COUNT files"

if [ "$BACKUP_FILE_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: Backup directory is empty"
    if [ "$FORCE" != true ]; then
        read -p "Continue anyway? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            echo "Rollback aborted."
            exit 0
        fi
    fi
fi

# Show backup information
echo ""
echo "📋 Backup Information:"
echo "   Directory: $BACKUP_DIR"
echo "   File count: $BACKUP_FILE_COUNT"
echo "   Created: $(stat -c %y "$BACKUP_DIR" 2>/dev/null || echo "unknown")"
echo ""

# Detect target governance structure to remove
TARGET_GOVERNANCE_ROOT="/home/ichardart/idp-projects/idp-governance"

if [ -d "$TARGET_GOVERNANCE_ROOT" ]; then
    CONSOLIDATED_FILE_COUNT=$(find "$TARGET_GOVERNANCE_ROOT" -type f -name "*.meta.json" | wc -l)
    echo "📂 Consolidated Structure:"
    echo "   Directory: $TARGET_GOVERNANCE_ROOT"
    echo "   Metadata files: $CONSOLIDATED_FILE_COUNT"
    echo ""
fi

# Confirmation
if [ "$FORCE" != true ]; then
    echo "⚠️  This will:"
    echo "   ✓ Restore $BACKUP_FILE_COUNT files from backup to original locations"
    if [ -d "$TARGET_GOVERNANCE_ROOT" ]; then
        echo "   ✓ Optionally remove consolidated structure at $TARGET_GOVERNANCE_ROOT"
    fi
    echo "   ✓ Overwrite any existing files with backed up versions"
    echo ""
    read -p "Are you sure you want to proceed with rollback? (y/n): " CONFIRM
    
    if [ "$CONFIRM" != "y" ]; then
        echo "Rollback aborted."
        exit 0
    fi
fi

log "🔄 Beginning rollback process..."

# Phase 1: Restore files from backup
log "📁 Phase 1: Restoring files from backup..."

RESTORED_COUNT=0
FAILED_COUNT=0

cd "$BACKUP_DIR"
find . -type f | while read file; do
    # Remove leading ./
    rel_path="${file#./}"
    target_path="/home/ichardart/$rel_path"
    target_dir=$(dirname "$target_path")
    
    log_verbose "Restoring: $rel_path"
    
    # Create target directory if needed
    if ! mkdir -p "$target_dir" 2>/dev/null; then
        echo "⚠️  Failed to create directory: $target_dir"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi
    
    # Copy file
    if cp "$file" "$target_path" 2>/dev/null; then
        RESTORED_COUNT=$((RESTORED_COUNT + 1))
        log_verbose "  ✓ Restored: $target_path"
    else
        echo "⚠️  Failed to restore: $target_path"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

log "✅ File restoration complete"
echo "   Restored: $RESTORED_COUNT files"
if [ "$FAILED_COUNT" -gt 0 ]; then
    echo "   Failed: $FAILED_COUNT files"
fi

# Phase 2: Handle consolidated structure
if [ -d "$TARGET_GOVERNANCE_ROOT" ]; then
    echo ""
    log "🗑️  Phase 2: Handling consolidated structure..."
    
    if [ "$FORCE" != true ]; then
        echo "The consolidated governance structure still exists at:"
        echo "  $TARGET_GOVERNANCE_ROOT"
        echo ""
        echo "Options:"
        echo "  1. Remove it completely (recommended for full rollback)"
        echo "  2. Keep it as backup/reference"
        echo "  3. Skip this step"
        echo ""
        read -p "Choose option (1/2/3): " REMOVE_OPTION
    else
        REMOVE_OPTION="1"
    fi
    
    case "$REMOVE_OPTION" in
        1)
            log "Removing consolidated structure..."
            if rm -rf "$TARGET_GOVERNANCE_ROOT" 2>/dev/null; then
                log "✅ Consolidated structure removed"
            else
                echo "⚠️  Failed to remove consolidated structure"
                echo "You may need to remove it manually: $TARGET_GOVERNANCE_ROOT"
            fi
            ;;
        2)
            RENAMED_DIR="${TARGET_GOVERNANCE_ROOT}_backup_$(date +%Y%m%d_%H%M%S)"
            log "Renaming consolidated structure to: $RENAMED_DIR"
            if mv "$TARGET_GOVERNANCE_ROOT" "$RENAMED_DIR" 2>/dev/null; then
                log "✅ Consolidated structure preserved as backup"
            else
                echo "⚠️  Failed to rename consolidated structure"
            fi
            ;;
        3)
            log "Skipping consolidated structure removal"
            ;;
        *)
            echo "⚠️  Invalid option. Skipping consolidated structure removal"
            ;;
    esac
else
    log "No consolidated structure found to remove"
fi

# Phase 3: Verification
echo ""
log "🔍 Phase 3: Verification..."

# Check if key governance files are back in place
KEY_FILES=(
    "/home/ichardart/code/infra/dev-env-docs/OPERATING_RULES.md"
    "/home/ichardart/code/CLAUDE.md"
    "/home/ichardart/code/infra/dev-env-docs/OSAA_DIRECTIVE.md"
)

VERIFICATION_PASSED=true
for key_file in "${KEY_FILES[@]}"; do
    if [ -f "$key_file" ]; then
        log_verbose "✓ Verified: $key_file"
    else
        echo "⚠️  Missing key file: $key_file"
        VERIFICATION_PASSED=false
    fi
done

if [ "$VERIFICATION_PASSED" = true ]; then
    log "✅ Key governance files verification passed"
else
    echo "⚠️  Some key governance files are missing"
    echo "This may indicate an incomplete rollback"
fi

# Summary
echo ""
echo "🎉 ROLLBACK COMPLETE!"
echo "===================="
echo ""
echo "📊 Summary:"
echo "   ✓ Backup used: $BACKUP_DIR"
echo "   ✓ Files restored: $RESTORED_COUNT"
if [ "$FAILED_COUNT" -gt 0 ]; then
    echo "   ⚠️  Restore failures: $FAILED_COUNT"
fi
echo "   ✓ Governance files: $([ "$VERIFICATION_PASSED" = true ] && echo "verified" || echo "issues detected")"
echo ""

if [ "$VERIFICATION_PASSED" = true ]; then
    echo "✅ All governance files have been restored to their original locations."
    echo "Your system should now be in the same state as before optimization."
else
    echo "⚠️  Rollback completed with some issues."
    echo "Please verify that your governance system is functioning correctly."
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Test governance functionality (run governance-check.sh)"
echo "   2. Verify git hooks are working correctly"
echo "   3. Check that all expected governance files are present"
echo ""
echo "🗂️  Backup preserved at: $BACKUP_DIR"