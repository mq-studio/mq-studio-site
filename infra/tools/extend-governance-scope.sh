#!/bin/bash
# 🏛️ IDP Governance Scope Extension Tool
# Extends governance framework to /idp-projects/ and other directories
# Version: 1.0.0

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_LOG="/home/ichardart/code/infra/logs/governance-extension-$(date +%Y%m%d).log"
IDP_PROJECTS_ROOT="/home/ichardart/idp-projects"

# Logging functions
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $*" | tee -a "$EXTENSION_LOG"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$EXTENSION_LOG"
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*" | tee -a "$EXTENSION_LOG"
}

# Detect project root markers
detect_project_roots() {
    local target_dir="$1"
    
    log_info "Detecting project roots in $target_dir"
    
    if [[ ! -d "$target_dir" ]]; then
        log_error "Target directory does not exist: $target_dir"
        return 1
    fi
    
    # Find existing project markers
    find "$target_dir" -name ".idp_project_root" -o -name "package.json" -o -name "go.mod" -o -name "Cargo.toml" -o -name "setup.py" -o -name "pom.xml" 2>/dev/null | while read -r marker; do
        local project_dir="$(dirname "$marker")"
        log_info "Found project marker: $marker -> $project_dir"
        echo "$project_dir"
    done > "/tmp/detected_projects.txt"
    
    # Also detect directories with significant development activity
    find "$target_dir" -maxdepth 2 -type d \( -name "src" -o -name "lib" -o -name "frontend" -o -name "backend" \) 2>/dev/null | while read -r dev_dir; do
        local project_dir="$(dirname "$dev_dir")"
        if [[ "$project_dir" != "$target_dir" ]]; then
            log_info "Found development directory: $dev_dir -> $project_dir"
            echo "$project_dir"
        fi
    done >> "/tmp/detected_projects.txt"
    
    # Remove duplicates
    sort "/tmp/detected_projects.txt" | uniq > "/tmp/unique_projects.txt"
    
    local project_count=$(wc -l < "/tmp/unique_projects.txt")
    log_info "Detected $project_count unique projects for governance extension"
    
    return 0
}

# Create federated governance structure for a project
setup_federated_governance() {
    local project_dir="$1"
    local project_name="$(basename "$project_dir")"
    
    log_info "Setting up federated governance for: $project_name ($project_dir)"
    
    # Create .idp_project_root marker if it doesn't exist
    if [[ ! -f "$project_dir/.idp_project_root" ]]; then
        cat > "$project_dir/.idp_project_root" << EOF
# IDP Project Root Marker
project_name: $project_name
governance_level: federated
parent_governance: /home/ichardart/code
created: $(date)
version: 1.0.0
EOF
        log_success "Created project root marker: $project_dir/.idp_project_root"
    fi
    
    # Create or update project manifest
    if [[ ! -f "$project_dir/manifest.md" ]]; then
        cat > "$project_dir/manifest.md" << EOF
# $project_name Project Manifest

## Project Information
- **Name**: $project_name
- **Type**: IDP Federated Project
- **Governance Level**: Federated
- **Parent Governance**: /home/ichardart/code
- **Created**: $(date)

## Governance Configuration
- **Verification Level**: Multi-level (ACTION/OUTPUT/OUTCOME)
- **Compliance Threshold**: 85%
- **Security Requirements**: Inherited from parent + project-specific
- **Documentation Standards**: IDP Standard

## Project Structure
\`\`\`
$project_name/
├── .idp_project_root          # Project marker
├── manifest.md                # This file
├── .governance/               # Project-specific governance
│   ├── verification.conf      # Verification configuration
│   └── compliance.log         # Compliance tracking
└── [project files]
\`\`\`

## Integration Points
- **Parent IDP**: /home/ichardart/code
- **Governance Tools**: Shared with parent
- **Verification Engine**: /home/ichardart/code/infra/tools/verification-engine.sh
- **MCP Integration**: Enabled
- **Agent Access**: Federated

## Compliance Status
- **Last Updated**: $(date)
- **Governance Readiness**: Initializing
- **Verification Status**: Pending

## Contact & Maintenance
- **Governance Authority**: IDP Core Team
- **Local Maintainer**: [To be assigned]
- **Review Cycle**: Monthly

---
*This manifest is automatically maintained by the IDP governance system.*
EOF
        log_success "Created project manifest: $project_dir/manifest.md"
    fi
    
    # Create governance directory structure
    mkdir -p "$project_dir/.governance"
    
    # Create project-specific verification configuration
    if [[ ! -f "$project_dir/.governance/verification.conf" ]]; then
        # Determine project type for appropriate verification profile
        local project_type="default"
        if [[ -f "$project_dir/package.json" ]]; then
            project_type="development_tool_setup"
        elif [[ -f "$project_dir/go.mod" ]]; then
            project_type="software_installation"
        elif [[ -d "$project_dir/servers" ]] || [[ -d "$project_dir/mcp" ]]; then
            project_type="mcp_server_deployment"
        fi
        
        cat > "$project_dir/.governance/verification.conf" << EOF
# Project-specific verification configuration
# Inherits from: /home/ichardart/code/infra/config/verification-profiles.yaml

PROJECT_NAME="$project_name"
PROJECT_TYPE="$project_type"
GOVERNANCE_LEVEL="federated"
PARENT_GOVERNANCE="/home/ichardart/code"

# Override verification settings if needed
VERIFICATION_PROFILE="$project_type"
COMPLIANCE_THRESHOLD=85
SECURITY_LEVEL="medium"

# Project-specific rules
PROJECT_ROOT="$project_dir"
MANIFEST_FILE="$project_dir/manifest.md"
GOVERNANCE_DIR="$project_dir/.governance"

# Integration settings
MCP_INTEGRATION=true
AGENT_ACCESS=true
INVENTORY_TRACKING=true

# Verification metadata
CREATED="$(date)"
LAST_UPDATED="$(date)"
VERSION="1.0.0"
EOF
        log_success "Created verification config: $project_dir/.governance/verification.conf"
    fi
    
    # Create compliance tracking file
    if [[ ! -f "$project_dir/.governance/compliance.log" ]]; then
        cat > "$project_dir/.governance/compliance.log" << EOF
# Compliance Tracking Log for $project_name
# Format: TIMESTAMP LEVEL EVENT DETAILS

$(date '+%Y-%m-%d %H:%M:%S') INFO GOVERNANCE_SETUP Federated governance initialized
$(date '+%Y-%m-%d %H:%M:%S') INFO VERIFICATION_CONFIG Created project-specific verification configuration
$(date '+%Y-%m-%d %H:%M:%S') INFO MANIFEST_CREATED Project manifest established
$(date '+%Y-%m-%d %H:%M:%S') INFO READY_FOR_OPERATIONS Project ready for governed operations
EOF
        log_success "Created compliance log: $project_dir/.governance/compliance.log"
    fi
    
    # Set up git hooks if it's a git repository
    if [[ -d "$project_dir/.git" ]]; then
        log_info "Git repository detected, setting up governance hooks"
        
        # Create pre-commit hook
        mkdir -p "$project_dir/.git/hooks"
        cat > "$project_dir/.git/hooks/pre-commit" << EOF
#!/bin/bash
# IDP Federated Governance Pre-commit Hook
/home/ichardart/code/infra/tools/verification-engine.sh validate "git_commit_\$(git rev-parse --short HEAD)" "$project_dir/.governance/verification.conf"
EOF
        chmod +x "$project_dir/.git/hooks/pre-commit"
        log_success "Created git pre-commit hook"
    fi
    
    log_success "Federated governance setup complete for: $project_name"
    return 0
}

# Update parent governance to recognize federated projects
update_parent_governance() {
    local federated_projects_file="/home/ichardart/code/infra/config/federated-projects.conf"
    
    log_info "Updating parent governance configuration"
    
    # Create federated projects registry
    echo "# IDP Federated Projects Registry" > "$federated_projects_file"
    echo "# Auto-generated on $(date)" >> "$federated_projects_file"
    echo "" >> "$federated_projects_file"
    
    while IFS= read -r project_dir; do
        if [[ -n "$project_dir" && -f "$project_dir/.idp_project_root" ]]; then
            local project_name="$(basename "$project_dir")"
            echo "FEDERATED_PROJECT=\"$project_dir\"  # $project_name" >> "$federated_projects_file"
        fi
    done < "/tmp/unique_projects.txt"
    
    log_success "Updated federated projects registry: $federated_projects_file"
    
    # Update governance detection script
    local context_script="/home/ichardart/code/infra/tools/detect-agent-context.sh"
    if [[ -f "$context_script" ]]; then
        # Add federated project detection to existing script
        log_info "Updating context detection for federated projects"
        
        # Backup original
        cp "$context_script" "$context_script.backup.$(date +%Y%m%d)"
        
        # Insert federated project detection logic
        sed -i '/# Detect if we.*in IDP project/a\
\
# Check for federated projects\
if [[ -f ".idp_project_root" ]]; then\
    CONTEXT_TYPE="FEDERATED_PROJECT"\
    PROJECT_NAME="$(basename "$(pwd)")"\
    GOVERNANCE_READINESS=85  # Default for federated projects\
fi' "$context_script"
        
        log_success "Updated context detection script"
    fi
    
    return 0
}

# Test federated governance setup
test_federated_governance() {
    local project_dir="$1"
    local project_name="$(basename "$project_dir")"
    
    log_info "Testing federated governance for: $project_name"
    
    # Test 1: Project marker exists
    if [[ ! -f "$project_dir/.idp_project_root" ]]; then
        log_error "Test failed: Project marker missing"
        return 1
    fi
    
    # Test 2: Manifest exists and is valid
    if [[ ! -f "$project_dir/manifest.md" ]]; then
        log_error "Test failed: Project manifest missing"
        return 1
    fi
    
    # Test 3: Governance directory structure
    if [[ ! -d "$project_dir/.governance" ]]; then
        log_error "Test failed: Governance directory missing"
        return 1
    fi
    
    # Test 4: Verification configuration
    if [[ ! -f "$project_dir/.governance/verification.conf" ]]; then
        log_error "Test failed: Verification config missing"
        return 1
    fi
    
    # Test 5: Verification engine accessibility
    if ! /home/ichardart/code/infra/tools/verification-engine.sh create-metadata "test_federated_$project_name" "echo test" "" "agent_onboarding" 2>/dev/null; then
        log_error "Test failed: Verification engine not accessible"
        return 1
    fi
    
    # Cleanup test metadata
    rm -f "/tmp/verification_test_federated_${project_name}.metadata"
    
    log_success "Federated governance tests passed for: $project_name"
    return 0
}

# Main execution function
extend_governance_scope() {
    local target_dir="${1:-$IDP_PROJECTS_ROOT}"
    
    log_info "Starting governance scope extension to: $target_dir"
    
    # Step 1: Detect project roots
    if ! detect_project_roots "$target_dir"; then
        log_error "Failed to detect project roots"
        return 1
    fi
    
    local project_count=$(wc -l < "/tmp/unique_projects.txt")
    if [[ $project_count -eq 0 ]]; then
        log_info "No projects detected for governance extension"
        return 0
    fi
    
    log_info "Extending governance to $project_count projects"
    
    # Step 2: Setup federated governance for each project
    local success_count=0
    local failure_count=0
    
    while IFS= read -r project_dir; do
        if [[ -n "$project_dir" ]]; then
            if setup_federated_governance "$project_dir"; then
                if test_federated_governance "$project_dir"; then
                    ((success_count++))
                    log_success "Successfully extended governance to: $project_dir"
                else
                    ((failure_count++))
                    log_error "Failed governance tests for: $project_dir"
                fi
            else
                ((failure_count++))
                log_error "Failed to setup governance for: $project_dir"
            fi
        fi
    done < "/tmp/unique_projects.txt"
    
    # Step 3: Update parent governance
    if ! update_parent_governance; then
        log_error "Failed to update parent governance configuration"
        return 1
    fi
    
    # Step 4: Report results
    log_info "Governance extension complete:"
    log_info "  - Projects processed: $project_count"
    log_info "  - Successful setups: $success_count"
    log_info "  - Failed setups: $failure_count"
    
    if [[ $failure_count -gt 0 ]]; then
        log_error "Some projects failed governance extension. Check logs for details."
        return 1
    fi
    
    log_success "All projects successfully extended with federated governance"
    
    # Cleanup temporary files
    rm -f "/tmp/detected_projects.txt" "/tmp/unique_projects.txt"
    
    return 0
}

# Usage information
usage() {
    echo "Usage: $0 [target_directory]"
    echo ""
    echo "Extends IDP governance to projects in the specified directory."
    echo "Default target: /home/ichardart/idp-projects"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Extend to default /idp-projects/"
    echo "  $0 /home/ichardart/idp-projects      # Explicit target"
    echo "  $0 /path/to/other/projects           # Custom target"
}

# Main execution
case "${1:-}" in
    "help"|"-h"|"--help")
        usage
        exit 0
        ;;
    *)
        extend_governance_scope "$1"
        ;;
esac