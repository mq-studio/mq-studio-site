#!/bin/bash

# IDP Monitoring Dashboard Startup Script
# Ensures dashboard is running and accessible

echo "🚀 IDP Monitoring Dashboard Startup"
echo "==================================="

# Check if already running
if pgrep -f "production-monitoring-system.js" > /dev/null; then
    echo "✅ Dashboard already running"
    PID=$(pgrep -f "production-monitoring-system.js")
    echo "📊 Process ID: $PID"
else
    echo "🔧 Starting dashboard service..."
    cd /home/ichardart/code/infra/monitoring
    
    # Start in background
    nohup node production-monitoring-system.js > dashboard.log 2>&1 &
    
    # Wait a moment for startup
    sleep 3
    
    if pgrep -f "production-monitoring-system.js" > /dev/null; then
        echo "✅ Dashboard started successfully"
        PID=$(pgrep -f "production-monitoring-system.js")
        echo "📊 Process ID: $PID"
    else
        echo "❌ Failed to start dashboard"
        echo "📋 Check log: cat /home/ichardart/code/infra/monitoring/dashboard.log"
        exit 1
    fi
fi

# Test connection
echo ""
echo "🔍 Testing dashboard connection..."
if curl -s -f http://localhost:3001/health > /dev/null; then
    echo "✅ Dashboard accessible at: http://localhost:3001"
    echo "📊 Metrics available at: http://localhost:3001/metrics"
    echo "🏥 Health check at: http://localhost:3001/health"
else
    echo "⚠️ Dashboard running but not responding"
    echo "🔧 May need a moment to fully initialize"
fi

echo ""
echo "🌐 Access Options:"
echo "=================="
echo "🔗 Primary URL: http://localhost:3001"
echo "🔗 Alternative: http://127.0.0.1:3001"
echo "📱 Direct access file: /home/ichardart/code/infra/monitoring/dashboard-direct-access.html"

echo ""
echo "🛠️ Management Commands:"
echo "======================="
echo "📊 View logs: tail -f /home/ichardart/code/infra/monitoring/dashboard.log"
echo "🔄 Restart: pkill -f production-monitoring-system.js && bash $0"
echo "🛑 Stop: pkill -f production-monitoring-system.js"

echo ""
echo "✅ Dashboard startup complete!"