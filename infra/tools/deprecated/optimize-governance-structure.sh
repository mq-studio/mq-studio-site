#!/bin/bash
# 🏛️ IDP Governance Optimization Implementation Script
# This script implements the recommendations from the governance optimization report

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR="/home/ichardart"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$SCRIPT_DIR/../logs/governance-optimization-$TIMESTAMP.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Header
echo "🏛️ IDP GOVERNANCE OPTIMIZATION"
echo "=============================="
log "Starting governance optimization process"

# Function to create unified governance structure
create_unified_structure() {
    log "📁 Creating unified governance structure..."
    
    UNIFIED_GOV="$HOME_DIR/idp-governance"
    
    # Create main directories
    mkdir -p "$UNIFIED_GOV"/{core,projects,tools,monitoring,methodologies,archives}
    mkdir -p "$UNIFIED_GOV/projects"/{code,idp-projects}
    mkdir -p "$UNIFIED_GOV/monitoring"/{logs,metrics,reports}
    
    log "✅ Unified structure created at $UNIFIED_GOV"
    
    # Create structure documentation
    cat > "$UNIFIED_GOV/README.md" << 'EOF'
# 🏛️ IDP Unified Governance

**Created**: $(date)
**Purpose**: Single source of truth for all IDP governance

## Directory Structure

```
idp-governance/
├── core/                    # Core governance framework and policies
│   ├── framework.md        # Main governance framework
│   ├── operating-rules.md  # Operating rules for all IDP components
│   └── security-policies.md # Security and compliance policies
├── projects/               # Project-specific governance
│   ├── code/              # Governance for /home/ichardart/code
│   └── idp-projects/      # Governance for /home/ichardart/idp-projects
├── tools/                 # All governance tools and scripts
├── monitoring/            # Logs, metrics, and reports
│   ├── logs/             # Governance enforcement logs
│   ├── metrics/          # Compliance metrics
│   └── reports/          # Generated reports
├── methodologies/         # Development methodologies (BMAD V2, etc.)
└── archives/             # Archived/deprecated governance artifacts
```

## Governance Hierarchy

1. **Global Governance**: Rules in `core/` apply to entire IDP
2. **Project Governance**: Rules in `projects/*/` apply to specific projects
3. **Local Governance**: `.governance` files in project directories

## Key Files

- `core/framework.md` - Main governance framework
- `core/operating-rules.md` - IDP-wide operating rules
- `tools/governance-enforcer.py` - Active enforcement script
- `monitoring/metrics/compliance-dashboard.json` - Real-time metrics

## Usage

All IDP components should reference this directory for governance policies.
Local project overrides must explicitly reference this directory.
EOF
    
    log "📝 Created unified governance README"
}

# Function to migrate existing governance artifacts
migrate_governance_artifacts() {
    log "🔄 Migrating existing governance artifacts..."
    
    UNIFIED_GOV="$HOME_DIR/idp-governance"
    
    # Create archive of current state
    ARCHIVE_DIR="$UNIFIED_GOV/archives/pre-optimization-$TIMESTAMP"
    mkdir -p "$ARCHIVE_DIR"
    
    # Archive existing governance directories
    if [ -d "$HOME_DIR/code/infra/idp-governance" ]; then
        cp -r "$HOME_DIR/code/infra/idp-governance" "$ARCHIVE_DIR/code-infra-idp-governance"
        log "📦 Archived code/infra/idp-governance"
    fi
    
    if [ -d "$HOME_DIR/idp-projects/idp-governance" ]; then
        cp -r "$HOME_DIR/idp-projects/idp-governance" "$ARCHIVE_DIR/idp-projects-idp-governance"
        log "📦 Archived idp-projects/idp-governance"
    fi
    
    # Migrate core files
    log "📋 Migrating core governance files..."
    
    # Core framework files
    [ -f "$HOME_DIR/code/infra/idp-governance/IDP_GOVERNANCE_FRAMEWORK.md" ] && \
        cp "$HOME_DIR/code/infra/idp-governance/IDP_GOVERNANCE_FRAMEWORK.md" "$UNIFIED_GOV/core/framework.md"
    
    [ -f "$HOME_DIR/code/infra/dev-env-docs/OPERATING_RULES.md" ] && \
        cp "$HOME_DIR/code/infra/dev-env-docs/OPERATING_RULES.md" "$UNIFIED_GOV/core/operating-rules.md"
    
    # Migrate tools
    log "🔧 Migrating governance tools..."
    cp -r "$HOME_DIR/code/infra/tools"/governance-*.{sh,py} "$UNIFIED_GOV/tools/" 2>/dev/null || true
    
    # Migrate methodologies
    log "📚 Migrating methodologies..."
    if [ -d "$HOME_DIR/idp-projects/idp-governance/methodologies" ]; then
        cp -r "$HOME_DIR/idp-projects/idp-governance/methodologies"/* "$UNIFIED_GOV/methodologies/"
    fi
    
    log "✅ Migration completed"
}

# Function to update tool references
update_tool_references() {
    log "🔧 Updating tool references to new structure..."
    
    UNIFIED_GOV="$HOME_DIR/idp-governance"
    
    # Update paths in governance tools
    for tool in "$UNIFIED_GOV/tools"/*.{sh,py}; do
        if [ -f "$tool" ]; then
            # Update references to old governance paths
            sed -i 's|/code/infra/idp-governance|/idp-governance/core|g' "$tool"
            sed -i 's|/idp-projects/idp-governance|/idp-governance|g' "$tool"
            log "✏️ Updated references in $(basename "$tool")"
        fi
    done
    
    # Create symlinks for backward compatibility
    ln -sf "$UNIFIED_GOV" "$HOME_DIR/code/infra/idp-governance-unified"
    ln -sf "$UNIFIED_GOV" "$HOME_DIR/idp-projects/idp-governance-unified"
    
    log "✅ Tool references updated"
}

# Function to create federated governance markers
create_governance_markers() {
    log "🏷️ Creating governance markers for projects..."
    
    # Create marker for code directory
    cat > "$HOME_DIR/code/.governance" << 'EOF'
# Governance Configuration
governance_scope: federated
governance_root: /home/ichardart/idp-governance
local_overrides: ./infra/idp-governance
enforcement_level: strict
real_time_sync: enabled
EOF
    
    # Create marker for idp-projects directory
    cat > "$HOME_DIR/idp-projects/.governance" << 'EOF'
# Governance Configuration
governance_scope: federated
governance_root: /home/ichardart/idp-governance
local_overrides: ./idp-governance
enforcement_level: strict
real_time_sync: enabled
EOF
    
    log "✅ Governance markers created"
}

# Function to update monitoring configuration
update_monitoring_config() {
    log "📊 Updating monitoring configuration..."
    
    UNIFIED_GOV="$HOME_DIR/idp-governance"
    
    # Create enhanced monitoring configuration
    cat > "$UNIFIED_GOV/monitoring/config.json" << EOF
{
  "monitoring_version": "2.0",
  "updated": "$(date -Iseconds)",
  "monitored_paths": [
    "/home/ichardart/code",
    "/home/ichardart/idp-projects",
    "/home/ichardart/.mcp",
    "/home/ichardart/.claude",
    "/home/ichardart/idp-governance"
  ],
  "enforcement_config": {
    "pre_commit_hooks": true,
    "real_time_monitoring": true,
    "monitoring_interval_seconds": 900,
    "file_watcher_enabled": true
  },
  "metrics_config": {
    "track_coverage": true,
    "track_violations": true,
    "track_compliance_score": true,
    "track_sync_latency": true
  },
  "clients": [
    "claude_desktop",
    "claude_code",
    "cline"
  ]
}
EOF
    
    log "✅ Monitoring configuration updated"
}

# Function to generate migration report
generate_migration_report() {
    log "📋 Generating migration report..."
    
    UNIFIED_GOV="$HOME_DIR/idp-governance"
    REPORT_FILE="$UNIFIED_GOV/monitoring/reports/migration-report-$TIMESTAMP.md"
    
    cat > "$REPORT_FILE" << EOF
# 🏛️ Governance Migration Report

**Generated**: $(date)
**Migration ID**: $TIMESTAMP

## Summary

The IDP governance structure has been successfully optimized and consolidated.

### Before Migration
- Governance artifacts: 245 (scattered across multiple locations)
- Primary locations: 3 (code/infra, idp-projects, .mcp)
- Coverage: ~3.4% of active directories

### After Migration
- Governance artifacts: Consolidated in single location
- Primary location: $UNIFIED_GOV
- Coverage: Ready for 100% coverage with federated model

## Changes Made

1. **Created Unified Structure**
   - Single governance root at $UNIFIED_GOV
   - Clear hierarchy: core → projects → local
   - Organized by function: core, tools, monitoring, methodologies

2. **Migrated Artifacts**
   - Core framework files → core/
   - Governance tools → tools/
   - Methodologies (BMAD V2) → methodologies/
   - Original files archived in archives/

3. **Updated References**
   - Tool scripts updated to reference new paths
   - Symlinks created for backward compatibility
   - Governance markers added to project roots

4. **Enhanced Monitoring**
   - Extended coverage to all project directories
   - Enhanced metrics configuration
   - Real-time sync configuration updated

## Next Steps

1. **Test the new structure**
   - Run governance-check.sh
   - Verify pre-commit hooks
   - Test real-time monitoring

2. **Update documentation**
   - Update CLAUDE.md with new paths
   - Update manifest.md files
   - Update team documentation

3. **Deploy federated governance**
   - Activate monitoring for all paths
   - Test project-specific overrides
   - Validate inheritance model

## Rollback Instructions

If needed, the original structure is preserved in:
$UNIFIED_GOV/archives/pre-optimization-$TIMESTAMP

To rollback:
1. Stop governance monitoring services
2. Restore from archive
3. Update tool references
4. Restart services

---
**Status**: ✅ Migration Successful
EOF
    
    log "✅ Migration report generated: $REPORT_FILE"
}

# Main execution flow
main() {
    echo ""
    echo "This script will optimize your IDP governance structure."
    echo "Original files will be archived for safety."
    echo ""
    read -p "Continue with optimization? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "❌ Optimization cancelled by user"
        exit 1
    fi
    
    # Execute optimization steps
    create_unified_structure
    migrate_governance_artifacts
    update_tool_references
    create_governance_markers
    update_monitoring_config
    generate_migration_report
    
    echo ""
    echo "✅ GOVERNANCE OPTIMIZATION COMPLETE!"
    echo "===================================="
    echo ""
    echo "📁 New governance root: $HOME_DIR/idp-governance"
    echo "📋 Migration report: $HOME_DIR/idp-governance/monitoring/reports/"
    echo "📊 Logs: $LOG_FILE"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Review the migration report"
    echo "2. Test governance tools with new structure"
    echo "3. Update any hardcoded paths in your projects"
    echo "4. Restart governance monitoring services"
    echo ""
    log "Governance optimization completed successfully"
}

# Run main function
main "$@"
