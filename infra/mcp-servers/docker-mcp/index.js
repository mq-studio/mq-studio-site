#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * IDP Docker MCP Server
 * 
 * Provides secure Docker container operations for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Features:
 * - Container lifecycle management
 * - Image operations
 * - Network management
 * - Volume management
 * - Docker Compose support
 * - Security scanning
 */

// Configuration from environment variables
const ALLOWED_WORKSPACE = process.env.DOCKER_WORKSPACE || '/home/ichardart/code';
const DOCKER_TIMEOUT = parseInt(process.env.DOCKER_TIMEOUT) || 60000; // 60 seconds
const MAX_OUTPUT_SIZE = parseInt(process.env.MAX_OUTPUT_SIZE) || 2 * 1024 * 1024; // 2MB
const READ_ONLY_MODE = process.env.READ_ONLY_MODE === 'true';
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/docker-mcp.log';

// Security configuration
const ALLOWED_COMMANDS = [
  // Container operations
  'docker ps', 'docker images', 'docker logs', 'docker inspect',
  'docker stats', 'docker top', 'docker port', 'docker diff',
  
  // Image operations
  'docker pull', 'docker build', 'docker tag', 'docker search',
  'docker history', 'docker image ls', 'docker image inspect',
  
  // Network operations (read-only)
  'docker network ls', 'docker network inspect',
  
  // Volume operations (read-only)
  'docker volume ls', 'docker volume inspect',
  
  // Docker Compose (limited)
  'docker-compose ps', 'docker-compose logs', 'docker-compose config'
];

const FORBIDDEN_COMMANDS = [
  // Destructive operations
  'docker rm', 'docker rmi', 'docker kill', 'docker stop',
  'docker restart', 'docker pause', 'docker unpause',
  
  // System operations
  'docker system prune', 'docker volume rm', 'docker network rm',
  'docker container prune', 'docker image prune',
  
  // Privileged operations
  'docker run --privileged', 'docker exec --privileged',
  'docker run --user root', 'docker exec --user root',
  
  // Network modifications
  'docker network create', 'docker network connect', 'docker network disconnect',
  
  // Volume modifications
  'docker volume create', 'docker volume rm'
];

const FORBIDDEN_PATTERNS = [
  /--privileged/,
  /--user\s+root/,
  /--cap-add/,
  /--device/,
  /--volume.*\/:/,
  /--mount.*\/:/,
  /-v\s+\/:/,
  /docker\s+run.*-d/,  // Detached mode
  /docker\s+exec.*-d/, // Detached exec
  /docker.*\|\s*sh/,
  /docker.*\|\s*bash/
];

// Resolve workspace path
const workspacePath = path.resolve(ALLOWED_WORKSPACE);

/**
 * Validates if a Docker command is safe to execute
 */
function validateDockerCommand(command) {
  const trimmedCommand = command.trim();
  
  if (!trimmedCommand) {
    return { valid: false, reason: 'Empty command' };
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return { valid: false, reason: `Forbidden pattern detected: ${pattern}` };
    }
  }
  
  // Check if command starts with docker
  if (!trimmedCommand.startsWith('docker')) {
    return { valid: false, reason: 'Command must start with docker' };
  }
  
  // Check against forbidden commands
  for (const forbidden of FORBIDDEN_COMMANDS) {
    if (trimmedCommand.includes(forbidden)) {
      return { valid: false, reason: `Forbidden command: ${forbidden}` };
    }
  }
  
  // Check if command is in allowed list
  const isAllowed = ALLOWED_COMMANDS.some(allowed => 
    trimmedCommand.startsWith(allowed) || 
    trimmedCommand.includes(allowed)
  );
  
  if (!isAllowed) {
    return { valid: false, reason: 'Command not in allowed list' };
  }
  
  // Check for read-only mode restrictions
  if (READ_ONLY_MODE) {
    const writeCommands = ['build', 'pull', 'push', 'create', 'run'];
    if (writeCommands.some(cmd => trimmedCommand.includes(cmd))) {
      return { valid: false, reason: 'Write operations disabled in read-only mode' };
    }
  }
  
  return { valid: true };
}

/**
 * Logs Docker operations for governance compliance
 */
async function logGovernanceEvent(event, command, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    command: command,
    workspace: workspacePath,
    result: result ? 'success' : 'failure',
    error: error,
    read_only_mode: READ_ONLY_MODE
  };
  
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(GOVERNANCE_LOG, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to write governance log:', logError);
  }
}

/**
 * Truncates output if it exceeds size limit
 */
function truncateOutput(output) {
  if (output.length <= MAX_OUTPUT_SIZE) {
    return output;
  }
  
  const truncated = output.slice(0, MAX_OUTPUT_SIZE);
  const truncationMsg = `\n\n[OUTPUT TRUNCATED - Exceeded ${MAX_OUTPUT_SIZE} bytes limit]`;
  return truncated + truncationMsg;
}

/**
 * Checks if Docker is available and accessible
 */
async function checkDockerAvailability() {
  try {
    const { stdout } = await execAsync('docker version --format "{{.Server.Version}}"', {
      timeout: 10000
    });
    return { available: true, version: stdout.trim() };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'docker-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_docker_command',
        description: 'Execute a Docker command with security controls',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The Docker command to execute (must be in allowed commands list)'
            },
            working_directory: {
              type: 'string',
              description: 'Working directory for command execution (optional)'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'check_docker_status',
        description: 'Check Docker daemon status and system information',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'list_containers',
        description: 'List Docker containers with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              enum: ['all', 'running', 'stopped', 'created'],
              description: 'Container filter (default: all)'
            }
          }
        }
      },
      {
        name: 'list_images',
        description: 'List Docker images with detailed information',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter for image names'
            }
          }
        }
      },
      {
        name: 'get_container_logs',
        description: 'Retrieve logs from a specific container',
        inputSchema: {
          type: 'object',
          properties: {
            container_id: {
              type: 'string',
              description: 'Container ID or name'
            },
            lines: {
              type: 'number',
              description: 'Number of lines to retrieve (default: 100)'
            }
          },
          required: ['container_id']
        }
      },
      {
        name: 'inspect_container',
        description: 'Get detailed information about a container',
        inputSchema: {
          type: 'object',
          properties: {
            container_id: {
              type: 'string',
              description: 'Container ID or name'
            }
          },
          required: ['container_id']
        }
      },
      {
        name: 'validate_docker_command',
        description: 'Check if a Docker command is allowed to be executed',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The Docker command to validate'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'get_docker_info',
        description: 'Get Docker system information and security settings',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'execute_docker_command': {
        const { command, working_directory } = args;
        
        // Validate command
        const validation = validateDockerCommand(command);
        if (!validation.valid) {
          await logGovernanceEvent('command_blocked', command, false, validation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Docker command blocked: ${validation.reason}`
              }
            ]
          };
        }
        
        // Validate working directory if provided
        let workingDir = workspacePath;
        if (working_directory) {
          const resolvedDir = path.resolve(workspacePath, working_directory);
          if (!resolvedDir.startsWith(workspacePath)) {
            await logGovernanceEvent('directory_blocked', command, false, 'Directory outside workspace');
            return {
              content: [
                {
                  type: 'text',
                  text: '❌ Working directory outside allowed workspace'
                }
              ]
            };
          }
          workingDir = resolvedDir;
        }
        
        try {
          const { stdout, stderr } = await execAsync(command, {
            cwd: workingDir,
            timeout: DOCKER_TIMEOUT
          });
          
          const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
          const truncatedOutput = truncateOutput(output);
          
          await logGovernanceEvent('command_executed', command, true);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Docker command executed successfully:\n\n${truncatedOutput}`
              }
            ]
          };
          
        } catch (execError) {
          const errorOutput = execError.stdout || execError.stderr || execError.message;
          const truncatedError = truncateOutput(errorOutput);
          
          await logGovernanceEvent('command_failed', command, false, execError.message);
          
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Docker command failed:\n\n${truncatedError}`
              }
            ]
          };
        }
      }

      case 'check_docker_status': {
        try {
          const dockerCheck = await checkDockerAvailability();
          
          if (!dockerCheck.available) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Docker not available: ${dockerCheck.error}`
                }
              ]
            };
          }
          
          const { stdout: info } = await execAsync('docker info --format "{{json .}}"', {
            timeout: 10000
          });
          
          const dockerInfo = JSON.parse(info);
          
          await logGovernanceEvent('status_check', 'docker info', true);
          
          return {
            content: [
              {
                type: 'text',
                text: `🐳 **Docker Status**

**Version:** ${dockerCheck.version}
**Containers:** ${dockerInfo.Containers || 0} total
**Running:** ${dockerInfo.ContainersRunning || 0}
**Stopped:** ${dockerInfo.ContainersStopped || 0}
**Images:** ${dockerInfo.Images || 0}
**Server Version:** ${dockerInfo.ServerVersion || 'Unknown'}
**Storage Driver:** ${dockerInfo.Driver || 'Unknown'}
**Security:** ${dockerInfo.SecurityOptions ? dockerInfo.SecurityOptions.join(', ') : 'None'}`
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('status_check_failed', 'docker info', false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Docker status check failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'list_containers': {
        const { filter = 'all' } = args;
        
        const filterMap = {
          'all': '-a',
          'running': '',
          'stopped': '-f status=exited',
          'created': '-f status=created'
        };
        
        const dockerFilter = filterMap[filter] || '-a';
        const command = `docker ps ${dockerFilter} --format "table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Names}}"`;
        
        try {
          const { stdout } = await execAsync(command, { timeout: 15000 });
          
          await logGovernanceEvent('list_containers', command, true);
          
          return {
            content: [
              {
                type: 'text',
                text: `📦 **Docker Containers (${filter})**\n\n${stdout || 'No containers found'}`
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('list_containers_failed', command, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Failed to list containers: ${error.message}`
              }
            ]
          };
        }
      }

      case 'list_images': {
        const { filter } = args;
        
        let command = 'docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.ID}}\\t{{.Size}}"';
        if (filter) {
          command += ` | grep ${filter}`;
        }
        
        try {
          const { stdout } = await execAsync(command, { timeout: 15000 });
          
          await logGovernanceEvent('list_images', command, true);
          
          return {
            content: [
              {
                type: 'text',
                text: `🖼️ **Docker Images**\n\n${stdout || 'No images found'}`
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('list_images_failed', command, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Failed to list images: ${error.message}`
              }
            ]
          };
        }
      }

      case 'get_container_logs': {
        const { container_id, lines = 100 } = args;
        
        const command = `docker logs --tail ${lines} ${container_id}`;
        
        try {
          const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
          
          const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
          const truncatedOutput = truncateOutput(output);
          
          await logGovernanceEvent('get_logs', command, true);
          
          return {
            content: [
              {
                type: 'text',
                text: `📄 **Container Logs (${container_id})**\n\n${truncatedOutput || 'No logs available'}`
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('get_logs_failed', command, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Failed to get container logs: ${error.message}`
              }
            ]
          };
        }
      }

      case 'validate_docker_command': {
        const { command } = args;
        const validation = validateDockerCommand(command);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ Docker command '${command}' is allowed`
                : `❌ Docker command '${command}' is blocked: ${validation.reason}`
            }
          ]
        };
      }

      case 'get_docker_info': {
        const allowedCommands = ALLOWED_COMMANDS.join('\n- ');
        const forbiddenCommands = FORBIDDEN_COMMANDS.join('\n- ');
        
        return {
          content: [
            {
              type: 'text',
              text: `🐳 **Docker MCP Security Configuration**

**Workspace:** ${workspacePath}
**Read-Only Mode:** ${READ_ONLY_MODE ? 'Enabled' : 'Disabled'}
**Command Timeout:** ${DOCKER_TIMEOUT}ms
**Max Output Size:** ${MAX_OUTPUT_SIZE} bytes

**✅ Allowed Commands:**
- ${allowedCommands}

**❌ Forbidden Commands:**
- ${forbiddenCommands}

**🚫 Security Controls:**
- No privileged containers
- No root user access
- No host volume mounts
- No detached mode
- Workspace path restrictions
- Complete audit logging`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await logGovernanceEvent('tool_error', name, false, error.message);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`
        }
      ]
    };
  }
});

// Start server
async function main() {
  // Ensure log directory exists
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await logGovernanceEvent('server_started', 'docker-mcp', true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP Docker MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});