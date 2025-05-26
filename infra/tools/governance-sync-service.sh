#!/bin/bash

# IDP Governance Synchronization Service
# Manages real-time governance context synchronization across all Claude clients

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
VENV_PATH="$INFRA_DIR/governance-sync-env"
WATCHER_SCRIPT="$SCRIPT_DIR/governance-watcher.py"
PID_FILE="$INFRA_DIR/logs/governance-sync.pid"
LOG_FILE="$INFRA_DIR/logs/governance-sync-service.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure directories exist
mkdir -p "$(dirname "$PID_FILE")"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

start_service() {
    echo -e "${BLUE}🔄 Starting IDP Governance Synchronization Service${NC}"
    
    # Check if already running
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️ Service already running (PID: $PID)${NC}"
            return 1
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # Check dependencies
    if [ ! -d "$VENV_PATH" ]; then
        echo -e "${RED}❌ Virtual environment not found. Setting up...${NC}"
        setup_environment
    fi
    
    if [ ! -f "$WATCHER_SCRIPT" ]; then
        echo -e "${RED}❌ Governance watcher script not found: $WATCHER_SCRIPT${NC}"
        return 1
    fi
    
    # Start the service
    log "Starting governance synchronization service"
    
    nohup "$VENV_PATH/bin/python" "$WATCHER_SCRIPT" --daemon > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service started successfully (PID: $PID)${NC}"
        log "Governance synchronization service started (PID: $PID)"
        
        echo ""
        echo "📋 Service Details:"
        echo "• PID: $PID"
        echo "• Log file: $LOG_FILE"
        echo "• Monitoring: Governance artifacts for real-time changes"
        echo "• Syncing: Claude Code, Claude Desktop, Cline"
        echo ""
        echo "🛠️ Management commands:"
        echo "• Stop: $0 stop"
        echo "• Status: $0 status"
        echo "• Restart: $0 restart"
        echo "• Logs: tail -f $LOG_FILE"
        
        return 0
    else
        echo -e "${RED}❌ Failed to start service${NC}"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_service() {
    echo -e "${BLUE}🛑 Stopping IDP Governance Synchronization Service${NC}"
    
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}⚠️ Service not running (no PID file)${NC}"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        log "Stopping governance synchronization service (PID: $PID)"
        kill "$PID"
        
        # Wait for process to stop
        sleep 2
        if ps -p "$PID" > /dev/null 2>&1; then
            log "Force stopping governance synchronization service"
            kill -9 "$PID"
        fi
        
        rm -f "$PID_FILE"
        echo -e "${GREEN}✅ Service stopped${NC}"
        log "Governance synchronization service stopped"
        return 0
    else
        echo -e "${YELLOW}⚠️ Service not running (stale PID file)${NC}"
        rm -f "$PID_FILE"
        return 1
    fi
}

status_service() {
    echo -e "${BLUE}📊 IDP Governance Synchronization Service Status${NC}"
    echo "=" * 55
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Service is running (PID: $PID)${NC}"
            
            # Show process info
            echo ""
            echo "📋 Process Details:"
            ps -p "$PID" -o pid,ppid,cmd,etime,cpu,mem
            
            # Show recent log entries
            if [ -f "$LOG_FILE" ]; then
                echo ""
                echo "📝 Recent Log Entries:"
                tail -5 "$LOG_FILE"
            fi
            
            # Show sync status
            if [ -f "$WATCHER_SCRIPT" ]; then
                echo ""
                echo "🔍 Synchronization Status:"
                "$VENV_PATH/bin/python" "$WATCHER_SCRIPT" --status
            fi
            
            return 0
        else
            echo -e "${RED}❌ Service not running (stale PID file)${NC}"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo -e "${RED}❌ Service not running${NC}"
        return 1
    fi
}

restart_service() {
    echo -e "${BLUE}🔄 Restarting IDP Governance Synchronization Service${NC}"
    stop_service
    sleep 2
    start_service
}

setup_environment() {
    echo -e "${BLUE}🔧 Setting up governance synchronization environment${NC}"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "$VENV_PATH" ]; then
        echo "📦 Creating virtual environment..."
        python3 -m venv "$VENV_PATH"
    fi
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    "$VENV_PATH/bin/pip" install watchdog > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Environment setup complete${NC}"
    else
        echo -e "${RED}❌ Failed to setup environment${NC}"
        return 1
    fi
}

test_service() {
    echo -e "${BLUE}🧪 Testing Governance Synchronization${NC}"
    
    if [ ! -f "$WATCHER_SCRIPT" ]; then
        echo -e "${RED}❌ Watcher script not found${NC}"
        return 1
    fi
    
    echo "🔍 Running synchronization test..."
    "$VENV_PATH/bin/python" "$WATCHER_SCRIPT" --test
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Test completed successfully${NC}"
    else
        echo -e "${RED}❌ Test failed${NC}"
        return 1
    fi
}

show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}📝 Governance Synchronization Logs${NC}"
        echo "=" * 40
        tail -f "$LOG_FILE"
    else
        echo -e "${YELLOW}⚠️ No log file found${NC}"
    fi
}

show_help() {
    echo -e "${BLUE}IDP Governance Synchronization Service${NC}"
    echo "====================================="
    echo ""
    echo "Manages real-time synchronization of governance context across all Claude clients."
    echo ""
    echo "Usage: $0 {start|stop|restart|status|test|logs|setup|help}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the synchronization service"
    echo "  stop    - Stop the synchronization service"  
    echo "  restart - Restart the synchronization service"
    echo "  status  - Show service status and sync info"
    echo "  test    - Test the synchronization system"
    echo "  logs    - Show real-time service logs"
    echo "  setup   - Setup/repair the service environment"
    echo "  help    - Show this help message"
    echo ""
    echo "Features:"
    echo "• Real-time monitoring of governance artifacts"
    echo "• Automatic context updates for Claude Code"
    echo "• Automatic context updates for Claude Desktop" 
    echo "• MCP server status synchronization"
    echo "• Change history tracking"
    echo ""
    echo "Files:"
    echo "• Service log: $LOG_FILE"
    echo "• PID file: $PID_FILE"
    echo "• Watcher script: $WATCHER_SCRIPT"
}

# Main command handling
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    test)
        test_service
        ;;
    logs)
        show_logs
        ;;
    setup)
        setup_environment
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac