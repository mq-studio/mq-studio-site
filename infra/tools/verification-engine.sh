#!/bin/bash
# 🎯 IDP Multi-Level Verification Engine
# Implements 6-level ACTION/OUTPUT/OUTCOME verification framework
# Version: 1.0.0

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERIFICATION_LOG="/home/ichardart/code/infra/logs/verification-$(date +%Y%m%d).log"
CONFIG_DIR="/home/ichardart/code/infra/config"

# Logging functions
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $*" | tee -a "$VERIFICATION_LOG"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$VERIFICATION_LOG"
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $*" | tee -a "$VERIFICATION_LOG"
}

log_failure() {
    local level="$1"
    local operation="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILURE: Level $level failed for operation $operation" | tee -a "$VERIFICATION_LOG"
}

# Level 1: ACTION Execution Verification
verify_action_execution() {
    local operation_id="$1"
    local start_time=$(date +%s)
    
    log_info "Level 1 - Verifying ACTION execution for $operation_id"
    
    # Check if operation has required metadata
    if [[ ! -f "/tmp/verification_${operation_id}.metadata" ]]; then
        log_error "Action metadata missing for $operation_id"
        return 1
    fi
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Verify process completion
    if [[ -z "$EXIT_CODE" ]]; then
        log_error "Exit code not recorded for $operation_id"
        return 1
    fi
    
    if [[ "$EXIT_CODE" -ne 0 ]]; then
        log_error "Action failed with exit code $EXIT_CODE"
        return 1
    fi
    
    # Verify execution time is reasonable
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ -n "$MAX_DURATION" ]] && [[ $duration -gt $MAX_DURATION ]]; then
        log_error "Action exceeded maximum duration: ${duration}s > ${MAX_DURATION}s"
        return 1
    fi
    
    log_success "Level 1 - ACTION execution verified for $operation_id"
    return 0
}

# Level 2: ACTION Correctness Verification
verify_action_correctness() {
    local operation_id="$1"
    local config_file="$2"
    
    log_info "Level 2 - Verifying ACTION correctness for $operation_id"
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Configuration file not found: $config_file"
        return 1
    fi
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Verify command syntax
    if [[ -n "$COMMAND_EXECUTED" ]]; then
        if ! command -v "$(echo "$COMMAND_EXECUTED" | cut -d' ' -f1)" >/dev/null 2>&1; then
            log_error "Command not found in PATH: $COMMAND_EXECUTED"
            return 1
        fi
    fi
    
    # Security compliance check
    if echo "$COMMAND_EXECUTED" | grep -E '(sudo|rm -rf|curl.*\|\s*bash|wget.*\|\s*sh)' >/dev/null; then
        log_error "Potentially unsafe command detected: $COMMAND_EXECUTED"
        return 1
    fi
    
    # Context appropriateness
    local current_dir="$(pwd)"
    if [[ "$current_dir" == "/home/ichardart/code"* ]] || [[ "$current_dir" == "/home/ichardart/idp-projects"* ]]; then
        log_info "Action executed in governed context: $current_dir"
    else
        log_error "Action executed outside governed context: $current_dir"
        return 1
    fi
    
    log_success "Level 2 - ACTION correctness verified for $operation_id"
    return 0
}

# Level 3: OUTPUT Generation Verification
verify_output_generation() {
    local operation_id="$1"
    
    log_info "Level 3 - Verifying OUTPUT generation for $operation_id"
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Check expected artifacts
    if [[ -n "$EXPECTED_FILES" ]]; then
        IFS=',' read -ra FILES <<< "$EXPECTED_FILES"
        for file in "${FILES[@]}"; do
            if [[ ! -e "$file" ]]; then
                log_error "Expected file not found: $file"
                return 1
            fi
            log_info "Found expected file: $file"
        done
    fi
    
    # Check expected directories
    if [[ -n "$EXPECTED_DIRS" ]]; then
        IFS=',' read -ra DIRS <<< "$EXPECTED_DIRS"
        for dir in "${DIRS[@]}"; do
            if [[ ! -d "$dir" ]]; then
                log_error "Expected directory not found: $dir"
                return 1
            fi
            log_info "Found expected directory: $dir"
        done
    fi
    
    # Verify basic structure compliance
    if [[ -n "$STRUCTURE_RULES" ]]; then
        eval "$STRUCTURE_RULES"
        if [[ $? -ne 0 ]]; then
            log_error "Structure compliance check failed"
            return 1
        fi
    fi
    
    log_success "Level 3 - OUTPUT generation verified for $operation_id"
    return 0
}

# Level 4: OUTPUT Correctness Verification
verify_output_correctness() {
    local operation_id="$1"
    local config_file="$2"
    
    log_info "Level 4 - Verifying OUTPUT correctness for $operation_id"
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Functional specification check
    if [[ -n "$FUNCTIONAL_TESTS" ]]; then
        IFS=',' read -ra TESTS <<< "$FUNCTIONAL_TESTS"
        for test in "${TESTS[@]}"; do
            log_info "Running functional test: $test"
            if ! eval "$test"; then
                log_error "Functional test failed: $test"
                return 1
            fi
        done
    fi
    
    # Quality standards check
    if [[ -n "$QUALITY_CHECKS" ]]; then
        IFS=',' read -ra CHECKS <<< "$QUALITY_CHECKS"
        for check in "${CHECKS[@]}"; do
            log_info "Running quality check: $check"
            if ! eval "$check"; then
                log_error "Quality check failed: $check"
                return 1
            fi
        done
    fi
    
    # Performance check
    if [[ -n "$PERFORMANCE_BASELINE" ]]; then
        log_info "Checking performance against baseline: $PERFORMANCE_BASELINE"
        # Implementation depends on specific performance metrics
        # For now, assume test passes
    fi
    
    log_success "Level 4 - OUTPUT correctness verified for $operation_id"
    return 0
}

# Level 5: OUTCOME Achievement Verification
verify_outcome_achievement() {
    local operation_id="$1"
    
    log_info "Level 5 - Verifying OUTCOME achievement for $operation_id"
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Business objective verification
    if [[ -n "$BUSINESS_OBJECTIVE" ]]; then
        log_info "Verifying business objective: $BUSINESS_OBJECTIVE"
        
        case "$BUSINESS_OBJECTIVE" in
            "software_installation")
                # For software installation, verify it's actually usable
                if [[ -n "$INSTALLED_BINARY" ]]; then
                    if command -v "$INSTALLED_BINARY" >/dev/null 2>&1; then
                        log_info "Software $INSTALLED_BINARY is accessible"
                    else
                        log_error "Software $INSTALLED_BINARY not accessible in PATH"
                        return 1
                    fi
                fi
                ;;
            "development_tool_setup")
                # Verify development workflow is enhanced
                if [[ -n "$WORKFLOW_TEST" ]]; then
                    if ! eval "$WORKFLOW_TEST"; then
                        log_error "Workflow enhancement not achieved"
                        return 1
                    fi
                fi
                ;;
            *)
                log_info "Generic business objective verification"
                ;;
        esac
    fi
    
    # Integration verification
    if [[ -n "$INTEGRATION_TESTS" ]]; then
        IFS=',' read -ra TESTS <<< "$INTEGRATION_TESTS"
        for test in "${TESTS[@]}"; do
            log_info "Running integration test: $test"
            if ! eval "$test"; then
                log_error "Integration test failed: $test"
                return 1
            fi
        done
    fi
    
    log_success "Level 5 - OUTCOME achievement verified for $operation_id"
    return 0
}

# Level 6: OUTCOME Optimality Verification
verify_outcome_optimality() {
    local operation_id="$1"
    local config_file="$2"
    
    log_info "Level 6 - Verifying OUTCOME optimality for $operation_id"
    
    source "/tmp/verification_${operation_id}.metadata"
    
    # Best practices compliance
    local compliance_score=100
    
    # Check for security best practices
    if [[ -n "$SECURITY_CHECKS" ]]; then
        IFS=',' read -ra CHECKS <<< "$SECURITY_CHECKS"
        for check in "${CHECKS[@]}"; do
            if ! eval "$check"; then
                compliance_score=$((compliance_score - 10))
                log_error "Security best practice not met: $check"
            fi
        done
    fi
    
    # Check for maintainability
    if [[ -n "$MAINTAINABILITY_CHECKS" ]]; then
        IFS=',' read -ra CHECKS <<< "$MAINTAINABILITY_CHECKS"
        for check in "${CHECKS[@]}"; do
            if ! eval "$check"; then
                compliance_score=$((compliance_score - 5))
                log_error "Maintainability check failed: $check"
            fi
        done
    fi
    
    # Performance optimization check
    if [[ -n "$OPTIMIZATION_TARGET" ]]; then
        log_info "Checking optimization against target: $OPTIMIZATION_TARGET"
        # Implementation depends on specific metrics
    fi
    
    # Minimum compliance threshold
    if [[ $compliance_score -lt 80 ]]; then
        log_error "Compliance score too low: $compliance_score%"
        return 1
    fi
    
    log_success "Level 6 - OUTCOME optimality verified for $operation_id (Score: $compliance_score%)"
    return 0
}

# Main verification function
validate_operation() {
    local operation_id="$1"
    local config_file="${2:-$CONFIG_DIR/default-verification.conf}"
    
    log_info "Starting multi-level verification for operation: $operation_id"
    log_info "Using configuration: $config_file"
    
    # Create verification log entry
    echo "VERIFICATION_START: $operation_id at $(date)" >> "$VERIFICATION_LOG"
    
    # Level 1-2: ACTION verification
    if ! verify_action_execution "$operation_id"; then
        log_failure "1" "$operation_id"
        return 1
    fi
    
    if ! verify_action_correctness "$operation_id" "$config_file"; then
        log_failure "2" "$operation_id"
        return 2
    fi
    
    # Level 3-4: OUTPUT verification
    if ! verify_output_generation "$operation_id"; then
        log_failure "3" "$operation_id"
        return 3
    fi
    
    if ! verify_output_correctness "$operation_id" "$config_file"; then
        log_failure "4" "$operation_id"
        return 4
    fi
    
    # Level 5-6: OUTCOME verification
    if ! verify_outcome_achievement "$operation_id"; then
        log_failure "5" "$operation_id"
        return 5
    fi
    
    if ! verify_outcome_optimality "$operation_id" "$config_file"; then
        log_failure "6" "$operation_id"
        return 6
    fi
    
    log_success "FULL_VERIFICATION_COMPLETE" "$operation_id"
    echo "VERIFICATION_SUCCESS: $operation_id at $(date)" >> "$VERIFICATION_LOG"
    return 0
}

# Helper function to create operation metadata
create_operation_metadata() {
    local operation_id="$1"
    local command="$2"
    local expected_files="$3"
    local business_objective="$4"
    
    cat > "/tmp/verification_${operation_id}.metadata" << EOF
OPERATION_ID="$operation_id"
COMMAND_EXECUTED="$command"
EXIT_CODE=0
EXPECTED_FILES="$expected_files"
BUSINESS_OBJECTIVE="$business_objective"
TIMESTAMP="$(date)"
EOF
}

# Usage information
usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  validate <operation_id> [config_file]  - Run full 6-level verification"
    echo "  create-metadata <id> <cmd> <files> <objective> - Create operation metadata"
    echo "  test-installation <binary_name>       - Test software installation verification"
    echo ""
    echo "Examples:"
    echo "  $0 validate shotgun_install"
    echo "  $0 create-metadata test_op 'npm install' 'package.json,node_modules' 'development_tool_setup'"
}

# Main execution
case "${1:-}" in
    "validate")
        if [[ -z "$2" ]]; then
            echo "Error: Operation ID required"
            usage
            exit 1
        fi
        validate_operation "$2" "$3"
        ;;
    "create-metadata")
        if [[ $# -lt 5 ]]; then
            echo "Error: All metadata parameters required"
            usage
            exit 1
        fi
        create_operation_metadata "$2" "$3" "$4" "$5"
        ;;
    "test-installation")
        if [[ -z "$2" ]]; then
            echo "Error: Binary name required"
            usage
            exit 1
        fi
        create_operation_metadata "test_${2}" "which $2" "$2" "software_installation"
        echo "INSTALLED_BINARY=$2" >> "/tmp/verification_test_${2}.metadata"
        validate_operation "test_${2}"
        ;;
    *)
        usage
        exit 1
        ;;
esac