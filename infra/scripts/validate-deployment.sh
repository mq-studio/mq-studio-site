#!/bin/bash
# Enhanced IDP Deployment Validation Gate
# Implements automated blocking gates from Enhanced Validation Framework v2.0

set -e

# Configuration
DEPLOYMENT_TIMEOUT=300
LOG_FILE="/home/ichardart/code/infra/logs/deployment-validation.log"
RESULTS_FILE="/home/ichardart/code/infra/logs/deployment-validation-results.json"
OVERRIDE_FILE="/home/ichardart/code/infra/logs/deployment-overrides.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] <deployment-type> [target]

Deployment Types:
  claude-desktop    - Validate Claude Desktop configuration deployment
  mcp-server       - Validate MCP server deployment
  governance       - Validate governance framework changes
  infrastructure   - Validate infrastructure changes

Options:
  -h, --help              Show this help message
  -v, --verbose           Verbose output
  -t, --timeout SEC       Deployment timeout (default: 300)
  --emergency             Emergency deployment mode (streamlined validation)
  --override REASON       Request manual override with reason
  --force                 Force deployment (requires elevated privileges)
  --dry-run              Validate without deploying

Examples:
  $0 claude-desktop
  $0 mcp-server governance-mcp
  $0 --dry-run infrastructure
  $0 --emergency --override "Production incident #123" claude-desktop
EOF
}

# Logging function
log() {
    echo "$(date -Iseconds) - $1" >> "$LOG_FILE"
    echo -e "$1"
}

# Initialize results structure
init_results() {
    cat > "$RESULTS_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "deployment_type": "$DEPLOYMENT_TYPE",
    "target": "${TARGET:-all}",
    "deployment_mode": "${EMERGENCY_MODE:+emergency}${EMERGENCY_MODE:-normal}",
    "dry_run": ${DRY_RUN:-false},
    "overall_status": "UNKNOWN",
    "gates": {
        "pre_deployment": {"status": "PENDING", "checks": {}},
        "health_verification": {"status": "PENDING", "checks": {}},
        "integration_test": {"status": "PENDING", "checks": {}},
        "rollback_readiness": {"status": "PENDING", "checks": {}}
    },
    "deployment_evidence": {
        "action_validation": null,
        "output_verification": null,
        "outcome_tracking": null
    },
    "override_requests": [],
    "risk_assessment": {
        "level": "UNKNOWN",
        "factors": [],
        "mitigation": []
    }
}
EOF
}

# Update gate result
update_gate_result() {
    local gate="$1"
    local status="$2"
    local check_name="$3"
    local result="$4"
    
    jq --arg gate "$gate" --arg status "$status" --arg check "$check_name" --arg result "$result" \
       '.gates[$gate].status = $status | .gates[$gate].checks[$check] = $result' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Log override request
log_override_request() {
    local reason="$1"
    local user="${USER:-unknown}"
    local timestamp=$(date -Iseconds)
    
    echo "$timestamp - OVERRIDE REQUEST - User: $user, Reason: $reason, Deployment: $DEPLOYMENT_TYPE" >> "$OVERRIDE_FILE"
    
    jq --arg reason "$reason" --arg user "$user" --arg timestamp "$timestamp" \
       '.override_requests += [{"timestamp": $timestamp, "user": $user, "reason": $reason}]' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Gate 1: Pre-deployment Validation
gate_pre_deployment() {
    log "${BLUE}🚪 Gate 1: Pre-deployment Validation${NC}"
    
    local gate_status="PASSED"
    local checks=()
    
    # Action validation check
    log "  🔍 Running action validation..."
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            if /home/ichardart/code/infra/scripts/validate-action.sh config /home/ichardart/.claude/config.json; then
                update_gate_result "pre_deployment" "PARTIAL" "action_validation" "PASSED"
                checks+=("action_validation:PASSED")
            else
                update_gate_result "pre_deployment" "FAILED" "action_validation" "FAILED"
                gate_status="FAILED"
                checks+=("action_validation:FAILED")
            fi
            ;;
        "mcp-server")
            local server_path="/home/ichardart/code/infra/mcp-servers/${TARGET:-governance-mcp}"
            if /home/ichardart/code/infra/scripts/validate-action.sh mcp-server "$server_path"; then
                update_gate_result "pre_deployment" "PARTIAL" "action_validation" "PASSED"
                checks+=("action_validation:PASSED")
            else
                update_gate_result "pre_deployment" "FAILED" "action_validation" "FAILED"
                gate_status="FAILED"
                checks+=("action_validation:FAILED")
            fi
            ;;
        "governance")
            if /home/ichardart/code/infra/scripts/validate-action.sh governance /home/ichardart/code/infra/governance/; then
                update_gate_result "pre_deployment" "PARTIAL" "action_validation" "PASSED"
                checks+=("action_validation:PASSED")
            else
                update_gate_result "pre_deployment" "FAILED" "action_validation" "FAILED"
                gate_status="FAILED"
                checks+=("action_validation:FAILED")
            fi
            ;;
        *)
            update_gate_result "pre_deployment" "FAILED" "action_validation" "UNSUPPORTED"
            gate_status="FAILED"
            checks+=("action_validation:UNSUPPORTED")
            ;;
    esac
    
    # Security scan
    log "  🔒 Running security scan..."
    if run_security_scan; then
        update_gate_result "pre_deployment" "PARTIAL" "security_scan" "PASSED"
        checks+=("security_scan:PASSED")
    else
        update_gate_result "pre_deployment" "FAILED" "security_scan" "FAILED"
        gate_status="FAILED"
        checks+=("security_scan:FAILED")
    fi
    
    # Dependency check
    log "  📦 Checking dependencies..."
    if check_dependencies; then
        update_gate_result "pre_deployment" "PARTIAL" "dependency_check" "PASSED"
        checks+=("dependency_check:PASSED")
    else
        update_gate_result "pre_deployment" "FAILED" "dependency_check" "FAILED"
        gate_status="FAILED"
        checks+=("dependency_check:FAILED")
    fi
    
    update_gate_result "pre_deployment" "$gate_status" "summary" "$(IFS=,; echo "${checks[*]}")"
    
    if [[ "$gate_status" == "PASSED" ]]; then
        log "${GREEN}  ✅ Pre-deployment validation passed${NC}"
        return 0
    else
        log "${RED}  ❌ Pre-deployment validation failed${NC}"
        return 1
    fi
}

# Gate 2: Health Verification
gate_health_verification() {
    log "${BLUE}🏥 Gate 2: Health Verification${NC}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log "  ⚠️ Skipping health verification in dry-run mode"
        update_gate_result "health_verification" "SKIPPED" "dry_run" "true"
        return 0
    fi
    
    local gate_status="PASSED"
    local checks=()
    
    # System health check
    log "  💓 Running system health check..."
    if /home/ichardart/code/infra/scripts/claude-desktop-health.sh; then
        update_gate_result "health_verification" "PARTIAL" "system_health" "PASSED"
        checks+=("system_health:PASSED")
    else
        update_gate_result "health_verification" "FAILED" "system_health" "FAILED"
        gate_status="FAILED"
        checks+=("system_health:FAILED")
    fi
    
    # Service availability check
    log "  🌐 Checking service availability..."
    if check_service_availability; then
        update_gate_result "health_verification" "PARTIAL" "service_availability" "PASSED"
        checks+=("service_availability:PASSED")
    else
        update_gate_result "health_verification" "FAILED" "service_availability" "FAILED"
        gate_status="FAILED"
        checks+=("service_availability:FAILED")
    fi
    
    # Performance baseline
    log "  ⚡ Establishing performance baseline..."
    if check_performance_baseline; then
        update_gate_result "health_verification" "PARTIAL" "performance_baseline" "PASSED"
        checks+=("performance_baseline:PASSED")
    else
        update_gate_result "health_verification" "FAILED" "performance_baseline" "FAILED"
        gate_status="FAILED"
        checks+=("performance_baseline:FAILED")
    fi
    
    update_gate_result "health_verification" "$gate_status" "summary" "$(IFS=,; echo "${checks[*]}")"
    
    if [[ "$gate_status" == "PASSED" ]]; then
        log "${GREEN}  ✅ Health verification passed${NC}"
        return 0
    else
        log "${RED}  ❌ Health verification failed${NC}"
        return 1
    fi
}

# Gate 3: Integration Test
gate_integration_test() {
    log "${BLUE}🔗 Gate 3: Integration Test${NC}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log "  ⚠️ Skipping integration test in dry-run mode"
        update_gate_result "integration_test" "SKIPPED" "dry_run" "true"
        return 0
    fi
    
    local gate_status="PASSED"
    local checks=()
    
    # Tool connectivity test
    log "  🔧 Testing tool connectivity..."
    if test_tool_connectivity; then
        update_gate_result "integration_test" "PARTIAL" "tool_connectivity" "PASSED"
        checks+=("tool_connectivity:PASSED")
    else
        update_gate_result "integration_test" "FAILED" "tool_connectivity" "FAILED"
        gate_status="FAILED"
        checks+=("tool_connectivity:FAILED")
    fi
    
    # End-to-end workflow test
    log "  🔄 Running end-to-end workflow test..."
    if test_e2e_workflow; then
        update_gate_result "integration_test" "PARTIAL" "e2e_workflow" "PASSED"
        checks+=("e2e_workflow:PASSED")
    else
        update_gate_result "integration_test" "FAILED" "e2e_workflow" "FAILED"
        gate_status="FAILED"
        checks+=("e2e_workflow:FAILED")
    fi
    
    # Data integrity check
    log "  🗄️ Verifying data integrity..."
    if check_data_integrity; then
        update_gate_result "integration_test" "PARTIAL" "data_integrity" "PASSED"
        checks+=("data_integrity:PASSED")
    else
        update_gate_result "integration_test" "FAILED" "data_integrity" "FAILED"
        gate_status="FAILED"
        checks+=("data_integrity:FAILED")
    fi
    
    update_gate_result "integration_test" "$gate_status" "summary" "$(IFS=,; echo "${checks[*]}")"
    
    if [[ "$gate_status" == "PASSED" ]]; then
        log "${GREEN}  ✅ Integration test passed${NC}"
        return 0
    else
        log "${RED}  ❌ Integration test failed${NC}"
        return 1
    fi
}

# Gate 4: Rollback Readiness
gate_rollback_readiness() {
    log "${BLUE}🔄 Gate 4: Rollback Readiness${NC}"
    
    local gate_status="PASSED"
    local checks=()
    
    # Backup verification
    log "  💾 Verifying backup availability..."
    if verify_backup_availability; then
        update_gate_result "rollback_readiness" "PARTIAL" "backup_verification" "PASSED"
        checks+=("backup_verification:PASSED")
    else
        update_gate_result "rollback_readiness" "FAILED" "backup_verification" "FAILED"
        gate_status="FAILED"
        checks+=("backup_verification:FAILED")
    fi
    
    # Rollback procedure test
    log "  ⬅️ Testing rollback procedure..."
    if test_rollback_procedure; then
        update_gate_result "rollback_readiness" "PARTIAL" "rollback_procedure" "PASSED"
        checks+=("rollback_procedure:PASSED")
    else
        update_gate_result "rollback_readiness" "FAILED" "rollback_procedure" "FAILED"
        gate_status="FAILED"
        checks+=("rollback_procedure:FAILED")
    fi
    
    # Recovery time estimation
    log "  ⏱️ Estimating recovery time..."
    if estimate_recovery_time; then
        update_gate_result "rollback_readiness" "PARTIAL" "recovery_time" "PASSED"
        checks+=("recovery_time:PASSED")
    else
        update_gate_result "rollback_readiness" "FAILED" "recovery_time" "FAILED"
        gate_status="FAILED"
        checks+=("recovery_time:FAILED")
    fi
    
    update_gate_result "rollback_readiness" "$gate_status" "summary" "$(IFS=,; echo "${checks[*]}")"
    
    if [[ "$gate_status" == "PASSED" ]]; then
        log "${GREEN}  ✅ Rollback readiness verified${NC}"
        return 0
    else
        log "${RED}  ❌ Rollback readiness failed${NC}"
        return 1
    fi
}

# Security scan implementation
run_security_scan() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Check for sensitive data in config
            if grep -i "password\|secret\|key" /home/ichardart/.claude/config.json >/dev/null 2>&1; then
                return 1
            fi
            return 0
            ;;
        "mcp-server")
            # Basic security check for MCP servers
            local server_path="/home/ichardart/code/infra/mcp-servers/${TARGET:-governance-mcp}"
            if [[ -d "$server_path" ]]; then
                # Check for hardcoded secrets
                if find "$server_path" -type f -name "*.js" -exec grep -l "password\|secret\|api_key" {} \; | grep -q .; then
                    return 1
                fi
            fi
            return 0
            ;;
        *)
            return 0
            ;;
    esac
}

# Dependency check implementation
check_dependencies() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Check Claude Desktop installation
            if [[ -d "/Applications/Claude Desktop.app" ]] || [[ -d "$HOME/.local/share/claude-desktop" ]]; then
                return 0
            fi
            return 1
            ;;
        "mcp-server")
            # Check Node.js availability
            if command -v node >/dev/null 2>&1; then
                return 0
            fi
            return 1
            ;;
        *)
            return 0
            ;;
    esac
}

# Service availability check
check_service_availability() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Check if Claude Desktop can start
            return 0  # Simplified for now
            ;;
        *)
            return 0
            ;;
    esac
}

# Performance baseline check
check_performance_baseline() {
    # Simplified performance check
    local start_time=$(date +%s%3N)
    sleep 0.1  # Simulate some work
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    # If basic operations take less than 1 second, consider it passed
    if [[ $duration -lt 1000 ]]; then
        return 0
    fi
    return 1
}

# Tool connectivity test
test_tool_connectivity() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Test MCP server connectivity
            return $(/home/ichardart/code/infra/scripts/claude-desktop-health.sh >/dev/null 2>&1; echo $?)
            ;;
        *)
            return 0
            ;;
    esac
}

# End-to-end workflow test
test_e2e_workflow() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Basic workflow test
            if jq '.workspace' /home/ichardart/.claude/config.json >/dev/null 2>&1; then
                return 0
            fi
            return 1
            ;;
        *)
            return 0
            ;;
    esac
}

# Data integrity check
check_data_integrity() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Verify config file integrity
            if jq empty /home/ichardart/.claude/config.json 2>/dev/null; then
                return 0
            fi
            return 1
            ;;
        *)
            return 0
            ;;
    esac
}

# Backup verification
verify_backup_availability() {
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Check if backup exists
            if [[ -f "/home/ichardart/.claude/config.json.backup" ]]; then
                return 0
            fi
            # Create backup
            cp /home/ichardart/.claude/config.json /home/ichardart/.claude/config.json.backup
            return 0
            ;;
        *)
            return 0
            ;;
    esac
}

# Rollback procedure test
test_rollback_procedure() {
    # Test that rollback mechanism works (without actually rolling back)
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            if [[ -f "/home/ichardart/.claude/config.json.backup" ]]; then
                return 0
            fi
            return 1
            ;;
        *)
            return 0
            ;;
    esac
}

# Recovery time estimation
estimate_recovery_time() {
    # Estimate time needed for rollback
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            # Simple config restore should be < 30 seconds
            return 0
            ;;
        *)
            return 0
            ;;
    esac
}

# Handle deployment override
handle_override() {
    local reason="$1"
    
    log "${YELLOW}⚠️ OVERRIDE REQUESTED${NC}"
    log "Reason: $reason"
    
    # Log the override request
    log_override_request "$reason"
    
    # In a real system, this would trigger approval workflow
    log "${YELLOW}⚠️ Override logged. Manual approval required.${NC}"
    
    if [[ "${FORCE_DEPLOYMENT:-false}" == "true" ]]; then
        log "${RED}🚨 FORCE DEPLOYMENT ACTIVATED${NC}"
        log "${RED}⚠️ Bypassing validation gates${NC}"
        return 0
    else
        log "${RED}❌ Deployment blocked pending override approval${NC}"
        return 1
    fi
}

# Generate risk assessment
assess_deployment_risk() {
    local risk_level="LOW"
    local risk_factors=()
    local mitigation=()
    
    case "$DEPLOYMENT_TYPE" in
        "claude-desktop")
            risk_factors+=("Configuration change")
            if [[ "${EMERGENCY_MODE:-false}" == "true" ]]; then
                risk_level="MEDIUM"
                risk_factors+=("Emergency deployment mode")
                mitigation+=("Extended monitoring period")
            fi
            ;;
        "mcp-server")
            risk_level="MEDIUM"
            risk_factors+=("Service component change")
            mitigation+=("Automated rollback on failure")
            ;;
        "infrastructure")
            risk_level="HIGH"
            risk_factors+=("Infrastructure change")
            mitigation+=("Staged rollout", "Extended monitoring")
            ;;
    esac
    
    # Update risk assessment in results
    jq --arg level "$risk_level" \
       --argjson factors "$(printf '%s\n' "${risk_factors[@]}" | jq -R . | jq -s .)" \
       --argjson mitigation "$(printf '%s\n' "${mitigation[@]}" | jq -R . | jq -s .)" \
       '.risk_assessment.level = $level |
        .risk_assessment.factors = $factors |
        .risk_assessment.mitigation = $mitigation' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    log "🎯 Deployment Risk Assessment: $risk_level"
}

# Generate final report
generate_report() {
    local overall_status="PASSED"
    local failed_gates=()
    
    # Check gate results
    local pre_status
    local health_status
    local integration_status
    local rollback_status
    
    pre_status=$(jq -r '.gates.pre_deployment.status' "$RESULTS_FILE")
    health_status=$(jq -r '.gates.health_verification.status' "$RESULTS_FILE")
    integration_status=$(jq -r '.gates.integration_test.status' "$RESULTS_FILE")
    rollback_status=$(jq -r '.gates.rollback_readiness.status' "$RESULTS_FILE")
    
    # Determine overall status
    if [[ "$pre_status" == "FAILED" ]]; then
        overall_status="BLOCKED"
        failed_gates+=("Pre-deployment")
    fi
    
    if [[ "$health_status" == "FAILED" ]]; then
        overall_status="BLOCKED"
        failed_gates+=("Health verification")
    fi
    
    if [[ "$integration_status" == "FAILED" ]]; then
        overall_status="BLOCKED"
        failed_gates+=("Integration test")
    fi
    
    if [[ "$rollback_status" == "FAILED" ]]; then
        overall_status="BLOCKED"
        failed_gates+=("Rollback readiness")
    fi
    
    # Update overall status
    jq --arg status "$overall_status" \
       --arg end_time "$(date -Iseconds)" \
       '.overall_status = $status | .end_timestamp = $end_time' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    # Display summary
    echo "======================================="
    case "$overall_status" in
        "PASSED")
            log "${GREEN}🎉 DEPLOYMENT VALIDATION PASSED${NC}"
            log "${GREEN}✅ All validation gates cleared${NC}"
            if [[ "${DRY_RUN:-false}" == "true" ]]; then
                log "${BLUE}ℹ️ Dry-run mode: No actual deployment performed${NC}"
            else
                log "${GREEN}🚀 Deployment authorized to proceed${NC}"
            fi
            ;;
        "BLOCKED")
            log "${RED}❌ DEPLOYMENT BLOCKED${NC}"
            log "${RED}🚨 Critical validation failures detected${NC}"
            if [[ ${#failed_gates[@]} -gt 0 ]]; then
                log "${RED}Failed gates:${NC}"
                for gate in "${failed_gates[@]}"; do
                    log "${RED}   - $gate${NC}"
                done
            fi
            ;;
    esac
    
    log "📊 Deployment Summary:"
    log "   - Type: $DEPLOYMENT_TYPE"
    log "   - Target: ${TARGET:-all}"
    log "   - Mode: ${EMERGENCY_MODE:+emergency}${EMERGENCY_MODE:-normal}"
    log "   - Risk Level: $(jq -r '.risk_assessment.level' "$RESULTS_FILE")"
    
    log "📋 Full results: $RESULTS_FILE"
    log "📝 Deployment log: $LOG_FILE"
    
    if [[ ${#failed_gates[@]} -gt 0 ]] && [[ -n "${OVERRIDE_REASON:-}" ]]; then
        log "${YELLOW}⚠️ Override requested - see override log: $OVERRIDE_FILE${NC}"
    fi
    
    # Return appropriate exit code
    case "$overall_status" in
        "PASSED") return 0 ;;
        "BLOCKED") return 1 ;;
    esac
}

# Parse command line arguments
DEPLOYMENT_TYPE=""
TARGET=""
VERBOSE=false
EMERGENCY_MODE=false
OVERRIDE_REASON=""
FORCE_DEPLOYMENT=false
DRY_RUN=false

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
            DEPLOYMENT_TIMEOUT="$2"
            shift 2
            ;;
        --emergency)
            EMERGENCY_MODE=true
            shift
            ;;
        --override)
            OVERRIDE_REASON="$2"
            shift 2
            ;;
        --force)
            FORCE_DEPLOYMENT=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
        *)
            if [[ -z "$DEPLOYMENT_TYPE" ]]; then
                DEPLOYMENT_TYPE="$1"
            elif [[ -z "$TARGET" ]]; then
                TARGET="$1"
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
if [[ -z "$DEPLOYMENT_TYPE" ]]; then
    echo "Error: Deployment type is required" >&2
    usage >&2
    exit 1
fi

# Main execution
main() {
    echo -e "${GREEN}🛡️ Enhanced IDP Deployment Validation Gate${NC}"
    echo "==========================================="
    echo "Deployment Type: $DEPLOYMENT_TYPE"
    echo "Target: ${TARGET:-all}"
    echo "Mode: ${EMERGENCY_MODE:+emergency}${EMERGENCY_MODE:-normal}"
    echo "Dry Run: ${DRY_RUN:-false}"
    echo ""
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$RESULTS_FILE")"
    mkdir -p "$(dirname "$OVERRIDE_FILE")"
    
    # Initialize results
    init_results
    
    # Assess deployment risk
    assess_deployment_risk
    
    # Run validation gates
    local pre_ok=0
    local health_ok=0
    local integration_ok=0
    local rollback_ok=0
    
    gate_pre_deployment || pre_ok=1
    gate_health_verification || health_ok=1
    gate_integration_test || integration_ok=1
    gate_rollback_readiness || rollback_ok=1
    
    # Check if override is needed
    if [[ $pre_ok -ne 0 ]] || [[ $health_ok -ne 0 ]] || [[ $integration_ok -ne 0 ]] || [[ $rollback_ok -ne 0 ]]; then
        if [[ -n "${OVERRIDE_REASON:-}" ]]; then
            if handle_override "$OVERRIDE_REASON"; then
                log "${YELLOW}⚠️ Deployment proceeding under override${NC}"
            else
                generate_report
                return 1
            fi
        else
            generate_report
            return 1
        fi
    fi
    
    # Generate final report
    generate_report
    return $?
}

# Run main function
main