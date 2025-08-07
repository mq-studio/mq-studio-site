# Centralized Docker MCP Server Architecture for IDP

## Executive Summary

This document outlines the design for evolving the current IDP MCP infrastructure into a fully centralized, Docker-based architecture leveraging the Docker MCP Toolkit. This approach will enable single-point installation and management of MCP servers accessible to all AI agents (Claude Desktop, Cline, VS Code, Gordon, etc.).

## Architecture Overview

### Current State → Target State

**Current**: Individual MCP servers run as separate processes, configured independently for each AI client
**Target**: Containerized MCP servers managed centrally through Docker MCP Toolkit, accessible to all AI clients

## Core Components

### 1. Docker MCP Toolkit Integration

The Docker MCP Toolkit will serve as the foundation, providing:
- **Secure containerization** of all MCP servers
- **Built-in OAuth support** and credential management
- **Zero-configuration setup** for AI clients
- **Cross-LLM compatibility** (Claude Desktop, Cursor, Continue.dev, Gordon)
- **Integrated tool discovery** from Docker MCP Catalog

### 2. Enhanced MCP Server Hub (v2.0)

Transform the existing hub into a container-native orchestrator:

```yaml
# docker-compose.mcp-hub.yml
version: '3.8'

services:
  mcp-hub:
    image: idp/mcp-server-hub:2.0
    ports:
      - "3010:3010"  # Traditional MCP
      - "3011:3011"  # A2A Protocol
      - "3012:3012"  # Docker MCP Toolkit Bridge
    environment:
      - MCP_MODE=centralized
      - DOCKER_MCP_ENABLED=true
      - A2A_PROTOCOL_ENABLED=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config:/config
    networks:
      - mcp-network
```

### 3. Containerized MCP Servers

Each MCP server will be containerized with standardized Dockerfile:

```dockerfile
# Base Dockerfile template for MCP servers
FROM mcp/docker:0.0.17 as base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy server code
COPY . .

# Add governance layer
COPY --from=idp/governance-base /governance /governance

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node health-check.js || exit 1

# Run with MCP protocol
CMD ["node", "index.js"]
```

### 4. Service Discovery & Registry

Leverage Docker MCP Toolkit's discovery with IDP enhancements:

```yaml
# mcp-registry.yml
mcp_servers:
  github:
    image: idp/github-mcp:latest
    catalog_ref: mcp/github:official
    governance_level: medium
    capabilities:
      - repository_access
      - issue_management
      - pull_requests
    
  database:
    image: idp/database-mcp:latest
    governance_level: high
    security_controls:
      - input_validation
      - query_limits
      - audit_logging
```

### 5. Multi-Agent Access Layer

Enable all AI agents to access centralized servers:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Claude Desktop  │  │      Cline      │  │     VS Code     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MCP Gateway       │
                    │  (Port 3012)        │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
│ Docker MCP      │  │  Traditional     │  │  A2A Protocol   │
│ Toolkit Bridge  │  │  MCP Bridge      │  │     Bridge      │
└────────┬────────┘  └─────────┬────────┘  └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Container Orchestra │
                    └──────────┬──────────┘
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │                          │                          │
┌───▼───┐ ┌────▼────┐ ┌───────▼──────┐ ┌────────────────▼─┐
│GitHub │ │Database │ │Filesystem    │ │ Other MCP Servers│
│ MCP   │ │  MCP    │ │    MCP       │ │   (15 total)     │
└───────┘ └─────────┘ └──────────────┘ └──────────────────┘
```

## Implementation Architecture

### Phase 1: Docker MCP Toolkit Setup (Week 1)

1. **Install Docker MCP Toolkit Extension**
   ```bash
   # Via Docker Desktop Extensions
   docker extension install mcp/toolkit:latest
   ```

2. **Configure MCP Catalog Access**
   - Browse 100+ pre-built MCP servers
   - Identify replacements for custom servers
   - Evaluate security and compliance

3. **Setup Container Registry**
   ```bash
   # Local registry for custom MCP servers
   docker run -d -p 5000:5000 --name registry registry:2
   ```

### Phase 2: Server Containerization (Week 2-3)

1. **Create Dockerfiles for Each Server**
   ```bash
   # Script to generate Dockerfiles
   ./scripts/dockerize-mcp-servers.sh
   ```

2. **Build and Tag Images**
   ```bash
   # Automated build pipeline
   for server in /home/ichardart/code/infra/mcp-servers/*; do
     docker build -t idp/$(basename $server):latest $server
   done
   ```

3. **Push to Registry**
   ```bash
   docker push idp/github-mcp:latest
   docker push idp/database-mcp:latest
   # ... etc
   ```

### Phase 3: Hub Enhancement (Week 3-4)

1. **Upgrade MCP Server Hub**
   - Add Docker MCP Toolkit bridge
   - Implement container orchestration
   - Enhanced service discovery

2. **Security Integration**
   - OAuth flow for Docker MCP tools
   - Credential vault integration
   - Network isolation policies

### Phase 4: Client Migration (Week 4-5)

1. **Update Client Configurations**
   ```json
   // Claude Desktop config
   {
     "mcpServers": {
       "centralized": {
         "command": "docker",
         "args": ["run", "--rm", "-i", "idp/mcp-gateway:latest"],
         "env": {
           "MCP_HUB_URL": "http://localhost:3012"
         }
       }
     }
   }
   ```

2. **Backward Compatibility**
   - Maintain legacy endpoints during transition
   - Gradual migration per client

## Security Architecture

### Container Security

1. **Image Scanning**
   ```yaml
   # Integrated with Docker MCP Toolkit
   security:
     scan_on_push: true
     vulnerability_threshold: medium
     compliance_checks:
       - CIS Docker Benchmark
       - OWASP Dependencies
   ```

2. **Runtime Security**
   - Read-only root filesystems
   - Non-root user execution
   - Capability dropping
   - Seccomp profiles

### Network Security

```yaml
networks:
  mcp-public:
    # Client-facing network
    driver: bridge
    
  mcp-internal:
    # Inter-container communication
    driver: bridge
    internal: true
    
  mcp-secure:
    # High-security servers (database, secrets)
    driver: bridge
    internal: true
    encrypted: true
```

### Credential Management

Leverage Docker MCP Toolkit's built-in OAuth and credential storage:

```yaml
# Credential configuration
credentials:
  github:
    type: oauth2
    provider: github
    scopes: [repo, read:org]
    
  database:
    type: vault
    path: /secret/mcp/database
    
  onepassword:
    type: service_account
    vault_url: ${OP_VAULT_URL}
```

## Governance Integration

### Compliance Automation

```yaml
# governance-policy.yml
policies:
  deployment:
    - require: dockerfile_scan
    - require: security_baseline
    - require: test_coverage >= 80%
    
  runtime:
    - enforce: resource_limits
    - enforce: network_policies
    - audit: all_operations
```

### Monitoring & Observability

```yaml
# monitoring stack
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    environment:
      - GF_INSTALL_PLUGINS=mcp-dashboard
      
  loki:
    image: grafana/loki
    command: -config.file=/etc/loki/config.yml
```

## Benefits of Centralized Architecture

### 1. Operational Excellence
- **Single deployment point** for all MCP servers
- **Unified upgrade process** across all clients
- **Centralized monitoring** and logging
- **Simplified troubleshooting**

### 2. Security Enhancement
- **Container isolation** for each MCP server
- **Centralized credential management**
- **Network segmentation** by security level
- **Automated vulnerability scanning**

### 3. Developer Experience
- **Zero-configuration** for AI clients
- **Consistent API** across all tools
- **Built-in documentation** and discovery
- **Local development** with production parity

### 4. Scalability
- **Horizontal scaling** of individual servers
- **Load balancing** for high-traffic tools
- **Resource optimization** through container limits
- **Multi-region deployment** capability

## Migration Strategy

### Step 1: Parallel Deployment
- Deploy containerized versions alongside existing
- Route traffic gradually to containers
- Monitor performance and stability

### Step 2: Client Migration
- Update one client at a time
- Maintain backward compatibility
- Provide migration tools and scripts

### Step 3: Legacy Decommission
- Phase out process-based servers
- Archive legacy configurations
- Update documentation

## Success Metrics

1. **Availability**: 99.9% uptime for MCP services
2. **Performance**: <100ms latency for tool discovery
3. **Security**: Zero high-severity vulnerabilities
4. **Adoption**: 100% of AI clients using centralized servers
5. **Efficiency**: 50% reduction in maintenance overhead

## Next Steps

1. **Proof of Concept**: Containerize 3 MCP servers
2. **Security Review**: Validate container security model
3. **Performance Testing**: Benchmark containerized vs. process-based
4. **Client Integration**: Test with Claude Desktop
5. **Production Pilot**: Deploy subset to production

This centralized Docker-based architecture will transform MCP server management while maintaining the sophisticated governance and A2A capabilities that make the IDP ecosystem powerful and secure.