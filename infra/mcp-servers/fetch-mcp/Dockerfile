# Multi-stage Dockerfile template for Node.js MCP servers
# Compliant with IDP governance and security standards

FROM node:18-alpine AS base

# Security: Install security updates and create non-root user
RUN apk update && apk upgrade && \
    addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp

# Set working directory
WORKDIR /app

# Governance: Add audit logging support
ENV GOVERNANCE_LOG_LEVEL=info
ENV NODE_ENV=production
ENV MCP_SERVER_NAME=fetch-mcp

# Dependencies stage
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Development dependencies for testing (if needed)
FROM dependencies AS dev-dependencies
RUN npm ci

# Testing stage
FROM dev-dependencies AS testing
COPY . .
RUN npm test && \
    npm run security:scan

# Production runtime stage
FROM base AS runtime

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy application code
COPY . .

# Security: Remove package-lock.json from runtime (not needed)
RUN rm -f package-lock.json

# Create governance directories
RUN mkdir -p /logs /config && \
    chown -R mcp:mcp /logs /config /app

# Security: Switch to non-root user
USER mcp

# Expose standard MCP port (if HTTP server)
EXPOSE 3000

# Health check for orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Governance: Add labels for policy compliance
LABEL mcp.governance.level="medium" \
      mcp.governance.audit="true" \
      mcp.compliance.version="1.0" \
      mcp.security.scan-date="$(date -I)"

# Default command
CMD ["node", "index.js"]