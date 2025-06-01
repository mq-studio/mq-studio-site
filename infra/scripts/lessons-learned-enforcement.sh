#!/bin/bash
# Lessons Learned Technical Enforcement Script
# Auto-enforces governance lessons from Claude Desktop investigation
# Part of Enhanced IDP Validation Framework

set -euo pipefail

# Configuration
LESSONS_CONFIG="/home/ichardart/code/infra/governance/lessons-learned-config.json"
ENFORCEMENT_LOG="/home/ichardart/code/infra/logs/lessons-enforcement.log"
VALIDATION_SCRIPTS_DIR="/home/ichardart/code/infra/scripts"

# Ensure log directory exists
mkdir -p "$(dirname "$ENFORCEMENT_LOG")"

log_enforcement() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" >> "$ENFORCEMENT_LOG"
}

# Lesson 1: Execution-First Governance Design
enforce_three_step_max() {
    local action_type="$1"
    local validation_script="$VALIDATION_SCRIPTS_DIR/validate-action.sh"
    
    if [[ -f "$validation_script" ]]; then
        # Check if validation takes more than 3 steps
        step_count=$(grep -c "Step [0-9]:" "$validation_script" 2>/dev/null || echo "0")
        if [[ $step_count -gt 3 ]]; then
            log_enforcement "LESSON VIOLATION: $action_type validation has $step_count steps (max 3 allowed)"
            echo "❌ Governance Lesson Violation: Validation exceeds 3-step maximum"
            echo "Current steps: $step_count | Maximum allowed: 3"
            return 1
        fi
    fi
    
    log_enforcement "✅ Three-step max enforced for $action_type"
    return 0
}

# Lesson 2: Technical Enforcement Over Human Compliance
enforce_automated_blocking() {
    local change_type="$1"
    
    # Check if pre-commit hooks are active
    if [[ ! -x "/home/ichardart/code/.git/hooks/pre-commit" ]]; then
        log_enforcement "LESSON VIOLATION: Pre-commit hooks not active - human compliance risk"
        echo "❌ Technical enforcement missing: Pre-commit hooks disabled"
        return 1
    fi
    
    # Check if cron job is active
    if ! crontab -l 2>/dev/null | grep -q "claude-desktop-health.sh"; then
        log_enforcement "LESSON VIOLATION: Automated monitoring not active"
        echo "❌ Technical enforcement missing: Health monitoring cron job not found"
        return 1
    fi
    
    log_enforcement "✅ Automated blocking enforced for $change_type"
    return 0
}

# Lesson 3: Fail-Fast Validation Gates
enforce_proactive_monitoring() {
    local service="$1"
    
    # Check if health monitoring is running within last 20 minutes
    local health_log="/home/ichardart/code/infra/logs/claude-desktop-health-results.json"
    if [[ -f "$health_log" ]]; then
        local last_check=$(stat -c %Y "$health_log" 2>/dev/null || echo "0")
        local current_time=$(date +%s)
        local time_diff=$((current_time - last_check))
        
        if [[ $time_diff -gt 1200 ]]; then  # 20 minutes
            log_enforcement "LESSON VIOLATION: Proactive monitoring stale (${time_diff}s since last check)"
            echo "❌ Fail-fast violation: Health monitoring stale (${time_diff}s ago)"
            return 1
        fi
    else
        log_enforcement "LESSON VIOLATION: No health monitoring evidence found"
        echo "❌ Fail-fast violation: No health monitoring evidence"
        return 1
    fi
    
    log_enforcement "✅ Proactive monitoring active for $service"
    return 0
}

# Lesson 4: Progressive Complexity Model
enforce_risk_based_validation() {
    local change_path="$1"
    local change_type=""
    
    # Determine change type and required validation level
    if [[ "$change_path" =~ \.claude/config\.json$ ]]; then
        change_type="critical-infrastructure"
    elif [[ "$change_path" =~ /mcp-servers/ ]]; then
        change_type="critical-infrastructure"
    elif [[ "$change_path" =~ /governance/ ]]; then
        change_type="governance"
    else
        change_type="routine"
    fi
    
    case "$change_type" in
        "critical-infrastructure")
            # Must have full 4-gate validation
            if ! /home/ichardart/code/infra/scripts/validate-deployment.sh --check-gates; then
                log_enforcement "LESSON VIOLATION: Critical infrastructure missing full validation"
                echo "❌ Progressive complexity violation: Critical change needs 4-gate validation"
                return 1
            fi
            ;;
        "governance")
            # Must have governance validation
            if ! /home/ichardart/code/infra/scripts/validate-action.sh governance "$change_path"; then
                log_enforcement "LESSON VIOLATION: Governance change failed validation"
                echo "❌ Progressive complexity violation: Governance change validation failed"
                return 1
            fi
            ;;
        "routine")
            # Basic validation sufficient
            if ! /home/ichardart/code/infra/scripts/validate-action.sh basic "$change_path"; then
                log_enforcement "LESSON VIOLATION: Routine change failed basic validation"
                echo "❌ Progressive complexity violation: Basic validation failed"
                return 1
            fi
            ;;
    esac
    
    log_enforcement "✅ Risk-based validation enforced for $change_type: $change_path"
    return 0
}

# Lesson 5: Evidence-Based Decision Making
enforce_machine_readable_results() {
    local validation_output="$1"
    
    # Check if validation outputs machine-readable JSON
    if ! echo "$validation_output" | jq empty 2>/dev/null; then
        log_enforcement "LESSON VIOLATION: Non-machine-readable validation output"
        echo "❌ Evidence-based violation: Validation output not machine-readable JSON"
        return 1
    fi
    
    # Check if result contains required fields
    local required_fields=("status" "timestamp" "validation_type")
    for field in "${required_fields[@]}"; do
        if ! echo "$validation_output" | jq -e "has(\"$field\")" >/dev/null 2>&1; then
            log_enforcement "LESSON VIOLATION: Missing required field '$field' in validation output"
            echo "❌ Evidence-based violation: Missing field '$field'"
            return 1
        fi
    done
    
    log_enforcement "✅ Machine-readable evidence enforced"
    return 0
}

# Lesson 6: Zero-Configuration Active Monitoring
enforce_zero_config_monitoring() {
    # Check if all monitoring requires zero human intervention
    local monitoring_processes=(
        "claude-desktop-health.sh"
        "pre-commit"
    )
    
    for process in "${monitoring_processes[@]}"; do
        if [[ "$process" == "pre-commit" ]]; then
            # Check if pre-commit runs automatically
            if [[ ! -x "/home/ichardart/code/.git/hooks/pre-commit" ]]; then
                log_enforcement "LESSON VIOLATION: Pre-commit requires manual activation"
                echo "❌ Zero-config violation: Pre-commit hooks not automatically active"
                return 1
            fi
        else
            # Check if process is in cron
            if ! crontab -l 2>/dev/null | grep -q "$process"; then
                log_enforcement "LESSON VIOLATION: $process not in automated schedule"
                echo "❌ Zero-config violation: $process not automatically scheduled"
                return 1
            fi
        fi
    done
    
    log_enforcement "✅ Zero-configuration monitoring enforced"
    return 0
}

# Lesson 7: Emergency Bypass with Accountability
enforce_bypass_accountability() {
    local bypass_file="/home/ichardart/code/.validation-bypass"
    
    # If bypass is active, ensure it's documented
    if [[ -f "$bypass_file" ]]; then
        local bypass_reason=$(cat "$bypass_file")
        if [[ -z "$bypass_reason" || "$bypass_reason" == "emergency reason" ]]; then
            log_enforcement "LESSON VIOLATION: Emergency bypass without proper justification"
            echo "❌ Accountability violation: Bypass active without documented reason"
            return 1
        fi
        
        # Log bypass usage
        log_enforcement "Emergency bypass active: $bypass_reason"
        echo "⚠️ Emergency bypass active: $bypass_reason"
    fi
    
    log_enforcement "✅ Bypass accountability enforced"
    return 0
}

# Main enforcement function
enforce_all_lessons() {
    local context="${1:-general}"
    local target="${2:-}"
    
    echo "🛡️ Enforcing Lessons Learned Framework..."
    log_enforcement "Starting lessons enforcement for context: $context"
    
    local violations=0
    
    # Run all lesson enforcements
    enforce_three_step_max "$context" || ((violations++))
    enforce_automated_blocking "$context" || ((violations++))
    enforce_proactive_monitoring "$context" || ((violations++))
    
    if [[ -n "$target" ]]; then
        enforce_risk_based_validation "$target" || ((violations++))
    fi
    
    enforce_zero_config_monitoring || ((violations++))
    enforce_bypass_accountability || ((violations++))
    
    if [[ $violations -eq 0 ]]; then
        echo "✅ All lessons learned successfully enforced"
        log_enforcement "✅ All lessons enforced successfully for $context"
        return 0
    else
        echo "❌ $violations lesson enforcement violations detected"
        log_enforcement "❌ $violations violations detected for $context"
        return 1
    fi
}

# Command line interface
case "${1:-help}" in
    "enforce")
        enforce_all_lessons "${2:-general}" "${3:-}"
        ;;
    "check")
        enforce_all_lessons "${2:-general}" "${3:-}" --check-only
        ;;
    "status")
        echo "📊 Lessons Learned Enforcement Status"
        if [[ -f "$ENFORCEMENT_LOG" ]]; then
            echo "Recent enforcement activity:"
            tail -5 "$ENFORCEMENT_LOG"
        else
            echo "No enforcement activity recorded"
        fi
        ;;
    *)
        echo "Usage: $0 {enforce|check|status} [context] [target]"
        echo "Examples:"
        echo "  $0 enforce mcp-server /path/to/server"
        echo "  $0 check claude-desktop"
        echo "  $0 status"
        exit 1
        ;;
esac