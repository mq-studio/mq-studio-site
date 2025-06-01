#!/bin/bash
# Activate IDP Dynamic Inventory and Governance Systems

echo "🚀 Activating IDP Dynamic Inventory System..."
echo "============================================"

# 1. Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install watchdog

# 2. Initialize the inventory database
echo "🗄️ Initializing inventory database..."
cd /home/ichardart/code
if [ -f "infra/tools/idp-directory-analyzer.py" ]; then
    python3 infra/tools/idp-directory-analyzer.py
    echo "✅ Directory analysis complete"
fi

if [ -f "infra/tools/init-inventory-db.py" ]; then
    python3 infra/tools/init-inventory-db.py
    echo "✅ Inventory database initialized"
fi

# 3. Start filesystem watcher
echo "👁️ Starting filesystem watcher..."
if [ -f "infra/tools/filesystem-watcher.py" ]; then
    nohup python3 infra/tools/filesystem-watcher.py > /home/ichardart/code/infra/logs/filesystem-watcher.log 2>&1 &
    echo "✅ Filesystem watcher started (PID: $!)"
    echo $! > /home/ichardart/code/infra/data/filesystem-watcher.pid
fi

# 4. Start governance sync service
echo "🔄 Starting governance sync service..."
if [ -f "infra/tools/governance-sync-service.sh" ]; then
    bash infra/tools/governance-sync-service.sh start
    echo "✅ Governance sync service started"
fi

# 5. Refresh governance for all clients
echo "📋 Refreshing governance context..."
if [ -f "infra/tools/governance-auto-refresh.py" ]; then
    python3 infra/tools/governance-auto-refresh.py --refresh-all
    echo "✅ Governance context refreshed"
fi

# 6. Check status
echo ""
echo "📊 System Status:"
echo "================"
bash infra/tools/governance-sync-service.sh status

echo ""
echo "✅ IDP systems activation complete!"
echo "💡 Use 'governance-sync-status' to check status anytime"
