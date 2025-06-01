#!/usr/bin/env node

/**
 * IDP Governance MCP Server
 * Provides governance awareness and compliance checking as an MCP tool
 * Works with both Claude Code and Claude Desktop
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const server = new Server(
  {
    name: "governance-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Paths
const INFRA_PATH = "/home/ichardart/code/infra";
const GOVERNANCE_PATH = path.join(INFRA_PATH, "idp-governance");
const MEMORY_PATH = path.join(INFRA_PATH, "data/memory");
const TOOLS_PATH = path.join(INFRA_PATH, "tools");

// Tool Definitions
const TOOLS = [
  {
    name: "get_governance_status",
    description: "Get current IDP governance status and compliance information",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "run_governance_check",
    description: "Run governance compliance check for current session",
    inputSchema: {
      type: "object",
      properties: {
        client_type: {
          type: "string",
          description: "Type of client (claude-desktop, claude-code, cline)",
          default: "claude-desktop"
        }
      },
      required: []
    }
  },
  {
    name: "get_governance_context",
    description: "Get governance context for AI agent sessions",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Register tools
server.setRequestHandler("tools/list", async () => {
  return { tools: TOOLS };
});

// Tool implementations
async function getGovernanceStatus() {
  try {
    const statusFile = path.join(MEMORY_PATH, "claude-desktop-governance.json");
    const statusData = await fs.readFile(statusFile, 'utf8');
    const status = JSON.parse(statusData);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(status, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text", 
          text: `Error reading governance status: ${error.message}`
        }
      ]
    };
  }
}

async function runGovernanceCheck(clientType = "claude-desktop") {
  try {
    const scriptPath = path.join(TOOLS_PATH, "claude-desktop-governance.py");
    
    return new Promise((resolve, reject) => {
      const child = spawn('python3', [scriptPath], {
        cwd: TOOLS_PATH,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            content: [
              {
                type: "text",
                text: `Governance check completed successfully:\n\n${stdout}`
              }
            ]
          });
        } else {
          resolve({
            content: [
              {
                type: "text",
                text: `Governance check failed (exit code ${code}):\n\nStdout:\n${stdout}\n\nStderr:\n${stderr}`
              }
            ]
          });
        }
      });
      
      child.on('error', (error) => {
        resolve({
          content: [
            {
              type: "text",
              text: `Error running governance check: ${error.message}`
            }
          ]
        });
      });
    });
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error starting governance check: ${error.message}`
        }
      ]
    };
  }
}

async function getGovernanceContext() {
  try {
    const contextFile = path.join(MEMORY_PATH, "governance-context.json");
    const contextData = await fs.readFile(contextFile, 'utf8');
    const context = JSON.parse(contextData);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(context, null, 2)
        }
      ]
    };
  } catch (error) {
    // Fallback to basic governance info
    const basicContext = {
      governance_framework: "IDP Governance Framework",
      status: "ACTIVE",
      workspace: "/home/ichardart/code",
      compliance_level: "ENFORCED",
      last_updated: new Date().toISOString()
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(basicContext, null, 2)
        }
      ]
    };
  }
}

// Tool execution handler
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_governance_status":
        return await getGovernanceStatus();
        
      case "run_governance_check":
        return await runGovernanceCheck(args?.client_type);
        
      case "get_governance_context":
        return await getGovernanceContext();
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool ${name}: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IDP Governance MCP server running");
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

module.exports = { server };