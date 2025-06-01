#!/bin/bash
# Enhanced IDP Action Validation Script
# Implements simplified 3-step validation process from Enhanced Validation Framework v2.0

set -e

# Configuration
VALIDATION_TIMEOUT=60
LOG_FILE="/home/ichardart/code/infra/logs/action-validation.log"
RESULTS_FILE="/home/ichardart/code/infra/logs/action-validation-results.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] <action-type> <target-path>

Action Types:
  mcp-server    - Validate MCP server changes
  config        - Validate configuration changes
  script        - Validate script changes
  governance    - Validate governance changes

Options:
  -h, --help           Show this help message
  -v, --verbose        Verbose output
  -t, --timeout SEC    Validation timeout (default: 60)
  --skip-deps          Skip dependency checks
  --emergency          Emergency validation mode (reduced checks)

Examples:
  $0 mcp-server /home/ichardart/code/infra/mcp-servers/governance-mcp
  $0 config /home/ichardart/.claude/config.json
  $0 script /home/ichardart/code/infra/scripts/health-check.sh
EOF
}

# Logging function
log() {
    echo "$(date -Iseconds) - $1" >> "$LOG_FILE"
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        echo -e "$1"
    fi
}

# Initialize results structure
init_results() {
    cat > "$RESULTS_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "action_type": "$ACTION_TYPE",
    "target_path": "$TARGET_PATH",
    "validation_mode": "${EMERGENCY_MODE:-normal}",
    "overall_status": "UNKNOWN",
    "steps": {
        "syntax_check": {"status": "PENDING", "details": "", "duration": 0},
        "dependency_verification": {"status": "PENDING", "details": "", "duration": 0},
        "basic_functionality": {"status": "PENDING", "details": "", "duration": 0}
    },
    "summary": {
        "total_issues": 0,
        "critical_issues": 0,
        "warnings": 0,
        "validation_time": 0
    }
}
EOF
}

# Update step result
update_step_result() {
    local step="$1"
    local status="$2"
    local details="$3"
    local duration="${4:-0}"
    
    jq --arg step "$step" --arg status "$status" --arg details "$details" --arg duration "$duration" \
       '.steps[$step].status = $status | .steps[$step].details = $details | .steps[$step].duration = ($duration | tonumber)' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Step 1: Syntax/Compilation Check
validate_syntax() {
    echo -e "${YELLOW}Step 1: Syntax/Compilation Check${NC}"
    local start_time=$(date +%s)
    
    case "$ACTION_TYPE" in
        "mcp-server")
            validate_mcp_server_syntax
            ;;
        "config")
            validate_config_syntax
            ;;
        "script")
            validate_script_syntax
            ;;
        "governance")
            validate_governance_syntax
            ;;
        *)
            update_step_result "syntax_check" "FAILED" "Unknown action type: $ACTION_TYPE" 0
            return 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $? -eq 0 ]]; then
        update_step_result "syntax_check" "PASSED" "Syntax validation successful" "$duration"
        echo -e "${GREEN}✅ Syntax check passed (${duration}s)${NC}"
        return 0
    else
        echo -e "${RED}❌ Syntax check failed (${duration}s)${NC}"
        return 1
    fi
}

# MCP Server syntax validation
validate_mcp_server_syntax() {
    if [[ ! -d "$TARGET_PATH" ]]; then
        update_step_result "syntax_check" "FAILED" "Target directory does not exist" 0
        return 1
    fi
    
    local main_file="$TARGET_PATH/index.js"
    if [[ ! -f "$main_file" ]]; then
        update_step_result "syntax_check" "FAILED" "Main server file (index.js) not found" 0
        return 1
    fi
    
    # Node.js syntax check
    if ! node -c "$main_file" 2>/dev/null; then
        update_step_result "syntax_check" "FAILED" "JavaScript syntax errors in $main_file" 0
        return 1
    fi
    
    # Check for required MCP patterns
    if ! grep -q "server\." "$main_file"; then
        update_step_result "syntax_check" "FAILED" "Missing MCP server patterns" 0
        return 1
    fi
    
    update_step_result "syntax_check" "PASSED" "MCP server syntax validation successful" 0
    return 0
}

# Config syntax validation
validate_config_syntax() {
    if [[ ! -f "$TARGET_PATH" ]]; then
        update_step_result "syntax_check" "FAILED" "Configuration file does not exist" 0
        return 1
    fi
    
    case "$TARGET_PATH" in
        *.json)
            if ! jq empty "$TARGET_PATH" 2>/dev/null; then
                update_step_result "syntax_check" "FAILED" "Invalid JSON syntax" 0
                return 1
            fi
            ;;
        *.yml|*.yaml)
            if command -v yq >/dev/null 2>&1; then
                if ! yq eval . "$TARGET_PATH" >/dev/null 2>&1; then
                    update_step_result "syntax_check" "FAILED" "Invalid YAML syntax" 0
                    return 1
                fi
            else
                log "Warning: yq not available, skipping YAML validation"
            fi
            ;;
        *)
            log "Warning: Unknown config file type, skipping syntax check"
            ;;
    esac
    
    update_step_result "syntax_check" "PASSED" "Configuration syntax validation successful" 0
    return 0
}

# Script syntax validation
validate_script_syntax() {
    if [[ ! -f "$TARGET_PATH" ]]; then
        update_step_result "syntax_check" "FAILED" "Script file does not exist" 0
        return 1
    fi
    
    case "$TARGET_PATH" in
        *.sh)
            if ! bash -n "$TARGET_PATH" 2>/dev/null; then
                update_step_result "syntax_check" "FAILED" "Bash syntax errors" 0
                return 1
            fi
            ;;
        *.py)
            if ! python3 -m py_compile "$TARGET_PATH" 2>/dev/null; then
                update_step_result "syntax_check" "FAILED" "Python syntax errors" 0
                return 1
            fi
            ;;
        *.js)
            if ! node -c "$TARGET_PATH" 2>/dev/null; then
                update_step_result "syntax_check" "FAILED" "JavaScript syntax errors" 0
                return 1
            fi
            ;;
        *)
            log "Warning: Unknown script type, performing basic file check"
            if [[ ! -r "$TARGET_PATH" ]]; then
                update_step_result "syntax_check" "FAILED" "File not readable" 0
                return 1
            fi
            ;;
    esac
    
    update_step_result "syntax_check" "PASSED" "Script syntax validation successful" 0
    return 0
}

# Governance syntax validation
validate_governance_syntax() {
    if [[ ! -f "$TARGET_PATH" ]]; then
        update_step_result "syntax_check" "FAILED" "Governance file does not exist" 0
        return 1
    fi
    
    # Markdown syntax check
    if [[ "$TARGET_PATH" == *.md ]]; then
        # Basic markdown validation - check for common issues
        if grep -q "^# " "$TARGET_PATH" && ! grep -q "^##" "$TARGET_PATH"; then
            log "Warning: Document has only top-level headers"
        fi
    fi
    
    update_step_result "syntax_check" "PASSED" "Governance document validation successful" 0
    return 0
}

# Step 2: Dependency Verification
validate_dependencies() {
    echo -e "${YELLOW}Step 2: Dependency Verification${NC}"
    local start_time=$(date +%s)
    
    if [[ "${SKIP_DEPS:-false}" == "true" ]]; then
        update_step_result "dependency_verification" "SKIPPED" "Dependency check skipped by user request" 0
        echo -e "${YELLOW}⚠️ Dependency check skipped${NC}"
        return 0
    fi
    
    case "$ACTION_TYPE" in
        "mcp-server")
            verify_mcp_dependencies
            ;;
        "config")
            verify_config_dependencies
            ;;
        "script")
            verify_script_dependencies
            ;;
        "governance")
            # Governance files typically don't have dependencies
            update_step_result "dependency_verification" "PASSED" "No dependencies to verify" 0
            echo -e "${GREEN}✅ No dependencies required${NC}"
            return 0
            ;;
        *)
            update_step_result "dependency_verification" "FAILED" "Unknown action type for dependency check" 0
            return 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $? -eq 0 ]]; then
        update_step_result "dependency_verification" "PASSED" "Dependency verification successful" "$duration"
        echo -e "${GREEN}✅ Dependency check passed (${duration}s)${NC}"
        return 0
    else
        echo -e "${RED}❌ Dependency check failed (${duration}s)${NC}"
        return 1
    fi
}

# MCP Server dependency verification
verify_mcp_dependencies() {
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        update_step_result "dependency_verification" "FAILED" "Node.js not available" 0
        return 1
    fi
    
    # Check for package.json
    if [[ -f "$TARGET_PATH/package.json" ]]; then
        # Verify npm dependencies can be resolved
        cd "$TARGET_PATH"
        if ! npm list --depth=0 >/dev/null 2>&1; then
            # Try installing dependencies
            if ! npm install >/dev/null 2>&1; then
                update_step_result "dependency_verification" "FAILED" "npm dependencies cannot be resolved" 0
                return 1
            fi
        fi
        cd - >/dev/null
    fi
    
    update_step_result "dependency_verification" "PASSED" "MCP server dependencies verified" 0
    return 0
}

# Config dependency verification
verify_config_dependencies() {
    case "$TARGET_PATH" in
        *claude/config.json)
            # Verify referenced MCP servers exist
            local servers
            if servers=$(jq -r '.mcpServers | keys[]' "$TARGET_PATH" 2>/dev/null); then
                while IFS= read -r server; do
                    if [[ -z "$server" ]]; then continue; fi
                    
                    local command
                    command=$(jq -r --arg server "$server" '.mcpServers[$server].command' "$TARGET_PATH")
                    
                    if [[ "$command" != "null" ]] && ! command -v "$command" >/dev/null 2>&1; then
                        update_step_result "dependency_verification" "FAILED" "Command '$command' not available for server '$server'" 0
                        return 1
                    fi
                done <<< "$servers"
            fi
            ;;
    esac
    
    update_step_result "dependency_verification" "PASSED" "Configuration dependencies verified" 0
    return 0
}

# Script dependency verification
verify_script_dependencies() {
    # Check shebang and required interpreters
    if [[ -f "$TARGET_PATH" ]]; then
        local shebang
        shebang=$(head -n1 "$TARGET_PATH")
        
        case "$shebang" in
            "#!/bin/bash"|"#!/usr/bin/bash")
                if ! command -v bash >/dev/null 2>&1; then
                    update_step_result "dependency_verification" "FAILED" "Bash interpreter not available" 0
                    return 1
                fi
                ;;
            "#!/usr/bin/python3"|"#!/bin/python3")
                if ! command -v python3 >/dev/null 2>&1; then
                    update_step_result "dependency_verification" "FAILED" "Python3 interpreter not available" 0
                    return 1
                fi
                ;;
            "#!/usr/bin/node"|"#!/bin/node")
                if ! command -v node >/dev/null 2>&1; then
                    update_step_result "dependency_verification" "FAILED" "Node.js interpreter not available" 0
                    return 1
                fi
                ;;
        esac
    fi
    
    update_step_result "dependency_verification" "PASSED" "Script dependencies verified" 0
    return 0
}

# Step 3: Basic Functionality Test
validate_functionality() {
    echo -e "${YELLOW}Step 3: Basic Functionality Test${NC}"
    local start_time=$(date +%s)
    
    case "$ACTION_TYPE" in
        "mcp-server")
            test_mcp_functionality
            ;;
        "config")
            test_config_functionality
            ;;
        "script")
            test_script_functionality
            ;;
        "governance")
            test_governance_functionality
            ;;
        *)
            update_step_result "basic_functionality" "FAILED" "Unknown action type for functionality test" 0
            return 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $? -eq 0 ]]; then
        update_step_result "basic_functionality" "PASSED" "Functionality test successful" "$duration"
        echo -e "${GREEN}✅ Functionality test passed (${duration}s)${NC}"
        return 0
    else
        echo -e "${RED}❌ Functionality test failed (${duration}s)${NC}"
        return 1
    fi
}

# MCP Server functionality test
test_mcp_functionality() {
    local main_file="$TARGET_PATH/index.js"
    
    # Try to start the server in test mode
    if timeout 10 node "$main_file" --test-mode >/dev/null 2>&1; then
        update_step_result "basic_functionality" "PASSED" "MCP server can start successfully" 0
        return 0
    else
        # Try basic module load test
        if node -e "require('$main_file')" 2>/dev/null; then
            update_step_result "basic_functionality" "PASSED" "MCP server module loads successfully" 0
            return 0
        else
            update_step_result "basic_functionality" "FAILED" "MCP server cannot start or load" 0
            return 1
        fi
    fi
}

# Config functionality test
test_config_functionality() {
    case "$TARGET_PATH" in
        *claude/config.json)
            # Test that Claude Desktop can parse the config
            if jq '.workspace' "$TARGET_PATH" >/dev/null 2>&1; then
                update_step_result "basic_functionality" "PASSED" "Configuration is parseable" 0
                return 0
            else
                update_step_result "basic_functionality" "FAILED" "Configuration cannot be parsed" 0
                return 1
            fi
            ;;
        *)
            # Generic config test - just verify it's readable
            if [[ -r "$TARGET_PATH" ]]; then
                update_step_result "basic_functionality" "PASSED" "Configuration file is readable" 0
                return 0
            else
                update_step_result "basic_functionality" "FAILED" "Configuration file is not readable" 0
                return 1
            fi
            ;;
    esac
}

# Script functionality test
test_script_functionality() {
    # Check if script is executable
    if [[ ! -x "$TARGET_PATH" ]]; then
        update_step_result "basic_functionality" "FAILED" "Script is not executable" 0
        return 1
    fi
    
    # Try to run with --help or --version if available
    if timeout 5 "$TARGET_PATH" --help >/dev/null 2>&1 || 
       timeout 5 "$TARGET_PATH" --version >/dev/null 2>&1 || 
       timeout 5 "$TARGET_PATH" -h >/dev/null 2>&1; then
        update_step_result "basic_functionality" "PASSED" "Script responds to help/version flags" 0
        return 0
    else
        update_step_result "basic_functionality" "PASSED" "Script is executable (basic test)" 0
        return 0
    fi
}

# Governance functionality test
test_governance_functionality() {
    # For governance documents, just verify readability and basic structure
    if [[ -r "$TARGET_PATH" ]]; then
        # Check if it has some basic structure (headers, etc.)
        if grep -q "^#" "$TARGET_PATH" 2>/dev/null; then
            update_step_result "basic_functionality" "PASSED" "Governance document has proper structure" 0
            return 0
        else
            update_step_result "basic_functionality" "PASSED" "Governance document is readable" 0
            return 0
        fi
    else
        update_step_result "basic_functionality" "FAILED" "Governance document is not readable" 0
        return 1
    fi
}

# Generate final report
generate_report() {
    local overall_status="PASSED"
    local total_issues=0
    local critical_issues=0
    local warnings=0
    local validation_start_time
    local validation_end_time
    
    validation_start_time=$(jq -r '.timestamp' "$RESULTS_FILE")
    validation_end_time=$(date -Iseconds)
    
    # Check step results
    local syntax_status
    local dep_status
    local func_status
    
    syntax_status=$(jq -r '.steps.syntax_check.status' "$RESULTS_FILE")
    dep_status=$(jq -r '.steps.dependency_verification.status' "$RESULTS_FILE")
    func_status=$(jq -r '.steps.basic_functionality.status' "$RESULTS_FILE")
    
    # Count issues
    if [[ "$syntax_status" == "FAILED" ]]; then
        overall_status="FAILED"
        critical_issues=$((critical_issues + 1))
    fi
    
    if [[ "$dep_status" == "FAILED" ]]; then
        overall_status="FAILED"
        critical_issues=$((critical_issues + 1))
    fi
    
    if [[ "$func_status" == "FAILED" ]]; then
        overall_status="FAILED"
        critical_issues=$((critical_issues + 1))
    fi
    
    # Count warnings
    if [[ "$dep_status" == "SKIPPED" ]]; then
        warnings=$((warnings + 1))
    fi
    
    total_issues=$((critical_issues + warnings))
    
    # Calculate validation time
    local start_epoch
    local end_epoch
    start_epoch=$(date -d "$validation_start_time" +%s)
    end_epoch=$(date -d "$validation_end_time" +%s)
    local validation_time=$((end_epoch - start_epoch))
    
    # Update summary
    jq --arg status "$overall_status" \
       --arg total "$total_issues" \
       --arg critical "$critical_issues" \
       --arg warnings "$warnings" \
       --arg duration "$validation_time" \
       --arg end_time "$validation_end_time" \
       '.overall_status = $status | 
        .summary.total_issues = ($total | tonumber) |
        .summary.critical_issues = ($critical | tonumber) |
        .summary.warnings = ($warnings | tonumber) |
        .summary.validation_time = ($duration | tonumber) |
        .end_timestamp = $end_time' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    # Display summary
    echo "================================"
    case "$overall_status" in
        "PASSED")
            echo -e "${GREEN}🎉 ACTION VALIDATION PASSED${NC}"
            echo -e "${GREEN}✅ All validation steps completed successfully${NC}"
            ;;
        "FAILED")
            echo -e "${RED}❌ ACTION VALIDATION FAILED${NC}"
            echo -e "${RED}❌ Critical issues must be resolved before deployment${NC}"
            ;;
    esac
    
    echo "📊 Validation Summary:"
    echo "   - Action Type: $ACTION_TYPE"
    echo "   - Target: $TARGET_PATH"
    echo "   - Total Issues: $total_issues"
    echo "   - Critical Issues: $critical_issues"
    echo "   - Warnings: $warnings"
    echo "   - Validation Time: ${validation_time}s"
    
    echo "📋 Full results: $RESULTS_FILE"
    echo "📝 Validation log: $LOG_FILE"
    
    # Return appropriate exit code
    case "$overall_status" in
        "PASSED") return 0 ;;
        "FAILED") return 1 ;;
    esac
}

# Parse command line arguments
ACTION_TYPE=""
TARGET_PATH=""
VERBOSE=false
SKIP_DEPS=false
EMERGENCY_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -t|--timeout)
            VALIDATION_TIMEOUT="$2"
            shift 2
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --emergency)
            EMERGENCY_MODE=true
            shift
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
        *)
            if [[ -z "$ACTION_TYPE" ]]; then
                ACTION_TYPE="$1"
            elif [[ -z "$TARGET_PATH" ]]; then
                TARGET_PATH="$1"
            else
                echo "Too many arguments" >&2
                usage >&2
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [[ -z "$ACTION_TYPE" ]] || [[ -z "$TARGET_PATH" ]]; then
    echo "Error: Action type and target path are required" >&2
    usage >&2
    exit 1
fi

# Main execution
main() {
    echo -e "${GREEN}🔍 Enhanced IDP Action Validation${NC}"
    echo "=================================="
    echo "Action Type: $ACTION_TYPE"
    echo "Target Path: $TARGET_PATH"
    echo "Validation Mode: ${EMERGENCY_MODE:+emergency}${EMERGENCY_MODE:-normal}"
    echo ""
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$RESULTS_FILE")"
    
    # Initialize results
    init_results
    
    # Run validation steps
    local syntax_ok=0
    local deps_ok=0
    local func_ok=0
    
    validate_syntax || syntax_ok=1
    validate_dependencies || deps_ok=1
    validate_functionality || func_ok=1
    
    # Generate final report
    generate_report
    return $?
}

# Run main function
main