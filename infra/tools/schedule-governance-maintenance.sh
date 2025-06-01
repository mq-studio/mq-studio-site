#!/bin/bash
# Scheduled Governance Maintenance System
# Sets up automated governance maintenance with configurable schedules

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIFECYCLE_MANAGER="$SCRIPT_DIR/governance-lifecycle-manager.py"
CRON_FILE="/tmp/governance-maintenance-cron"
LOG_DIR="/home/ichardart/code/infra/logs"

echo "🕐 GOVERNANCE MAINTENANCE SCHEDULER"
echo "=================================="
echo ""

# Create log directory
mkdir -p "$LOG_DIR"

# Function to show current schedule
show_current_schedule() {
    echo "📅 Current Governance Maintenance Schedule:"
    echo "=========================================="
    
    if crontab -l 2>/dev/null | grep -q "governance-lifecycle-manager"; then
        echo "✅ Scheduled maintenance found:"
        crontab -l 2>/dev/null | grep "governance-lifecycle-manager" | while read line; do
            echo "   $line"
        done
    else
        echo "❌ No scheduled governance maintenance found"
    fi
    echo ""
}

# Function to create maintenance schedule
create_schedule() {
    local schedule_type="$1"
    
    echo "📝 Creating $schedule_type maintenance schedule..."
    
    # Get current crontab (excluding any existing governance maintenance)
    crontab -l 2>/dev/null | grep -v "governance-lifecycle-manager" > "$CRON_FILE" || touch "$CRON_FILE"
    
    case "$schedule_type" in
        "daily")
            # Daily maintenance at 2 AM
            echo "0 2 * * * python3 $LIFECYCLE_MANAGER --full-maintenance >> $LOG_DIR/governance-maintenance.log 2>&1" >> "$CRON_FILE"
            echo "✅ Added daily maintenance at 2:00 AM"
            ;;
        "weekly") 
            # Weekly maintenance on Sunday at 3 AM
            echo "0 3 * * 0 python3 $LIFECYCLE_MANAGER --full-maintenance >> $LOG_DIR/governance-maintenance.log 2>&1" >> "$CRON_FILE"
            echo "✅ Added weekly maintenance on Sunday at 3:00 AM"
            ;;
        "monthly")
            # Monthly maintenance on 1st at 4 AM
            echo "0 4 1 * * python3 $LIFECYCLE_MANAGER --full-maintenance >> $LOG_DIR/governance-maintenance.log 2>&1" >> "$CRON_FILE"
            echo "✅ Added monthly maintenance on 1st at 4:00 AM"
            ;;
        "custom")
            echo "Enter custom cron schedule (e.g., '0 2 * * *' for daily at 2 AM):"
            read -r custom_schedule
            echo "$custom_schedule python3 $LIFECYCLE_MANAGER --full-maintenance >> $LOG_DIR/governance-maintenance.log 2>&1" >> "$CRON_FILE"
            echo "✅ Added custom maintenance schedule: $custom_schedule"
            ;;
        *)
            echo "❌ Invalid schedule type: $schedule_type"
            return 1
            ;;
    esac
    
    # Add health monitoring (daily at 1 AM)
    echo "0 1 * * * python3 $LIFECYCLE_MANAGER --health-only >> $LOG_DIR/governance-health.log 2>&1" >> "$CRON_FILE"
    
    # Install the new crontab
    crontab "$CRON_FILE"
    rm -f "$CRON_FILE"
    
    echo "✅ Maintenance schedule installed successfully"
}

# Function to remove maintenance schedule
remove_schedule() {
    echo "🗑️ Removing governance maintenance schedule..."
    
    # Get current crontab excluding governance maintenance
    crontab -l 2>/dev/null | grep -v "governance-lifecycle-manager" > "$CRON_FILE" || touch "$CRON_FILE"
    
    # Install the cleaned crontab
    crontab "$CRON_FILE"
    rm -f "$CRON_FILE"
    
    echo "✅ Governance maintenance schedule removed"
}

# Function to test maintenance
test_maintenance() {
    echo "🧪 Testing governance maintenance..."
    echo "================================="
    
    # Run dry-run maintenance
    echo "Running dry-run maintenance test..."
    python3 "$LIFECYCLE_MANAGER" --full-maintenance --dry-run
    
    echo ""
    echo "✅ Test completed - check output above for any issues"
}

# Function to show maintenance logs
show_logs() {
    local log_type="$1"
    local lines="${2:-50}"
    
    case "$log_type" in
        "maintenance")
            if [ -f "$LOG_DIR/governance-maintenance.log" ]; then
                echo "📋 Recent Maintenance Log (last $lines lines):"
                echo "=============================================="
                tail -n "$lines" "$LOG_DIR/governance-maintenance.log"
            else
                echo "❌ No maintenance log found at $LOG_DIR/governance-maintenance.log"
            fi
            ;;
        "health")
            if [ -f "$LOG_DIR/governance-health.log" ]; then
                echo "🏥 Recent Health Log (last $lines lines):"
                echo "========================================"
                tail -n "$lines" "$LOG_DIR/governance-health.log"
            else
                echo "❌ No health log found at $LOG_DIR/governance-health.log"
            fi
            ;;
        "lifecycle")
            if [ -f "$SCRIPT_DIR/governance-lifecycle.log" ]; then
                echo "🔄 Recent Lifecycle Log (last $lines lines):"
                echo "==========================================="
                tail -n "$lines" "$SCRIPT_DIR/governance-lifecycle.log"
            else
                echo "❌ No lifecycle log found at $SCRIPT_DIR/governance-lifecycle.log"
            fi
            ;;
        "all")
            show_logs "maintenance" "$lines"
            echo ""
            show_logs "health" "$lines"
            echo ""
            show_logs "lifecycle" "$lines"
            ;;
        *)
            echo "❌ Invalid log type. Use: maintenance, health, lifecycle, or all"
            ;;
    esac
}

# Function to show system status
show_status() {
    echo "📊 GOVERNANCE MAINTENANCE SYSTEM STATUS"
    echo "======================================"
    echo ""
    
    # Check if lifecycle manager exists and is executable
    if [ -x "$LIFECYCLE_MANAGER" ]; then
        echo "✅ Lifecycle Manager: Ready"
    else
        echo "❌ Lifecycle Manager: Not found or not executable"
        echo "   Expected: $LIFECYCLE_MANAGER"
    fi
    
    # Check cron service
    if systemctl is-active cron >/dev/null 2>&1 || systemctl is-active crond >/dev/null 2>&1; then
        echo "✅ Cron Service: Running"
    else
        echo "⚠️ Cron Service: Status unknown"
    fi
    
    # Check log directory
    if [ -d "$LOG_DIR" ] && [ -w "$LOG_DIR" ]; then
        echo "✅ Log Directory: Ready ($LOG_DIR)"
    else
        echo "❌ Log Directory: Not writable ($LOG_DIR)"
    fi
    
    # Show disk space for logs
    local log_space
    log_space=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1 || echo "unknown")
    echo "📁 Log Space Used: $log_space"
    
    echo ""
    show_current_schedule
    
    # Show recent activity
    echo "📈 Recent Activity:"
    echo "=================="
    
    if [ -f "$LOG_DIR/governance-maintenance.log" ]; then
        local last_maintenance
        last_maintenance=$(tail -n 1 "$LOG_DIR/governance-maintenance.log" 2>/dev/null | head -c 50)
        echo "🔧 Last Maintenance: ${last_maintenance}..."
    else
        echo "🔧 Last Maintenance: Never"
    fi
    
    if [ -f "$LOG_DIR/governance-health.log" ]; then
        local last_health
        last_health=$(tail -n 1 "$LOG_DIR/governance-health.log" 2>/dev/null | head -c 50)
        echo "🏥 Last Health Check: ${last_health}..."
    else
        echo "🏥 Last Health Check: Never"
    fi
}

# Main menu function
show_menu() {
    echo "🏛️ GOVERNANCE MAINTENANCE SCHEDULER"
    echo "=================================="
    echo ""
    echo "Options:"
    echo "  1) Show current schedule"
    echo "  2) Create daily maintenance schedule"
    echo "  3) Create weekly maintenance schedule"
    echo "  4) Create monthly maintenance schedule"
    echo "  5) Create custom schedule"
    echo "  6) Remove maintenance schedule"
    echo "  7) Test maintenance (dry run)"
    echo "  8) View logs"
    echo "  9) Show system status"
    echo "  0) Exit"
    echo ""
    read -p "Select option (0-9): " choice
    
    case "$choice" in
        1) show_current_schedule ;;
        2) create_schedule "daily" ;;
        3) create_schedule "weekly" ;;
        4) create_schedule "monthly" ;;
        5) create_schedule "custom" ;;
        6) remove_schedule ;;
        7) test_maintenance ;;
        8) 
            echo ""
            echo "Log types: maintenance, health, lifecycle, all"
            read -p "Enter log type: " log_type
            read -p "Number of lines (default 50): " log_lines
            show_logs "$log_type" "${log_lines:-50}"
            ;;
        9) show_status ;;
        0) echo "Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option"; ;;
    esac
}

# Command line interface
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        echo ""
        show_menu
        echo ""
        read -p "Press Enter to continue..." 
        clear
    done
else
    # Command line mode
    case "$1" in
        "status")
            show_status
            ;;
        "schedule")
            if [ -n "$2" ]; then
                create_schedule "$2"
            else
                echo "Usage: $0 schedule [daily|weekly|monthly|custom]"
            fi
            ;;
        "remove")
            remove_schedule
            ;;
        "test")
            test_maintenance
            ;;
        "logs")
            show_logs "${2:-all}" "${3:-50}"
            ;;
        "help")
            echo "Governance Maintenance Scheduler"
            echo ""
            echo "Usage:"
            echo "  $0                    # Interactive mode"
            echo "  $0 status            # Show system status"
            echo "  $0 schedule [type]   # Create schedule (daily/weekly/monthly/custom)"
            echo "  $0 remove            # Remove schedule"
            echo "  $0 test              # Test maintenance"
            echo "  $0 logs [type]       # View logs (maintenance/health/lifecycle/all)"
            echo "  $0 help              # Show this help"
            ;;
        *)
            echo "❌ Unknown command: $1"
            echo "Use '$0 help' for usage information"
            ;;
    esac
fi