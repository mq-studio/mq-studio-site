FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001 -G mcp

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application
COPY . .

# Create logs directory
RUN mkdir -p /logs && chown -R mcp:mcp /app /logs

USER mcp

EXPOSE 3010 3011 3012

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3010/health || exit 1

CMD ["node", "index.js"]