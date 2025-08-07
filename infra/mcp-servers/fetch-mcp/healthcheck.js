// Health check for MCP server
// Returns exit code 0 if healthy, 1 if unhealthy

const process = require('process');

async function healthCheck() {
    try {
        // Basic process health
        if (process.uptime() < 1) {
            throw new Error('Process not fully started');
        }
        
        // Check if main module can be loaded
        require('./index.js');
        
        // TODO: Add server-specific health checks here
        // e.g., database connectivity, API endpoint checks
        
        console.log('Health check passed');
        process.exit(0);
    } catch (error) {
        console.error('Health check failed:', error.message);
        process.exit(1);
    }
}

healthCheck();
