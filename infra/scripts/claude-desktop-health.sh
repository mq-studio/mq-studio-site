#!/bin/bash
# Enhanced Claude Desktop Health Check System
# Implements automated validation gates from Enhanced Validation Framework v2.0

set -e

# Configuration
HEALTH_CHECK_TIMEOUT=30
MCP_SERVER_TIMEOUT=10
LOG_FILE="/home/ichardart/code/infra/logs/claude-desktop-health.log"
RESULTS_FILE="/home/ichardart/code/infra/logs/claude-desktop-health-results.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
    "overall_status": "UNKNOWN",
    "tests": {
        "config_validation": {"status": "PENDING", "details": ""},
        "mcp_connectivity": {"status": "PENDING", "servers": {}},
        "tool_availability": {"status": "PENDING", "details": ""},
        "basic_functionality": {"status": "PENDING", "details": ""}
    },
    "summary": {
        "total_servers": 0,
        "responsive_servers": 0,
        "failed_servers": 0,
        "critical_failures": []
    }
}
EOF
}

# Update results JSON
update_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    jq --arg test "$test_name" --arg status "$status" --arg details "$details" \
       '.tests[$test].status = $status | .tests[$test].details = $details' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Update server result
update_server_result() {
    local server_name="$1"
    local status="$2"
    local details="$3"
    
    jq --arg server "$server_name" --arg status "$status" --arg details "$details" \
       '.tests.mcp_connectivity.servers[$server] = {"status": $status, "details": $details}' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Validate Claude Desktop configuration
validate_config() {
    log "${GREEN}🔍 CLAUDE DESKTOP HEALTH CHECK${NC}"
    log "================================"
    
    if [[ ! -f ~/.claude/config.json ]]; then
        update_result "config_validation" "FAILED" "Claude Desktop config file not found"
        log "${RED}❌ Claude Desktop config file not found${NC}"
        return 1
    fi
    
    if ! jq empty ~/.claude/config.json 2>/dev/null; then
        update_result "config_validation" "FAILED" "Invalid JSON in config file"
        log "${RED}❌ Invalid JSON in Claude Desktop config${NC}"
        return 1
    fi
    
    update_result "config_validation" "PASSED" "Configuration file valid"
    log "${GREEN}✅ Configuration file validation passed${NC}"
    return 0
}

# Test MCP server connectivity
test_mcp_connectivity() {
    log "${YELLOW}Testing MCP server connectivity...${NC}"
    
    local servers
    if ! servers=$(jq -r '.mcpServers | keys[]' ~/.claude/config.json 2>/dev/null); then
        update_result "mcp_connectivity" "FAILED" "Cannot read server list from config"
        log "${RED}❌ Cannot read server list from config${NC}"
        return 1
    fi
    
    local total_servers=0
    local responsive_servers=0
    local failed_servers=0
    local critical_failures=()
    
    while IFS= read -r server; do
        if [[ -z "$server" ]]; then continue; fi
        
        total_servers=$((total_servers + 1))
        log "  Testing server: $server"
        
        # Get server configuration
        local command
        local args
        local env_vars
        
        command=$(jq -r --arg server "$server" '.mcpServers[$server].command' ~/.claude/config.json)
        args=$(jq -r --arg server "$server" '.mcpServers[$server].args // []' ~/.claude/config.json)
        env_vars=$(jq -r --arg server "$server" '.mcpServers[$server].env // {}' ~/.claude/config.json)
        
        # Test server startup
        if test_single_server "$server" "$command" "$args" "$env_vars"; then
            responsive_servers=$((responsive_servers + 1))
            update_server_result "$server" "RESPONSIVE" "Server started and responded successfully"
            log "${GREEN}    ✅ $server: Responsive${NC}"
        else
            failed_servers=$((failed_servers + 1))
            critical_failures+=("$server")
            update_server_result "$server" "FAILED" "Server failed to start or respond"
            log "${RED}    ❌ $server: Failed${NC}"
        fi
    done <<< "$servers"
    
    # Update summary
    jq --arg total "$total_servers" --arg responsive "$responsive_servers" --arg failed "$failed_servers" \
       --argjson failures "$(printf '%s\n' "${critical_failures[@]}" | jq -R . | jq -s .)" \
       '.summary.total_servers = ($total | tonumber) | 
        .summary.responsive_servers = ($responsive | tonumber) |
        .summary.failed_servers = ($failed | tonumber) |
        .summary.critical_failures = $failures' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    if [[ $failed_servers -eq 0 ]]; then
        update_result "mcp_connectivity" "PASSED" "All $total_servers servers responsive"
        log "${GREEN}✅ All MCP servers responding ($responsive_servers/$total_servers)${NC}"
        return 0
    else
        update_result "mcp_connectivity" "FAILED" "$failed_servers of $total_servers servers failed"
        log "${RED}❌ MCP connectivity failed ($failed_servers/$total_servers servers failed)${NC}"
        return 1
    fi
}

# Test individual server
test_single_server() {
    local server_name="$1"
    local command="$2"
    local args="$3"
    local env_vars="$4"
    
    # Special handling for different server types
    case "$server_name" in
        "governance-mcp")
            return $(test_governance_server)
            ;;
        *)
            return $(test_generic_server "$server_name" "$command" "$args" "$env_vars")
            ;;
    esac
}

# Test governance MCP server specifically
test_governance_server() {
    local server_path="/home/ichardart/code/infra/mcp-servers/governance-mcp"
    
    if [[ ! -f "$server_path/index.js" ]]; then
        return 1
    fi
    
    # Test if server can start without errors
    timeout $MCP_SERVER_TIMEOUT node "$server_path/index.js" --test-mode 2>/dev/null || return 1
    return 0
}

# Test generic MCP server
test_generic_server() {
    local server_name="$1"
    local command="$2"
    local args="$3"
    local env_vars="$4"
    
    # Create temporary test script
    local test_script="/tmp/test_${server_name}_$$"
    
    cat > "$test_script" << EOF
#!/bin/bash
export \$(echo '$env_vars' | jq -r 'to_entries[] | "\(.key)=\(.value)"' 2>/dev/null || true)

if [[ "$command" == "npx" ]]; then
    # For npx servers, just check if the package exists
    npx --yes \$(echo '$args' | jq -r '.[0]' 2>/dev/null || echo 'unknown') --help >/dev/null 2>&1
elif [[ "$command" == "node" ]]; then
    # For node servers, try to run with timeout
    timeout $MCP_SERVER_TIMEOUT \$($command \$(echo '$args' | jq -r '.[]' 2>/dev/null | tr '\n' ' ')) --help >/dev/null 2>&1 || \
    timeout $MCP_SERVER_TIMEOUT \$($command \$(echo '$args' | jq -r '.[]' 2>/dev/null | tr '\n' ' ')) >/dev/null 2>&1
else
    # Generic command test
    timeout $MCP_SERVER_TIMEOUT \$($command --help) >/dev/null 2>&1
fi
EOF
    
    chmod +x "$test_script"
    
    if timeout $MCP_SERVER_TIMEOUT "$test_script" 2>/dev/null; then
        rm -f "$test_script"
        return 0
    else
        rm -f "$test_script"
        return 1
    fi
}

# Test tool availability (simplified check)
test_tool_availability() {
    log "${YELLOW}Verifying tool availability...${NC}"
    
    # Check if Claude Desktop is installed and accessible
    if command -v claude-desktop >/dev/null 2>&1; then
        update_result "tool_availability" "PASSED" "Claude Desktop CLI available"
        log "${GREEN}✅ Claude Desktop CLI available${NC}"
        return 0
    else
        # Alternative check for Claude Desktop installation
        if [[ -d "/Applications/Claude Desktop.app" ]] || [[ -d "$HOME/.local/share/claude-desktop" ]]; then
            update_result "tool_availability" "PARTIAL" "Claude Desktop installed but CLI not in PATH"
            log "${YELLOW}⚠️ Claude Desktop installed but CLI not accessible${NC}"
            return 0
        else
            update_result "tool_availability" "FAILED" "Claude Desktop not found"
            log "${RED}❌ Claude Desktop not found${NC}"
            return 1
        fi
    fi
}

# Test basic functionality
test_basic_functionality() {
    log "${YELLOW}Testing basic functionality...${NC}"
    
    # Create a simple test to verify the config can be read and parsed
    local test_output
    if test_output=$(jq -r '.workspace // "/home/ichardart/code"' ~/.claude/config.json 2>&1); then
        update_result "basic_functionality" "PASSED" "Configuration readable, workspace: $test_output"
        log "${GREEN}✅ Basic functionality test passed${NC}"
        return 0
    else
        update_result "basic_functionality" "FAILED" "Configuration parsing failed: $test_output"
        log "${RED}❌ Basic functionality test failed${NC}"
        return 1
    fi
}

# Generate final report
generate_report() {
    local overall_status="PASSED"
    local critical_issues=()
    
    # Check each test result
    local config_status
    local mcp_status
    local tool_status
    local func_status
    
    config_status=$(jq -r '.tests.config_validation.status' "$RESULTS_FILE")
    mcp_status=$(jq -r '.tests.mcp_connectivity.status' "$RESULTS_FILE")
    tool_status=$(jq -r '.tests.tool_availability.status' "$RESULTS_FILE")
    func_status=$(jq -r '.tests.basic_functionality.status' "$RESULTS_FILE")
    
    # Determine overall status
    if [[ "$config_status" == "FAILED" ]] || [[ "$func_status" == "FAILED" ]]; then
        overall_status="FAILED"
        critical_issues+=("Critical system failure")
    elif [[ "$mcp_status" == "FAILED" ]]; then
        overall_status="DEGRADED"
        critical_issues+=("MCP server failures detected")
    elif [[ "$tool_status" == "FAILED" ]]; then
        overall_status="DEGRADED"
        critical_issues+=("Tool availability issues")
    fi
    
    # Update overall status
    jq --arg status "$overall_status" --argjson issues "$(printf '%s\n' "${critical_issues[@]}" | jq -R . | jq -s .)" \
       '.overall_status = $status | .critical_issues = $issues' \
       "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
    
    # Display summary
    log "================================"
    case "$overall_status" in
        "PASSED")
            log "${GREEN}🎉 HEALTH CHECK PASSED${NC}"
            log "${GREEN}✅ All systems operational${NC}"
            ;;
        "DEGRADED")
            log "${YELLOW}⚠️ HEALTH CHECK DEGRADED${NC}"
            log "${YELLOW}⚠️ Some services have issues but core functionality available${NC}"
            ;;
        "FAILED")
            log "${RED}❌ HEALTH CHECK FAILED${NC}"
            log "${RED}❌ Critical system failures detected${NC}"
            ;;
    esac
    
    local responsive
    local total
    responsive=$(jq -r '.summary.responsive_servers' "$RESULTS_FILE")
    total=$(jq -r '.summary.total_servers' "$RESULTS_FILE")
    log "📊 MCP Servers: $responsive/$total responsive"
    
    if [[ ${#critical_issues[@]} -gt 0 ]]; then
        log "${RED}🚨 Critical Issues:${NC}"
        for issue in "${critical_issues[@]}"; do
            log "${RED}   - $issue${NC}"
        done
    fi
    
    log "📋 Full results: $RESULTS_FILE"
    log "📝 Health check log: $LOG_FILE"
    
    # Return appropriate exit code
    case "$overall_status" in
        "PASSED") return 0 ;;
        "DEGRADED") return 1 ;;
        "FAILED") return 2 ;;
    esac
}

# Main execution
main() {
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$RESULTS_FILE")"
    
    # Initialize results
    init_results
    
    # Run health checks
    local config_ok=0
    local mcp_ok=0
    local tool_ok=0
    local func_ok=0
    
    validate_config || config_ok=1
    test_mcp_connectivity || mcp_ok=1
    test_tool_availability || tool_ok=1
    test_basic_functionality || func_ok=1
    
    # Generate final report
    generate_report
    return $?
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi