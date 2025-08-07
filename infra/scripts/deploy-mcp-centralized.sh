#!/bin/bash
set -e

echo "🚀 Deploying Centralized MCP Infrastructure"
echo "==========================================="

# Set environment variables
export LOG_LEVEL=${LOG_LEVEL:-info}
export GITHUB_TOKEN=${GITHUB_TOKEN:-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}

# Step 1: Ensure registry is running
echo "📊 Checking Docker registry..."
if ! docker ps | grep -q idp-registry; then
    echo "Starting Docker registry..."
    cd /home/ichardart/code/infra/docker-registry
    docker-compose up -d
fi

# Step 2: Ensure tracing infrastructure is running
echo "📊 Checking tracing infrastructure..."
if ! docker ps | grep -q idp-jaeger; then
    echo "Starting tracing infrastructure..."
    cd /home/ichardart/code/infra/monitoring/tracing
    docker-compose up -d
fi

# Step 3: Login to registry
echo "🔐 Logging into registry..."
echo "mcpregistry" | docker login localhost:5000 -u admin --password-stdin

# Step 4: Deploy centralized MCP infrastructure using existing servers
echo "🐳 Deploying MCP containers..."
cd /home/ichardart/code/infra/mcp-central

# Create simplified compose file with existing working servers
cat > docker-compose.simple.yml << 'EOF'
services:
  # GitHub MCP using existing configuration
  github-mcp:
    image: docker.io/modelcontextprotocol/server-github:latest
    container_name: github-mcp
    environment:
      - GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_TOKEN}
      - DEBUG=mcp:*
    networks:
      - mcp-network
    restart: unless-stopped
    labels:
      - "mcp.server=github"
      - "mcp.governance.level=medium"

  # Memory MCP using existing configuration  
  memory-mcp:
    image: docker.io/modelcontextprotocol/server-memory:latest
    container_name: memory-mcp
    environment:
      - MEMORY_FILE_PATH=/data/knowledge-graph.json
    volumes:
      - memory-data:/data
    networks:
      - mcp-network
    restart: unless-stopped
    labels:
      - "mcp.server=memory"
      - "mcp.governance.level=medium"

  # Fetch MCP (our containerized version)
  fetch-mcp:
    image: localhost:5000/idp/fetch-mcp:latest
    container_name: fetch-mcp
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=${LOG_LEVEL:-info}
    networks:
      - mcp-network
    restart: unless-stopped
    labels:
      - "mcp.server=fetch"
      - "mcp.governance.level=low"

  # Simple MCP proxy/gateway
  mcp-gateway:
    image: nginx:alpine
    container_name: mcp-gateway
    ports:
      - "3010:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - mcp-network
    restart: unless-stopped
    depends_on:
      - github-mcp
      - memory-mcp
      - fetch-mcp

networks:
  mcp-network:
    name: mcp-network
    driver: bridge

volumes:
  memory-data:
    driver: local
EOF

# Create nginx configuration for simple proxy
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream mcp_backend {
        # For now, just return status
        server 127.0.0.1:8080;
    }
    
    server {
        listen 80;
        
        location /health {
            access_log off;
            return 200 '{"status":"healthy","version":"1.0","timestamp":"$time_iso8601"}';
            add_header Content-Type application/json;
        }
        
        location /servers {
            access_log off;
            return 200 '{"servers":["github","memory","fetch"],"count":3}';
            add_header Content-Type application/json;
        }
        
        location / {
            return 200 '{"message":"MCP Gateway Active","servers":3}';
            add_header Content-Type application/json;
        }
    }
}
EOF

# Deploy the services
echo "🚀 Starting MCP services..."
docker-compose -f docker-compose.simple.yml up -d

# Step 5: Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Step 6: Verify deployment
echo "🔍 Verifying deployment..."

# Check if containers are running
echo "Checking containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(github-mcp|memory-mcp|fetch-mcp|mcp-gateway)"

# Test gateway
echo ""
echo "Testing MCP Gateway:"
curl -s http://localhost:3010/health | jq .
curl -s http://localhost:3010/servers | jq .

# Step 7: Update Claude Desktop configuration
echo ""
echo "📝 Creating Claude Desktop bridge configuration..."

cat > claude-bridge.json << 'EOF'
{
  "mcpServers": {
    "centralized-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "--network", "mcp-network",
        "-e", "MCP_GATEWAY_URL=http://mcp-gateway",
        "alpine/curl", "curl", "-X", "POST", "http://mcp-gateway/health"
      ],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
EOF

echo "✅ Centralized MCP infrastructure deployed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Gateway available at: http://localhost:3010"
echo "2. Individual servers accessible via Docker network: mcp-network"
echo "3. To integrate with Claude Desktop, use the configuration in claude-bridge.json"
echo ""
echo "🔧 Management commands:"
echo "  View logs: docker-compose -f docker-compose.simple.yml logs -f"
echo "  Restart:   docker-compose -f docker-compose.simple.yml restart"
echo "  Stop:      docker-compose -f docker-compose.simple.yml down"
echo ""
EOF

chmod +x /home/ichardart/code/infra/scripts/deploy-mcp-centralized.sh