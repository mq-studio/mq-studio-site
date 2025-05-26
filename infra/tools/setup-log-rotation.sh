#!/bin/bash
# Setup Log Rotation for IDP Governance
# Prevents accumulation of large log files

INFRA_LOGS="/home/ichardart/code/infra/logs"

# Create logrotate configuration
sudo tee /etc/logrotate.d/idp-governance > /dev/null <<EOF
$INFRA_LOGS/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 $(whoami) $(whoami)
    maxsize 10M
}

$INFRA_LOGS/mcp-status-*.json {
    daily
    rotate 3
    compress
    delaycompress
    missingok
    notifempty
    maxsize 1M
}
EOF

# Create cleanup script for MCP status files
cat > "$INFRA_LOGS/cleanup-mcp-status.sh" << 'EOF'
#!/bin/bash
# Clean old MCP status files (keep last 24 hours)
find /home/ichardart/code/infra/logs -name "mcp-status-*.json" -mtime +1 -delete
EOF

chmod +x "$INFRA_LOGS/cleanup-mcp-status.sh"

# Add to crontab to run daily
(crontab -l 2>/dev/null; echo "0 2 * * * $INFRA_LOGS/cleanup-mcp-status.sh") | crontab -

echo "✅ Log rotation configured:"
echo "  - Daily rotation for .log files (keep 7 days)"
echo "  - Daily rotation for MCP status files (keep 3 days)"
echo "  - Max size limits: 10M for logs, 1M for status files"
echo "  - Daily cleanup cron job added"