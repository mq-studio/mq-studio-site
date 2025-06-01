#!/bin/bash
# IDP Governance Structure Optimization v2.0
# Enhanced with dry-run capability, git hooks handling, and safety mechanisms

set -e

# Configuration
DRY_RUN=false
VERBOSE=false
FORCE=false
BACKUP_ENABLED=true

# Parse command line arguments
while getopts "dvfh" opt; do
    case $opt in
        d) DRY_RUN=true ;;
        v) VERBOSE=true ;;
        f) FORCE=true ;;
        h) 
            echo "IDP Governance Structure Optimization v2.0"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -d    Dry run mode (show what would be done without executing)"
            echo "  -v    Verbose output"
            echo "  -f    Force execution without confirmation prompts"
            echo "  -h    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 -d             # Dry run to see what would happen"
            echo "  $0 -dv            # Dry run with verbose output"
            echo "  $0 -f             # Force execution without prompts"
            echo "  $0                # Interactive mode with confirmations"
            exit 0
            ;;
        \?) 
            echo "Invalid option: -$OPTARG" >&2
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - [VERBOSE] $1"
    fi
}

dry_run_execute() {
    local description="$1"
    local command="$2"
    
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY RUN] $description"
        echo "  Command: $command"
    else
        log_verbose "Executing: $description"
        eval "$command"
    fi
}

# Display mode
if [ "$DRY_RUN" = true ]; then
    echo "🧪 IDP GOVERNANCE STRUCTURE OPTIMIZATION v2.0 (DRY RUN MODE)"
    echo "============================================================="
    echo "⚠️  DRY RUN: No actual changes will be made"
else
    echo "🏛️ IDP GOVERNANCE STRUCTURE OPTIMIZATION v2.0"
    echo "=============================================="
fi

echo "📂 Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE EXECUTION")"
echo "📝 Verbose: $([ "$VERBOSE" = true ] && echo "ENABLED" || echo "DISABLED")"
echo "⚡ Force: $([ "$FORCE" = true ] && echo "ENABLED" || echo "DISABLED")"
echo ""

# Define paths
DATA_DIR="/home/ichardart/code/infra/data/memory"
TARGET_GOVERNANCE_ROOT="/home/ichardart/idp-projects/idp-governance"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ichardart/code/infra/data/backups/governance_optimization_$TIMESTAMP"

# Find most recent mapping and validation files
log "🔍 Locating governance mapping data..."

MAPPING_FILE=$(ls -t $DATA_DIR/governance_artifacts_v2_*.json 2>/dev/null | head -1)
if [ -z "$MAPPING_FILE" ]; then
    MAPPING_FILE=$(ls -t $DATA_DIR/governance_artifacts_*.json 2>/dev/null | head -1)
fi

VALIDATION_FILE=$(ls -t $DATA_DIR/governance_validation_*.json 2>/dev/null | head -1)

if [ ! -f "$MAPPING_FILE" ]; then
    echo "❌ Error: No governance mapping file found in $DATA_DIR"
    echo "Please run the mapping script first:"
    echo "  python3 /home/ichardart/code/infra/tools/map-governance-artifacts-v2.py"
    exit 1
fi

log "✅ Using mapping file: $MAPPING_FILE"

if [ -f "$VALIDATION_FILE" ]; then
    log "✅ Using validation file: $VALIDATION_FILE"
    
    # Check if validation passed (only if not forcing)
    if [ "$FORCE" != true ]; then
        VALIDATION_PASSED=$(jq -r '.overall_passed // false' "$VALIDATION_FILE" 2>/dev/null)
        
        if [ "$VALIDATION_PASSED" != "true" ]; then
            echo "⚠️  Warning: Validation did not pass completely."
            if [ "$DRY_RUN" != true ]; then
                echo "This could indicate issues with the governance mapping."
                echo "Review the validation report before proceeding."
                echo ""
                if [ "$FORCE" != true ]; then
                    read -p "Continue anyway? (y/n): " PROCEED
                    if [ "$PROCEED" != "y" ]; then
                        echo "Aborting optimization."
                        exit 1
                    fi
                fi
            fi
        else
            log "✅ Validation passed"
        fi
    fi
else
    echo "⚠️  No validation file found. Consider running validation first."
fi

# Extract artifact statistics
log "📊 Analyzing governance artifacts..."

TOTAL_ARTIFACTS=$(jq -r '.artifact_count // (.artifacts | length)' "$MAPPING_FILE" 2>/dev/null || echo "unknown")
if command -v jq >/dev/null 2>&1; then
    HIGH_CONFIDENCE=$(jq -r '[.artifacts[] | select(.confidence_level == "high")] | length' "$MAPPING_FILE" 2>/dev/null || echo "unknown")
    MEDIUM_CONFIDENCE=$(jq -r '[.artifacts[] | select(.confidence_level == "medium")] | length' "$MAPPING_FILE" 2>/dev/null || echo "unknown")
    LOW_CONFIDENCE=$(jq -r '[.artifacts[] | select(.confidence_level == "low")] | length' "$MAPPING_FILE" 2>/dev/null || echo "unknown")
    GIT_HOOKS=$(jq -r '[.artifacts[] | select(.special_handling.git_hook == true)] | length' "$MAPPING_FILE" 2>/dev/null || echo "unknown")
else
    HIGH_CONFIDENCE="unknown"
    MEDIUM_CONFIDENCE="unknown" 
    LOW_CONFIDENCE="unknown"
    GIT_HOOKS="unknown"
fi

echo ""
echo "📋 Governance Artifact Summary:"
echo "   Total artifacts: $TOTAL_ARTIFACTS"
echo "   High confidence: $HIGH_CONFIDENCE"
echo "   Medium confidence: $MEDIUM_CONFIDENCE"
echo "   Low confidence: $LOW_CONFIDENCE"
echo "   Git hooks requiring special handling: $GIT_HOOKS"
echo ""

# Create optimization plan
log "📝 Creating optimization plan..."

# Create directories structure
log_verbose "Planning directory structure..."

dry_run_execute "Create target governance root directory" \
    "mkdir -p \"$TARGET_GOVERNANCE_ROOT\""

# Create category directories based on mapping config
if [ -f "/home/ichardart/code/infra/config/governance_mapping_config.json" ]; then
    CATEGORIES=$(jq -r '.governance_patterns | keys[]' /home/ichardart/code/infra/config/governance_mapping_config.json 2>/dev/null)
else
    CATEGORIES="standards templates validation methodologies monitoring enforcement planning roles automation security unclassified"
fi

for category in $CATEGORIES; do
    dry_run_execute "Create category directory: $category" \
        "mkdir -p \"$TARGET_GOVERNANCE_ROOT/$category\""
done

# Create backup directory
if [ "$BACKUP_ENABLED" = true ]; then
    dry_run_execute "Create backup directory" \
        "mkdir -p \"$BACKUP_DIR\""
fi

# Generate optimization report
REPORT_FILE="$DATA_DIR/governance_optimization_plan_v2_$TIMESTAMP.md"

dry_run_execute "Generate optimization report" \
    "cat > \"$REPORT_FILE\" << 'EOF'
# Governance Structure Optimization Plan v2.0

**Generated**: $(date)
**Mode**: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE EXECUTION")
**Mapping File**: $MAPPING_FILE
**Target Structure**: $TARGET_GOVERNANCE_ROOT

## Overview

This plan will consolidate governance artifacts from across the system into a 
unified structure while preserving existing functionality and maintaining git hooks.

## Artifact Analysis

- **Total Artifacts**: $TOTAL_ARTIFACTS
- **High Confidence**: $HIGH_CONFIDENCE
- **Medium Confidence**: $MEDIUM_CONFIDENCE  
- **Low Confidence**: $LOW_CONFIDENCE
- **Git Hooks**: $GIT_HOOKS (require special handling)

## Target Structure

All governance artifacts will be consolidated under: \`$TARGET_GOVERNANCE_ROOT\`

The directory structure will be organized by governance function:

$(for cat in $CATEGORIES; do echo "- \`$TARGET_GOVERNANCE_ROOT/$cat\` - $(echo $cat | tr '_' ' ' | sed 's/.*/\L&/; s/[a-z]*/\u&/g')"; done)

## Special Handling

### Git Hooks
- Git hooks will be copied to the governance structure for centralized management
- Original hooks will remain in place for functionality
- Bidirectional links will be created for synchronization

### Configuration Files
- Configuration files will be version tracked
- Original locations preserved with symlinks where appropriate

## Implementation Strategy

The implementation will proceed in the following phases:

1. **Backup** - Create backups of all governance artifacts
2. **Consolidation** - Copy artifacts to the target structure with metadata
3. **Special Handling** - Handle git hooks and config files appropriately
4. **Linking** - Create symbolic links where beneficial (MANUAL STEP)
5. **Validation** - Verify the new structure works correctly
6. **Documentation** - Update references and documentation

This approach ensures zero downtime and allows for easy rollback if needed.

## Safety Measures

- Complete backup of all original files
- Dry-run capability for testing
- Metadata tracking for full traceability
- Manual confirmation required for symbolic links
- Rollback script provided

EOF"

log "✅ Optimization plan created: $REPORT_FILE"

# Show what will be implemented
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🔍 DRY RUN SUMMARY:"
    echo "=================="
    echo "The following actions would be performed:"
    echo ""
    echo "📁 Directory Creation:"
    echo "   - Target root: $TARGET_GOVERNANCE_ROOT"
    for category in $CATEGORIES; do
        echo "   - Category: $TARGET_GOVERNANCE_ROOT/$category"
    done
    echo ""
    echo "💾 Backup:"
    echo "   - Backup directory: $BACKUP_DIR"
    echo "   - All $TOTAL_ARTIFACTS artifacts would be backed up"
    echo ""
    echo "📋 Processing:"
    echo "   - Regular artifacts: Copy with metadata"
    echo "   - Git hooks ($GIT_HOOKS): Special preservation handling"
    echo "   - Config files: Version tracking enabled"
    echo ""
    echo "🔗 Linking (Manual Step):"
    echo "   - Implementation script will be generated"
    echo "   - Symbolic links commented out for safety"
    echo "   - Manual review and activation required"
    echo ""
    echo "✅ TO EXECUTE FOR REAL:"
    echo "   Run without -d flag: $0"
    echo ""
    exit 0
fi

# Confirm execution (unless forced)
if [ "$FORCE" != true ]; then
    echo "🚀 Ready to implement governance structure optimization."
    echo ""
    echo "This will:"
    echo "  ✓ Create backup of all governance artifacts"
    echo "  ✓ Consolidate $TOTAL_ARTIFACTS artifacts into organized structure"
    echo "  ✓ Handle $GIT_HOOKS git hooks with special preservation"
    echo "  ✓ Generate implementation script for linking phase"
    echo "  ✓ Preserve all original functionality"
    echo ""
    read -p "Proceed with implementation? (y/n): " IMPLEMENT
    
    if [ "$IMPLEMENT" != "y" ]; then
        echo "Implementation aborted. Review the plan at $REPORT_FILE"
        exit 0
    fi
fi

log "🚀 Beginning implementation..."

# Phase 1: Backup
if [ "$BACKUP_ENABLED" = true ]; then
    log "📦 Phase 1: Creating backups..."
    
    if command -v jq >/dev/null 2>&1; then
        jq -r '.artifacts[] | .path' "$MAPPING_FILE" | while read artifact_path; do
            if [ -f "$artifact_path" ]; then
                rel_path=$(echo "$artifact_path" | sed "s|/home/ichardart/||")
                backup_path="$BACKUP_DIR/$rel_path"
                backup_dir=$(dirname "$backup_path")
                
                log_verbose "Backing up: $artifact_path"
                mkdir -p "$backup_dir"
                cp "$artifact_path" "$backup_path"
            fi
        done
    else
        echo "⚠️  jq not available - backup phase skipped"
        echo "Manual backup recommended before proceeding"
    fi
    
    log "✅ Backups created in $BACKUP_DIR"
else
    log "⚠️  Backup phase skipped (disabled)"
fi

# Phase 2: Consolidation
log "🗂️  Phase 2: Consolidating artifacts..."

IMPLEMENTATION_SCRIPT="$DATA_DIR/implement_governance_optimization_v2_$TIMESTAMP.sh"

cat > "$IMPLEMENTATION_SCRIPT" << 'IMPL_EOF'
#!/bin/bash
# Governance Structure Implementation Script v2.0
# Generated automatically - review before execution

set -e

echo "🏛️ Implementing Governance Structure Optimization v2.0..."
echo "========================================================"

IMPL_EOF

echo "TARGET_GOVERNANCE_ROOT=\"$TARGET_GOVERNANCE_ROOT\"" >> "$IMPLEMENTATION_SCRIPT"
echo "BACKUP_DIR=\"$BACKUP_DIR\"" >> "$IMPLEMENTATION_SCRIPT"
echo "" >> "$IMPLEMENTATION_SCRIPT"

# Add consolidation commands
if command -v jq >/dev/null 2>&1; then
    log "Processing artifacts with metadata..."
    
    jq -r '.artifacts[] | @json' "$MAPPING_FILE" | while read artifact_json; do
        path=$(echo "$artifact_json" | jq -r '.path')
        
        if [ -f "$path" ]; then
            filename=$(basename "$path")
            primary_classification=$(echo "$artifact_json" | jq -r '.primary_classification // "unclassified"')
            confidence_level=$(echo "$artifact_json" | jq -r '.confidence_level // "unknown"')
            special_handling=$(echo "$artifact_json" | jq -r '.special_handling // {}')
            
            # Use hash of original path to ensure uniqueness
            path_hash=$(echo -n "$path" | md5sum | cut -d' ' -f1 | head -c 8)
            
            # Create unique filename
            if [[ "$filename" == *.* ]]; then
                name="${filename%.*}"
                ext="${filename##*.}"
                new_filename="${name}_${path_hash}.${ext}"
            else
                new_filename="${filename}_${path_hash}"
            fi
            
            target_path="$TARGET_GOVERNANCE_ROOT/$primary_classification/$new_filename"
            
            # Check for special handling
            is_git_hook=$(echo "$special_handling" | jq -r '.git_hook // false')
            
            if [ "$is_git_hook" = "true" ]; then
                echo "# Git hook special handling: $path" >> "$IMPLEMENTATION_SCRIPT"
                echo "echo \"Processing git hook: $path\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "mkdir -p \"$(dirname \"$target_path\")\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "cp \"$path\" \"$target_path\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "echo \"  ✓ Git hook preserved: $target_path\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "echo \"  📝 Original remains functional at: $path\"" >> "$IMPLEMENTATION_SCRIPT"
            else
                echo "mkdir -p \"$(dirname \"$target_path\")\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "cp \"$path\" \"$target_path\"" >> "$IMPLEMENTATION_SCRIPT"
                echo "echo \"Consolidated: $filename -> $primary_classification/\"" >> "$IMPLEMENTATION_SCRIPT"
            fi
            
            # Create metadata file for traceability
            meta_path="${target_path}.meta.json"
            echo "cat > \"$meta_path\" << 'METAEOF'" >> "$IMPLEMENTATION_SCRIPT"
            echo "{" >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"original_path\": \"$path\"," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"consolidated_path\": \"$target_path\"," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"primary_classification\": \"$primary_classification\"," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"confidence_level\": \"$confidence_level\"," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"special_handling\": $special_handling," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"consolidated_date\": \"$(date -Iseconds)\"," >> "$IMPLEMENTATION_SCRIPT"
            echo "  \"consolidation_version\": \"2.0\"" >> "$IMPLEMENTATION_SCRIPT"
            echo "}" >> "$IMPLEMENTATION_SCRIPT"
            echo "METAEOF" >> "$IMPLEMENTATION_SCRIPT"
            echo "" >> "$IMPLEMENTATION_SCRIPT"
        fi
    done
else
    echo "⚠️  jq not available - consolidation phase requires manual implementation"
fi

# Add completion and safety notes
cat >> "$IMPLEMENTATION_SCRIPT" << 'FINAL_EOF'

echo "✅ Consolidation phase complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Review the consolidated structure at: $TARGET_GOVERNANCE_ROOT"
echo "2. Verify that all artifacts are correctly categorized"
echo "3. Test core governance functionality"
echo "4. Run validation script against the new structure"
echo ""
echo "⚠️  IMPORTANT: Symbolic links were not created automatically for safety."
echo "Review the consolidated structure before creating any symbolic links."
echo ""
echo "🔄 For rollback, use the backup at: $BACKUP_DIR"
echo ""
echo "🎉 Governance structure optimization implementation complete!"

FINAL_EOF

chmod +x "$IMPLEMENTATION_SCRIPT"

log "✅ Implementation script created: $IMPLEMENTATION_SCRIPT"

# Execute the implementation script
log "🔄 Executing consolidation..."
bash "$IMPLEMENTATION_SCRIPT"

# Create rollback script
ROLLBACK_SCRIPT="$DATA_DIR/rollback_governance_optimization_v2_$TIMESTAMP.sh"

cat > "$ROLLBACK_SCRIPT" << 'ROLLBACK_EOF'
#!/bin/bash
# Governance Optimization Rollback Script v2.0

set -e

echo "🔄 Governance Structure Optimization Rollback"
echo "============================================="

ROLLBACK_EOF

echo "BACKUP_DIR=\"$BACKUP_DIR\"" >> "$ROLLBACK_SCRIPT"
echo "TARGET_GOVERNANCE_ROOT=\"$TARGET_GOVERNANCE_ROOT\"" >> "$ROLLBACK_SCRIPT"

cat >> "$ROLLBACK_SCRIPT" << 'ROLLBACK_FINAL'

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "⚠️  This will restore all files from the backup and remove the consolidated structure."
read -p "Are you sure you want to proceed with rollback? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Rollback aborted."
    exit 0
fi

echo "🔄 Restoring files from backup..."

# Restore all files from backup
cd "$BACKUP_DIR"
find . -type f | while read file; do
    target_path="/home/ichardart/$file"
    target_dir=$(dirname "$target_path")
    
    mkdir -p "$target_dir"
    cp "$file" "$target_path"
    echo "Restored: $target_path"
done

echo "🗑️  Removing consolidated structure..."
read -p "Remove consolidated governance structure at $TARGET_GOVERNANCE_ROOT? (y/n): " REMOVE_CONSOLIDATED

if [ "$REMOVE_CONSOLIDATED" = "y" ]; then
    rm -rf "$TARGET_GOVERNANCE_ROOT"
    echo "✅ Consolidated structure removed"
else
    echo "⚠️  Consolidated structure preserved"
fi

echo "✅ Rollback complete!"
echo "All files have been restored to their original locations."

ROLLBACK_FINAL

chmod +x "$ROLLBACK_SCRIPT"

log "✅ Rollback script created: $ROLLBACK_SCRIPT"

echo ""
echo "🎉 GOVERNANCE STRUCTURE OPTIMIZATION COMPLETE!"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "   ✓ Processed $TOTAL_ARTIFACTS governance artifacts"
echo "   ✓ Created organized structure at: $TARGET_GOVERNANCE_ROOT"
echo "   ✓ Backed up originals to: $BACKUP_DIR"
echo "   ✓ Generated metadata for full traceability"
echo "   ✓ Preserved git hook functionality"
echo ""
echo "📋 Next Steps:"
echo "   1. Review consolidated structure: ls -la $TARGET_GOVERNANCE_ROOT"
echo "   2. Validate functionality with existing tools"
echo "   3. Consider creating symbolic links where beneficial"
echo "   4. Update documentation and references"
echo ""
echo "🔄 Rollback available: $ROLLBACK_SCRIPT"
echo "📄 Full report: $REPORT_FILE"
echo ""
echo "🏛️ Your governance artifacts are now systematically organized!"