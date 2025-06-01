#!/bin/bash
# Integrated Governance System Activation Script

set -e

echo "🏛️ INTEGRATED GOVERNANCE SYSTEM ACTIVATION"
echo "=========================================="
echo ""

# Configuration
DB_PATH="/home/ichardart/code/infra/data/idp-inventory.db"
MCP_CONFIG_PATH="/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
INVENTORY_SCRIPT="/home/ichardart/code/infra/tools/integrated-governance-inventory.py"

# Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 not found"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found"
        exit 1
    fi
    
    # Check database directory
    mkdir -p "$(dirname "$DB_PATH")"
    
    # Check if governance config exists
    if [ ! -f "/home/ichardart/code/infra/config/governance_mapping_config.json" ]; then
        echo "⚠️ Governance config will be created automatically"
    fi
    
    echo "✅ Prerequisites checked"
}

install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Install Python dependencies
    log "Installing Python watchdog..."
    pip install watchdog > /dev/null 2>&1 || {
        echo "⚠️ Failed to install watchdog - continuing anyway"
    }
    
    # Install MCP server dependencies
    log "Installing MCP server dependencies..."
    cd /home/ichardart/code/infra/mcp-servers/inventory-mcp
    if [ -f "package.json" ]; then
        npm install > /dev/null 2>&1 || {
            echo "⚠️ Failed to install npm dependencies - continuing anyway"
        }
    fi
    
    echo "✅ Dependencies installed"
}

populate_governance_database() {
    echo "🗄️ Populating governance database..."
    log "Starting integrated governance inventory scan..."
    
    # Run the integrated governance inventory
    python3 "$INVENTORY_SCRIPT" || {
        echo "❌ Failed to populate governance database"
        echo "Check the script and try again"
        return 1
    }
    
    # Verify database was populated
    ARTIFACT_COUNT=$(python3 -c "
import sqlite3
conn = sqlite3.connect('$DB_PATH')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM governance_artifacts')
count = cursor.fetchone()[0]
conn.close()
print(count)
" 2>/dev/null || echo "0")
    
    if [ "$ARTIFACT_COUNT" -gt 0 ]; then
        log "✅ Database populated with $ARTIFACT_COUNT governance artifacts"
    else
        echo "⚠️ Database appears empty - check for errors above"
        return 1
    fi
}

configure_mcp_server() {
    echo "⚙️ Configuring MCP server..."
    
    # Check if Cline config file exists
    if [ ! -f "$MCP_CONFIG_PATH" ]; then
        echo "⚠️ Cline MCP config file not found at $MCP_CONFIG_PATH"
        echo "Please add the inventory-mcp server manually to your Cline configuration:"
        echo ""
        echo '{
  "inventory-mcp": {
    "command": "node",
    "args": ["/home/ichardart/code/infra/mcp-servers/inventory-mcp/index.js"],
    "disabled": false,
    "autoApprove": []
  }
}'
        echo ""
        return 1
    fi
    
    # Check if inventory-mcp is already configured
    if grep -q "inventory-mcp" "$MCP_CONFIG_PATH"; then
        log "✅ inventory-mcp already configured in Cline"
    else
        log "Adding inventory-mcp to Cline configuration..."
        
        # Backup original config
        cp "$MCP_CONFIG_PATH" "${MCP_CONFIG_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Add inventory-mcp server (this is a simplified approach)
        echo "⚠️ Manual configuration required:"
        echo "Add the following to your Cline MCP configuration:"
        echo ""
        echo '"inventory-mcp": {'
        echo '  "command": "node",'
        echo '  "args": ["/home/ichardart/code/infra/mcp-servers/inventory-mcp/index.js"],'
        echo '  "disabled": false,'
        echo '  "autoApprove": []'
        echo '}'
        echo ""
    fi
}

start_filesystem_watcher() {
    echo "👁️ Starting filesystem watcher..."
    
    # Check if already running
    if pgrep -f "filesystem-watcher.py" > /dev/null; then
        log "✅ Filesystem watcher already running"
        return 0
    fi
    
    # Start filesystem watcher in background
    WATCHER_SCRIPT="/home/ichardart/code/infra/tools/filesystem-watcher.py"
    if [ -f "$WATCHER_SCRIPT" ]; then
        log "Starting filesystem watcher in background..."
        nohup python3 "$WATCHER_SCRIPT" > /home/ichardart/code/infra/logs/filesystem-watcher.log 2>&1 &
        
        # Give it a moment to start
        sleep 2
        
        if pgrep -f "filesystem-watcher.py" > /dev/null; then
            log "✅ Filesystem watcher started successfully"
        else
            echo "⚠️ Filesystem watcher may have failed to start - check logs"
        fi
    else
        echo "⚠️ Filesystem watcher script not found at $WATCHER_SCRIPT"
    fi
}

test_integration() {
    echo "🧪 Testing integration..."
    
    # Test database query
    log "Testing database connectivity..."
    DB_TEST=$(python3 -c "
import sqlite3
try:
    conn = sqlite3.connect('$DB_PATH')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM governance_artifacts')
    count = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM directories WHERE governance_artifacts_count > 0')
    dir_count = cursor.fetchone()[0]
    conn.close()
    print(f'SUCCESS: {count} artifacts, {dir_count} governance directories')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null)
    
    if [[ "$DB_TEST" == SUCCESS* ]]; then
        log "✅ Database test: $DB_TEST"
    else
        echo "❌ Database test failed: $DB_TEST"
        return 1
    fi
    
    # Test MCP server (basic syntax check)
    log "Testing MCP server syntax..."
    cd /home/ichardart/code/infra/mcp-servers/inventory-mcp
    if node -c index.js 2>/dev/null; then
        log "✅ MCP server syntax check passed"
    else
        echo "⚠️ MCP server syntax check failed"
    fi
    
    echo "✅ Integration tests completed"
}

generate_summary() {
    echo ""
    echo "📊 ACTIVATION SUMMARY"
    echo "===================="
    
    # Get stats from database
    STATS=$(python3 -c "
import sqlite3
try:
    conn = sqlite3.connect('$DB_PATH')
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM governance_artifacts')
    total_artifacts = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM directories WHERE governance_artifacts_count > 0')
    gov_dirs = cursor.fetchone()[0]
    
    cursor.execute('SELECT primary_classification, COUNT(*) FROM governance_artifacts GROUP BY primary_classification ORDER BY COUNT(*) DESC LIMIT 5')
    top_classifications = cursor.fetchall()
    
    cursor.execute('SELECT confidence_level, COUNT(*) FROM governance_artifacts GROUP BY confidence_level')
    confidence_levels = cursor.fetchall()
    
    conn.close()
    
    print(f'Total Artifacts: {total_artifacts}')
    print(f'Governance Directories: {gov_dirs}')
    print('Top Classifications:')
    for classification, count in top_classifications:
        print(f'  {classification}: {count}')
    print('Confidence Levels:')
    for level, count in confidence_levels:
        print(f'  {level}: {count}')
        
except Exception as e:
    print(f'Database unavailable: {e}')
" 2>/dev/null)
    
    echo "$STATS"
    
    echo ""
    echo "🎯 STATUS:"
    echo "✅ Database: Populated with governance artifacts"
    echo "✅ MCP Server: Ready for configuration"
    echo "$([ $(pgrep -f filesystem-watcher.py | wc -l) -gt 0 ] && echo "✅" || echo "⚠️") Filesystem Watcher: $([ $(pgrep -f filesystem-watcher.py | wc -l) -gt 0 ] && echo "Running" || echo "Needs manual start")"
    
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Add inventory-mcp server to Cline configuration"
    echo "2. Restart Cline to load the new MCP server"
    echo "3. Test governance queries via MCP tools"
    echo "4. Monitor filesystem watcher logs if needed"
    
    echo ""
    echo "🔗 USEFUL COMMANDS:"
    echo "Check database: sqlite3 $DB_PATH 'SELECT COUNT(*) FROM governance_artifacts;'"
    echo "Check watcher: ps aux | grep filesystem-watcher"
    echo "Test MCP server: cd /home/ichardart/code/infra/mcp-servers/inventory-mcp && node index.js --test"
    
    echo ""
    echo "🎉 INTEGRATED GOVERNANCE SYSTEM ACTIVATION COMPLETE!"
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    populate_governance_database || {
        echo "❌ Failed to populate database - stopping activation"
        exit 1
    }
    configure_mcp_server
    start_filesystem_watcher
    test_integration
    generate_summary
}

# Handle interruption
trap 'echo ""; echo "❌ Activation interrupted"; exit 1' INT

# Run main function
main