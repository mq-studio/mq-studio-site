const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/logs/mcp-hub.log' })
  ]
});

// Initialize Docker client
const docker = new Docker();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MCP Server Registry
let mcpServers = new Map();

// Initialize server registry from Docker labels
async function initializeServerRegistry() {
  try {
    const containers = await docker.listContainers();
    
    for (const containerInfo of containers) {
      const labels = containerInfo.Labels || {};
      
      if (labels['mcp.server']) {
        const serverName = labels['mcp.server'];
        const container = docker.getContainer(containerInfo.Id);
        
        mcpServers.set(serverName, {
          name: serverName,
          containerId: containerInfo.Id,
          container: container,
          governanceLevel: labels['mcp.governance.level'] || 'medium',
          status: containerInfo.State,
          image: containerInfo.Image,
          created: containerInfo.Created
        });
        
        logger.info(`Registered MCP server: ${serverName}`, {
          containerId: containerInfo.Id,
          governanceLevel: labels['mcp.governance.level']
        });
      }
    }
    
    logger.info(`Initialized ${mcpServers.size} MCP servers`);
  } catch (error) {
    logger.error('Failed to initialize server registry', { error: error.message });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    servers: mcpServers.size,
    version: '2.0.0'
  });
});

// List all available MCP servers
app.get('/servers', (req, res) => {
  const serverList = Array.from(mcpServers.values()).map(server => ({
    name: server.name,
    status: server.status,
    governanceLevel: server.governanceLevel,
    image: server.image
  }));
  
  res.json({
    servers: serverList,
    count: serverList.length
  });
});

// List all tools from all servers
app.get('/tools', async (req, res) => {
  try {
    const allTools = [];
    
    for (const [serverName, serverInfo] of mcpServers) {
      try {
        // For now, return mock tools - in production this would query each container
        const tools = [
          {
            name: `${serverName}_tool_1`,
            description: `Primary tool for ${serverName}`,
            server: serverName,
            governance_level: serverInfo.governanceLevel
          }
        ];
        
        allTools.push(...tools);
      } catch (error) {
        logger.warn(`Failed to get tools from ${serverName}`, { error: error.message });
      }
    }
    
    res.json({
      tools: allTools,
      count: allTools.length,
      servers: mcpServers.size
    });
  } catch (error) {
    logger.error('Failed to list tools', { error: error.message });
    res.status(500).json({ error: 'Failed to list tools' });
  }
});

// Proxy tool calls to appropriate server
app.post('/tools/:toolName/call', async (req, res) => {
  const { toolName } = req.params;
  const { arguments: toolArgs } = req.body;
  
  try {
    // Determine which server handles this tool
    const serverName = toolName.split('_')[0]; // Simple routing logic
    const serverInfo = mcpServers.get(serverName);
    
    if (!serverInfo) {
      return res.status(404).json({ error: `Server not found for tool: ${toolName}` });
    }
    
    // Log the tool call for governance
    logger.info('Tool call', {
      tool: toolName,
      server: serverName,
      governanceLevel: serverInfo.governanceLevel,
      timestamp: new Date().toISOString()
    });
    
    // For now, return a mock response - in production this would proxy to the container
    const result = {
      tool: toolName,
      server: serverName,
      result: `Mock result from ${toolName}`,
      arguments: toolArgs,
      timestamp: new Date().toISOString()
    };
    
    res.json(result);
  } catch (error) {
    logger.error('Tool call failed', { 
      tool: toolName, 
      error: error.message 
    });
    res.status(500).json({ error: 'Tool call failed' });
  }
});

// Server management endpoints
app.post('/servers/:serverName/restart', async (req, res) => {
  const { serverName } = req.params;
  
  try {
    const serverInfo = mcpServers.get(serverName);
    if (!serverInfo) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    await serverInfo.container.restart();
    
    logger.info(`Restarted server: ${serverName}`);
    res.json({ message: `Server ${serverName} restarted successfully` });
  } catch (error) {
    logger.error(`Failed to restart server: ${serverName}`, { error: error.message });
    res.status(500).json({ error: 'Failed to restart server' });
  }
});

// Get server logs
app.get('/servers/:serverName/logs', async (req, res) => {
  const { serverName } = req.params;
  const { tail = 100 } = req.query;
  
  try {
    const serverInfo = mcpServers.get(serverName);
    if (!serverInfo) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    const logs = await serverInfo.container.logs({
      stdout: true,
      stderr: true,
      tail: parseInt(tail),
      timestamps: true
    });
    
    res.json({
      server: serverName,
      logs: logs.toString()
    });
  } catch (error) {
    logger.error(`Failed to get logs for server: ${serverName}`, { error: error.message });
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Governance reporting endpoint
app.get('/governance/report', (req, res) => {
  const serversByGovernanceLevel = {};
  
  for (const [serverName, serverInfo] of mcpServers) {
    const level = serverInfo.governanceLevel;
    if (!serversByGovernanceLevel[level]) {
      serversByGovernanceLevel[level] = [];
    }
    serversByGovernanceLevel[level].push(serverName);
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    totalServers: mcpServers.size,
    governanceLevels: serversByGovernanceLevel,
    complianceStatus: 'active',
    auditEnabled: true
  });
});

// Start the server
const PORT = process.env.PORT || 3010;

async function startServer() {
  try {
    // Initialize the server registry
    await initializeServerRegistry();
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`MCP Hub started on port ${PORT}`, {
        servers: mcpServers.size,
        mode: 'centralized',
        version: '2.0.0'
      });
    });
    
    // Refresh server registry every 30 seconds
    setInterval(async () => {
      await initializeServerRegistry();
    }, 30000);
    
  } catch (error) {
    logger.error('Failed to start MCP Hub', { error: error.message });
    process.exit(1);
  }
}

startServer();