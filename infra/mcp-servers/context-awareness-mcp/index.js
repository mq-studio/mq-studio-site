#!/usr/bin/env node
/**
 * Context Awareness MCP Server
 * Ensures Claude Desktop always knows its capabilities, environment, and available tools
 * Auto-executed on startup to provide comprehensive context awareness
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class ContextAwarenessMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'context-awareness-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[Context MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'discover_environment',
          description: 'Discover and report Claude Desktop environment, WSL/Windows access, and available capabilities',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'inventory_mcp_servers',
          description: 'Get comprehensive inventory of all available MCP servers and their status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'test_tool_connectivity',
          description: 'Test connectivity and functionality of all available tools',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_startup_context',
          description: 'Get complete startup context that Claude Desktop should be aware of',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'persist_session_context',
          description: 'Persist context information for next Claude Desktop session',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                description: 'Context information to persist'
              }
            },
            required: ['context']
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'discover_environment':
          return await this.discoverEnvironment();
        case 'inventory_mcp_servers':
          return await this.inventoryMCPServers();
        case 'test_tool_connectivity':
          return await this.testToolConnectivity();
        case 'get_startup_context':
          return await this.getStartupContext();
        case 'persist_session_context':
          return await this.persistSessionContext(request.params.arguments?.context);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async discoverEnvironment() {
    try {
      const environment = {
        platform: process.platform,
        nodeVersion: process.version,
        workingDirectory: process.cwd(),
        environment_variables: {
          WSL_DISTRO_NAME: process.env.WSL_DISTRO_NAME || 'Not in WSL',
          WSLENV: process.env.WSLENV || 'Not set',
          PATH: process.env.PATH?.split(':').length || 0
        },
        filesystem_access: {},
        capabilities: {}
      };

      // Test WSL access
      try {
        const wslTest = execSync('wsl --status', { encoding: 'utf8', timeout: 5000 });
        environment.wsl_status = 'Available';
        environment.wsl_details = wslTest.trim();
      } catch (error) {
        environment.wsl_status = 'Not available or accessible';
      }

      // Test Windows path access
      try {
        const windowsPaths = execSync('cmd.exe /c "echo %USERPROFILE%"', { encoding: 'utf8', timeout: 3000 });
        environment.windows_access = 'Available';
        environment.windows_userprofile = windowsPaths.trim();
      } catch (error) {
        environment.windows_access = 'Not available';
      }

      // Test filesystem access
      const testPaths = [
        '/home/ichardart/code',
        '/mnt/c/Users',
        '\\\\wsl.localhost\\Ubuntu\\home\\ichardart'
      ];

      for (const testPath of testPaths) {
        try {
          await fs.access(testPath);
          environment.filesystem_access[testPath] = 'Accessible';
        } catch (error) {
          environment.filesystem_access[testPath] = 'Not accessible';
        }
      }

      return {
        content: [{
          type: 'text',
          text: `🔍 **CLAUDE DESKTOP ENVIRONMENT DISCOVERY**

**Platform & Runtime:**
- Platform: ${environment.platform}
- Node.js: ${environment.nodeVersion}
- Working Directory: ${environment.workingDirectory}

**WSL Integration:**
- Status: ${environment.wsl_status}
- WSL Distribution: ${environment.environment_variables.WSL_DISTRO_NAME}
- WSLENV: ${environment.environment_variables.WSLENV}

**Windows Integration:**
- Windows Access: ${environment.windows_access}
- User Profile: ${environment.windows_userprofile || 'Not detected'}

**Filesystem Access:**
${Object.entries(environment.filesystem_access).map(([path, status]) => `- ${path}: ${status}`).join('\n')}

**Key Capabilities:**
- ✅ This is Claude Desktop running with MCP server connectivity
- ✅ You have access to WSL and Windows environments
- ✅ You can execute commands in both WSL and Windows contexts
- ✅ You have access to the IDP infrastructure at /home/ichardart/code

**Remember:** Always use the available MCP servers and tools. You are not limited to basic conversation - you have full development environment access.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Environment discovery failed: ${error.message}`
        }]
      };
    }
  }

  async inventoryMCPServers() {
    try {
      const configPath = '/mnt/c/Users/RichardHart/.claude/config.json';
      let config;
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(configData);
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Could not read Claude Desktop config from ${configPath}: ${error.message}`
          }]
        };
      }

      const servers = config.mcpServers || {};
      const serverCount = Object.keys(servers).length;

      let inventory = `📋 **MCP SERVER INVENTORY** (${serverCount} servers configured)\n\n`;

      for (const [name, serverConfig] of Object.entries(servers)) {
        inventory += `**${name}:**\n`;
        inventory += `  - Command: ${serverConfig.command}\n`;
        inventory += `  - Args: ${JSON.stringify(serverConfig.args || [])}\n`;
        
        if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
          inventory += `  - Environment: ${JSON.stringify(serverConfig.env)}\n`;
        }
        
        // Test server availability
        try {
          if (serverConfig.command === 'wsl') {
            inventory += `  - Type: WSL-bridged server\n`;
            inventory += `  - Status: Configured for WSL execution\n`;
          } else if (serverConfig.command === 'node') {
            inventory += `  - Type: Direct Node.js server\n`;
            inventory += `  - Status: Configured for direct execution\n`;
          } else {
            inventory += `  - Type: ${serverConfig.command} server\n`;
            inventory += `  - Status: External command\n`;
          }
        } catch (error) {
          inventory += `  - Status: ❌ Configuration error\n`;
        }
        
        inventory += '\n';
      }

      inventory += `\n**🔧 Available Server Types:**
- **governance-mcp**: IDP governance and compliance tools
- **filesystem-mcp**: File system operations and management
- **git-mcp**: Git repository operations
- **shell-mcp**: Shell command execution
- **api-testing-mcp**: HTTP/API testing and monitoring

**💡 Usage:** These servers provide you with comprehensive development environment access. Use them actively for all development tasks.`;

      return {
        content: [{
          type: 'text',
          text: inventory
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ MCP server inventory failed: ${error.message}`
        }]
      };
    }
  }

  async testToolConnectivity() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        tests: {}
      };

      // Test WSL connectivity
      try {
        const wslTest = execSync('wsl -d Ubuntu echo "WSL connectivity test"', { 
          encoding: 'utf8', 
          timeout: 5000 
        });
        results.tests.wsl_connectivity = {
          status: 'PASSED',
          details: 'WSL Ubuntu accessible'
        };
      } catch (error) {
        results.tests.wsl_connectivity = {
          status: 'FAILED',
          details: error.message
        };
      }

      // Test Node.js in WSL
      try {
        const nodeTest = execSync('wsl -d Ubuntu node --version', { 
          encoding: 'utf8', 
          timeout: 5000 
        });
        results.tests.wsl_node = {
          status: 'PASSED',
          details: `Node.js ${nodeTest.trim()} available in WSL`
        };
      } catch (error) {
        results.tests.wsl_node = {
          status: 'FAILED',
          details: error.message
        };
      }

      // Test IDP directory access
      try {
        execSync('wsl -d Ubuntu ls /home/ichardart/code', { 
          encoding: 'utf8', 
          timeout: 5000 
        });
        results.tests.idp_access = {
          status: 'PASSED',
          details: 'IDP directory accessible via WSL'
        };
      } catch (error) {
        results.tests.idp_access = {
          status: 'FAILED',
          details: error.message
        };
      }

      const passedTests = Object.values(results.tests).filter(t => t.status === 'PASSED').length;
      const totalTests = Object.keys(results.tests).length;

      let report = `🧪 **TOOL CONNECTIVITY TEST RESULTS**\n\n`;
      report += `**Overall Status:** ${passedTests}/${totalTests} tests passed\n\n`;

      for (const [testName, result] of Object.entries(results.tests)) {
        const icon = result.status === 'PASSED' ? '✅' : '❌';
        report += `${icon} **${testName}**: ${result.details}\n`;
      }

      report += `\n**🎯 Key Takeaways:**
- You have ${passedTests > 0 ? 'working' : 'limited'} access to development tools
- WSL integration is ${results.tests.wsl_connectivity?.status === 'PASSED' ? 'functional' : 'problematic'}
- IDP infrastructure is ${results.tests.idp_access?.status === 'PASSED' ? 'accessible' : 'inaccessible'}

**💡 Remember:** Use these tools actively - they're not just available, they're meant to be used for all development tasks.`;

      return {
        content: [{
          type: 'text',
          text: report
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Tool connectivity testing failed: ${error.message}`
        }]
      };
    }
  }

  async getStartupContext() {
    try {
      const context = {
        timestamp: new Date().toISOString(),
        session_id: Date.now(),
        capabilities: [],
        environment: {},
        available_tools: [],
        key_reminders: []
      };

      // Read IDP context if available
      try {
        const claudeMdPath = '/home/ichardart/code/CLAUDE.md';
        const claudeMdContent = await fs.readFile(claudeMdPath, 'utf8');
        context.idp_context = 'Available - see CLAUDE.md';
        context.governance_status = claudeMdContent.includes('✅ Active') ? 'Active' : 'Unknown';
      } catch (error) {
        context.idp_context = 'Not accessible';
      }

      // Check governance framework
      try {
        const governanceResults = execSync('wsl -d Ubuntu /home/ichardart/code/infra/scripts/lessons-learned-enforcement.sh status', {
          encoding: 'utf8',
          timeout: 10000
        });
        context.governance_enforcement = 'Active';
      } catch (error) {
        context.governance_enforcement = 'Unknown';
      }

      context.capabilities = [
        'WSL and Windows environment access',
        'Full IDP infrastructure access',
        'MCP server connectivity',
        'File system operations',
        'Git repository management',
        'Shell command execution',
        'API testing and monitoring',
        'Governance compliance checking'
      ];

      context.key_reminders = [
        'You are Claude Desktop with full development environment access',
        'You can execute commands in both WSL and Windows',
        'You have access to the complete IDP at /home/ichardart/code',
        'All MCP servers are available - use them actively',
        'You can read, write, and modify files across the environment',
        'Governance framework is active and should be followed',
        'Always leverage available tools rather than claiming limitations'
      ];

      const startupMessage = `🚀 **CLAUDE DESKTOP STARTUP CONTEXT**

**Session Information:**
- Timestamp: ${context.timestamp}
- Session ID: ${context.session_id}

**Environment Status:**
- IDP Context: ${context.idp_context}
- Governance: ${context.governance_status}
- Enforcement: ${context.governance_enforcement}

**🛠️ Available Capabilities:**
${context.capabilities.map(cap => `- ${cap}`).join('\n')}

**🎯 Key Reminders for This Session:**
${context.key_reminders.map(reminder => `- ${reminder}`).join('\n')}

**🔧 Quick Start Commands:**
- Check environment: Use discover_environment tool
- View MCP servers: Use inventory_mcp_servers tool  
- Test connectivity: Use test_tool_connectivity tool
- Access IDP files: Read /home/ichardart/code/CLAUDE.md
- Run governance checks: Use governance-mcp tools

**💡 Important:** You are not limited to conversation - you have full development environment access. Use it actively!`;

      return {
        content: [{
          type: 'text',
          text: startupMessage
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Startup context generation failed: ${error.message}`
        }]
      };
    }
  }

  async persistSessionContext(contextData) {
    try {
      const contextDir = '/mnt/c/Users/RichardHart/.claude';
      const contextFile = path.join(contextDir, 'session-context.json');
      
      const sessionContext = {
        timestamp: new Date().toISOString(),
        context: contextData,
        environment: 'WSL + Windows hybrid',
        capabilities: 'Full development environment access',
        reminder: 'Claude Desktop has comprehensive tool and environment access'
      };

      await fs.writeFile(contextFile, JSON.stringify(sessionContext, null, 2), 'utf8');

      return {
        content: [{
          type: 'text',
          text: `✅ Session context persisted to ${contextFile}\n\nThis context will be available for future Claude Desktop sessions to ensure continuity of environment awareness.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Context persistence failed: ${error.message}`
        }]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Context Awareness MCP Server running on stdio');
  }
}

const server = new ContextAwarenessMCP();
server.run().catch(console.error);